import os
import asyncio
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def seed_data():
    print("🌱 Starting data seeding for all users...")
    
    # 1. Fetch all users
    user_res = supabase.table("users").select("id, name, auth0_id").execute()
    
    if not user_res.data:
        print("❌ No users found in database. Please log in to the app first to create user profiles.")
        return
    
    print(f"👥 Found {len(user_res.data)} users.")

    today = datetime.now()
    songs = [
        ("Ode to Joy", "Piano"),
        ("Minuet in G", "Violin"),
        ("C Major Scale", "Piano"),
        ("Twinkle Twinkle", "Guitar"),
        ("Greensleeves", "Flute")
    ]

    for user in user_res.data:
        user_id = user["id"]
        print(f"\n👤 Processing User: {user['name']} ({user['auth0_id']})")
        
        sessions = []
        
        for i in range(7):
            target_date = today - timedelta(days=6-i)
            
            # 80% chance they practiced that day
            if random.random() > 0.2:
                num_sessions = random.randint(1, 3)
                for _ in range(num_sessions):
                    song, inst = random.choice(songs)
                    duration = random.randint(300, 1800)
                    
                    session_data = {
                        "user_id": user_id,
                        "song_name": song,
                        "instrument": inst,
                        "duration_seconds": duration,
                        "total_practice_seconds": duration,
                        "date": target_date.isoformat(),
                        "xml_content": "<!-- Seed Data -->",
                        "analysis_summary": "Great session! Keep working on your timing.",
                        "analysis_feedback": "Focus on the transition between measure 4 and 5.",
                        "audio_url": None
                    }
                    sessions.append(session_data)

        if sessions:
            try:
                print(f"  🚀 Inserting {len(sessions)} sessions...")
                supabase.table("sessions").insert(sessions).execute()
                
                # Update user streak
                supabase.table("users").update({
                    "streak_count": 7,
                    "last_practice_date": today.isoformat()
                }).eq("id", user_id).execute()
                print(f"  ✅ Done with {user['name']}")
            except Exception as e:
                print(f"  ❌ Error for {user['name']}: {e}")

    print("\n✨ ALL USERS POPULATED SUCCESSFULLY! ✨")

if __name__ == "__main__":
    asyncio.run(seed_data())
