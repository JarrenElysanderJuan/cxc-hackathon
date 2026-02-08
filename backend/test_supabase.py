import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def test_connection():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or "your_supabase_url_here" in url:
        print("❌ Error: SUPABASE_URL not set in .env")
        return

    if not key or "your_supabase_service_role_key_here" in key:
        print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not set in .env")
        return

    print(f"Connecting to {url}...")
    try:
        supabase: Client = create_client(url, key)
        # Try to list tables or check health
        # We'll just try to select from users table
        res = supabase.table("users").select("count", count="exact").limit(0).execute()
        print("✅ Successfully connected to Supabase!")
        print(f"📊 User count: {res.count}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_connection()
