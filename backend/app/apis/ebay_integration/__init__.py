from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
import requests
from datetime import datetime
import databutton as db

router = APIRouter()

class EbayListing(BaseModel):
    title: str
    price: float
    condition: Optional[str] = None
    url: str
    date_listed: str

def get_ebay_oauth_token() -> str:
    """Get OAuth token for eBay API"""
    client_id = db.secrets.get("EBAY_PROD_CLIENT_ID")
    client_secret = db.secrets.get("EBAY_PROD_CLIENT_SECRET")
    
    auth_url = "https://api.ebay.com/identity/v1/oauth2/token"
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    data = {
        "grant_type": "client_credentials",
        "scope": "https://api.ebay.com/oauth/api_scope"
    }
    
    response = requests.post(
        auth_url,
        headers=headers,
        data=data,
        auth=(client_id, client_secret)
    )
    
    if response.status_code != 200:
        print(f"Error getting OAuth token: {response.text}")
        raise Exception("Failed to get OAuth token")
        
    return response.json()["access_token"]

def search_ebay_listings(keywords: str, condition: Optional[str] = None) -> List[EbayListing]:
    """Search eBay for active listings"""
    token = get_ebay_oauth_token()
    
    headers = {
        "Authorization": f"Bearer {token}",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
    }
    
    # Build query
    q = keywords
    if condition:
        q += f" {condition}"
    
    params = {
        "q": q,
        "limit": 100
    }
    
    response = requests.get(
        "https://api.ebay.com/buy/browse/v1/item_summary/search",
        headers=headers,
        params=params
    )
    
    if response.status_code != 200:
        print(f"Error searching eBay: {response.text}")
        return []
    
    data = response.json()
    listings = []
    
    for item in data.get("itemSummaries", []):
        listings.append(EbayListing(
            title=item["title"],
            price=float(item["price"]["value"]),
            condition=item.get("condition"),
            url=item["itemWebUrl"],
            date_listed=item.get("itemCreationDate", datetime.now().isoformat())
        ))
    
    return listings
