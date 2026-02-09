# Harmony Helper: Your Personal AI Music Coach

### Inspiration
**Harmony Helper** was inspired by the challenges modern musicians face when practicing alone: the lack of immediate, technical feedback between weekly lessons. We saw an opportunity to democratize high-level music coaching by building an intelligent platform that doesn't just record you, but actually *listens* and provides actionable, measure-specific advice. Our goal was to bridge the gap between repetitive "rote" practice and intentional, data-driven improvement through real-time AI analysis.

### What it does
**Harmony Helper** is an AI-powered practice companion that transforms how musicians master their instruments. It features:

*   **Interactive Sheet Music** — Load MusicXML files and see your performance errors highlighted directly on the score using OpenSheetMusicDisplay (OSMD).
*   **AI Coach Avatar** — Receive verbal and visual feedback from an AI Avatar that uses ElevenLabs TTS and synchronized text-chunking to explain technical nuances.
*   **Performance Spectrograms** — Compare your actual audio frequency data against a target reference model generated directly from your sheet music.
*   **Rich Markdown Summaries** — Get professional, AI-generated reports that break down your performance by pitch, rhythm, dynamics, and posture.
*   **Practice Dashboard** — Track your growth with a weekly progress bar chart, total practice minutes, and a 7-day consistency streak powered by Supabase.

### How we built it
We built **Harmony Helper** as a modern web application using **Vite, React, TypeScript, and Tailwind CSS**. 
*   **Backend**: A FastAPI (Python) server handles the heavy lifting, including audio conversion (WebM to WAV) and MusicXML synthesis (Music21 to MIDI).
*   **AI Pipeline**: We integrated **OpenAI (via OpenRouter)** for performance analysis and **ElevenLabs** for the coach's natural voice. 
*   **Data & Auth**: **Supabase** handles our practice history and audio storage, while **Auth0** provides secure user authentication.
*   **Visualization**: We used **OSMD** for sheet music rendering and **Recharts** for the practice statistics.

### Challenges we ran into
One of our biggest challenges was the "Audio-to-Score" synchronization. Aligning real-time browser recordings with specific measures in a MusicXML file required complex timestamping and precise character-mapping for the AI Avatar's subtitles. Additionally, setting up a robust pipeline to convert sheet music into a "perfect" reference audio file using FluidSynth and SoundFonts while keeping the backend lightweight was a major technical hurdle.

### Accomplishments that we're proud of
We're proud to have delivered a platform that feels like a premium "studio" experience. Despite the technical complexity of the audio pipeline, we successfully created:

*   A fully functional **AI Avatar system** with custom karaoke-style text synchronization.
*   An end-to-end **Audio-to-Markdown** analysis engine that delivers professional-grade coaching notes.
*   A scalable **Practice History** system that tracks user engagement and streaks across all devices.
*   A high-performance **Sheet Music Renderer** that dynamically highlights errors based on AI detection.

Our team communicated effectively to integrate a complex stack of frontend, backend, and AI services into a tool that genuinely supports a musician's journey toward mastery.
