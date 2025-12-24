'use client';

import { useEffect, useState } from 'react';
import { UserCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api';
import type { Patient } from '@/types';

export default function DoctorPatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const { error: showError } = useToast();

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
            label: 'Name',
            sortable: true,
            render: (patient) => `${patient.first_name} ${patient.last_name}`,
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
                        Manage your patient records
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Patients ({patients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable data={patients} columns={columns} pageSize={10} />
                </CardContent>
            </Card>
        </div>
    );
}
