
import { SessionData } from "@/types";

export interface UserStatsData {
    weekly_progress: { day: string; minutes: number }[];
    streak: number;
    total_minutes: number;
}

export interface IStorageService {
    // Session Management
    saveSession(session: SessionData): Promise<void>;
    getSessions(): Promise<SessionData[]>;
    getSessionById(id: string): Promise<SessionData | null>;
    deleteSession(id: string): Promise<void>;

    // User Stats
    getUserStats(): Promise<UserStatsData>;

    // User Sync (for backend)
    syncUser(user: { email: string; name: string; sub: string; picture: string }): Promise<void>;

    // Auth
    setToken(token: string): void;
}
