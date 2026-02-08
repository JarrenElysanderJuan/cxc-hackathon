
import { IStorageService, UserStatsData } from "./types";
import { SessionData } from "@/types";

const STORAGE_KEY = "harmony-helper-storage";

export class LocalStorageService implements IStorageService {

    private getStorage(): { state: { history: SessionData[], streak: number } } {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { state: { history: [], streak: 0 } };
        try {
            return JSON.parse(raw);
        } catch {
            return { state: { history: [], streak: 0 } };
        }
    }

    private setStorage(history: SessionData[], streak: number) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            state: { history, streak },
            version: 0
        }));
    }

    async saveSession(session: SessionData): Promise<void> {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 500));

        const { state } = this.getStorage();
        // Prepend new session
        const newHistory = [session, ...state.history];

        // Simple streak logic: increment if last session was NOT today
        // For mock, just increment
        const newStreak = state.streak + 1;

        this.setStorage(newHistory, newStreak);
    }

    async getSessions(): Promise<SessionData[]> {
        await new Promise(r => setTimeout(r, 300));
        const { state } = this.getStorage();
        return state.history || [];
    }

    async getSessionById(id: string): Promise<SessionData | null> {
        const sessions = await this.getSessions();
        return sessions.find(s => s.id === id) || null;
    }

    async deleteSession(id: string): Promise<void> {
        const { state } = this.getStorage();
        const newHistory = state.history.filter(s => s.id !== id);
        this.setStorage(newHistory, state.streak);
    }

    async getUserStats(): Promise<UserStatsData> {
        const { state } = this.getStorage();

        // Mock aggregation
        return {
            weekly_progress: [
                { day: "Mon", minutes: 15 },
                { day: "Tue", minutes: 30 },
                { day: "Wed", minutes: 45 },
                { day: "Thu", minutes: 20 },
                { day: "Fri", minutes: 60 },
                { day: "Sat", minutes: 40 },
                { day: "Sun", minutes: 25 },
            ],
            streak: state.streak,
            total_minutes: 120
        };
    }

    async syncUser(user: { email: string; name: string; sub: string; picture: string }): Promise<void> {
        console.log("[LocalStorage] Mock sync user:", user);
    }

    setToken(token: string): void {
        // No-op for local storage
    }
}
