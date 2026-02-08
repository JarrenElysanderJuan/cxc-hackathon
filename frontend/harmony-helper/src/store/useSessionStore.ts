import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AnalysisResponse, SessionData } from '@/types';

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

interface SessionState {
    currentSession: SessionData | null;
    isRecording: boolean;
    isAnalyzing: boolean;

    // History & Gamification
    history: SessionData[];
    streak: number;

    // Actions
    startNewSession: (xmlContent: string, songName: string, instrument: string) => void;
    setRecordingBlob: (blob: Blob) => void;
    setAnalysisResults: (results: AnalysisResponse) => void;
    clearSession: () => void;
    saveSession: () => Promise<void>;
    deleteSession: (id: string) => void;

    setRecordingStatus: (isRecording: boolean) => void;
    setAnalyzingStatus: (isAnalyzing: boolean) => void;
    setInstrument: (instrument: string) => void;
}

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            currentSession: null,
            isRecording: false,
            isAnalyzing: false,
            history: [],
            // Mock streak starts at 3 for demo purposes
            streak: 3,

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

                let audioData = "";
                if (currentSession.audioBlob) {
                    try {
                        audioData = await blobToBase64(currentSession.audioBlob);
                    } catch (error) {
                        console.error("Failed to convert audio blob", error);
                    }
                }

                // Create a copy for history that uses string for audio (if we were typing strictly, we'd need a separate type, but for now we'll store base64 in the same field or custom)
                // Actually SessionData has audioBlob as Blob. We can't store string there if strict.
                // Let's rely on the fact that standard JSON.stringify will ignore Blob or mangle it.
                // We need to store the base64 string. 
                // Let's add `audioBase64` to SessionData separately or just cast it. 
                // For simplicity in this hackathon, we'll cast.

                const sessionToSave = {
                    ...currentSession,
                    audioBlob: undefined, // Don't try to persist blob
                    audioBase64: audioData, // New field for storage
                };

                set({
                    history: [sessionToSave as any, ...history],
                    currentSession: null
                });
            },

            deleteSession: (id) => set((state) => ({
                history: state.history.filter(s => s.id !== id)
            })),

            setRecordingStatus: (isRecording) => set({ isRecording }),
            setAnalyzingStatus: (isAnalyzing) => set({ isAnalyzing }),
            setInstrument: (instrument) => set((state) => ({
                currentSession: state.currentSession ? { ...state.currentSession, instrument } : null
            })),
        }),
        {
            name: 'harmony-helper-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ history: state.history, streak: state.streak }), // Only persist history and streak
        }
    )
);
