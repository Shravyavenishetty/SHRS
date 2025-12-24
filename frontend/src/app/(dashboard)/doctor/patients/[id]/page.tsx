'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    User,
    FileText,
    Pill,
    Calendar,
    ArrowLeft,
    Plus,
    Phone,
    Mail,
    MapPin,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Timeline, TimelineItem } from '@/components/ui/Timeline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MedicalRecordForm, PrescriptionForm } from '@/components/forms';
import { apiClient } from '@/lib/api';
import { Patient, MedicalRecord, Prescription, Appointment } from '@/types';
import Link from 'next/link';

type TabType = 'overview' | 'medical-history' | 'prescriptions' | 'appointments';

export default function PatientProfilePage() {
    const params = useParams();
    const router = useRouter();
    const patientId = parseInt(params?.id as string);

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [patient, setPatient] = useState<Patient | null>(null);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

    useEffect(() => {
        if (patientId) {
            fetchPatientData();
        }
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            const [patientData, records, prescriptionsData, appointmentsData] = await Promise.all([
                apiClient.getPatientById(patientId),
                apiClient.getMedicalRecords().then(r => r.filter(rec => rec.patient_id === patientId)),
                apiClient.getPrescriptions().then(p => p.filter(presc => presc.patient_id === patientId)),
                apiClient.getAppointments().then(a => a.filter(app => app.patient_id === patientId)),
            ]);

            setPatient(patientData);
            setMedicalRecords(records);
            setPrescriptions(prescriptionsData);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Failed to fetch patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    const medicalHistoryTimeline: TimelineItem[] = medicalRecords.map((record) => ({
        id: record.id,
        title: record.diagnosis,
        description: record.treatment,
        date: new Date(record.visit_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }),
        type: 'default',
        metadata: {
            medicines: record.prescribed_medicines,
        },
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">Patient not found</p>
                <Link href="/doctor/patients" className="text-blue-600 hover:underline mt-2 inline-block">
                    ← Back to patients
                </Link>
            </div>
        );
    }

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: User },
        { id: 'medical-history' as TabType, label: 'Medical History', icon: FileText },
        { id: 'prescriptions' as TabType, label: 'Prescriptions', icon: Pill },
        { id: 'appointments' as TabType, label: 'Appointments', icon: Calendar },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="btn-ghost"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="page-title">Patient Profile</h1>
                        <p className="page-description">
                            Complete medical records and history
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowMedicalRecordForm(true)}
                        className="btn-primary"
                    >
                        <Plus className="h-4 w-4" />
                        Add Record
                    </button>
                    <button
                        onClick={() => setShowPrescriptionForm(true)}
                        className="btn-secondary"
                    >
                        <Plus className="h-4 w-4" />
                        Prescribe
                    </button>
                </div>
            </div>

            {/* Patient Info Card */}
            <Card className="medical-card">
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{patient.first_name} {patient.last_name}</h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <Activity className="h-4 w-4" />
                                            Patient ID: P-{patient.id.toString().padStart(5, '0')}
                                        </span>
                                        {patient.age && (
                                            <span>{patient.age} years old</span>
                                        )}
                                        {patient.gender && (
                                            <Badge variant="outline">{patient.gender}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
                                {patient.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-700">{patient.phone}</span>
                                    </div>
                                )}
                                {patient.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-700">{patient.email}</span>
                                    </div>
                                )}
                                {patient.address && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-700">{patient.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="flex gap-8" role="tablist" aria-label="Patient information tabs">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`${tab.id}-panel`}
                                id={`${tab.id}-tab`}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div
                        role="tabpanel"
                        id="overview-panel"
                        aria-labelledby="overview-tab"
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-3 gap-6">
                            <Card className="medical-card">
                                <CardContent className="p-6 text-center">
                                    <FileText className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-slate-900">{medicalRecords.length}</p>
                                    <p className="text-sm text-slate-600">Medical Records</p>
                                </CardContent>
                            </Card>
                            <Card className="medical-card">
                                <CardContent className="p-6 text-center">
                                    <Pill className="h-10 w-10 text-green-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-slate-900">{prescriptions.length}</p>
                                    <p className="text-sm text-slate-600">Prescriptions</p>
                                </CardContent>
                            </Card>
                            <Card className="medical-card">
                                <CardContent className="p-6 text-center">
                                    <Calendar className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                                    <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
                                    <p className="text-sm text-slate-600">Appointments</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="medical-card">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {medicalRecords.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">No medical records yet</p>
                                ) : (
                                    <Timeline items={medicalHistoryTimeline.slice(0, 3)} />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Medical History Tab */}
                {activeTab === 'medical-history' && (
                    <div
                        role="tabpanel"
                        id="medical-history-panel"
                        aria-labelledby="medical-history-tab"
                    >
                        <Card className="medical-card">
                            <CardHeader>
                                <CardTitle>Complete Medical History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {medicalRecords.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 mb-4">No medical records yet</p>
                                        <button
                                            onClick={() => setShowMedicalRecordForm(true)}
                                            className="btn-primary"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add First Record
                                        </button>
                                    </div>
                                ) : (
                                    <Timeline items={medicalHistoryTimeline} />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Prescriptions Tab */}
                {activeTab === 'prescriptions' && (
                    <div
                        role="tabpanel"
                        id="prescriptions-panel"
                        aria-labelledby="prescriptions-tab"
                    >
                        <Card className="medical-card">
                            <CardHeader>
                                <CardTitle>All Prescriptions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {prescriptions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Pill className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 mb-4">No prescriptions yet</p>
                                        <button
                                            onClick={() => setShowPrescriptionForm(true)}
                                            className="btn-primary"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add First Prescription
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {prescriptions.map(prescription => (
                                            <div key={prescription.id} className="p-4 hover:bg-slate-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900">{prescription.medicine_name}</h4>
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            <span className="font-medium">Dosage:</span> {prescription.dosage} • {prescription.frequency}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {new Date(prescription.start_date).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                            {prescription.end_date && ` - ${new Date(prescription.end_date).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}`}
                                                        </p>
                                                        {prescription.notes && (
                                                            <p className="text-sm text-slate-600 mt-2 italic">{prescription.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                    <div
                        role="tabpanel"
                        id="appointments-panel"
                        aria-labelledby="appointments-tab"
                    >
                        <Card className="medical-card">
                            <CardHeader>
                                <CardTitle>Appointment History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {appointments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">No appointments found</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {appointments.map(appointment => (
                                            <div key={appointment.id} className="p-4 hover:bg-slate-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-slate-900">
                                                                {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </h4>
                                                            <Badge variant={appointment.status as any}>
                                                                {appointment.status}
                                                            </Badge>
                                                        </div>
                                                        {appointment.appointment_time && (
                                                            <p className="text-sm text-slate-600 mt-1">
                                                                Time: {appointment.appointment_time}
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            Reason: {appointment.reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Forms */}
            <MedicalRecordForm
                isOpen={showMedicalRecordForm}
                onClose={() => setShowMedicalRecordForm(false)}
                onSuccess={() => {
                    setShowMedicalRecordForm(false);
                    fetchPatientData();
                }}
                patientId={patientId}
            />

            <PrescriptionForm
                isOpen={showPrescriptionForm}
                onClose={() => setShowPrescriptionForm(false)}
                onSuccess={() => {
                    setShowPrescriptionForm(false);
                    fetchPatientData();
                }}
                patientId={patientId}
            />
        </div>
    );
}
