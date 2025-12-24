import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    iconColor?: string;
    iconBgColor?: string;
    className?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    iconColor = 'text-blue-600',
    iconBgColor = 'bg-blue-100',
    className,
}: StatCardProps) {
    return (
        <div className={cn('stat-card animate-fade-in', className)}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                    {trend && (
                        <div className="mt-2 flex items-center gap-1">
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                                )}
                            >
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-slate-500">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={cn('rounded-lg p-3', iconBgColor)}>
                    <Icon className={cn('h-6 w-6', iconColor)} />
                </div>
            </div>
        </div>
    );
}
