-- Database schema for Harmony Helper

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Synced from Auth0)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    picture TEXT,
    streak_count INTEGER DEFAULT 0,
    last_practice_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    song_name VARCHAR(255) NOT NULL,
    instrument VARCHAR(100) NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    date TIMESTAMPTZ DEFAULT NOW(),
    xml_content TEXT, -- Could be large, stored as TEXT
    analysis_summary TEXT,
    analysis_feedback TEXT,
    audio_url TEXT, -- URL to Supabase Storage
    total_practice_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth0_id = auth.uid()::text);

-- Policies for sessions
CREATE POLICY "Users can manage their own sessions" 
    ON public.sessions FOR ALL 
    USING (user_id IN (SELECT id FROM public.users WHERE auth0_id = auth.uid()::text));

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
