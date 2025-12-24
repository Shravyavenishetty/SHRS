'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = React.useCallback(
        (type: ToastType, message: string, duration = 5000) => {
            const id = Math.random().toString(36).substring(7);
            const toast: Toast = { id, type, message, duration };

            setToasts((prev) => [...prev, toast]);

            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }
        },
        [removeToast]
    );

    const success = React.useCallback(
        (message: string, duration?: number) => addToast('success', message, duration),
        [addToast]
    );

    const error = React.useCallback(
        (message: string, duration?: number) => addToast('error', message, duration),
        [addToast]
    );

    const info = React.useCallback(
        (message: string, duration?: number) => addToast('info', message, duration),
        [addToast]
    );

    const warning = React.useCallback(
        (message: string, duration?: number) => addToast('warning', message, duration),
        [addToast]
    );

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, removeToast, success, error, info, warning }}
        >
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

function ToastContainer({
    toasts,
    removeToast,
}: {
    toasts: Toast[];
    removeToast: (id: string) => void;
}) {
    return (
        <div className="fixed bottom-0 right-0 p-6 space-y-4 z-50 max-w-md">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle,
    };

    const styles = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-400',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-400',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-400',
        warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-800 dark:text-amber-400',
    };

    const Icon = icons[toast.type];

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg animate-slide-up',
                styles[toast.type]
            )}
        >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
                onClick={onClose}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
