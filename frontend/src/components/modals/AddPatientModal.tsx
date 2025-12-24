'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { useToast } from '../ui/Toast';
import { apiClient } from '@/lib/api';

interface AddPatientModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddPatientModal({ open, onClose, onSuccess }: AddPatientModalProps) {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        medical_history: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await apiClient.createPatient({
                ...formData,
                age: parseInt(formData.age),
            });
            success('Patient added successfully!');
            onSuccess();
            onClose();
            setFormData({
                first_name: '',
                last_name: '',
                age: '',
                gender: '',
                phone: '',
                email: '',
                address: '',
                medical_history: '',
            });
        } catch (err: any) {
            error(err.response?.data?.detail || 'Failed to add patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>Add New Patient</ModalTitle>
                    <ModalClose onClose={onClose} />
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input
                                    id="first_name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    required
                                    placeholder="John"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input
                                    id="last_name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    required
                                    placeholder="Doe"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="age">Age *</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    required
                                    min="0"
                                    max="150"
                                    placeholder="30"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gender *</Label>
                                <Select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    required
                                    className="mt-1"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="+1234567890"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="patient@example.com"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                                placeholder="123 Main St, City, Country"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="medical_history">Medical History</Label>
                            <Textarea
                                id="medical_history"
                                value={formData.medical_history}
                                onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                                placeholder="Any pre-existing conditions, allergies, or medical history..."
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Patient'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
