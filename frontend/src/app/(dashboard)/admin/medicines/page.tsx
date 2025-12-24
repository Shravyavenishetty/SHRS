'use client';

import { useEffect, useState } from 'react';
import { Pill, Plus, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { MedicineForm } from '@/components/forms';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Medicine } from '@/types';

export default function MedicinesPage() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMedicineForm, setShowMedicineForm] = useState(false);
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const data = await apiClient.getMedicines();
            setMedicines(data);
        } catch (err) {
            showError('Failed to fetch medicines');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<Medicine>[] = [
        {
            key: 'name',
            label: 'Medicine Name',
            sortable: true,
        },
        {
            key: 'description',
            label: 'Description',
        },
        {
            key: 'dosage_form',
            label: 'Form',
            render: (medicine) => medicine.dosage_form || 'N/A',
        },
        {
            key: 'manufacturer',
            label: 'Manufacturer',
            render: (medicine) => medicine.manufacturer || 'N/A',
        },
        {
            key: 'stock_quantity',
            label: 'Stock',
            sortable: true,
            render: (medicine) => {
                const quantity = medicine.stock_quantity || 0;
                return (
                    <Badge variant={quantity > 50 ? 'success' : quantity > 10 ? 'warning' : 'destructive'}>
                        {quantity}
                    </Badge>
                );
            },
        },
        {
            key: 'created_at',
            label: 'Added',
            sortable: true,
            render: (medicine) => formatDate(medicine.created_at),
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
    const totalStock = medicines.reduce((sum, m) => sum + (m.stock_quantity || 0), 0);
    const lowStock = medicines.filter((m) => (m.stock_quantity || 0) < 10).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-outfit font-bold">Medicines</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage medicine inventory
                    </p>
                </div>
                <Button onClick={() => setShowMedicineForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
                        <Pill className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{medicines.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            In database
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                        <Package className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStock}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Units available
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <Package className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStock}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Need restock
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Medicines ({medicines.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={medicines}
                        columns={columns}
                        pageSize={10}
                    />
                </CardContent>
            </Card>

            {/* Medicine Form Modal */}
            <MedicineForm
                isOpen={showMedicineForm}
                onClose={() => setShowMedicineForm(false)}
                onSuccess={() => {
                    setShowMedicineForm(false);
                    fetchMedicines();
                    success('Medicine added successfully!');
                }}
            />
        </div>
    );
}
