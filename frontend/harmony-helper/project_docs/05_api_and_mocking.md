# API Layer & Mocking Strategy

## Overview
The application uses a centralized API service pattern located at `src/services/api.ts`. This allows for easy switching between mock data (for development) and real backend calls.

## `api.analyze` Endpoint

### Function Signature
```typescript
analyze: async (payload: AnalyzePayload): Promise<AnalysisResponse>
```

### Request Payload (`AnalyzePayload`)
- `Song_name` (string): Name of the song being practiced.
- `Instrument` (string): Instrument used (e.g., "Piano", "Voice").
- `Audio_length` (number): Duration of the recording in seconds.
- `Recording` (string): Base64 encoded audio string (from `Blob`).
- `Target_XML` (string): The raw MusicXML content of the practiced piece.

### Response Payload (`AnalysisResponse`)
- `performace_summary` (string): A short textual summary of the performance.
- `coach-feedback` (string): Detailed actionable feedback.
- `user-spectrogram` (string): Base64 image or URL of the user's audio spectrogram.
- `target-spectrogram` (string): Base64 image or URL of the target/perfect execution spectrogram.
- `marked-up-musicxml` (string): The original MusicXML with added markup tags for errors (to be rendered by OSMD).

## Mocking Strategy
Currently, `api.ts` contains a `delay` function to simulate network latency (2000ms).
Inside `analyze`, it returns a hardcoded `mockResponse`.

To connect to a real backend:
1.  Replace the mock return with a `fetch` or `axios` call.
2.  Ensure the backend accepts JSON body or `FormData` (if sending binary directly).
3.  Use environment variables (`VITE_API_URL`) to define the backend host.
