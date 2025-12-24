'use client';

import React, { useState } from 'react';
import { Pill, AlertCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { apiClient } from '@/lib/api';
import { Prescription } from '@/types';

interface PrescriptionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (prescription: Prescription) => void;
    patientId: number;
}

export function PrescriptionForm({ isOpen, onClose, onSuccess, patientId }: PrescriptionFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        medicine_name: '',
        dosage: '',
        frequency: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const frequencyOptions = [
        'Once daily',
        'Twice daily',
        'Three times daily',
        'Four times daily',
        'Every 4 hours',
        'Every 6 hours',
        'Every 8 hours',
        'Every 12 hours',
        'As needed',
        'Before meals',
        'After meals',
        'At bedtime',
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.medicine_name) {
            newErrors.medicine_name = 'Medicine name is required';
        }
        if (!formData.dosage) {
            newErrors.dosage = 'Dosage is required';
        }
        if (!formData.frequency) {
            newErrors.frequency = 'Frequency is required';
        }
        if (!formData.start_date) {
            newErrors.start_date = 'Start date is required';
        }
        if (formData.end_date && formData.end_date < formData.start_date) {
            newErrors.end_date = 'End date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const prescription = await apiClient.createPrescription({
                patient_id: patientId,
                doctor_id: 0, // Will be set by backend
                medicine_name: formData.medicine_name,
                dosage: formData.dosage,
                frequency: formData.frequency,
                start_date: formData.start_date,
                end_date: formData.end_date || undefined,
                notes: formData.notes || undefined,
            });

            onSuccess?.(prescription);
            onClose();

            // Reset form
            setFormData({
                medicine_name: '',
                dosage: '',
                frequency: '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                notes: '',
            });
        } catch (error) {
            console.error('Failed to create prescription:', error);
            setErrors({ submit: 'Failed to save prescription. Please try again.' });
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
                    <Pill className="h-5 w-5 text-green-600" />
                    Add Prescription
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

                    {/* Medicine Name */}
                    <div className="form-group">
                        <Label htmlFor="medicine_name" className="form-label">
                            Medicine Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="medicine_name"
                            value={formData.medicine_name}
                            onChange={(e) => handleChange('medicine_name', e.target.value)}
                            placeholder="e.g., Amoxicillin, Ibuprofen"
                            className={errors.medicine_name ? 'border-red-500' : ''}
                        />
                        {errors.medicine_name && (
                            <p className="form-error">{errors.medicine_name}</p>
                        )}
                    </div>

                    {/* Dosage */}
                    <div className="form-group">
                        <Label htmlFor="dosage" className="form-label">
                            Dosage <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="dosage"
                            value={formData.dosage}
                            onChange={(e) => handleChange('dosage', e.target.value)}
                            placeholder="e.g., 500mg, 1 tablet, 5ml"
                            className={errors.dosage ? 'border-red-500' : ''}
                        />
                        {errors.dosage && (
                            <p className="form-error">{errors.dosage}</p>
                        )}
                    </div>

                    {/* Frequency */}
                    <div className="form-group">
                        <Label htmlFor="frequency" className="form-label">
                            Frequency <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="frequency"
                            value={formData.frequency}
                            onChange={(e) => handleChange('frequency', e.target.value)}
                            className={`form-input ${errors.frequency ? 'border-red-500' : ''}`}
                        >
                            <option value="">Select frequency...</option>
                            {frequencyOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        {errors.frequency && (
                            <p className="form-error">{errors.frequency}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div className="form-group">
                            <Label htmlFor="start_date" className="form-label">
                                Start Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                id="start_date"
                                value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                                className={errors.start_date ? 'border-red-500' : ''}
                            />
                            {errors.start_date && (
                                <p className="form-error">{errors.start_date}</p>
                            )}
                        </div>

                        {/* End Date */}
                        <div className="form-group">
                            <Label htmlFor="end_date" className="form-label">
                                End Date (Optional)
                            </Label>
                            <Input
                                type="date"
                                id="end_date"
                                value={formData.end_date}
                                onChange={(e) => handleChange('end_date', e.target.value)}
                                min={formData.start_date}
                                className={errors.end_date ? 'border-red-500' : ''}
                            />
                            {errors.end_date && (
                                <p className="form-error">{errors.end_date}</p>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <Label htmlFor="notes" className="form-label">
                            Instructions / Notes (Optional)
                        </Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Special instructions, warnings, or additional notes..."
                            rows={3}
                        />
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">💊 Prescription Guidelines:</p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                            <li>Ensure dosage and frequency are clearly specified</li>
                            <li>Include any special instructions or warnings</li>
                            <li>Patient can download this prescription</li>
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
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {loading ? 'Saving...' : 'Save Prescription'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
