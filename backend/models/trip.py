from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True)
    destination = Column(String, nullable=False)
    days = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    daily_budget = Column(Float, nullable=False)
    
    # Bonus Challenge: Auto-Save Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)