'use client';

import { useEffect, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Patient } from '@/types';
import { AddPatientModal } from '@/components/modals/AddPatientModal';

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const data = await apiClient.getPatients();
            setPatients(data);
        } catch (err) {
            showError('Failed to fetch patients');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<Patient>[] = [
        {
            key: 'first_name',
            label: 'First Name',
            sortable: true,
        },
        {
            key: 'last_name',
            label: 'Last Name',
            sortable: true,
        },
        {
            key: 'age',
            label: 'Age',
            sortable: true,
        },
        {
            key: 'gender',
            label: 'Gender',
            sortable: true,
        },
        {
            key: 'phone',
            label: 'Phone',
        },
        {
            key: 'email',
            label: 'Email',
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (patient) => (
                <Badge variant={patient.is_active ? 'success' : 'destructive'}>
                    {patient.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'date_registered',
            label: 'Registered',
            sortable: true,
            render: (patient) => formatDate(patient.date_registered),
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
                    <h1 className="text-3xl font-outfit font-bold">Patients</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage patient records
                    </p>
                </div>
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Patients ({patients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={patients}
                        columns={columns}
                        pageSize={10}
                    />
                </CardContent>
            </Card>

            <AddPatientModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchPatients}
            />
        </div>
    );
}
