from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from datetime import datetime
from database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False) # NEW: Links trip to owner
    destination = Column(String, nullable=False)
    days = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    travel_month = Column(String, nullable=True)
    travel_season = Column(String, nullable=True)
    category = Column(String, nullable=True)
    daily_budget = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    ai_recommendation = Column(Text, nullable=True)