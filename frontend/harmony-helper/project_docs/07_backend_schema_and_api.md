# Backend Schema & API Planning

## Overview
This document outlines the database schema, API endpoints, and frontend integration strategy to transition from local storage to a persistent backend for **Harmony Helper**.

The system will store user practice sessions, including audio recordings, sheet music (XML), and AI analysis results. Authentication is handled via **Auth0**.

## 1. Database Schema
We recommend a **Relational Database** (PostgreSQL) for structured data and **Object Storage** (S3/R2/Supabase Storage) for large files (Audio arrays).

### Tables

#### `users`
Tracks users authenticated via Auth0.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Internal User ID |
| `auth0_id` | VARCHAR | UNIQUE, NOT NULL | ID from Auth0 (`sub` claim) |
| `email` | VARCHAR | NOT NULL | User email |
| `created_at` | TIMESTAMPTZ | Default: `now()` | Account creation date |
| `streak_count` | INTEGER | Default: 0 | Current daily streak |
| `last_practice_date` | TIMESTAMPTZ | NULL | Used for streak calculation |

#### `sessions`
Stores metadata and analysis for each practice session.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: `gen_random_uuid()` | Session ID |
| `user_id` | UUID | FK -> `users.id` | Owner of the session |
| `song_name` | VARCHAR | NOT NULL | Name of the piece practiced |
| `instrument` | VARCHAR | NOT NULL | Instrument used (e.g., "Piano") |
| `duration_seconds` | INTEGER | NOT NULL | Length of practice |
| `date` | TIMESTAMPTZ | Default: `now()` | When the session occurred |
| `xml_content` | TEXT | NULL | MusicXML string (could be large) |
| `analysis_summary` | TEXT | NULL | Short AI summary |
| `analysis_feedback` | TEXT | NULL | Detailed AI feedback |
| `score_accuracy` | INTEGER | NULL | Optional: Logic implementation dependent |
| `audio_url` | VARCHAR | NULL | URL to audio file in Object Storage |

### Object Storage (Buckets)
*   **Bucket**: `harmony-helper-recordings`
    *   **Path**: `/{user_id}/{session_id}.webm`

---

## 2. API Endpoints
All endpoints require an **Authorization Header** with the Auth0 Bearer Token.

### User Routes
*   `POST /api/users/sync`
    *   **Purpose**: Ensures user exists in DB after login. Call this on app init if Auth0 user is present.
    *   **Body**: `{ email: string, auth0_id: string, name: string }`

### Session Routes
*   `GET /api/sessions`
    *   **Purpose**: Fetch history list (metadata only) for the logged-in user.
    *   **Response**: `[{ id, song_name, instrument, date, duration_seconds }, ...]`

*   `GET /api/sessions/:id`
    *   **Purpose**: Fetch full details for a specific session (including XML, Feedback, Audio URL).
    *   **Response**: `SessionData` object.

*   `POST /api/sessions`
    *   **Purpose**: Save a completed session.
    *   **Body**: `{ songName, instrument, duration, xmlContent, analysis, audioBase64? }`
    *   **Note**: Backend handles uploading `audioBase64` to Object Storage and saving the URL to DB.

*   `DELETE /api/sessions/:id`
    *   **Purpose**: Delete a session.

### Stats Routes
*   `GET /api/stats`
    *   **Purpose**: Fetch aggregated stats for the graph (e.g., minutes practiced per day).
    *   **Response**: `{ weekly_progress: [{ day: 'Mon', minutes: 20 }, ...], streak: 5 }`

---

## 3. Frontend Integration & Toggle Strategy

We will use the **Repository Pattern** or **Service Strategy Pattern** to switch between Real API and Local/Mock storage.

### Interface
Define a common interface `IStorageService`:
```typescript
interface IStorageService {
    getSessions(): Promise<SessionData[]>;
    getSessionById(id: string): Promise<SessionData | null>;
    saveSession(session: SessionData): Promise<void>;
    deleteSession(id: string): Promise<void>;
    getUserStats(): Promise<UserStatsData>;
}
```

### Implementations
1.  **`LocalStorageService` (Current)**:
    *   Uses `useSessionStore` / `localStorage`.
    *   Stores audio as Base64 strings (limitations apply).
2.  **`ApiStorageService` (New)**:
    *   Uses `fetch` / `axios`.
    *   Sends/Receives data from the backend.

### The Toggle
In `src/services/storageFactory.ts`:
```typescript
const USE_MOCK = import.meta.env.VITE_USE_MOCK_STORAGE === 'true';

export const storageService: IStorageService = USE_MOCK 
    ? new LocalStorageService() 
    : new ApiStorageService();
```

## 4. Implementation Steps

1.  **Backend Setup**:
    *   Initialize database (Postgres) and Object Storage.
    *   Set up API server (Node/Express/NestJS or Python/FastAPI).
    *   Implement Auth0 middleware for token verification.

2.  **Frontend Refactoring**:
    *   Create `IStorageService` interface.
    *   Refactor `useSessionStore` to delegate persistence calls to `storageService` instead of handling `localStorage` directly (or keep Zustand for *state* separate from *persistence*).
    *   *Correction*: `persist` middleware in Zustand *is* the Sync engine currently. We would likely **remove** `persist` middleware for the *Data* part and instead load data on mount (`useEffect`) using the service.

3.  **Endpoint Integration**:
    *   Implement `ApiStorageService`.
    *   Add `VITE_USE_MOCK_STORAGE` to `.env`.
    *   Test seamless switching.
