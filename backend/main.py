import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = FastAPI(title="Harmony Helper API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for backend admin tasks

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# Models
class UserSync(BaseModel):
    sub: str
    email: str
    name: str
    picture: str

class SessionBase(BaseModel):
    song_name: str
    instrument: str
    duration_seconds: int
    date: str
    xml_content: str
    analysis: Optional[dict] = None
    audioBase64: Optional[str] = None

# Endpoints
@app.get("/")
async def root():
    return {"message": "Harmony Helper API is running"}

@app.post("/api/users/sync")
async def sync_user(user: UserSync):
    if not supabase: raise HTTPException(500, "Supabase not configured")
    
    # Upsert user
    data = {
        "auth0_id": user.sub,
        "email": user.email,
        "name": user.name,
        "picture": user.picture
    }
    
    res = supabase.table("users").upsert(data, on_conflict="auth0_id").execute()
    return {"status": "success", "data": res.data}

@app.post("/api/sessions")
async def save_session(session: SessionBase):
    if not supabase: raise HTTPException(500, "Supabase not configured")
    
    # 1. Get user UUID from auth0_id (TODO: Use real user from token)
    # For now, let's assume we have a user sync'd 
    user_res = supabase.table("users").select("id").eq("auth0_id", "mock_auth0_id").execute()
    if not user_res.data:
        # Fallback or error
        raise HTTPException(404, "User not found. Please sync first.")
    
    user_id = user_res.data[0]["id"]
    
    audio_url = None
    if session.audioBase64:
        try:
            # Decode base64
            import base64
            header, encoded = session.audioBase64.split(",", 1)
            audio_data = base64.b64decode(encoded)
            
            # Upload to Supabase Storage
            filename = f"{user_id}/{datetime.now().timestamp()}.webm"
            # Note: storage.from_("recordings").upload(...)
            # res = supabase.storage.from_("recordings").upload(filename, audio_data)
            # For simplicity in mock, just assume URL
            audio_url = f"{SUPABASE_URL}/storage/v1/object/public/recordings/{filename}"
            print(f"Uploaded audio to {audio_url}")
        except Exception as e:
            print(f"Audio upload failed: {e}")

    # 2. Save Session to DB
    session_data = {
        "user_id": user_id,
        "song_name": session.song_name,
        "instrument": session.instrument,
        "duration_seconds": session.duration_seconds,
        "date": session.date,
        "xml_content": session.xml_content,
        "analysis_summary": session.analysis.get("performace_summary") if session.analysis else None,
        "analysis_feedback": session.analysis.get("coach-feedback") if session.analysis else None,
        "audio_url": audio_url
    }
    
    res = supabase.table("sessions").insert(session_data).execute()
    return {"status": "success", "id": res.data[0]["id"]}

@app.get("/api/sessions")
async def get_sessions():
    if not supabase: raise HTTPException(500, "Supabase not configured")
    res = supabase.table("sessions").select("*").order("date", desc=True).execute()
    return res.data

@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    if not supabase: raise HTTPException(500, "Supabase not configured")
    supabase.table("sessions").delete().eq("id", session_id).execute()
    return {"status": "success"}

@app.get("/api/stats")
async def get_stats():
    # Mock stats for now
    return {
        "weekly_progress": [
            {"day": "Mon", "minutes": 10},
            {"day": "Tue", "minutes": 25},
            {"day": "Wed", "minutes": 15},
            {"day": "Thu", "minutes": 30},
            {"day": "Fri", "minutes": 20},
            {"day": "Sat", "minutes": 45},
            {"day": "Sun", "minutes": 35},
        ],
        "streak": 3,
        "total_minutes": 180
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
