'use client';

import React, { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { apiClient } from '@/lib/api';
import type { User } from '@/types';

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (user: User) => void;
}

export function UserForm({ isOpen, onClose, onSuccess }: UserFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'patient',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!formData.role) {
            newErrors.role = 'Please select a role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const user = await apiClient.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role as 'admin' | 'doctor' | 'patient',
            });

            onSuccess?.(user);
            onClose();

            // Reset form
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'patient',
            });
            setErrors({});
        } catch (error: any) {
            console.error('Failed to create user:', error);
            setErrors({ submit: error.response?.data?.detail || 'Failed to create user. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <ModalHeader>
                <ModalTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Add New User
                </ModalTitle>
                <ModalClose onClose={onClose} />
            </ModalHeader>

            <form onSubmit={handleSubmit}>
                <ModalBody className="space-y-4">
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{errors.submit}</span>
                        </div>
                    )}

                    {/* Username */}
                    <div className="form-group">
                        <Label htmlFor="username" className="form-label">
                            Username <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="username"
                            value={formData.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            placeholder="e.g., john_doe"
                            className={errors.username ? 'border-red-500' : ''}
                        />
                        {errors.username && (
                            <p className="form-error">{errors.username}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <Label htmlFor="email" className="form-label">
                            Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="user@example.com"
                            className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                            <p className="form-error">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <Label htmlFor="password" className="form-label">
                            Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            placeholder="••••••••"
                            className={errors.password ? 'border-red-500' : ''}
                        />
                        {errors.password && (
                            <p className="form-error">{errors.password}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="form-group">
                        <Label htmlFor="role" className="form-label">
                            Role <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={(e) => handleChange('role', e.target.value)}
                            className={`form-input ${errors.role ? 'border-red-500' : ''}`}
                        >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Admin</option>
                        </select>
                        {errors.role && (
                            <p className="form-error">{errors.role}</p>
                        )}
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">👤 User Guidelines:</p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                            <li>Username must be unique</li>
                            <li>User will receive login credentials</li>
                            <li>Role determines system permissions</li>
                        </ul>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? 'Creating...' : 'Create User'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
