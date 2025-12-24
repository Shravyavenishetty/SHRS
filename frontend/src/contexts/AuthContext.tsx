'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/auth';
import type { User, LoginRequest, RegisterRequest, RoleName } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (role: RoleName) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = () => {
            const storedUser = authUtils.getUser();
            const isAuth = authUtils.isAuthenticated();

            if (storedUser && isAuth) {
                setUser(storedUser);
            } else {
                authUtils.clearAuth();
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await apiClient.login(credentials);

            // After successful login, we need to fetch user data
            // For now, we'll create a basic user object from the token
            const role = authUtils.getUserRole();
            const tempUser: User = {
                id: 0,  // Will be updated when we fetch full user data
                email: credentials.username,
                username: credentials.username.split('@')[0],
                role: {
                    id: 0,
                    name: role || 'patient',
                },
                is_active: true,
                created_at: new Date().toISOString(),
            };

            authUtils.setUser(tempUser);
            setUser(tempUser);

            // Redirect to appropriate dashboard
            const dashboardRoute = authUtils.getDashboardRoute();
            router.push(dashboardRoute);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            await apiClient.register(data);
            // After registration, automatically login
            await login({
                username: data.email,
                password: data.password,
            });
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        apiClient.logout();
        authUtils.clearAuth();
        setUser(null);
        router.push('/login');
    };

    const hasRole = (role: RoleName): boolean => {
        return user?.role?.name === role;
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && authUtils.isAuthenticated(),
        hasRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
