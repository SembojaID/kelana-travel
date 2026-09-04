"""
KelanaAI - Session 04: PostgreSQL Database Integration
"""
from contextlib import asynccontextmanager
from models.trip import Trip
from services.bedrock_service import generate_itinerary

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, SessionLocal
from models.trip import Trip
from models.user import User
from schemas.trip import TripRequest, TripUpdate
from schemas.user_schema import UserCreate, UserLogin
from auth import get_password_hash, verify_password, create_access_token
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from auth import SECRET_KEY, ALGORITHM
from services.trip_service import (
    get_travel_season,
    get_trip_category,
    calculate_daily_budget,
)

from pydantic import BaseModel
from services.kb_service import ask_knowledge_base
from models.conversation import Conversation, Message
from schemas.conversation_schema import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)
from services.chat_service import generate_chat_response
class QuestionRequest(BaseModel):
    question: str
    
# Insert the lifespan context manager right before app = FastAPI(...)
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # Ensures database tables are created on startup
    yield

app = FastAPI(title="KelanaAI API - Stateful")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Initialize database tables when the app starts
init_db()
# -----------------------------------------------------------------------
# AUTHENTICATION
# -----------------------------------------------------------------------

@app.post("/api/v1/auth/register")
def register(user: UserCreate):
    db = SessionLocal()
    
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    
    new_user = User(
        name=user.name, 
        email=user.email, 
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.close()
    
    return {"message": "User created successfully"}

@app.post("/api/v1/auth/login")
def login(user: UserLogin):
    db = SessionLocal()
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if not db_user or not verify_password(user.password, db_user.password_hash):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(db_user.id)})
    db.close()
    
    return {"access_token": access_token, "token_type": "bearer"}


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
def get_current_user(token: str = Depends(oauth2_scheme)):
    db = SessionLocal()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token structure")
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User no longer exists")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    finally:
        db.close()

# ADD IT HERE:
@app.get("/api/v1/auth/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile information and total trips."""
    db = SessionLocal()
    trip_count = db.query(Trip).filter(Trip.user_id == current_user.id).count()
    db.close()
    return {
        "name": current_user.name,
        "email": current_user.email,
        "total_trips": trip_count
    }

# -------------------------------------------------------------
# CREATE (POST)
# -------------------------------------------------------------

@app.post("/api/v1/trips")
def create_trip(request: TripRequest, current_user: User = Depends(get_current_user)):
    """Saves a new trip permanently into PostgreSQL for the logged-in user."""
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    calculated_season = get_travel_season(request.travel_month)

    new_trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        travel_month=request.travel_month,
        category=request.travel_style,
        travel_season=calculated_season,
        user_id=current_user.id  # <-- Bind trip to the authenticated user
    )

    db = SessionLocal()
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    trip_data = {
        "id": new_trip.id,
        "destination": new_trip.destination,
        "days": new_trip.days,
        "budget": new_trip.budget,
        "travel_month": new_trip.travel_month,
        "travel_style": new_trip.category,
        "travel_season": new_trip.travel_season
    }
    db.close()
    
    return trip_data



# -------------------------------------------------------------
# READ (GET)
# -------------------------------------------------------------
@app.get("/api/v1/trips")
def list_trips(current_user: User = Depends(get_current_user)):
    """Returns all saved trips."""
    db = SessionLocal()
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    """Retrieves one trip by ID."""
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    db.close()
    
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip

# -------------------------------------------------------------
# UPDATE (PUT) - Homework Challenge
# -------------------------------------------------------------
@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripUpdate, current_user: User = Depends(get_current_user)):
    """Updates budget and recalculates category + daily_budget."""
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    # NEW: Reject other users' trips (Tugas 2)
    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Forbidden: You cannot edit someone else's trip")
    
    # Update and recalculate based on new budget
    trip.budget = request.budget
    trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
    trip.category = get_trip_category(trip.budget)
    
    db.commit()
    db.refresh(trip)
    db.close()
    
    return trip

