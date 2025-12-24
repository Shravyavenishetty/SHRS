'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Shield, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { UserForm } from '@/components/forms';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUserForm, setShowUserForm] = useState(false);
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await apiClient.getUsers();
            setUsers(data);
        } catch (err) {
            showError('Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<User>[] = [
        {
            key: 'username',
            label: 'Username',
            sortable: true,
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
        },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (user) => {
                const roleColors: Record<string, 'default' | 'secondary' | 'success'> = {
                    admin: 'secondary',
                    doctor: 'default',
                    patient: 'success',
                };
                return (
                    <Badge variant={roleColors[user.role?.name || 'default'] || 'default'}>
                        {user.role?.name || 'N/A'}
                    </Badge>
                );
            },
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (user) => (
                <Badge variant={user.is_active ? 'success' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (user) => formatDate(user.created_at),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Count users by role
    const roleStats = users.reduce((acc, user) => {
        const role = user.role?.name || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-outfit font-bold">Users</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage system users and permissions
                    </p>
                </div>
                <Button onClick={() => setShowUserForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active accounts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <Shield className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roleStats.admin || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            System administrators
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Doctors</CardTitle>
                        <UserCheck className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roleStats.doctor || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Healthcare providers
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={users}
                        columns={columns}
                        pageSize={10}
                    />
                </CardContent>
            </Card>

            {/* User Form Modal */}
            <UserForm
                isOpen={showUserForm}
                onClose={() => setShowUserForm(false)}
                onSuccess={() => {
                    setShowUserForm(false);
                    fetchUsers();
                    success('User created successfully!');
                }}
            />
        </div>
    );
}
