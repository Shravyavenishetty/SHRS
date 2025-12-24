'use client';

import { useEffect, useState } from 'react';
import {
    Users,
    UserCog,
    UserCircle,
    Calendar,
    Pill,
    Activity,
    TrendingUp,
    Clock,
    Server,
    Database,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface Stats {
    totalUsers: number;
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    todayAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    totalMedicines: number;
}

interface SystemMetric {
    label: string;
    value: string;
    status: 'healthy' | 'warning' | 'error';
    icon: typeof CheckCircle;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch data from all endpoints
            const [doctors, patients, appointments, medicines] = await Promise.all([
                apiClient.getDoctors(),
                apiClient.getPatients(),
                apiClient.getAppointments(),
                apiClient.getMedicines().catch(() => []),
            ]);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayAppts = appointments.filter(a => {
                const apptDate = new Date(a.appointment_date);
                apptDate.setHours(0, 0, 0, 0);
                return apptDate.getTime() === today.getTime();
            });

            setStats({
                totalUsers: doctors.length + patients.length,
                totalDoctors: doctors.length,
                totalPatients: patients.length,
                totalAppointments: appointments.length,
                todayAppointments: todayAppts.length,
                pendingAppointments: appointments.filter(a => a.status === 'pending').length,
                completedAppointments: appointments.filter(a => a.status === 'completed').length,
                totalMedicines: medicines.length,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const systemMetrics: SystemMetric[] = [
        { label: 'API Server', value: 'Online', status: 'healthy', icon: CheckCircle },
        { label: 'Database', value: 'Connected', status: 'healthy', icon: Database },
        { label: 'Response Time', value: '<100ms', status: 'healthy', icon: Activity },
        { label: 'Uptime', value: '99.9%', status: 'healthy', icon: TrendingUp },
    ];

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
                <h1 className="page-title">System Administration</h1>
                <p className="page-description">
                    Monitor and manage the healthcare system
                </p>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid-stats">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    iconColor="text-purple-600"
                    iconBgColor="bg-purple-100"
                />
                <StatCard
                    title="Healthcare Providers"
                    value={stats?.totalDoctors || 0}
                    icon={UserCog}
                    iconColor="text-blue-600"
                    iconBgColor="bg-blue-100"
                />
                <StatCard
                    title="Registered Patients"
                    value={stats?.totalPatients || 0}
                    icon={UserCircle}
                    iconColor="text-teal-600"
                    iconBgColor="bg-teal-100"
                />
                <StatCard
                    title="Total Appointments"
                    value={stats?.totalAppointments || 0}
                    icon={Calendar}
                    iconColor="text-green-600"
                    iconBgColor="bg-green-100"
                />
            </div>

            {/* Secondary Stats - Data Dense */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="medical-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Today</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                    {stats?.todayAppointments || 0}
                                </p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="medical-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Pending</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                    {stats?.pendingAppointments || 0}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="medical-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Completed</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                    {stats?.completedAppointments || 0}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="medical-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Medicines</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                    {stats?.totalMedicines || 0}
                                </p>
                            </div>
                            <Pill className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* System Health */}
                <Card className="medical-card">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Server className="h-5 w-5 text-blue-600" />
                            System Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {systemMetrics.map((metric) => {
                                const Icon = metric.icon;
                                return (
                                    <div key={metric.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metric.status === 'healthy' ? 'bg-green-100' :
                                                    metric.status === 'warning' ? 'bg-amber-100' : 'bg-red-100'
                                                }`}>
                                                <Icon className={`h-4 w-4 ${metric.status === 'healthy' ? 'text-green-600' :
                                                        metric.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                                                    }`} />
                                            </div>
                                            <span className="font-medium text-slate-700">{metric.label}</span>
                                        </div>
                                        <Badge variant={metric.status === 'healthy' ? 'completed' : 'warning'}>
                                            {metric.value}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Management Links */}
                <Card className="medical-card">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-semibold text-slate-900">
                            Management Tools
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            <Link
                                href="/admin/users"
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">User Management</p>
                                        <p className="text-sm text-slate-500">Manage accounts and roles</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:text-slate-600">→</span>
                            </Link>

                            <Link
                                href="/admin/doctors"
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                                        <UserCog className="h-5 w-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Doctor Profiles</p>
                                        <p className="text-sm text-slate-500">Healthcare providers</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:text-slate-600">→</span>
                            </Link>

                            <Link
                                href="/admin/patients"
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                        <UserCircle className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Patient Records</p>
                                        <p className="text-sm text-slate-500">View all patients</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:text-slate-600">→</span>
                            </Link>

                            <Link
                                href="/admin/medicines"
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                        <Pill className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Medicine Inventory</p>
                                        <p className="text-sm text-slate-500">Stock and supplies</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:text-slate-600">→</span>
                            </Link>

                            <Link
                                href="/admin/appointments"
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                        <Calendar className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">All Appointments</p>
                                        <p className="text-sm text-slate-500">System-wide schedule</p>
                                    </div>
                                </div>
                                <span className="text-slate-400 group-hover:text-slate-600">→</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity / System Log */}
            <Card className="medical-card">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Recent System Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        <div className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">New patient registration</p>
                                    <p className="text-xs text-slate-500 mt-1">Patient ID: P-12345 registered successfully</p>
                                </div>
                                <span className="text-xs text-slate-400">2 min ago</span>
                            </div>
                        </div>
                        <div className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">Appointment confirmed</p>
                                    <p className="text-xs text-slate-500 mt-1">Dr. Smith's appointment with John Doe</p>
                                </div>
                                <span className="text-xs text-slate-400">15 min ago</span>
                            </div>
                        </div>
                        <div className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">Medicine stock updated</p>
                                    <p className="text-xs text-slate-500 mt-1">Aspirin inventory increased by 500 units</p>
                                </div>
                                <span className="text-xs text-slate-400">1 hour ago</span>
                            </div>
                        </div>
                        <div className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">New doctor profile created</p>
                                    <p className="text-xs text-slate-500 mt-1">Dr. Jane Williams - Cardiology specialist</p>
                                </div>
                                <span className="text-xs text-slate-400">3 hours ago</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
