from fastapi import APIRouter
from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

router = APIRouter()

class SalesByPlatform(BaseModel):
    platform: str
    total_sales: int
    total_revenue: float
    average_price: float
    growth_rate: float  # Month over month growth

class InventoryMetrics(BaseModel):
    total_items: int
    active_listings: int
    sold_items: int
    average_days_to_sell: float
    turnover_rate: float  # Items sold / total items

class TimeSeriesPoint(BaseModel):
    date: str
    value: float

class PlatformBreakdown(BaseModel):
    platform: str
    value: float
    percentage: float

class AnalyticsSummary(BaseModel):
    total_revenue: float
    total_sales: int
    average_price: float
    profit_margin: float
    platform_metrics: List[SalesByPlatform]
    inventory_metrics: InventoryMetrics
    revenue_trend: List[TimeSeriesPoint]
    sales_trend: List[TimeSeriesPoint]
    platform_revenue_breakdown: List[PlatformBreakdown]
    top_categories: List[PlatformBreakdown]

def generate_mock_time_series(base_value: float, days: int, trend: float = 0.1, volatility: float = 0.2) -> List[TimeSeriesPoint]:
    """Generate mock time series data with trend and volatility"""
    dates = [datetime.now() - timedelta(days=x) for x in range(days)]
    values = []
    current = base_value
    
    for i in range(days):
        # Add trend and random noise
        change = current * (trend/days + np.random.normal(0, volatility))
        current += change
        values.append(max(current, 0))  # Ensure non-negative
    
    return [
        TimeSeriesPoint(
            date=date.strftime('%Y-%m-%d'),
            value=round(value, 2)
        )
        for date, value in zip(dates, values)
    ]

def calculate_growth_rate(values: List[float]) -> float:
    """Calculate month-over-month growth rate"""
    if len(values) < 2 or values[-2] == 0:
        return 0.0
    return ((values[-1] - values[-2]) / values[-2]) * 100

@router.get("/summary")
def get_analytics_summary() -> AnalyticsSummary:
    """Get comprehensive analytics summary with mock data"""
    # Mock platform metrics
    platforms = ['Poshmark', 'Mercari', 'eBay']
    platform_metrics = []
    total_revenue = 0
    total_sales = 0
    
    for platform in platforms:
        sales = np.random.randint(50, 200)
        revenue = sales * np.random.uniform(30, 100)
        total_sales += sales
        total_revenue += revenue
        
        platform_metrics.append(SalesByPlatform(
            platform=platform,
            total_sales=sales,
            total_revenue=round(revenue, 2),
            average_price=round(revenue/sales, 2),
            growth_rate=round(np.random.uniform(-10, 20), 1)
        ))
    
    # Mock inventory metrics
    active = np.random.randint(100, 500)
    sold = np.random.randint(50, 200)
    inventory_metrics = InventoryMetrics(
        total_items=active + sold,
        active_listings=active,
        sold_items=sold,
        average_days_to_sell=round(np.random.uniform(10, 30), 1),
        turnover_rate=round(sold/(active + sold), 2)
    )
    
    # Generate time series data
    revenue_trend = generate_mock_time_series(total_revenue/30, 30, trend=0.2)
    sales_trend = generate_mock_time_series(total_sales/30, 30, trend=0.15)
    
    # Calculate platform revenue breakdown
    total = sum(p.total_revenue for p in platform_metrics)
    platform_breakdown = [
        PlatformBreakdown(
            platform=p.platform,
            value=p.total_revenue,
            percentage=round((p.total_revenue/total) * 100, 1)
        )
        for p in platform_metrics
    ]
    
    # Mock top categories
    categories = ['Clothing', 'Shoes', 'Accessories', 'Electronics', 'Home']
    category_values = np.random.dirichlet(np.ones(len(categories))) * total_revenue
    top_categories = [
        PlatformBreakdown(
            platform=cat,
            value=round(val, 2),
            percentage=round((val/total_revenue) * 100, 1)
        )
        for cat, val in zip(categories, category_values)
    ]
    
    return AnalyticsSummary(
        total_revenue=round(total_revenue, 2),
        total_sales=total_sales,
        average_price=round(total_revenue/total_sales, 2),
        profit_margin=round(np.random.uniform(0.2, 0.4) * 100, 1),
        platform_metrics=platform_metrics,
        inventory_metrics=inventory_metrics,
        revenue_trend=revenue_trend,
        sales_trend=sales_trend,
        platform_revenue_breakdown=sorted(platform_breakdown, key=lambda x: x.value, reverse=True),
        top_categories=sorted(top_categories, key=lambda x: x.value, reverse=True)
    )
