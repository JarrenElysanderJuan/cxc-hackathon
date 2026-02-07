# ElevenLabs Integration (Text-to-Speech)

## Overview
The application uses ElevenLabs to give the AI Coach a realistic voice. This is handled in `src/services/elevenlabs.ts` and utilized by the `AIAvatar` component.

## Architecture
- **Service**: `elevenLabsService`
- **Method**: `speakText(text: string): Promise<string>`
- **Output**: Returns a URL string (`blob:https://...`) pointing to the generated audio.

## Implementation Details
1.  **API Key**: Requires `VITE_ELEVENLABS_KEY` in `.env`.
2.  **Voice ID**: Currently hardcoded to a specific voice ID (e.g., `21m00Tcm4TlvDq8ikWAM` - verify in code).
3.  **Fallback**: The `AIAvatar` component has a `try/catch` block. If ElevenLabs fails (e.g., loose connection, missing key, quota exceeded), it falls back to the browser's native `window.speechSynthesis` (Web Speech API).

## Usage
The `AIAvatar` component receives `feedbackText` as a prop.
- On mount or update, if `autoSpeak` is true, it calls `speak()`.
- `speak()` calls `elevenLabsService.speakText()`.
- The returned Blob URL is played via an HTML5 `Audio` element.

## Caching (Optimization)
Currently, there is no caching implemented. Each feedback generation request hits the API.
**Future Optimization**: Store mapping of `text -> blobUrl` to avoid re-fetching common phrases.
