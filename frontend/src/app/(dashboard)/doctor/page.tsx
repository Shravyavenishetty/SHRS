'use client';

import { useEffect, useState } from 'react';
import { Calendar, UserCircle, FileText, AlertCircle, Clock, MapPin, Eye, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api';
import { Appointment } from '@/types';
import Link from 'next/link';

interface Stats {
    todayAppointments: number;
    totalPatients: number;
    pendingRecords: number;
    alerts: number;
}

export default function DoctorDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const appointments = await apiClient.getAppointmentsByDoctor();
            const patients = await apiClient.getPatients();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayAppts = appointments.filter(a => {
                const apptDate = new Date(a.appointment_date);
                apptDate.setHours(0, 0, 0, 0);
                return apptDate.getTime() === today.getTime();
            });

            const upcomingAppts = appointments
                .filter(a => new Date(a.appointment_date) >= new Date() && a.status !== 'canceled')
                .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                .slice(0, 5);

            setStats({
                todayAppointments: todayAppts.length,
                totalPatients: patients.length,
                pendingRecords: appointments.filter(a => a.status === 'pending').length,
                alerts: appointments.filter(a => a.status === 'pending' && new Date(a.appointment_date) <= new Date()).length,
            });

            setUpcomingAppointments(upcomingAppts);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Welcome Back, Doctor</h1>
                <p className="page-description">
                    Here's your overview for today
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid-stats">
                <StatCard
                    title="Today's Appointments"
                    value={stats?.todayAppointments || 0}
                    icon={Calendar}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />
                <StatCard
                    title="Pending Requests"
                    value={stats?.pendingRecords || 0}
                    icon={Clock}
                    iconColor="text-amber-600"
                    iconBgColor="bg-amber-100"
                />
                <StatCard
                    title="Total Patients"
                    value={stats?.totalPatients || 0}
                    icon={UserCircle}
                    iconColor="text-teal-600"
                    iconBgColor="bg-teal-100"
                />
                <StatCard
                    title="Alerts"
                    value={stats?.alerts || 0}
                    icon={AlertCircle}
                    iconColor="text-red-600"
                    iconBgColor="bg-red-100"
                />
            </div>

            {/* Upcoming Appointments */}
            <Card className="medical-card">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            Upcoming Appointments
                        </CardTitle>
                        <Link
                            href="/doctor/appointments"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            View All →
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {upcomingAppointments.length === 0 ? (
                        <div className="p-8 text-center">
                            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No upcoming appointments</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {upcomingAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                                                    {appointment.patient?.first_name?.charAt(0) || 'P'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-slate-900 truncate">
                                                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">
                                                        {appointment.patient?.age} years • {appointment.patient?.gender}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 ml-13">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(appointment.appointment_date)}</span>
                                                </div>
                                                {appointment.appointment_time && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{appointment.appointment_time}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-2 text-sm text-slate-700 ml-13">
                                                <span className="font-medium">Reason:</span> {appointment.reason}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant={appointment.status as any}>
                                                {appointment.status}
                                            </Badge>
                                            <Link
                                                href={`/doctor/patients/${appointment.patient_id}`}
                                                className="btn-ghost text-xs py-1.5 px-3"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid-cards">
                <Card className="medical-card-hover">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link
                            href="/doctor/appointments"
                            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">Manage Appointments</p>
                                <p className="text-sm text-slate-500">View and update your schedule</p>
                            </div>
                        </Link>
                        <Link
                            href="/doctor/patients"
                            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
                        >
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                <UserCircle className="h-5 w-5 text-teal-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">Patient Records</p>
                                <p className="text-sm text-slate-500">Access patient information</p>
                            </div>
                        </Link>
                        <Link
                            href="/doctor/medical-records"
                            className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">Medical Records</p>
                                <p className="text-sm text-slate-500">Add new diagnoses and treatments</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="medical-card-hover">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            Today's Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Stethoscope className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Consultations</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{stats?.todayAppointments || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Pending</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{stats?.pendingRecords || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Requires Attention</span>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{stats?.alerts || 0}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
