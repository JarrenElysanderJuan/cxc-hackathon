import { AnalysisResponse } from "@/types";

// Mock delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AnalyzePayload {
    Song_name: string;
    Instrument: string;
    Audio_length: number;
    Recording: string; // Base64 or Blob URL
    Target_XML: string; // MusicXML content
}

export const api = {
    analyze: async (payload: AnalyzePayload): Promise<AnalysisResponse> => {
        console.log("🚀 [API] Sending /analyze request:", payload);

        // Simulate network delay
        await delay(2000);

        // Mock Response
        const mockResponse: AnalysisResponse = {
            "performace_summary": "Great job! Your pitch was generally accurate, but watch your tempo in the second measure.",
            "coach-feedback": "Focus on maintaining consistent breath support during the high notes. Try practicing the transition from measure 3 to 4 slowly.",
            "user-spectrogram": "dummy_user_spectrogram_base64",
            "target-spectrogram": "dummy_target_spectrogram_base64",
            "marked-up-musicxml": payload.Target_XML // In reality this would be marked up
        };

        console.log("✅ [API] Received /analyze response:", mockResponse);
        return mockResponse;
    }
};
