'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, User } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { apiClient } from '@/lib/api';
import { Doctor, Appointment } from '@/types';

interface AppointmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (appointment: Appointment) => void;
    doctors?: Doctor[];
}

export function AppointmentForm({ isOpen, onClose, onSuccess, doctors = [] }: AppointmentFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.doctor_id) newErrors.doctor_id = 'Please select a doctor';
        if (!formData.appointment_date) newErrors.appointment_date = 'Please select a date';
        if (!formData.appointment_time) newErrors.appointment_time = 'Please select a time';
        if (!formData.reason || formData.reason.length < 10) {
            newErrors.reason = 'Please provide a reason (at least 10 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const appointment = await apiClient.createAppointment({
                doctor_id: parseInt(formData.doctor_id),
                appointment_date: formData.appointment_date,
                appointment_time: formData.appointment_time,
                reason: formData.reason,
                patient_id: 0, // Will be set by backend based on authenticated user
                status: 'pending',
            });

            onSuccess?.(appointment);
            onClose();

            // Reset form
            setFormData({
                doctor_id: '',
                appointment_date: '',
                appointment_time: '',
                reason: '',
            });
        } catch (error) {
            console.error('Failed to create appointment:', error);
            setErrors({ submit: 'Failed to book appointment. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <ModalHeader>
                <ModalTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Book Appointment
                </ModalTitle>
                <ModalClose onClose={onClose} />
            </ModalHeader>

            <form onSubmit={handleSubmit}>
                <ModalBody className="space-y-4">
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {errors.submit}
                        </div>
                    )}

                    {/* Doctor Selection */}
                    <div className="form-group">
                        <Label htmlFor="doctor" className="form-label">
                            <User className="h-4 w-4 inline mr-1" />
                            Select Doctor
                        </Label>
                        <Select
                            id="doctor"
                            value={formData.doctor_id}
                            onChange={(e) => handleChange('doctor_id', e.target.value)}
                            className={errors.doctor_id ? 'border-red-500' : ''}
                        >
                            <option value="">Choose a doctor...</option>
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.name} - {doctor.specialty}
                                </option>
                            ))}
                        </Select>
                        {errors.doctor_id && (
                            <p className="form-error">{errors.doctor_id}</p>
                        )}
                    </div>

                    {/* Date Selection */}
                    <div className="form-group">
                        <Label htmlFor="date" className="form-label">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Appointment Date
                        </Label>
                        <Input
                            type="date"
                            id="date"
                            value={formData.appointment_date}
                            onChange={(e) => handleChange('appointment_date', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={errors.appointment_date ? 'border-red-500' : ''}
                        />
                        {errors.appointment_date && (
                            <p className="form-error">{errors.appointment_date}</p>
                        )}
                    </div>

                    {/* Time Selection */}
                    <div className="form-group">
                        <Label htmlFor="time" className="form-label">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Appointment Time
                        </Label>
                        <Input
                            type="time"
                            id="time"
                            value={formData.appointment_time}
                            onChange={(e) => handleChange('appointment_time', e.target.value)}
                            className={errors.appointment_time ? 'border-red-500' : ''}
                        />
                        {errors.appointment_time && (
                            <p className="form-error">{errors.appointment_time}</p>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="form-group">
                        <Label htmlFor="reason" className="form-label">
                            Reason for Visit
                        </Label>
                        <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) => handleChange('reason', e.target.value)}
                            placeholder="Please describe your symptoms or reason for the appointment..."
                            rows={4}
                            className={errors.reason ? 'border-red-500' : ''}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {formData.reason.length}/500 characters
                        </p>
                        {errors.reason && (
                            <p className="form-error">{errors.reason}</p>
                        )}
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">📋 Please Note:</p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                            <li>Your appointment will be pending until confirmed by the doctor</li>
                            <li>You will receive a confirmation notification</li>
                            <li>Please arrive 10 minutes before your scheduled time</li>
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
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
