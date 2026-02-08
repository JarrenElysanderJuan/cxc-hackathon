# Harmony Helper 🎵

Harmony Helper is an AI-powered music practice coach. It allows musicians to upload sheet music (MusicXML), record their practice sessions, and receive instant AI-driven feedback on their performance.

## Core Features
- **Instrument Selector**: Supports Piano, Voice, Guitar, and more.
- **AI Coach**: Interactive "Cortana-style" avatar with line-by-line karaoke feedback.
- **Acoustic Precision**: Configured for 44.1kHz high-fidelity music recording.
- **Practice Tools**: Integrated metronome with count-in, auto-scrolling sheet music, and measure jumping.
- **Gamification**: Streak tracking and practice history with audio playback.

---

## Tech Stack
### Frontend
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **State**: Zustand
- **Sheet Music**: OpenSheetMusicDisplay (OSMD)
- **Auth**: Auth0

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL + RLS)
- **Storage**: Supabase Storage (Audio recordings)
- **Environment**: Python Virtual Env (venv)

---

## Prerequisites
- **Node.js**: v18+ 
- **Python**: v3.10+
- **Supabase Account**: For database and storage.
- **Auth0 Account**: For user authentication.

---

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# or: source venv/bin/activate # Unix/macOS

pip install -r requirements.txt
```

**Configuration**: Create a `backend/.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Frontend Setup
```bash
cd frontend/harmony-helper
npm install
```

**Configuration**: Create a `frontend/harmony-helper/.env` file:
```env
VITE_AUTH0_DOMAIN=your_auth0_domain
VITE_AUTH0_CLIENT_ID=your_auth0_client_id
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_STORAGE=false  # Set to true to use browser localStorage only
VITE_ELEVENLABS_KEY=your_key  # Optional for AI voice
```

---

## Running the Application

### Start Backend
```bash
cd backend
.\venv\Scripts\python.exe main.py
```
The API will run on `http://localhost:8000`.

### Start Frontend
```bash
cd frontend/harmony-helper
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## Documentation
- **Architecture & Guides**: See `frontend/harmony-helper/project_docs/`
- **Model Handoff Context**: See `frontend/harmony-helper/context/`
- **Storage Toggling**: See `frontend/harmony-helper/project_docs/08_storage_toggling.md`
