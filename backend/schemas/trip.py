from pydantic import BaseModel
from typing import Optional

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_month: Optional[str] = "December"
    travel_style: Optional[str] = "General"

class TripUpdate(BaseModel):
    budget: float