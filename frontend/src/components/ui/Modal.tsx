'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

const Modal = ({ open, onClose, children, className }: ModalProps) => {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    'relative z-10 w-full max-w-lg max-h-[90vh] overflow-auto bg-card rounded-xl shadow-xl animate-slide-up',
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
};

const ModalHeader = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={cn('flex items-center justify-between p-6 border-b', className)}>
        {children}
    </div>
);

const ModalTitle = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <h2 className={cn('text-2xl font-semibold', className)}>{children}</h2>
);

const ModalClose = ({ onClose }: { onClose: () => void }) => (
    <button
        onClick={onClose}
        className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
    </button>
);

const ModalBody = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => <div className={cn('p-6', className)}>{children}</div>;

const ModalFooter = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={cn('flex items-center justify-end gap-3 p-6 border-t', className)}>
        {children}
    </div>
);

export { Modal, ModalHeader, ModalTitle, ModalClose, ModalBody, ModalFooter };
