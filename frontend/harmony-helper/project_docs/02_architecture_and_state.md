# Architecture & State Management

## Folder Structure
The project follows a feature-based and service-oriented architecture:

```
src/
├── components/
│   ├── ui/               # Reusable Shadcn UI components
│   ├── auth/             # Login/Logout buttons, AuthProvider wrapper
│   ├── MusicXMLRenderer  # OSMD wrapper for sheet music
│   ├── RecordingBar      # Controls for recording session
│   ├── AIAvatar          # Visual avatar + TTS logic
│   └── UserStats         # Recharts graph
├── pages/
│   ├── HomePage          # Landing + Stats
│   ├── SessionPage       # Main practice interface
│   └── FeedbackPage      # Results view
├── services/
│   ├── api.ts            # Centralized API calls (Mocked)
│   ├── audio.ts          # MediaRecorder abstraction
│   └── elevenlabs.ts     # TTS Integration
├── store/
│   ├── useAuthStore.ts   # User profile & Token state
│   └── useSessionStore.ts# Session data, recording blobs, analysis results
├── types/                # Shared TypeScript interfaces
```

## State Management Strategy (Zustand)

### 1. `useAuthStore`
- **Purpose**: Tracks if a user is logged in, their profile data (from Auth0), and auth token.
- **Sync**: Updated via `Auth0Provider` hooks in the UI.

### 2. `useSessionStore`
- **Purpose**: The "brain" of the practice session.
- **Key Fields**:
    - `currentSession`: Contains `xmlContent`, `audioBlob`, `songName`.
    - `analysis`: Stores the result from the `/analyze` API call.
    - `isRecording`, `isAnalyzing`: Status flags.
- **Flow**:
    1. `SessionPage` uploads file -> calls `startNewSession`.
    2. User records -> `audioService` returns blob -> calls `setRecordingBlob`.
    3. User requests feedback -> API returns result -> calls `setAnalysisResults`.
    4. `FeedbackPage` reads `analysis` from store to display results.

## Routing
- **Library**: `react-router-dom`
- **Routes**:
    - `/`: Home
    - `/session`: Practice Interface
    - `/feedback`: Analysis Results
- **Wrapper**: `Auth0ProviderWithNavigate` handles Auth0 redirect callbacks.
