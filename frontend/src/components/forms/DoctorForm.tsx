'use client';

import React, { useState } from 'react';
import { UserCog, AlertCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { apiClient } from '@/lib/api';
import type { Doctor } from '@/types';

interface DoctorFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (doctor: Doctor) => void;
}

export function DoctorForm({ isOpen, onClose, onSuccess }: DoctorFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        specialty: '',
        email: '',
        contact: '',
        experience: '',
        hospital: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const specialties = [
        'Cardiology',
        'Dermatology',
        'Emergency Medicine',
        'Endocrinology',
        'Gastroenterology',
        'General Practice',
        'Neurology',
        'Oncology',
        'Orthopedics',
        'Pediatrics',
        'Psychiatry',
        'Radiology',
        'Surgery',
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || formData.name.length < 2) {
            newErrors.name = 'Doctor name is required (minimum 2 characters)';
        }
        if (!formData.specialty) {
            newErrors.specialty = 'Please select a specialty';
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.contact || formData.contact.length < 10) {
            newErrors.contact = 'Contact number must be at least 10 digits';
        }
        if (!formData.experience || isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
            newErrors.experience = 'Please enter valid years of experience';
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const doctor = await apiClient.createDoctor({
                name: formData.name,
                specialty: formData.specialty,
                email: formData.email,
                contact: formData.contact,
                experience: parseInt(formData.experience),
                hospital: formData.hospital || undefined,
                password: formData.password,
            } as any);

            onSuccess?.(doctor);
            onClose();

            // Reset form
            setFormData({
                name: '',
                specialty: '',
                email: '',
                contact: '',
                experience: '',
                hospital: '',
                password: '',
            });
            setErrors({});
        } catch (error: any) {
            console.error('Failed to create doctor:', error);
            setErrors({ submit: error.response?.data?.detail || 'Failed to add doctor. Please try again.' });
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
                    <UserCog className="h-5 w-5 text-blue-600" />
                    Add New Doctor
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

                    <div className="grid grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="form-group col-span-2">
                            <Label htmlFor="name" className="form-label">
                                Doctor Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Dr. John Smith"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="form-error">{errors.name}</p>}
                        </div>

                        {/* Specialty */}
                        <div className="form-group">
                            <Label htmlFor="specialty" className="form-label">
                                Specialty <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="specialty"
                                value={formData.specialty}
                                onChange={(e) => handleChange('specialty', e.target.value)}
                                className={`form-input ${errors.specialty ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select specialty...</option>
                                {specialties.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                            {errors.specialty && <p className="form-error">{errors.specialty}</p>}
                        </div>

                        {/* Experience */}
                        <div className="form-group">
                            <Label htmlFor="experience" className="form-label">
                                Experience (years) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                id="experience"
                                value={formData.experience}
                                onChange={(e) => handleChange('experience', e.target.value)}
                                placeholder="5"
                                min="0"
                                className={errors.experience ? 'border-red-500' : ''}
                            />
                            {errors.experience && <p className="form-error">{errors.experience}</p>}
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
                                placeholder="doctor@hospital.com"
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <p className="form-error">{errors.email}</p>}
                        </div>

                        {/* Contact */}
                        <div className="form-group">
                            <Label htmlFor="contact" className="form-label">
                                Contact Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="tel"
                                id="contact"
                                value={formData.contact}
                                onChange={(e) => handleChange('contact', e.target.value)}
                                placeholder="+1234567890"
                                className={errors.contact ? 'border-red-500' : ''}
                            />
                            {errors.contact && <p className="form-error">{errors.contact}</p>}
                        </div>

                        {/* Hospital */}
                        <div className="form-group col-span-2">
                            <Label htmlFor="hospital" className="form-label">
                                Hospital/Clinic (Optional)
                            </Label>
                            <Input
                                type="text"
                                id="hospital"
                                value={formData.hospital}
                                onChange={(e) => handleChange('hospital', e.target.value)}
                                placeholder="City General Hospital"
                            />
                        </div>

                        {/* Password */}
                        <div className="form-group col-span-2">
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
                            {errors.password && <p className="form-error">{errors.password}</p>}
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">👨‍⚕️ Doctor Account Info:</p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                            <li>Doctor will use email and password to login</li>
                            <li>Email must be unique</li>
                            <li>Account will be active immediately</li>
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
                        {loading ? 'Adding...' : 'Add Doctor'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
