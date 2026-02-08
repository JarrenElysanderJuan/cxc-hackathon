
import { IStorageService, UserStatsData } from "./types";
import { SessionData } from "@/types";
import { useAuthStore } from "@/store/useAuthStore"; // Assuming we'll need token

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export class ApiStorageService implements IStorageService {

    private token: string | null = null;

    setToken(token: string): void {
        this.token = token;
        console.log("🔐 [ApiStorage] Token updated");
    }

    private async getHeaders(): Promise<HeadersInit> {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token || ""}`
        };
    }

    async saveSession(session: SessionData): Promise<void> {
        let audioBase64 = "";
        if (session.audioBlob) {
            audioBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(session.audioBlob!);
            });
        }

        const payload = {
            song_name: session.songName,
            instrument: session.instrument,
            duration_seconds: session.durationSeconds,
            date: session.date,
            xml_content: session.xmlContent,
            analysis: session.analysis,
            audioBase64: audioBase64,
        };

        const res = await fetch(`${API_URL}/api/sessions`, {
            method: "POST",
            headers: await this.getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: "Unknown error" }));
            throw new Error(error.detail || "Failed to save session");
        }
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
