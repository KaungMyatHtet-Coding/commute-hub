import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { PageProps } from '@/types';

type FlashType = 'success' | 'error' | 'warning';

const ICONS: Record<FlashType, JSX.Element> = {
    success: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    warning: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
    ),
};

const STYLES: Record<FlashType, string> = {
    success: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    error:   'bg-red-50 text-red-800 ring-1 ring-red-200',
    warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
};

const ICON_STYLES: Record<FlashType, string> = {
    success: 'text-emerald-500',
    error:   'text-red-500',
    warning: 'text-amber-500',
};

export default function FlashToast() {
    const { flash } = usePage<PageProps>().props;
    const [visible, setVisible] = useState(false);
    const [msg, setMsg] = useState<{ type: FlashType; text: string } | null>(null);

    useEffect(() => {
        const type: FlashType | null = flash?.success
            ? 'success'
            : flash?.error
            ? 'error'
            : flash?.warning
            ? 'warning'
            : null;

        const text = type ? flash![type] : null;

        if (type && text) {
            setMsg({ type, text });
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4500);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [flash?.success, flash?.error, flash?.warning]);

    if (!visible || !msg) return null;

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl px-4 py-3 shadow-lg ${STYLES[msg.type]}`}
        >
            <span className={`mt-0.5 shrink-0 ${ICON_STYLES[msg.type]}`}>
                {ICONS[msg.type]}
            </span>
            <p className="flex-1 text-sm font-medium leading-relaxed">{msg.text}</p>
            <button
                onClick={() => setVisible(false)}
                className="ms-2 shrink-0 opacity-60 hover:opacity-100"
                aria-label="Dismiss"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
