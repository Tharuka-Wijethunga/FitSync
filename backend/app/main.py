
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from pymongo import MongoClient, ASCENDING
from .core.config import settings
from .routes import auth, workouts, users, coach, chat
from fastapi.middleware.cors import CORSMiddleware
from bson.binary import UuidRepresentation
from uuid import UUID
import json

class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

app = FastAPI(
    title="FitSync Pro Backend",
    description="API for user management and workout plan requests.",
    version="1.0.0",
    json_encoder=UUIDEncoder
)

# This list contains the origins that are allowed to make requests to our API.
origins = [
    "http://localhost:5173", # The origin of our React frontend
    "http://localhost:3000", # Common alternative port for React dev servers
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Database connection handling
@app.on_event("startup")
def startup_db_client():
    app.mongodb_client = MongoClient(
        settings.DATABASE_URL,
        uuidRepresentation='standard' 
    )
    app.database = app.mongodb_client[settings.DATABASE_NAME]

    try:
        print("Creating database indexes...")
        app.database.users.create_index([("email", ASCENDING)], unique=True, name="email_unique_idx")
        app.database.users.create_index([("gym_registration_number", ASCENDING)], unique=True, name="gym_reg_unique_idx")
        print("Indexes created successfully.")
    except Exception as e:
        print(f"An error occurred while creating indexes: {e}")
        
    print(f"Connected to MongoDB database: {settings.DATABASE_NAME}")
    print(f"Using UUID Representation: {app.mongodb_client.uuid_representation}")


@app.on_event("shutdown")
def shutdown_db_client():
    app.mongodb_client.close()
    print("MongoDB connection closed.")


app.include_router(auth.router, tags=["Authentication"], prefix="/auth")
app.include_router(workouts.router, tags=["Workouts"], prefix="/workouts")
app.include_router(users.router, tags=["Users"], prefix="/users")
app.include_router(coach.router, tags=["Coach"], prefix="/coach")
app.include_router(chat.router, tags=["Chatbot"], prefix="/chat")

@app.get("/")
def read_root():
    return {"message": "Welcome to the FitSync Pro API"}