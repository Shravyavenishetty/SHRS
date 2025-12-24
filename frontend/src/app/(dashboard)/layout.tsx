'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    UserCog,
    UserCircle,
    Calendar,
    FileText,
    Pill,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: SidebarProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    // Navigation items based on role
    const getNavItems = () => {
        if (user?.role?.name === 'admin') {
            return [
                { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/admin/users', label: 'Users', icon: Users },
                { href: '/admin/doctors', label: 'Doctors', icon: UserCog },
                { href: '/admin/patients', label: 'Patients', icon: UserCircle },
                { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
                { href: '/admin/medicines', label: 'Medicines', icon: Pill },
                { href: '/admin/settings', label: 'Settings', icon: Settings },
            ];
        } else if (user?.role?.name === 'doctor') {
            return [
                { href: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
                { href: '/doctor/patients', label: 'Patients', icon: UserCircle },
                { href: '/doctor/medical-records', label: 'Medical Records', icon: FileText },
                { href: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
            ];
        } else {
            return [
                { href: '/patient', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
                { href: '/patient/medical-records', label: 'Medical Records', icon: FileText },
                { href: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
                { href: '/patient/profile', label: 'Profile', icon: Settings },
            ];
        }
    };

    const navItems = getNavItems();

    const getPageTitle = () => {
        const currentItem = navItems.find(item => item.href === pathname);
        return currentItem?.label || 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 transition-transform lg:translate-x-0 shadow-sm',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <span className="font-outfit font-bold text-xl text-slate-900">SHRS</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-600" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate text-slate-900">{user?.username}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role?.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Menu className="h-6 w-6 text-slate-600" />
                        </button>

                        <h1 className="hidden lg:block text-xl font-semibold text-slate-900">
                            {getPageTitle()}
                        </h1>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md ml-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients, appointments..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right side items */}
                    <div className="flex items-center gap-3">
                        {/* Mobile search icon */}
                        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <Search className="h-5 w-5 text-slate-600" />
                        </button>

                        {/* Notification Bell */}
                        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <Bell className="h-5 w-5 text-slate-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User info on desktop */}
                        <div className="hidden lg:flex items-center gap-2 ml-2">
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-700">{user?.username}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role?.name}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
