'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    const variantStyles = {
        danger: {
            icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
            buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
            buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        },
        info: {
            icon: <AlertTriangle className="h-5 w-5 text-blue-600" />,
            buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        },
    };

    const style = variantStyles[variant];

    return (
        <Modal open={isOpen} onClose={onClose}>
            <ModalHeader>
                <ModalTitle className="flex items-center gap-2">
                    {style.icon}
                    {title}
                </ModalTitle>
                <button
                    onClick={onClose}
                    className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    disabled={loading}
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </button>
            </ModalHeader>

            <ModalBody>
                <p className="text-slate-600 dark:text-slate-300">{message}</p>
            </ModalBody>

            <ModalFooter>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                >
                    {cancelText}
                </Button>
                <Button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className={style.buttonClass}
                >
                    {loading ? 'Processing...' : confirmText}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
