'use client';

import { useEffect, useState } from 'react';
import { UserCog, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { DoctorForm } from '@/components/forms';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { type Doctor } from '@/types';

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDoctorForm, setShowDoctorForm] = useState(false);
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const data = await apiClient.getDoctors();
            console.log('Fetched doctors:', data);
            setDoctors(data);
        } catch (err: any) {
            console.error('Error fetching doctors:', err);
            showError(err.response?.data?.detail || 'Failed to fetch doctors');
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<Doctor>[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
        },
        {
            key: 'specialty',
            label: 'Specialty',
            sortable: true,
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
        },
        {
            key: 'contact',
            label: 'Contact',
        },
        {
            key: 'experience',
            label: 'Experience',
            sortable: true,
            render: (doctor) => `${doctor.experience || 0} years`,
        },
        {
            key: 'hospital',
            label: 'Hospital',
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (doctor) => (
                <Badge variant={doctor.is_active ? 'success' : 'destructive'}>
                    {doctor.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (doctor) => formatDate(doctor.created_at),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-outfit font-bold">Doctors</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage healthcare providers
                    </p>
                </div>
                <Button onClick={() => setShowDoctorForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                </Button>
            </div>

            {doctors.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <UserCog className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
                        <p className="text-muted-foreground mb-4">
                            There are currently no doctors in the system.
                        </p>
                        <Button onClick={() => setShowDoctorForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Doctor
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Doctors ({doctors.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={doctors}
                            columns={columns}
                            pageSize={10}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Doctor Form Modal */}
            <DoctorForm
                isOpen={showDoctorForm}
                onClose={() => setShowDoctorForm(false)}
                onSuccess={() => {
                    setShowDoctorForm(false);
                    fetchDoctors();
                    success('Doctor added successfully!');
                }}
            />
        </div>
    );
}
