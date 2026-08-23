"""
KelanaAI - Session 03: REST API with FastAPI
Author: KelanaAI Developer
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List

# Reusing business logic from Session 02 - zero modifications needed
from services.trip_service import (
    get_trip_category,
    get_travel_season,
    calculate_daily_budget,
    get_recommended_transportation,
    get_recommended_places,
    get_all_categories,
    get_all_transportations
)

app = FastAPI(
    title="KelanaAI API",
    description="REST API web service for KelanaAI Travel Planner",
    version="0.3.0"
)


# Pydantic Model for JSON Request Validation
class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_month: Optional[str] = "December"
    travel_style: Optional[str] = "General"


# -------------------------------------------------------------
# 1. Base & Health Endpoints (Hands-on Lab)
# -------------------------------------------------------------
@app.get("/")
def home():
    """Welcome endpoint."""
    return {"message": "Welcome to KelanaAI"}


@app.get("/health")
def health_check():
    """Health check endpoint for hosting platforms."""
    return {"status": "OK"}


# -------------------------------------------------------------
# 2. Informational Endpoints (Challenge & Homework)
# -------------------------------------------------------------
@app.get("/api/v1/trip-categories", response_model=List[str])
def get_categories():
    """Returns all available trip categories."""
    return get_all_categories()


@app.get("/api/v1/recommendations", response_model=List[str])
def get_recommendations():
    """Homework: Returns list of recommended places."""
    return get_recommended_places()


@app.get("/api/v1/transportations", response_model=List[str])
def get_transportations():
    """Homework: Returns list of transport options."""
    return get_all_transportations()


# -------------------------------------------------------------
# 3. Main Business Logic Endpoint (POST Request)
# -------------------------------------------------------------
@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    """
    Receives trip details in JSON, calculates daily budget, 
    determines category/season, and returns recommendations.
    """
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    season = get_travel_season(request.travel_month)
    recommended_transport = get_recommended_transportation(category)
    recommended_places = get_recommended_places()

    return {
        "destination": request.destination,
        "days": request.days,
        "budget": request.budget,
        "travel_month": request.travel_month,
        "travel_style": request.travel_style,
        "daily_budget": daily_budget,
        "category": category,
        "season": season,
        "recommended_transportation": recommended_transport,
        "recommended_places": recommended_places
    }