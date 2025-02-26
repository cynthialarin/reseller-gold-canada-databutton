from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
import re
import time
from datetime import datetime
from bs4 import BeautifulSoup
import requests
from urllib.parse import quote_plus

router = APIRouter()

class ScrapedListing(BaseModel):
    title: str
    price: float
    platform: str
    condition: Optional[str] = None
    url: str
    date_listed: Optional[str] = None

class BaseScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self._last_request = 0
        self._delay = 2  # Delay between requests in seconds

    def _wait(self):
        """Ensure we don't make requests too quickly"""
        now = time.time()
        diff = now - self._last_request
        if diff < self._delay:
            time.sleep(self._delay - diff)
        self._last_request = time.time()

    def _get(self, url: str) -> str:
        """Make a GET request with rate limiting"""
        self._wait()
        response = self.session.get(url)
        response.raise_for_status()
        return response.text

    def search(self, keywords: str) -> List[ScrapedListing]:
        """Search for listings matching keywords"""
        raise NotImplementedError

class PoshmarkScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = "https://poshmark.com"

    def search(self, keywords: str) -> List[ScrapedListing]:
        """Search Poshmark for listings"""
        search_url = f"{self.base_url}/search?q={quote_plus(keywords)}&type=listings"
        
        try:
            html = self._get(search_url)
            soup = BeautifulSoup(html, 'html.parser')
            listings = []

            # Find all listing cards
            cards = soup.find_all('div', {'class': 'card'})
            
            for card in cards[:10]:  # Limit to first 10 results
                try:
                    # Extract listing details
                    title_elem = card.find('div', {'class': 'title'})
                    price_elem = card.find('div', {'class': 'price'})
                    url_elem = card.find('a', {'class': 'tile'})
                    
                    if not all([title_elem, price_elem, url_elem]):
                        continue

                    # Clean and parse data
                    title = title_elem.text.strip()
                    price_text = price_elem.text.strip()
                    price = float(re.sub(r'[^\d.]', '', price_text))
                    url = self.base_url + url_elem['href']

                    listings.append(ScrapedListing(
                        title=title,
                        price=price,
                        platform="Poshmark",
                        url=url,
                        date_listed=datetime.now().strftime('%Y-%m-%d')  # Approximate
                    ))
                except Exception as e:
                    print(f"Error parsing Poshmark listing: {e}")
                    continue

            return listings
        except Exception as e:
            print(f"Error scraping Poshmark: {e}")
            return []

class MercariScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.base_url = "https://www.mercari.com"

    def search(self, keywords: str) -> List[ScrapedListing]:
        """Search Mercari for listings"""
        search_url = f"{self.base_url}/search?keyword={quote_plus(keywords)}"
        
        try:
            html = self._get(search_url)
            soup = BeautifulSoup(html, 'html.parser')
            listings = []

            # Find all listing cards
            cards = soup.find_all('div', {'class': 'item-cell'})
            
            for card in cards[:10]:  # Limit to first 10 results
                try:
                    # Extract listing details
                    title_elem = card.find('h3', {'class': 'item-name'})
                    price_elem = card.find('div', {'class': 'item-price'})
                    url_elem = card.find('a', {'class': 'item-link'})
                    condition_elem = card.find('div', {'class': 'item-condition'})
                    
                    if not all([title_elem, price_elem, url_elem]):
                        continue

                    # Clean and parse data
                    title = title_elem.text.strip()
                    price_text = price_elem.text.strip()
                    price = float(re.sub(r'[^\d.]', '', price_text))
                    url = self.base_url + url_elem['href']
                    condition = condition_elem.text.strip() if condition_elem else None

                    listings.append(ScrapedListing(
                        title=title,
                        price=price,
                        platform="Mercari",
                        condition=condition,
                        url=url,
                        date_listed=datetime.now().strftime('%Y-%m-%d')  # Approximate
                    ))
                except Exception as e:
                    print(f"Error parsing Mercari listing: {e}")
                    continue

            return listings
        except Exception as e:
            print(f"Error scraping Mercari: {e}")
            return []

def get_scraped_listings(keywords: str) -> List[ScrapedListing]:
    """Get listings from all scrapers"""
    scrapers = [
        PoshmarkScraper(),
        MercariScraper()
    ]
    
    all_listings = []
    for scraper in scrapers:
        try:
            listings = scraper.search(keywords)
            all_listings.extend(listings)
        except Exception as e:
            print(f"Error with {scraper.__class__.__name__}: {e}")
            continue
    
    return all_listings