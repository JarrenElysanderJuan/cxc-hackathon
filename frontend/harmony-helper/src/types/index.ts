export interface UserProfile {
    sub: string;
    email: string;
    name: string;
    picture: string;
}

export interface NoteError {
    measure: number;
    noteIndex: number;
    type: "pitch" | "timing" | "dynamics";
    description: string;
    severity: "minor" | "moderate" | "major";
}

export interface AnalysisResponse {
    "performace_summary": string;
    "coach-feedback": string;
    "user-spectrogram": string; // Base64 or URL
    "target-spectrogram": string; // Base64 or URL
    "marked-up-musicxml": string;
}

export interface SessionData {
    id: string;
    date: string;
    songName: string;
    instrument: string;
    durationSeconds: number;
    audioBlob?: Blob;
    xmlContent: string;
    analysis?: AnalysisResponse;
}
