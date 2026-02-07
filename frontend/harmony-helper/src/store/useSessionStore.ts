import { create } from 'zustand';
import { AnalysisResponse, SessionData } from '@/types';

interface SessionState {
    currentSession: SessionData | null;
    isRecording: boolean;
    isAnalyzing: boolean;

    // Actions
    startNewSession: (xmlContent: string, songName: string, instrument: string) => void;
    setRecordingBlob: (blob: Blob) => void;
    setAnalysisResults: (results: AnalysisResponse) => void;
    clearSession: () => void;
    setRecordingStatus: (isRecording: boolean) => void;
    setAnalyzingStatus: (isAnalyzing: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    currentSession: null,
    isRecording: false,
    isAnalyzing: false,

    startNewSession: (xmlContent, songName, instrument) => set({
        currentSession: {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            songName,
            instrument,
            durationSeconds: 0,
            xmlContent,
        },
        isRecording: false,
        isAnalyzing: false,
    }),

    setRecordingBlob: (blob) => set((state) => ({
        currentSession: state.currentSession ? { ...state.currentSession, audioBlob: blob } : null
    })),

    setAnalysisResults: (results) => set((state) => ({
        currentSession: state.currentSession ? { ...state.currentSession, analysis: results } : null
    })),

    clearSession: () => set({ currentSession: null, isRecording: false, isAnalyzing: false }),

    setRecordingStatus: (isRecording) => set({ isRecording }),
    setAnalyzingStatus: (isAnalyzing) => set({ isAnalyzing }),
}));
