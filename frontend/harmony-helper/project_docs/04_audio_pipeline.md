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
2.  **Start**: `audioService.start()` is called. Sheet music starts scrolling.
3.  **Stop**: User clicks "Stop". `audioService.stop()` returns a `Blob`.
4.  **Store**: The `Blob` is saved to `useSessionStore` (`setRecordingBlob`).
5.  **Analyze**:
    - The `Blob` (WebM) is converted to Base64 in the frontend.
    - Sent to `api.analyze` along with piece metadata (BPM, Start Measure).
    - **Backend Conversion**: The server automatically converts the WebM payload to WAV using `pydub` before passing it to the inference engine.
    - **Reference Synthesis**: The backend synthesizes a reference "ground truth" audio from the MusicXML.
    - **Result**: The backend returns a marked-up MusicXML, text reports, and base64 spectrograms.

## Current Infrastructure
- **Frontend**: Standard WebMediaRecorder (`audio/webm`).
- **Backend**: FastAPI + Pydub + FFmpeg (optional but recommended) for transcoding.
- **AI**: Integration via `conversions.py`, `reportandscript.py`, and `xml_mark_up.py`.

## Challenges & Future Improvements
- **Latency**: Audio transcoding and LLM report generation can take 5-10 seconds.
- **Audio Fidelity**: Web recordings vary in quality; noise cancellation or gain normalization could be added.
- **Visualizer**: Currently, we show static pre-rendered spectrograms. A real-time waveform visualizer would be a great addition.
