from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Rick Teacher Game Models
class PlayerProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    player_name: str
    score: int = 0
    level: int = 1
    consecutive_correct: int = 0
    total_attempts: int = 0
    correct_answers: int = 0
    wrong_answers: int = 0
    last_played: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlayerProgressCreate(BaseModel):
    player_name: str
    score: int = 0
    level: int = 1
    consecutive_correct: int = 0
    total_attempts: int = 0
    correct_answers: int = 0
    wrong_answers: int = 0

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Rick Teacher Game Endpoints
@api_router.post("/player/progress", response_model=PlayerProgress)
async def save_player_progress(input: PlayerProgressCreate):
    """Save or update player progress"""
    player_dict = input.model_dump()
    
    # Check if player already exists
    existing_player = await db.player_progress.find_one(
        {"player_name": player_dict["player_name"]}, 
        {"_id": 0}
    )
    
    if existing_player:
        # Update existing player
        player_dict['last_played'] = datetime.now(timezone.utc).isoformat()
        await db.player_progress.update_one(
            {"player_name": player_dict["player_name"]},
            {"$set": player_dict}
        )
        player_obj = PlayerProgress(**player_dict)
    else:
        # Create new player
        player_obj = PlayerProgress(**player_dict)
        doc = player_obj.model_dump()
        doc['last_played'] = doc['last_played'].isoformat()
        await db.player_progress.insert_one(doc)
    
    return player_obj

@api_router.get("/player/progress/{player_name}", response_model=PlayerProgress)
async def get_player_progress(player_name: str):
    """Get player progress by name"""
    player = await db.player_progress.find_one(
        {"player_name": player_name}, 
        {"_id": 0}
    )
    
    if not player:
        # Return default progress if player not found
        return PlayerProgress(player_name=player_name)
    
    # Convert ISO string timestamp back to datetime
    if isinstance(player['last_played'], str):
        player['last_played'] = datetime.fromisoformat(player['last_played'])
    
    return PlayerProgress(**player)

@api_router.get("/player/leaderboard", response_model=List[PlayerProgress])
async def get_leaderboard():
    """Get top 10 players by score"""
    players = await db.player_progress.find({}, {"_id": 0}).sort("score", -1).to_list(10)
    
    # Convert ISO string timestamps back to datetime objects
    for player in players:
        if isinstance(player['last_played'], str):
            player['last_played'] = datetime.fromisoformat(player['last_played'])
    
    return players

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()