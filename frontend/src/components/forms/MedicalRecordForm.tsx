'use client';

import React, { useState } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { apiClient } from '@/lib/api';
import { MedicalRecord } from '@/types';

interface MedicalRecordFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (record: MedicalRecord) => void;
    patientId: number;
}

export function MedicalRecordForm({ isOpen, onClose, onSuccess, patientId }: MedicalRecordFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        diagnosis: '',
        treatment: '',
        prescribed_medicines: '',
        notes: '',
        visit_date: new Date().toISOString().split('T')[0],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.diagnosis || formData.diagnosis.length < 5) {
            newErrors.diagnosis = 'Diagnosis is required (minimum 5 characters)';
        }
        if (!formData.treatment || formData.treatment.length < 10) {
            newErrors.treatment = 'Treatment plan is required (minimum 10 characters)';
        }
        if (!formData.visit_date) newErrors.visit_date = 'Visit date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const record = await apiClient.createMedicalRecord({
                patient_id: patientId,
                doctor_id: 0, // Will be set by backend based on authenticated user
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                prescribed_medicines: formData.prescribed_medicines || undefined,
                notes: formData.notes || undefined,
                visit_date: formData.visit_date,
            });

            onSuccess?.(record);
            onClose();

            // Reset form
            setFormData({
                diagnosis: '',
                treatment: '',
                prescribed_medicines: '',
                notes: '',
                visit_date: new Date().toISOString().split('T')[0],
            });
        } catch (error) {
            console.error('Failed to create medical record:', error);
            setErrors({ submit: 'Failed to save medical record. Please try again.' });
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
                    <FileText className="h-5 w-5 text-blue-600" />
                    Add Medical Record
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

                    {/* Visit Date */}
                    <div className="form-group">
                        <Label htmlFor="visit_date" className="form-label">
                            Visit Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            id="visit_date"
                            value={formData.visit_date}
                            onChange={(e) => handleChange('visit_date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className={errors.visit_date ? 'border-red-500' : ''}
                        />
                        {errors.visit_date && (
                            <p className="form-error">{errors.visit_date}</p>
                        )}
                    </div>

                    {/* Diagnosis */}
                    <div className="form-group">
                        <Label htmlFor="diagnosis" className="form-label">
                            Diagnosis <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="diagnosis"
                            value={formData.diagnosis}
                            onChange={(e) => handleChange('diagnosis', e.target.value)}
                            placeholder="e.g., Common Cold, Hypertension"
                            className={errors.diagnosis ? 'border-red-500' : ''}
                        />
                        {errors.diagnosis && (
                            <p className="form-error">{errors.diagnosis}</p>
                        )}
                    </div>

                    {/* Treatment */}
                    <div className="form-group">
                        <Label htmlFor="treatment" className="form-label">
                            Treatment Plan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="treatment"
                            value={formData.treatment}
                            onChange={(e) => handleChange('treatment', e.target.value)}
                            placeholder="Describe the treatment plan, procedures, or recommendations..."
                            rows={3}
                            className={errors.treatment ? 'border-red-500' : ''}
                        />
                        {errors.treatment && (
                            <p className="form-error">{errors.treatment}</p>
                        )}
                    </div>

                    {/* Prescribed Medicines */}
                    <div className="form-group">
                        <Label htmlFor="medicines" className="form-label">
                            Prescribed Medicines (Optional)
                        </Label>
                        <Textarea
                            id="medicines"
                            value={formData.prescribed_medicines}
                            onChange={(e) => handleChange('prescribed_medicines', e.target.value)}
                            placeholder="List medicines, dosages, and duration..."
                            rows={2}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Tip: Use separate prescription form for detailed medicine records
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <Label htmlFor="notes" className="form-label">
                            Additional Notes (Optional)
                        </Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Any additional observations or notes..."
                            rows={2}
                        />
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                            This record will be permanently added to the patient's medical history and cannot be deleted.
                        </p>
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
                        {loading ? 'Saving...' : 'Save Medical Record'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
