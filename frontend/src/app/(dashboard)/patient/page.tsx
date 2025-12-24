'use client';

import { useEffect, useState } from 'react';
import { Calendar, FileText, Pill, Clock, Download, Plus, User, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { Timeline, TimelineItem } from '@/components/ui/Timeline';
import { apiClient } from '@/lib/api';
import { Appointment, MedicalRecord, Prescription } from '@/types';
import Link from 'next/link';

export default function PatientDashboard() {
    const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
    const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
    const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatientData();
    }, []);

    const fetchPatientData = async () => {
        try {
            //  Get data - using available API methods
            const appointments = await apiClient.getAppointments();
            const records = await apiClient.getMedicalRecords();
            const prescriptions = await apiClient.getPrescriptions();

            // Find next upcoming appointment
            const upcoming = appointments
                .filter(a => new Date(a.appointment_date) >= new Date() && a.status !== 'canceled')
                .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

            setUpcomingAppointment(upcoming || null);
            setRecentRecords(records.slice(0, 5));
            setRecentPrescriptions(prescriptions.slice(0, 3));
        } catch (error) {
            console.error('Failed to fetch patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const medicalRecordsTimeline: TimelineItem[] = recentRecords.map((record) => ({
        id: record.id,
        title: record.diagnosis,
        description: record.treatment,
        date: formatDate(record.visit_date),
        type: 'default',
        metadata: {
            doctor: record.doctor_id ? `Dr. ID: ${record.doctor_id}` : undefined,
        },
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Your Health Dashboard</h1>
                <p className="page-description">
                    Manage your appointments and medical records
                </p>
            </div>

            {/* Upcoming Appointment Card - Prominent */}
            {upcomingAppointment ? (
                <Card className="medical-card border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-slate-900">Upcoming Appointment</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">
                                            Dr. {upcomingAppointment.doctor?.name || 'TBD'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(upcomingAppointment.appointment_date)}</span>
                                        {upcomingAppointment.appointment_time && (
                                            <>
                                                <Clock className="h-4 w-4 ml-2" />
                                                <span>{upcomingAppointment.appointment_time}</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2">
                                        <span className="font-medium">Reason:</span> {upcomingAppointment.reason}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={upcomingAppointment.status as any} className="mt-1">
                                {upcomingAppointment.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="medical-card bg-gradient-to-r from-teal-50 to-white border-l-4 border-l-teal-600">
                    <CardContent className="p-6 text-center">
                        <Calendar className="h-12 w-12 text-teal-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Upcoming Appointments</h3>
                        <p className="text-slate-600 mb-4">Schedule an appointment with your doctor</p>
                        <Link href="/patient/appointments" className="btn-primary inline-flex">
                            <Plus className="h-4 w-4" />
                            Book Appointment
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="medical-card">
                    <CardContent className="p-4 text-center">
                        <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{recentRecords.length}</p>
                        <p className="text-sm text-slate-600">Medical Records</p>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="p-4 text-center">
                        <Pill className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{recentPrescriptions.length}</p>
                        <p className="text-sm text-slate-600">Prescriptions</p>
                    </CardContent>
                </Card>
                <Card className="medical-card">
                    <CardContent className="p-4 text-center">
                        <Activity className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">
                            {recentRecords.length + recentPrescriptions.length}
                        </p>
                        <p className="text-sm text-slate-600">Total Records</p>
                    </CardContent>
                </Card>
            </div>

            {/* Medical History Timeline */}
            <Card className="medical-card">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            Your Medical History
                        </CardTitle>
                        <Link
                            href="/patient/medical-records"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            View All →
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {medicalRecordsTimeline.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No medical records yet</p>
                        </div>
                    ) : (
                        <Timeline items={medicalRecordsTimeline} />
                    )}
                </CardContent>
            </Card>

            {/* Recent Prescriptions */}
            <Card className="medical-card">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            Recent Prescriptions
                        </CardTitle>
                        <Link
                            href="/patient/prescriptions"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            View All →
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {recentPrescriptions.length === 0 ? (
                        <div className="p-8 text-center">
                            <Pill className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No prescriptions available</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentPrescriptions.map((prescription) => (
                                <div key={prescription.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900">{prescription.medicine_name}</h4>
                                            <p className="text-sm text-slate-600 mt-1">
                                                <span className="font-medium">Dosage:</span> {prescription.dosage} • {prescription.frequency}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {formatDate(prescription.start_date)}
                                                {prescription.end_date && ` - ${formatDate(prescription.end_date)}`}
                                            </p>
                                        </div>
                                        <button className="btn-ghost text-xs py-1.5 px-3">
                                            <Download className="h-3.5 w-3.5" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <Link
                    href="/patient/appointments"
                    className="flex items-center gap-4 p-5 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-900">Book Appointment</p>
                        <p className="text-sm text-slate-500">Schedule with a doctor</p>
                    </div>
                </Link>
                <Link
                    href="/patient/medical-records"
                    className="flex items-center gap-4 p-5 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all"
                >
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                        <FileText className="h-6 w-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-slate-900">View Records</p>
                        <p className="text-sm text-slate-500">Access medical history</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
