'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { useToast } from '../ui/Toast';
import { apiClient } from '@/lib/api';

interface AddDoctorModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddDoctorModal({ open, onClose, onSuccess }: AddDoctorModalProps) {
    const { success, error } = useToast();
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await apiClient.createDoctor({
                ...formData,
                experience: parseInt(formData.experience),
            });
            success('Doctor added successfully!');
            onSuccess();
            onClose();
            setFormData({
                name: '',
                specialty: '',
                email: '',
                contact: '',
                experience: '',
                hospital: '',
                password: '',
            });
        } catch (err: any) {
            error(err.response?.data?.detail || 'Failed to add doctor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>Add New Doctor</ModalTitle>
                    <ModalClose onClose={onClose} />
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Dr. John Doe"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="specialty">Specialty *</Label>
                            <Select
                                id="specialty"
                                value={formData.specialty}
                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                required
                                className="mt-1"
                            >
                                <option value="">Select Specialty</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Dermatology">Dermatology</option>
                                <option value="General Medicine">General Medicine</option>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="doctor@example.com"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="contact">Contact *</Label>
                                <Input
                                    id="contact"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    required
                                    placeholder="+1234567890"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="experience">Experience (years) *</Label>
                                <Input
                                    id="experience"
                                    type="number"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    required
                                    min="0"
                                    placeholder="5"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="hospital">Hospital *</Label>
                                <Input
                                    id="hospital"
                                    value={formData.hospital}
                                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                                    required
                                    placeholder="City Hospital"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                placeholder="Min 6 characters"
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
                        {loading ? 'Adding...' : 'Add Doctor'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
