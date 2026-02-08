import os
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
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

# Helper to get user from token
async def get_current_user_id(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        # For development/testing, return a mock ID if no token or if it's the mock-token
        if authorization == "Bearer mock-token" or not authorization:
            return os.getenv("MOCK_USER_ID", "mock_auth0_id")
        return os.getenv("MOCK_USER_ID", "mock_auth0_id")
    
    try:
        token = authorization.split(" ")[1]
        import json
        import base64
        # Extract sub from JWT payload
        _, payload, _ = token.split(".")
        # Add padding if needed
        padding = "=" * (4 - len(payload) % 4)
        decoded = base64.b64decode(payload + padding).decode("utf-8")
        data = json.loads(decoded)
        return data.get("sub")
    except Exception as e:
        print(f"Token decode error: {e}")
        return "mock_auth0_id"

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

class AnalyzePayload(BaseModel):
    Song_name: str
    Instrument: str
    Audio_length: float
    Recording: str
    Target_XML: str
    BPM: int
    Start_Measure: int

# Endpoints
@app.get("/")
async def root():
    return {"message": "Harmony Helper API is running"}

@app.post("/api/users/sync")
async def sync_user(user: UserSync):
    if not supabase: raise HTTPException(500, "Supabase not configured")
    
    data = {
        "auth0_id": user.sub,
        "email": user.email,
        "name": user.name,
        "picture": user.picture
    }
    
    res = supabase.table("users").upsert(data, on_conflict="auth0_id").execute()
    return {"status": "success", "data": res.data}

@app.post("/api/analyze")
async def analyze(payload: AnalyzePayload):
    # Mock AI response for now (to be replaced by teammates)
    return {
        "performace_summary": f"Great session with {payload.Song_name}! Your {payload.Instrument} playing showed good rhythm at {payload.BPM} BPM.",
        "coach-feedback": f"Try focusing on the transition at measure {payload.Start_Measure}. Keep up the steady practice!",
        "user-spectrogram": "dummy_user_spectrogram_base64",
        "target-spectrogram": "dummy_target_spectrogram_base64",
        "marked-up-musicxml": payload.Target_XML
    }

@app.post("/api/sessions")
async def save_session(session: SessionBase, auth0_id: str = Depends(get_current_user_id)):
    if not supabase: raise HTTPException(500, "Supabase not configured")
    
    user_res = supabase.table("users").select("id, streak_count, last_practice_date").eq("auth0_id", auth0_id).execute()
    if not user_res.data:
        raise HTTPException(404, "User not found. Please sync first.")
    
    user_info = user_res.data[0]
    user_id = user_info["id"]
    
    # Streak Logic
    new_streak = user_info.get("streak_count", 0) or 0
    last_date_str = user_info.get("last_practice_date")
    today = datetime.now().date()
    
    if last_date_str:
        try:
            # Parse ISO date, handling potential whitespace/padding
            last_date = datetime.fromisoformat(last_date_str.replace("Z", "+00:00")).date()
            if last_date == today - timedelta(days=1):
                new_streak += 1
            elif last_date < today - timedelta(days=1):
                new_streak = 1
            # If they already practiced today, keep streak the same
        except Exception:
            new_streak = 1
    else:
        new_streak = 1

    audio_url = None
    if session.audioBase64:
        try:
            import base64
            # Strip header if present
            if "," in session.audioBase64:
                _, encoded = session.audioBase64.split(",", 1)
            else:
                encoded = session.audioBase64
                
            audio_data = base64.b64decode(encoded)
            filename = f"{user_id}/{datetime.now().timestamp()}.webm"
            # Actual upload logic would go here
            audio_url = f"{SUPABASE_URL}/storage/v1/object/public/recordings/{filename}"
        except Exception as e:
            print(f"Audio processing failed: {e}")

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
    
    # Insert session
    supabase.table("sessions").insert(session_data).execute()
    
    # Update user streak and last_practice_date
    supabase.table("users").update({
        "streak_count": new_streak,
        "last_practice_date": datetime.now().isoformat()
    }).eq("id", user_id).execute()
    
    return {"status": "success", "streak": new_streak}

@app.get("/api/sessions")
async def get_sessions(auth0_id: str = Depends(get_current_user_id)):
    if not supabase: raise HTTPException(500, "Supabase not configured")
    
    user_res = supabase.table("users").select("id").eq("auth0_id", auth0_id).execute()
    if not user_res.data: return []
    
    user_id = user_res.data[0]["id"]
    res = supabase.table("sessions").select("*").eq("user_id", user_id).order("date", desc=True).execute()
    return res.data

@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str, auth0_id: str = Depends(get_current_user_id)):
    if not supabase: raise HTTPException(500, "Supabase not configured")
    
    user_res = supabase.table("users").select("id").eq("auth0_id", auth0_id).execute()
    if not user_res.data: raise HTTPException(403)
    
    user_id = user_res.data[0]["id"]
    supabase.table("sessions").delete().eq("id", session_id).eq("user_id", user_id).execute()
    return {"status": "success"}

@app.get("/api/stats")
async def get_stats(auth0_id: str = Depends(get_current_user_id)):
    if not supabase: raise HTTPException(500, "Supabase not configured")
    
    user_res = supabase.table("users").select("id, streak_count").eq("auth0_id", auth0_id).execute()
    if not user_res.data:
        return {"weekly_progress": [], "streak": 0, "total_minutes": 0}
    
    user_id = user_res.data[0]["id"]
    streak = user_res.data[0].get("streak_count", 0)
    
    # Total minutes
    sessions_res = supabase.table("sessions").select("duration_seconds").eq("user_id", user_id).execute()
    total_seconds = sum(s["duration_seconds"] for s in sessions_res.data)
    total_minutes = total_seconds // 60
    
    # Weekly progress
    from collections import defaultdict
    daily_stats = defaultdict(int)
    
    # Get last 7 days of sessions
    seven_days_ago = datetime.now() - timedelta(days=7)
    sessions_res = supabase.table("sessions") \
        .select("date, duration_seconds") \
        .eq("user_id", user_id) \
        .gte("date", seven_days_ago.isoformat()) \
        .execute()
    
    for s in sessions_res.data:
        try:
            # Parse date and get day name
            dt = datetime.fromisoformat(s["date"].replace("Z", "+00:00"))
            day_name = dt.strftime("%a")
            daily_stats[day_name] += s["duration_seconds"] // 60
        except Exception:
            continue
            
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_progress = [{"day": d, "minutes": daily_stats.get(d, 0)} for d in days]

    return {
        "weekly_progress": weekly_progress,
        "streak": streak,
        "total_minutes": total_minutes
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
