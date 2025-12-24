'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { Appointment } from '@/types';

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const data = await apiClient.getAppointmentsByDoctor();
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
            key: 'patient_id',
            label: 'Patient ID',
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
        {
            key: 'actions',
            label: 'Actions',
            render: (apt) => (
                <div className="flex gap-2">
                    {apt.status === 'pending' && (
                        <Button size="sm" variant="outline">
                            Confirm
                        </Button>
                    )}
                    {apt.status === 'confirmed' && (
                        <Button size="sm" variant="secondary">
                            Complete
                        </Button>
                    )}
                </div>
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

    const todayAppointments = appointments.filter(
        (a) => new Date(a.appointment_date).toDateString() === new Date().toDateString()
    );

    const upcomingAppointments = appointments.filter(
        (a) => new Date(a.appointment_date) > new Date()
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-outfit font-bold">Appointments</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your appointment schedule
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Today's Appointments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayAppointments.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Upcoming
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointments.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Appointments Table */}
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
