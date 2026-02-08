# Technical State Overview

## Frontend Architecture
- **Framework**: React (Vite) + Tailwind + Shadcn UI.
- **State**: Zustand (`useSessionStore`, `useAuthStore`).
- **Storage Layer**: decoupled via `IStorageService`.
    - `LocalStorageService`: Active (Mock).
    - `ApiStorageService`: Scaffolded (Fetches from `VITE_API_URL`).
- **Auth**: Auth0 integration. `Auth0TokenSync` captures tokens and passes them to the storage service via `setToken()`.

## Backend Architecture
- **Framework**: FastAPI (Python 3.10+).
- **Database**: Supabase (PostgreSQL) + Supabase Storage (Audio).
- **Key Files**:
    - `backend/main.py`: Main API.
    - `backend/schema.sql`: DB structure (users, sessions).
    - `backend/venv`: Virtual environment (installed).

## Dependencies of Note
- **Frontend**: OSMD (Sheet Music), Framer Motion (Animations), ElevenLabs (Voice placeholder).
- **Backend**: `supabase`, `fastapi`, `uvicorn`, `pydantic`.
