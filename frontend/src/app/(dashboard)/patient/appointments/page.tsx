'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { Appointment } from '@/types';

export default function PatientAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const { error: showError } = useToast();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const data = await apiClient.getAppointments();
            setAppointments(data);
        } catch (err) {
            showError('Failed to fetch appointments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'canceled':
                return 'destructive';
            case 'completed':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const columns: Column<Appointment>[] = [
        {
            key: 'appointment_date',
            label: 'Date & Time',
            sortable: true,
            render: (apt) => formatDateTime(apt.appointment_date),
        },
        {
            key: 'doctor_id',
            label: 'Doctor ID',
            sortable: true,
        },
        {
            key: 'reason',
            label: 'Reason',
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (apt) => (
                <Badge variant={getStatusVariant(apt.status)}>
                    {apt.status}
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

    const upcomingAppointments = appointments.filter(
        (a) => new Date(a.appointment_date) > new Date()
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-outfit font-bold">My Appointments</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage your appointments
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Upcoming Appointments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Appointments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointments.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable data={appointments} columns={columns} pageSize={10} />
                </CardContent>
            </Card>
        </div>
    );
}
