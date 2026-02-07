# Audio Pipeline & Recording

## audioService (`src/services/audio.ts`)
This service abstracts the browser's `MediaRecorder` API.

### Key Methods
1.  **`start()`**:
    - Requests microphone access (`navigator.mediaDevices.getUserMedia`).
    - Initializes `MediaRecorder` with `audio/webm` (or `audio/mp4` fallback).
    - Starts recording and collects data chunks.
2.  **`stop()`**:
    - Stops the recorder.
    - Compiles chunks into a single `Blob`.
    - Releases microphone tracks to stop the "recording" indicator in the browser.
3.  **`pause()` / `resume()`**:
    - Pauses/Resumes the recording stream without finalizing the file.

## Integration Flow (`SessionPage`)
1.  **User Trigger**: User clicks "Record" in `RecordingBar`.
2.  **Start**: `audioService.start()` is called. Sheet music starts scrolling (simulated via `isPlaying` prop passed to `MusicXMLRenderer`).
3.  **Stop**: User clicks "Stop". `audioService.stop()` returns a `Blob`.
4.  **Store**: The `Blob` is saved to `useSessionStore` (`setRecordingBlob`).
5.  **Analyze**:
    - The `Blob` is converted to Base64.
    - Sent to `api.analyze` along with the MusicXML content.

## Challenges & Future Improvements
- **Format Compatibility**: `audio/webm` is standard for Chrome/Firefox but might need conversion (e.g., to WAV/MP3) if the backend requires specific formats (though `ffmpeg` on backend usually handles this).
- **Latency**: Ensure audio processing doesn't block the UI thread.
- **Visualizer**: Currently, we show a simple progress bar. A real-time waveform visualizer (using `AudioContext` analyser node) would be a great addition.
