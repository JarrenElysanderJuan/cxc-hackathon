import { AnalysisResponse } from "@/types";

// Mock delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AnalyzePayload {
    Song_name: string;
    Instrument: string;
    Audio_length: number;
    Recording: string; // Base64 or Blob URL
    Target_XML: string; // MusicXML content
    BPM: number;
    Start_Measure: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
    analyze: async (payload: AnalyzePayload): Promise<AnalysisResponse> => {
        console.log("🚀 [API] Sending /analyze request:", payload);

        const res = await fetch(`${API_URL}/api/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error("Analysis failed");
        }

        const data: AnalysisResponse = await res.json();
        console.log("✅ [API] Received /analyze response:", data);
        return data;
    }
};
