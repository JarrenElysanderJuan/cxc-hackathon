# Future Work & TODOs

## High Priority

- [ ] **Real Backend Integration**:
    - Connect `services/api.ts` to a real Python/Node.js backend.
    - Implement the actual audio analysis logic (FFT, Pitch Detection).
    - Generate real spectrograms.
- [ ] **MusicXML Error markup**:
    - Define a schema for how errors are marked in MusicXML (e.g., color tags, specific annotations).
    - Update `MusicXMLRenderer` to parse and visually highlight these errors.
- [ ] **Session Persistence**:
    - Currently, sessions are lost on refresh.
    - Implement a database or `localStorage` solution to save past sessions.
- [ ] **Audio Format**:
    - Ensure the backend can handle the `audio/webm` container produced by `MediaRecorder`.
    - Alternatively, implement a client-side WAV converter (e.g., using `audio-recorder-polyfill` or similar).

## Medium Priority

- [ ] **Better Error Handling**:
    - Add global error boundaries.
    - Improve UI feedback for failed uploads or recordings.
- [ ] **Unit Testing**:
    - Add tests for `useSessionStore` logic.
    - Add component tests for `RecordingBar`.
- [ ] **Instrument Selector**:
    - Make the "Instrument" selection on Home/Session page functional (currently defaults to "Piano").

## Low Priority (Polish)

- [ ] **Visualizer**: Add a real-time audio waveform visualizer during recording.
- [ ] **Avatar Animation**: Make the AIAvatar lip-sync to the audio (using Visemes from ElevenLabs API if available, or simple amplitude-based animation).
