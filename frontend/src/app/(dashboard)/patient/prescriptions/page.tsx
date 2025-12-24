'use client';

import { useEffect, useState } from 'react';
import { Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Prescription } from '@/types';

export default function PatientPrescriptionsPage() {
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

    const isActive = (rx: Prescription) => {
        if (!rx.end_date) return true;
        return new Date(rx.end_date) > new Date();
    };

    const columns: Column<Prescription>[] = [
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
        {
            key: 'status',
            label: 'Status',
            render: (rx) => (
                <Badge variant={isActive(rx) ? 'success' : 'secondary'}>
                    {isActive(rx) ? 'Active' : 'Completed'}
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

    const activePrescriptions = prescriptions.filter(isActive);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-outfit font-bold">Prescriptions</h1>
                <p className="text-muted-foreground mt-1">
                    Your prescribed medications
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Prescriptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activePrescriptions.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Prescriptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{prescriptions.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable data={prescriptions} columns={columns} pageSize={10} />
                </CardContent>
            </Card>
        </div>
    );
}
