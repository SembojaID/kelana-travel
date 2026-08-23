import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load .env so os.getenv() can read it
load_dotenv()

# Connection string from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# engine = the connection pool
engine = create_engine(DATABASE_URL)

# SessionLocal = a factory for DB sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base = all ORM models inherit from this
Base = declarative_base()

def init_db() -> None:
    """Create all SQLAlchemy tables for the configured database."""
    Base.metadata.create_all(bind=engine)