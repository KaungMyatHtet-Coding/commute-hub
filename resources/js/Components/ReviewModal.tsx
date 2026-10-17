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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
                <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-900">
                        Leave a Review
                    </h3>
                    <p className="text-xs text-gray-500">
                        Rate your experience with {roleLabel} <span className="font-semibold text-gray-700">{targetName}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Star Rating Picker */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
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
                                        <span className={active ? 'text-amber-400' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    </button>
                                );
                            })}
                            <span className="ms-2 text-sm font-bold text-gray-700">
                                {rating} of 5 stars
                            </span>
                        </div>
                    </div>

                    {/* Feedback Comment */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                            Feedback (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share how the trip went, punctuality, communication, etc."
                            className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-60"
                        >
                            {loading ? 'Submitting…' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
