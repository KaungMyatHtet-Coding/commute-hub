import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'red' | 'emerald' | 'indigo' | 'purple';
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'indigo',
    onConfirm,
    onClose,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const colorClasses = {
        red: 'bg-red-600 hover:bg-red-700 text-white',
        emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        purple: 'bg-purple-600 hover:bg-purple-700 text-white',
    }[confirmColor];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`rounded-xl px-5 py-2 text-xs font-bold shadow-sm transition ${colorClasses}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
