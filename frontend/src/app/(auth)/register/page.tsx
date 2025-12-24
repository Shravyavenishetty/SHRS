'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import type { RoleName } from '@/types';

export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '' as RoleName | '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role as RoleName,
            });
            // Redirect is handled by AuthContext
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-outfit font-bold text-primary mb-2">
                        SHRS
                    </h1>
                    <p className="text-muted-foreground">
                        Create your account
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-center mb-2">
                            Register
                        </h2>
                        <p className="text-center text-sm text-muted-foreground">
                            Step {step} of 2
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 && (
                            <>
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium mb-2">
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                        minLength={3}
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="johndoe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium mb-2">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleName })}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="">Select a role</option>
                                        <option value="patient">Patient</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all"
                                >
                                    Next
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-2">
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

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full border border-primary text-primary hover:bg-primary/10 font-semibold py-3 rounded-lg transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Creating Account...' : 'Register'}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>

                    <div className="text-center text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-primary hover:underline font-semibold"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
