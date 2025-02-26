from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

router = APIRouter()

class PricePoint(BaseModel):
    price: float
    date: str
    platform: str
    condition: Optional[str] = None
    sold: bool = False

class CompetitorListing(BaseModel):
    title: str
    price: float
    platform: str
    condition: Optional[str] = None
    url: str
    date_listed: str

class MarketTrend(BaseModel):
    period: str  # 'day', 'week', 'month'
    average_price: float
    volume: int
    price_change: float  # percentage

from pydantic import BaseModel, validator

class PriceAnalysisRequest(BaseModel):
    keywords: str
    category: Optional[str] = None
    condition: Optional[str] = None
    brand: Optional[str] = None
    
    @validator('keywords')
    def keywords_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('keywords cannot be empty')
        return v.strip()
        
    @validator('category', 'condition', 'brand')
    def trim_optional_fields(cls, v):
        if v is None:
            return v
        return v.strip() or None

class PriceAnalysisResponse(BaseModel):
    suggested_price: float
    price_range: dict[str, float]  # min, max
    confidence_score: float  # 0-1
    market_trends: List[MarketTrend]
    price_history: List[PricePoint]
    active_competitors: List[CompetitorListing]
    best_day_to_list: str  # day of week
    best_time_to_list: str  # time of day

def generate_mock_price_data(base_price: float, num_points: int) -> List[PricePoint]:
    """Generate mock price data for development"""
    now = datetime.now()
    platforms = ['eBay', 'Poshmark', 'Mercari']
    conditions = ['New', 'Like New', 'Good', 'Fair']
    
    price_points = []
    for i in range(num_points):
        date = now - timedelta(days=i)
        platform = np.random.choice(platforms)
        condition = np.random.choice(conditions)
        # Add some random variation to price
        price = base_price * (1 + np.random.normal(0, 0.1))
        # More likely to be sold if price is lower
        sold = np.random.random() < (1 - price/base_price/1.2)
        
        price_points.append(PricePoint(
            price=round(price, 2),
            date=date.strftime('%Y-%m-%d'),
            platform=platform,
            condition=condition,
            sold=sold
        ))
    
    return price_points

def get_competitor_listings(keywords: str, condition: Optional[str] = None) -> List[CompetitorListing]:
    """Get competitor listings from eBay and other sources"""
    from app.apis.ebay_integration import search_ebay_listings
    
    # Get eBay listings
    ebay_listings = search_ebay_listings(keywords, condition)
    
    # Convert to CompetitorListing format
    competitors = [
        CompetitorListing(
            title=listing.title,
            price=listing.price,
            platform='eBay',
            condition=listing.condition,
            url=listing.url,
            date_listed=listing.date_listed
        )
        for listing in ebay_listings
    ]
    
    return competitors

def calculate_market_trends(price_points: List[PricePoint]) -> List[MarketTrend]:
    """Calculate market trends from price points"""
    df = pd.DataFrame([p.dict() for p in price_points])
    df['date'] = pd.to_datetime(df['date'])
    
    trends = []
    for period, days in [('day', 1), ('week', 7), ('month', 30)]:
        recent = df[df['date'] >= datetime.now() - timedelta(days=days)]
        older = df[df['date'] < datetime.now() - timedelta(days=days)]
        
        if len(recent) == 0 or len(older) == 0:
            continue
            
        avg_price = recent['price'].mean()
        old_avg = older['price'].mean()
        price_change = ((avg_price - old_avg) / old_avg * 100) if old_avg > 0 else 0
        
        trends.append(MarketTrend(
            period=period,
            average_price=round(avg_price, 2),
            volume=len(recent[recent['sold']]),
            price_change=round(price_change, 1)
        ))
    
    return trends

def analyze_best_timing(price_points: List[PricePoint]) -> tuple[str, str]:
    """Analyze best day and time to list based on sales"""
    df = pd.DataFrame([p.dict() for p in price_points])
    df['date'] = pd.to_datetime(df['date'])
    df['day'] = df['date'].dt.day_name()
    df['hour'] = df['date'].dt.hour
    
    # Find day with most sales
    sales_by_day = df[df['sold']]['day'].value_counts()
    best_day = sales_by_day.index[0] if len(sales_by_day) > 0 else 'Monday'
    
    # Find hour with most sales
    sales_by_hour = df[df['sold']]['hour'].value_counts()
    best_hour = sales_by_hour.index[0] if len(sales_by_hour) > 0 else 12
    best_time = f"{best_hour:02d}:00"
    
    return best_day, best_time

@router.post("/analyze-price")
def analyze_price(body: PriceAnalysisRequest) -> PriceAnalysisResponse:
    """Analyze market prices and provide recommendations"""
    # For now, generate mock data based on keywords
    # This will be replaced with real data from eBay API and web scraping
    base_price = 100.0  # This would be determined by ML model
    
    # Generate mock historical data
    price_points = generate_mock_price_data(base_price, 90)  # 90 days of data
    
    # Calculate price statistics
    prices = [p.price for p in price_points]
    suggested_price = np.median(prices)
    price_range = {
        'min': np.percentile(prices, 25),
        'max': np.percentile(prices, 75)
    }
    
    # Calculate market trends
    market_trends = calculate_market_trends(price_points)
    
    # Get real competitor listings
    competitors = get_competitor_listings(body.keywords)
    
    # Analyze best timing
    best_day, best_time = analyze_best_timing(price_points)
    
    # Calculate confidence score based on amount of data
    confidence_score = min(1.0, len(price_points) / 100)
    
    return PriceAnalysisResponse(
        suggested_price=round(suggested_price, 2),
        price_range={
            'min': round(price_range['min'], 2),
            'max': round(price_range['max'], 2)
        },
        confidence_score=round(confidence_score, 2),
        market_trends=market_trends,
        price_history=sorted(price_points, key=lambda x: x.date, reverse=True),
        active_competitors=competitors,
        best_day_to_list=best_day,
        best_time_to_list=best_time
    )
