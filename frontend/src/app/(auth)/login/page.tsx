'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await login(formData);
            // Redirect is handled by AuthContext
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-outfit font-bold text-primary mb-2">
                        SHRS
                    </h1>
                    <p className="text-muted-foreground">
                        Swecha Health Records System
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-center mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-center text-sm text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="username"
                                type="email"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="text-center text-sm">
                        <p className="text-muted-foreground">
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-primary hover:underline font-semibold"
                            >
                                Register
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Demo Credentials:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>Admin: admin@shrs.com / admin123</p>
                        <p>Doctor: doctor@shrs.com / doctor123</p>
                        <p>Patient: patient@shrs.com / patient123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