# -------------------------------------------------------------
# KNOWLEDGE BASE / RAG ASSISTANT - Session 09
# -------------------------------------------------------------
@app.post("/api/v1/ask")
def ask_question(request: QuestionRequest, current_user: User = Depends(get_current_user)):
    """
    Retrieves grounded answers from Amazon Bedrock Knowledge Base.
    """
    try:
        result = ask_knowledge_base(request.question)
        return {
            "question": request.question,
            "answer": result["answer"],
            "source": result["source"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# -------------------------------------------------------------
# DELETE (DELETE) - Homework Challenge
# -------------------------------------------------------------
@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    """Removes a trip by ID."""
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    # NEW: Reject other users' trips (Tugas 3)
    if trip.user_id != current_user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Forbidden: You cannot delete someone else's trip")
        
    db.delete(trip)
    db.commit()
    db.close()
    
    return {"message": f"Trip {trip_id} successfully deleted"}

# Add this endpoint below your existing routes - on Session 5
@app.post("/api/v1/trips/{trip_id}/generate")
def generate_trip_recommendation(trip_id: int, current_user: User = Depends(get_current_user)):
    """Triggers AI generation for an existing user trip and saves it."""
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
    
    ai_text = generate_itinerary(
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        category=trip.category
    )
    
    trip.ai_recommendation = ai_text
    db.commit()
    db.refresh(trip)
    db.close()
    
    return {
        "trip_id": trip.id,
        "destination": trip.destination,
        "recommendation": trip.ai_recommendation
    }

# -------------------------------------------------------------
# CONVERSATIONAL AI CHAT - Session 10
# -------------------------------------------------------------

@app.post("/api/v1/conversations", status_code=201)
def create_conversation(req: ConversationCreate, current_user: User = Depends(get_current_user)):
    """Create a new conversation thread."""
    db = SessionLocal()
    new_conv = Conversation(user_id=current_user.id, title=req.title or "New Conversation")
    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)
    conv_id = new_conv.id
    db.close()
    return {"conversation_id": conv_id, "title": req.title}


@app.get("/api/v1/conversations")
def list_conversations(current_user: User = Depends(get_current_user)):
    """List all conversation threads for the current user."""
    db = SessionLocal()
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )
    res = [{"id": c.id, "title": c.title, "created_at": c.created_at} for c in convs]
    db.close()
    return res


@app.get("/api/v1/conversations/{conv_id}/messages")
def get_messages(conv_id: int, current_user: User = Depends(get_current_user)):
    """Retrieve all messages in a conversation thread."""
    db = SessionLocal()
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conv_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        db.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    res = [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at,
        }
        for m in messages
    ]
    db.close()
    return res


@app.post("/api/v1/conversations/{conv_id}/messages")
def send_message(conv_id: int, req: MessageCreate, current_user: User = Depends(get_current_user)):
    """Send a user message, rebuild history context, query Bedrock, and store response."""
    db = SessionLocal()
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conv_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        db.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    # 1. Save user message
    user_msg = Message(conversation_id=conv_id, role="user", content=req.content)
    db.add(user_msg)
    db.commit()

    # Automatically set title from first user message if still default
    if conv.title == "New Conversation":
        conv.title = req.content[:30] + ("..." if len(req.content) > 30 else "")
        db.commit()

    # 2. Fetch all previous messages in thread for context
    history = (
        db.query(Message)
        .filter(Message.conversation_id == conv_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    # 3. Call Bedrock with full multi-turn history context
    ai_text = generate_chat_response(history)

    # 4. Save AI response
    ai_msg = Message(conversation_id=conv_id, role="assistant", content=ai_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    response_data = {
        "id": ai_msg.id,
        "role": ai_msg.role,
        "content": ai_msg.content,
        "created_at": ai_msg.created_at,
    }
    db.close()
    return response_data


@app.patch("/api/v1/conversations/{conv_id}")
def update_conversation_title(conv_id: int, req: ConversationUpdate, current_user: User = Depends(get_current_user)):
    """Rename a conversation title."""
    db = SessionLocal()
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conv_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        db.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.title = req.title
    db.commit()
    db.close()
    return {"message": "Title updated successfully", "title": req.title}