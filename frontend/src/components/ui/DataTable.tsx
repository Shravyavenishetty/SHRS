'use client';

import * as React from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    pageSize?: number;
    className?: string;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    onRowClick,
    pageSize = 10,
    className,
}: DataTableProps<T>) {
    const [sortColumn, setSortColumn] = React.useState<string | null>(null);
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = React.useState(1);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const sortedData = React.useMemo(() => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (aValue === bValue) return 0;
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [data, sortColumn, sortDirection]);

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className={cn('space-y-4', className)}>
            <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                                    >
                                        {column.sortable ? (
                                            <button
                                                onClick={() => handleSort(column.key)}
                                                className="flex items-center gap-2 hover:text-foreground transition-colors"
                                            >
                                                {column.label}
                                                <ArrowUpDown className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            column.label
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-8 text-center text-muted-foreground"
                                    >
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => onRowClick?.(item)}
                                        className={cn(
                                            'hover:bg-muted/50 transition-colors',
                                            onRowClick && 'cursor-pointer'
                                        )}
                                    >
                                        {columns.map((column) => (
                                            <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                                                {column.render
                                                    ? column.render(item)
                                                    : item[column.key]?.toString() || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * pageSize + 1} to{' '}
                        {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}{' '}
                        results
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
