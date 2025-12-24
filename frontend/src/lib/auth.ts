import { config } from './config';
import type { User, RoleName } from '@/types';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
    sub: string;  // email
    role: string;
    exp: number;
}

export const authUtils = {
    // Get stored token
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(config.tokenKey);
    },

    // Set token in storage
    setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(config.tokenKey, token);
    },

    // Get stored user data
    getUser(): User | null {
        if (typeof window === 'undefined') return null;
        const userData = localStorage.getItem(config.userKey);
        return userData ? JSON.parse(userData) : null;
    },

    // Set user data in storage
    setUser(user: User): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(config.userKey, JSON.stringify(user));
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<TokenPayload>(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch {
            return false;
        }
    },

    // Get user role from token
    getUserRole(): RoleName | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded = jwtDecode<TokenPayload>(token);
            return decoded.role as RoleName;
        } catch {
            return null;
        }
    },

    // Check if user has specific role
    hasRole(role: RoleName): boolean {
        const userRole = this.getUserRole();
        return userRole === role;
    },

    // Clear all auth data
    clearAuth(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(config.tokenKey);
        localStorage.removeItem(config.userKey);
    },

    // Get dashboard route based on role
    getDashboardRoute(): string {
        const role = this.getUserRole();
        switch (role) {
            case 'admin':
                return '/admin';
            case 'doctor':
                return '/doctor';
            case 'patient':
                return '/patient';
            default:
                return '/login';
        }
    },
};
