'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { RoleName } from '@/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: RoleName[];
}

export default function ProtectedRoute({
    children,
    allowedRoles,
}: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (allowedRoles && !allowedRoles.includes(user?.role?.name as RoleName)) {
                // User doesn't have required role, redirect to their dashboard
                const dashboardRoute = user?.role?.name === 'admin'
                    ? '/admin'
                    : user?.role?.name === 'doctor'
                        ? '/doctor'
                        : '/patient';
                router.push(dashboardRoute);
            }
        }
    }, [loading, isAuthenticated, user, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role?.name as RoleName)) {
        return null;
    }

    return <>{children}</>;
}
