import { create } from 'zustand';
import { UserProfile } from '@/types';

interface AuthState {
    isAuthenticated: boolean;
    user: UserProfile | null;
    token: string | null;
    login: (user: UserProfile, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    token: null,
    login: (user, token) => set({ isAuthenticated: true, user, token }),
    logout: () => set({ isAuthenticated: false, user: null, token: null }),
}));
