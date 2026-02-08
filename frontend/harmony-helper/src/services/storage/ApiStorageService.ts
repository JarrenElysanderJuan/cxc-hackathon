
import { IStorageService, UserStatsData } from "./types";
import { SessionData } from "@/types";
import { useAuthStore } from "@/store/useAuthStore"; // Assuming we'll need token

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export class ApiStorageService implements IStorageService {

    private async getHeaders(): Promise<HeadersInit> {
        // Implementation note: In real app we might need to get token async
        // For now assuming we can access it from store or auth0 hook
        // This might require passing the token into methods or useAuthStore.getState()

        // Placeholder for token logic
        const token = "mock-token"; // Replace with real token retrieval

        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };
    }

    async saveSession(session: SessionData): Promise<void> {
        // For API, we might split audio upload from metadata save
        // 1. Upload audio -> get URL
        // 2. Post metadata with audio_url

        // For scaffolding, just log
        console.log("[ApiStorage] Saving session to", API_URL, session);

        // Mock implementation for now until backend is ready
        throw new Error("Backend not fully implemented yet");
    }

    async getSessions(): Promise<SessionData[]> {
        const res = await fetch(`${API_URL}/api/sessions`, {
            headers: await this.getHeaders()
        });
        if (!res.ok) throw new Error("Failed to fetch sessions");
        return res.json();
    }

    async getSessionById(id: string): Promise<SessionData | null> {
        const res = await fetch(`${API_URL}/api/sessions/${id}`, {
            headers: await this.getHeaders()
        });
        if (!res.ok) return null;
        return res.json();
    }

    async deleteSession(id: string): Promise<void> {
        await fetch(`${API_URL}/api/sessions/${id}`, {
            method: "DELETE",
            headers: await this.getHeaders()
        });
    }

    async getUserStats(): Promise<UserStatsData> {
        const res = await fetch(`${API_URL}/api/stats`, {
            headers: await this.getHeaders()
        });
        return res.json();
    }

    async syncUser(user: { email: string; name: string; sub: string; picture: string }): Promise<void> {
        await fetch(`${API_URL}/api/users/sync`, {
            method: "POST",
            headers: await this.getHeaders(),
            body: JSON.stringify(user)
        });
    }
}
