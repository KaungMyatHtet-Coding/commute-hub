import { FormEvent, useState } from 'react';

interface Props {
    isOpen: boolean;
    title: string;
    description: string;
    isReasonRequired?: boolean;
    reasonPlaceholder?: string;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    loading?: boolean;
}

export default function CancelModal({
    isOpen,
    title,
    description,
    isReasonRequired = false,
    reasonPlaceholder = 'Please explain why you need to cancel…',
    onClose,
    onConfirm,
    loading = false,
}: Props) {
    const [reason, setReason] = useState<string>('');
    const [error, setError] = useState<string>('');

    if (!isOpen) return null;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (isReasonRequired && !reason.trim()) {
            setError('Please provide a reason for cancellation.');
            return;
        }
        setError('');
        onConfirm(reason.trim());
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
                <div className="border-b border-gray-100 bg-red-50/70 px-6 py-4">
                    <h3 className="text-lg font-bold text-red-900">
                        {title}
                    </h3>
                    <p className="mt-1 text-xs text-red-700">
                        {description}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                            Reason for Cancellation {isReasonRequired ? '(Required)' : '(Optional)'}
                        </label>
                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder={reasonPlaceholder}
                            className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                        />
                        {error && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-60"
                        >
                            {loading ? 'Processing…' : 'Confirm Cancellation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
