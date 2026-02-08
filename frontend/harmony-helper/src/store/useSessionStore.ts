import { create } from 'zustand';
import { AnalysisResponse, SessionData } from '@/types';
import { storageService } from '@/services/storage';

interface SessionState {
    currentSession: SessionData | null;
    isRecording: boolean;
    isAnalyzing: boolean;

    // History & Gamification
    history: SessionData[];
    streak: number;
    isLoadingHistory: boolean;

    // Actions
    init: () => Promise<void>;
    startNewSession: (xmlContent: string, songName: string, instrument: string) => void;
    setRecordingBlob: (blob: Blob) => void;
    setAnalysisResults: (results: AnalysisResponse) => void;
    clearSession: () => void;
    saveSession: () => Promise<void>;
    deleteSession: (id: string) => Promise<void>;

    setRecordingStatus: (isRecording: boolean) => void;
    setAnalyzingStatus: (isAnalyzing: boolean) => void;
    setInstrument: (instrument: string) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    currentSession: null,
    isRecording: false,
    isAnalyzing: false,
    history: [],
    streak: 0,
    isLoadingHistory: false,

    init: async () => {
        set({ isLoadingHistory: true });
        try {
            const [history, stats] = await Promise.all([
                storageService.getSessions(),
                storageService.getUserStats()
            ]);
            set({ history, streak: stats.streak, isLoadingHistory: false });
        } catch (error) {
            console.error("Failed to load session history:", error);
            set({ isLoadingHistory: false });
        }
    },

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

    saveSession: async () => {
        const { currentSession, history } = get();
        if (!currentSession) return;

        // Optimistic update
        const newHistory = [currentSession, ...history];
        set({ history: newHistory, currentSession: null });

        try {
            await storageService.saveSession(currentSession);
            // Re-fetch stats to update streak if changed
            const stats = await storageService.getUserStats();
            set({ streak: stats.streak });
        } catch (error) {
            console.error("Failed to save session:", error);
            // Rollback on error? For now just log.
        }
    },

    deleteSession: async (id) => {
        const { history } = get();
        // Optimistic update
        set({ history: history.filter(s => s.id !== id) });

        try {
            await storageService.deleteSession(id);
        } catch (error) {
            console.error("Failed to delete session:", error);
            // Rollback?
            set({ history });
        }
    },

    setRecordingStatus: (isRecording) => set({ isRecording }),
    setAnalyzingStatus: (isAnalyzing) => set({ isAnalyzing }),
    setInstrument: (instrument) => set((state) => ({
        currentSession: state.currentSession ? { ...state.currentSession, instrument } : null
    })),
}));
