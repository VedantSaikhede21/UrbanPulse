from typing import List

from pydantic import BaseModel


class WardScore(BaseModel):
    id: str
    name: str
    uhs_score: float


class WardSummary(BaseModel):
    name: str
    uhs_score: float


class TrendingCategory(BaseModel):
    category: str
    count: int


class CityPulseResponse(BaseModel):
    wards: List[WardSummary]
    critical_wards: int
    trending_categories: List[TrendingCategory]
    pulse_alerts: List[str]