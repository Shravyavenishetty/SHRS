import React from 'react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
    id: string | number;
    title: string;
    description?: string;
    date: string;
    time?: string;
    type?: 'default' | 'success' | 'warning' | 'error';
    metadata?: {
        doctor?: string;
        location?: string;
        [key: string]: any;
    };
}

interface TimelineProps {
    items: TimelineItem[];
    className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
    const getMarkerClass = (type: TimelineItem['type'] = 'default') => {
        switch (type) {
            case 'success':
                return 'timeline-marker-success';
            case 'warning':
                return 'timeline-marker-warning';
            case 'error':
                return 'bg-red-600';
            default:
                return '';
        }
    };

    return (
        <div className={cn('timeline', className)}>
            {items.map((item, index) => (
                <div key={item.id} className="timeline-item">
                    <div className={cn('timeline-marker', getMarkerClass(item.type))} />
                    <div className="medical-card p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                                {item.description && (
                                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                                )}
                            </div>
                            <div className="text-right ml-4">
                                <p className="text-sm font-medium text-slate-700">{item.date}</p>
                                {item.time && (
                                    <p className="text-xs text-slate-500">{item.time}</p>
                                )}
                            </div>
                        </div>
                        {item.metadata && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                                    {item.metadata.doctor && (
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Doctor:</span>
                                            <span>{item.metadata.doctor}</span>
                                        </div>
                                    )}
                                    {item.metadata.location && (
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Location:</span>
                                            <span>{item.metadata.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
