# Project Overview: Harmony Helper

## Introduction
Harmony Helper is a web-based AI music coaching application designed to help users practice instruments (currently focused on Piano/Voice) by providing real-time sheet music rendering and AI-powered feedback.

## Tech Stack
- **Frontend Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion
- **State Management**: Key features use **Zustand** (global stores). Local UI state uses `useState`.
- **Sheet Music Rendering**: OpenSheetMusicDisplay (OSMD) (implied by `MusicXMLRenderer`).
- **Authentication**: Auth0 (`@auth0/auth0-react`).
- **Audio Recording**: Native Browser `MediaRecorder` API.
- **TTS (Text-to-Speech)**: ElevenLabs API (with Web Speech API fallback).

## Core Features
1.  **Home Page**: Landing page with Auth login/logout and user statistics.
2.  **Practice Session**:
    - Upload MusicXML files.
    - Render sheet music.
    - Record audio performance.
3.  **Analysis & Feedback**:
    - Mocked API analysis returning coaching advice and spectrograms.
    - AI Avatar (Visual + Audio) providing feedback.
    - Detailed error breakdown (Pitch, Timing, Dynamics).

## User Definitions
- **User**: A musician practicing a piece.
- **Coach**: The AI agent providing feedback.

## Key Directories
- `src/components`: UI components (Shadcn + Custom).
- `src/pages`: Main route views.
- `src/services`: External integrations (API, Audio, Auth, ElevenLabs).
- `src/store`: Global Zustand stores.
