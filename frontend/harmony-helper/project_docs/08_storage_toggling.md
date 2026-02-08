# Storage Toggling Guide

Harmony Helper supports two storage modes: **Local (Mock)** and **API (Remote)**. This allows for development without a backend and easy transition to production.

## How to Toggle Modes

Mode switching is controlled via environment variables in `frontend/harmony-helper/.env`.

### 1. Local / Mock Storage (Default)
In this mode, all session data and history are stored in the browser's `localStorage`. This is ideal for frontend development and offline testing.

**Configuration:**
```bash
VITE_USE_MOCK_STORAGE=true
```

### 2. API / Remote Storage (Supabase)
In this mode, the frontend communicates with the FastAPI backend, which stores data in Supabase. Audio files are uploaded to Supabase Storage.

**Configuration:**
```bash
VITE_USE_MOCK_STORAGE=false
VITE_API_URL=http://localhost:8000
```

## Architecture Details

- **Interface**: Both modes implement the `IStorageService` interface defined in `src/services/storage/types.ts`.
- **Factory**: The `storageService` is instantiated in `src/services/storage/index.ts` based on the environment variable.
- **State Integration**: `useSessionStore` interacts only with the `storageService` singleton, making it agnostic to the underlying persistence mechanism.

## Backend Requirements for API Mode
When using API storage, ensure:
1. The FastAPI server is running (`cd backend && python main.py`).
2. Supabase credentials are set in `backend/.env`.
3. The `recordings` bucket exists in Supabase Storage and is set to "Public".
