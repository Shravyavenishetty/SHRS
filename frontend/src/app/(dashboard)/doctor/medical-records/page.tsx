'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { MedicalRecord } from '@/types';

export default function DoctorMedicalRecordsPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { error: showError } = useToast();

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const data = await apiClient.getMedicalRecords();
            setRecords(data);
        } catch (err) {
            showError('Failed to fetch medical records');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<MedicalRecord>[] = [
        {
            key: 'visit_date',
            label: 'Visit Date',
            sortable: true,
            render: (record) => formatDate(record.visit_date),
        },
        {
            key: 'patient_id',
            label: 'Patient ID',
            sortable: true,
        },
        {
            key: 'diagnosis',
            label: 'Diagnosis',
        },
        {
            key: 'treatment',
            label: 'Treatment',
        },
        {
            key: 'prescribed_medicines',
            label: 'Medicines',
            render: (record) => record.prescribed_medicines || '-',
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
                    <h1 className="text-3xl font-outfit font-bold">Medical Records</h1>
                    <p className="text-muted-foreground mt-1">
                        Patient medical history and records
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Record
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Medical Records ({records.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable data={records} columns={columns} pageSize={10} />
                </CardContent>
            </Card>
        </div>
    );
}
