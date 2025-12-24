'use client';

import React, { useState } from 'react';
import { Pill, AlertCircle } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, ModalClose } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { apiClient } from '@/lib/api';
import type { Medicine } from '@/types';

interface MedicineFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (medicine: Medicine) => void;
}

export function MedicineForm({ isOpen, onClose, onSuccess }: MedicineFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dosage_form: '',
        strength: '',
        manufacturer: '',
        stock_quantity: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const dosageForms = [
        'Tablet',
        'Capsule',
        'Syrup',
        'Injection',
        'Cream',
        'Ointment',
        'Drops',
        'Inhaler',
        'Powder',
        'Solution',
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || formData.name.length < 2) {
            newErrors.name = 'Medicine name is required (minimum 2 characters)';
        }
        if (!formData.dosage_form) {
            newErrors.dosage_form = 'Please select a dosage form';
        }
        if (formData.stock_quantity && isNaN(Number(formData.stock_quantity))) {
            newErrors.stock_quantity = 'Stock quantity must be a number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const medicine = await apiClient.createMedicine({
                name: formData.name,
                description: formData.description || undefined,
                dosage_form: formData.dosage_form,
                manufacturer: formData.manufacturer || undefined,
                stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
                price: 0, // Default price
                stock: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
                expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            });

            onSuccess?.(medicine);
            onClose();

            // Reset form
            setFormData({
                name: '',
                description: '',
                dosage_form: '',
                strength: '',
                manufacturer: '',
                stock_quantity: '',
            });
            setErrors({});
        } catch (error: any) {
            console.error('Failed to create medicine:', error);
            setErrors({ submit: error.response?.data?.detail || 'Failed to add medicine. Please try again.' });
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
                    Add New Medicine
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
                        <Label htmlFor="name" className="form-label">
                            Medicine Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g., Paracetamol, Amoxicillin"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="form-error">{errors.name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <Label htmlFor="description" className="form-label">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Brief description of the medicine..."
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Dosage Form */}
                        <div className="form-group">
                            <Label htmlFor="dosage_form" className="form-label">
                                Dosage Form <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="dosage_form"
                                value={formData.dosage_form}
                                onChange={(e) => handleChange('dosage_form', e.target.value)}
                                className={`form-input ${errors.dosage_form ? 'border-red-500' : ''}`}
                            >
                                <option value="">Select form...</option>
                                {dosageForms.map(form => (
                                    <option key={form} value={form}>
                                        {form}
                                    </option>
                                ))}
                            </select>
                            {errors.dosage_form && (
                                <p className="form-error">{errors.dosage_form}</p>
                            )}
                        </div>

                        {/* Strength */}
                        <div className="form-group">
                            <Label htmlFor="strength" className="form-label">
                                Strength (Optional)
                            </Label>
                            <Input
                                type="text"
                                id="strength"
                                value={formData.strength}
                                onChange={(e) => handleChange('strength', e.target.value)}
                                placeholder="e.g., 500mg, 10ml"
                            />
                        </div>
                    </div>

                    {/* Manufacturer */}
                    <div className="form-group">
                        <Label htmlFor="manufacturer" className="form-label">
                            Manufacturer (Optional)
                        </Label>
                        <Input
                            type="text"
                            id="manufacturer"
                            value={formData.manufacturer}
                            onChange={(e) => handleChange('manufacturer', e.target.value)}
                            placeholder="e.g., Pfizer, GSK"
                        />
                    </div>

                    {/* Stock Quantity */}
                    <div className="form-group">
                        <Label htmlFor="stock_quantity" className="form-label">
                            Initial Stock Quantity (Optional)
                        </Label>
                        <Input
                            type="number"
                            id="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={(e) => handleChange('stock_quantity', e.target.value)}
                            placeholder="0"
                            min="0"
                            className={errors.stock_quantity ? 'border-red-500' : ''}
                        />
                        {errors.stock_quantity && (
                            <p className="form-error">{errors.stock_quantity}</p>
                        )}
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">💊 Medicine Guidelines:</p>
                        <ul className="text-sm text-green-700 mt-2 space-y-1 ml-4 list-disc">
                            <li>Ensure medicine name is spelled correctly</li>
                            <li>Stock will be tracked automatically</li>
                            <li>You can update details later</li>
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
                        {loading ? 'Adding...' : 'Add Medicine'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
