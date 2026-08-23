"""
KelanaAI - Session 04: PostgreSQL Database Integration
"""

from fastapi import FastAPI, HTTPException
from database import init_db, SessionLocal
from models.trip import Trip
from schemas.trip import TripRequest, TripUpdate

from services.trip_service import (
    get_trip_category,
    calculate_daily_budget,
)

app = FastAPI(title="KelanaAI API - Stateful")

# Initialize database tables when the app starts
init_db()

# -------------------------------------------------------------
# CREATE (POST)
# -------------------------------------------------------------
@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    """Saves a new trip permanently into PostgreSQL."""
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget
    )
    
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()
    
    return trip

# -------------------------------------------------------------
# READ (GET)
# -------------------------------------------------------------
@app.get("/api/v1/trips")
def list_trips():
    """Returns all saved trips."""
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    """Retrieves one trip by ID."""
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip

# -------------------------------------------------------------
# UPDATE (PUT) - Homework Challenge
# -------------------------------------------------------------
@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripUpdate):
    """Updates budget and recalculates category + daily_budget."""
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    
    # Update and recalculate based on new budget
    trip.budget = request.budget
    trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
    trip.category = get_trip_category(trip.budget)
    
    db.commit()
    db.refresh(trip)
    db.close()
    
    return trip

# -------------------------------------------------------------
# DELETE (DELETE) - Homework Challenge
# -------------------------------------------------------------
@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    """Removes a trip by ID."""
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
        
    db.delete(trip)
    db.commit()
    db.close()
    
    return {"message": f"Trip {trip_id} successfully deleted"}