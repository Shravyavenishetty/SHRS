'use client';

import { useEffect, useState } from 'react';
import { Pill, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Prescription } from '@/types';

export default function DoctorPrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const { error: showError } = useToast();

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = async () => {
        try {
            const data = await apiClient.getPrescriptions();
            setPrescriptions(data);
        } catch (err) {
            showError('Failed to fetch prescriptions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<Prescription>[] = [
        {
            key: 'patient_id',
            label: 'Patient ID',
            sortable: true,
        },
        {
            key: 'medicine_name',
            label: 'Medicine',
            sortable: true,
        },
        {
            key: 'dosage',
            label: 'Dosage',
        },
        {
            key: 'frequency',
            label: 'Frequency',
        },
        {
            key: 'start_date',
            label: 'Start Date',
            sortable: true,
            render: (rx) => formatDate(rx.start_date),
        },
        {
            key: 'end_date',
            label: 'End Date',
            render: (rx) => rx.end_date ? formatDate(rx.end_date) : 'Ongoing',
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
                    <h1 className="text-3xl font-outfit font-bold">Prescriptions</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage patient prescriptions
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Prescription
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Prescriptions ({prescriptions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable data={prescriptions} columns={columns} pageSize={10} />
                </CardContent>
            </Card>
        </div>
    );
}
