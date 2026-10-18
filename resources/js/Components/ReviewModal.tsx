import { FormEvent, useState } from 'react';

interface Props {
    isOpen: boolean;
    targetName: string;
    roleLabel: string; // e.g. "Driver" or "Passenger"
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
    loading?: boolean;
}

export default function ReviewModal({
    isOpen,
    targetName,
    roleLabel,
    onClose,
    onSubmit,
    loading = false,
}: Props) {
    const [rating, setRating] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');

    if (!isOpen) return null;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (rating < 1 || rating > 5) return;
        onSubmit(rating, comment);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-[#1C1C22] shadow-xl dark:shadow-black/60 ring-1 ring-gray-200 dark:ring-slate-800 transition-colors">
                <div className="border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/40 dark:to-purple-950/40 px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Leave a Review
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Rate your experience with {roleLabel} <span className="font-semibold text-gray-700 dark:text-gray-200">{targetName}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Star Rating Picker */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2">
                            Rating
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const active = (hoverRating || rating) >= star;
                                return (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 text-2xl transition hover:scale-110 focus:outline-none"
                                    >
                                        <span className={active ? 'text-amber-400' : 'text-gray-300 dark:text-slate-700'}>
                                            ★
                                        </span>
                                    </button>
                                );
                            })}
                            <span className="ms-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                {rating} of 5 stars
                            </span>
                        </div>
                    </div>

                    {/* Feedback Comment */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2">
                            Feedback (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share how the trip went, punctuality, communication, etc."
                            className="w-full rounded-xl border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm shadow-sm focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-gray-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 px-5 py-2 text-sm font-semibold text-white shadow-sm dark:shadow-black/40 transition disabled:opacity-60"
                        >
                            {loading ? 'Submitting…' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
