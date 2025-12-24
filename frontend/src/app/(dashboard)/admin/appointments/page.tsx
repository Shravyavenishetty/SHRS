'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { AppointmentForm } from '@/components/forms';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Appointment } from '@/types';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const { success, error: showError } = useToast();

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

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'warning' | 'success' | 'destructive'> = {
            pending: 'warning',
            confirmed: 'default',
            completed: 'success',
            cancelled: 'destructive',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    const columns: Column<Appointment>[] = [
        {
            key: 'patient',
            label: 'Patient',
            sortable: true,
            render: (appointment) =>
                `${appointment.patient?.first_name} ${appointment.patient?.last_name}`,
        },
        {
            key: 'doctor',
            label: 'Doctor',
            sortable: true,
            render: (appointment) => appointment.doctor?.name || 'N/A',
        },
        {
            key: 'appointment_date',
            label: 'Date',
            sortable: true,
            render: (appointment) => formatDate(appointment.appointment_date),
        },
        {
            key: 'appointment_time',
            label: 'Time',
            render: (appointment) => appointment.appointment_time || 'N/A',
        },
        {
            key: 'reason',
            label: 'Reason',
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (appointment) => getStatusBadge(appointment.status),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Calculate statistics
    const stats = {
        total: appointments.length,
        pending: appointments.filter((a) => a.status === 'pending').length,
        confirmed: appointments.filter((a) => a.status === 'confirmed').length,
        completed: appointments.filter((a) => a.status === 'completed').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-outfit font-bold">Appointments</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage patient appointments
                    </p>
                </div>
                <Button onClick={() => setShowAppointmentForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All appointments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting confirmation
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.confirmed}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Scheduled
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Finished
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Appointments ({appointments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={appointments}
                        columns={columns}
                        pageSize={10}
                    />
                </CardContent>
            </Card>

            {/* Appointment Form Modal */}
            <AppointmentForm
                isOpen={showAppointmentForm}
                onClose={() => setShowAppointmentForm(false)}
                onSuccess={() => {
                    setShowAppointmentForm(false);
                    fetchAppointments();
                    success('Appointment created successfully!');
                }}
            />
        </div>
    );
}
