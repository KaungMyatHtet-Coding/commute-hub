import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CancelModal from '@/Components/CancelModal';
import ReviewModal from '@/Components/ReviewModal';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import type { PageProps } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RideStop {
    id: number;
    stop_name: string;
    stop_order: number;
    estimated_time: string | null;
}

interface RideDriver {
    id: number;
    name: string;
    email: string;
}

interface RideVehicle {
    id: number;
    make: string;
    model: string;
    color: string | null;
    license_plate: string;
    seat_capacity: number;
}

interface Review {
    id: number;
    booking_id: number;
    reviewer_id: number;
    reviewee_id: number;
    rating: number;
    comment?: string | null;
}

interface Ride {
    id: number;
    driver_id: number;
    driver: RideDriver;
    vehicle: RideVehicle;
    departure_time: string;
    available_seats: number;
    total_seats: number;
    price_per_seat: string;
    status: string; // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    notes: string | null;
    cancellation_reason?: string | null;
    stops: RideStop[];
}

interface PassengerBooking {
    id: number;
    status: string;
    seats_booked: number;
    price_per_seat: string;
    created_at: string;
    cancellation_reason?: string | null;
    passenger: {
        id: number;
        name: string;
        email: string;
    };
    pickupStop: {
        id: number;
        stop_name: string;
    } | null;
    dropoffStop: {
        id: number;
        stop_name: string;
    } | null;
    reviews?: Review[];
}

interface BookingFormData {
    pickup_stop_id: string;
    dropoff_stop_id: string;
    seats_booked: string;
}

interface ExistingBooking {
    id: number;
    status: string;
    seats_booked: number;
    price_per_seat: string;
    cancellation_reason?: string | null;
    pickupStop?: { id: number; stop_name: string } | null;
    dropoffStop?: { id: number; stop_name: string } | null;
    reviews?: Review[];
}

interface Props extends PageProps {
    ride: Ride;
    isDriver?: boolean;
    bookings?: PassengerBooking[];
    existingBooking?: ExistingBooking | null;
    driverRating?: number;
    driverReviewCount?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString([], {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatTime(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Stop timeline ───────────────────────────────────────────────────────────

function StopTimeline({ stops }: { stops: RideStop[] }) {
    if (stops.length === 0) {
        return <p className="text-sm italic text-gray-400">No stops listed.</p>;
    }

    return (
        <ol className="relative border-s border-indigo-200 ms-3">
            {stops.map((stop, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === stops.length - 1;
                return (
                    <li key={stop.id} className="mb-6 ms-6">
                        <span
                            className={[
                                'absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white',
                                isFirst
                                    ? 'bg-indigo-600'
                                    : isLast
                                    ? 'bg-green-500'
                                    : 'bg-indigo-200',
                            ].join(' ')}
                        >
                            {isFirst ? (
                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="6" />
                                </svg>
                            ) : isLast ? (
                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zm0 0v8" />
                                </svg>
                            ) : (
                                <svg className="h-2.5 w-2.5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="6" />
                                </svg>
                            )}
                        </span>
                        <div className="flex items-baseline gap-3">
                            <h3 className="text-sm font-semibold text-gray-800">{stop.stop_name}</h3>
                            {stop.estimated_time && (
                                <time className="text-xs text-gray-400">{formatTime(stop.estimated_time)}</time>
                            )}
                            {isFirst && (
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Departure</span>
                            )}
                            {isLast && stops.length > 1 && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Destination</span>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

// ─── Driver Bookings Management ──────────────────────────────────────────────

function DriverBookingsManagement({
    ride,
    bookings,
    currentUserId,
    onOpenReviewModal,
}: {
    ride: Ride;
    bookings: PassengerBooking[];
    currentUserId: number;
    onOpenReviewModal: (bookingId: number, targetName: string) => void;
}) {
    const pendingBookings = bookings.filter((b) => b.status === 'pending');
    const otherBookings = bookings.filter((b) => b.status !== 'pending');
    const acceptedCount = bookings.filter((b) => b.status === 'accepted' || b.status === 'completed').length;

    function handleAccept(id: number) {
        router.patch(route('bookings.accept', id), {}, {
            preserveScroll: true,
        });
    }

    function handleReject(id: number) {
        if (!confirm('Are you sure you want to decline/reject this booking request?')) return;
        router.patch(route('bookings.reject', id), {}, {
            preserveScroll: true,
        });
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Passenger Booking Requests</h3>
                    <p className="text-xs text-gray-500">
                        {bookings.length} total · {pendingBookings.length} pending · {acceptedCount} confirmed
                    </p>
                </div>
                {pendingBookings.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {pendingBookings.length} action needed
                    </span>
                )}
            </div>

            {bookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                    No booking requests received for this ride yet.
                </div>
            ) : (
                <>
                    {/* ── Pending Requests Section (Prominently Featured) ── */}
                    {pendingBookings.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                                    Pending Requests ({pendingBookings.length})
                                </h4>
                            </div>
                            <div className="space-y-3">
                                {pendingBookings.map((booking) => {
                                    const totalCost = (Number(booking.price_per_seat) * booking.seats_booked).toFixed(2);
                                    return (
                                        <div
                                            key={booking.id}
                                            className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 shadow-sm ring-1 ring-amber-200/60"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">
                                                        {booking.passenger.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-gray-900">{booking.passenger.name}</p>
                                                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-300">
                                                                Pending Review
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{booking.passenger.email}</p>
                                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-700 flex-wrap">
                                                            <span className="font-medium text-gray-800">{booking.pickupStop?.stop_name ?? '—'}</span>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="font-medium text-gray-800">{booking.dropoffStop?.stop_name ?? '—'}</span>
                                                            <span className="text-gray-300">·</span>
                                                            <span className="font-semibold text-indigo-700">
                                                                {booking.seats_booked} seat{booking.seats_booked !== 1 ? 's' : ''}
                                                            </span>
                                                            <span className="text-gray-500">(${totalCost})</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 sm:self-center shrink-0">
                                                    <button
                                                        onClick={() => handleAccept(booking.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(booking.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Confirmed & Other Bookings Section ── */}
                    {otherBookings.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                Confirmed & Past Bookings ({otherBookings.length})
                            </h4>
                            <div className="space-y-2">
                                {otherBookings.map((booking) => {
                                    const totalCost = (Number(booking.price_per_seat) * booking.seats_booked).toFixed(2);
                                    const isAccepted = booking.status === 'accepted';
                                    const isCompleted = booking.status === 'completed' || ride.status === 'completed';
                                    const isCancelled = booking.status === 'cancelled' || booking.status === 'cancelled_by_driver';

                                    const driverReview = booking.reviews?.find(
                                        (r) => Number(r.reviewer_id) === Number(currentUserId),
                                    );

                                    return (
                                        <div
                                            key={booking.id}
                                            className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 transition"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                                                        {booking.passenger.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-gray-900 text-sm">{booking.passenger.name}</p>
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                                    booking.status === 'completed'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : booking.status === 'accepted'
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : isCancelled
                                                                        ? 'bg-gray-100 text-gray-600'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {booking.status === 'cancelled_by_driver'
                                                                    ? 'Cancelled by Driver'
                                                                    : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                            </span>
                                                        </div>
                                                        <div className="mt-0.5 text-xs text-gray-500">
                                                            <span>{booking.pickupStop?.stop_name ?? '—'}</span>
                                                            <span className="mx-1 text-gray-400">→</span>
                                                            <span>{booking.dropoffStop?.stop_name ?? '—'}</span>
                                                            <span className="mx-1.5 text-gray-300">·</span>
                                                            <span>{booking.seats_booked} seat{booking.seats_booked !== 1 ? 's' : ''} (${totalCost})</span>
                                                        </div>
                                                        {booking.cancellation_reason && (
                                                            <p className="mt-1 text-xs text-red-600 italic">
                                                                Cancellation Reason: {booking.cancellation_reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 self-start sm:self-center">
                                                    {/* Review options on completed trips */}
                                                    {isCompleted && (
                                                        driverReview ? (
                                                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                                                ★ {driverReview.rating} Reviewed
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => onOpenReviewModal(booking.id, booking.passenger.name)}
                                                                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 transition"
                                                            >
                                                                Review Passenger
                                                            </button>
                                                        )
                                                    )}

                                                    {/* Cancel / Reject button before trip starts */}
                                                    {isAccepted && ride.status !== 'in_progress' && ride.status !== 'completed' && (
                                                        <button
                                                            onClick={() => handleReject(booking.id)}
                                                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                                                        >
                                                            Cancel Seat
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ─── Booking Form ─────────────────────────────────────────────────────────────

function BookingForm({
    ride,
    existingBooking,
}: {
    ride: Ride;
    existingBooking?: ExistingBooking | null;
}) {
    const { auth } = usePage<Props>().props;
    const isDriver = Boolean(auth?.user && Number(ride.driver_id) === Number(auth.user.id));

    const { data, setData, post, processing, errors, reset } = useForm<BookingFormData>({
        pickup_stop_id: '',
        dropoff_stop_id: '',
        seats_booked: '1',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('rides.bookings.store', ride.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    if (isDriver) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                You are the driver of this ride. You cannot book your own ride.
            </div>
        );
    }

    if (existingBooking && ['pending', 'accepted', 'completed'].includes(existingBooking.status)) {
        return (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                <p className="font-semibold">
                    {existingBooking.status === 'completed'
                        ? '✓ Trip Completed'
                        : existingBooking.status === 'accepted'
                        ? '✓ Booking Confirmed'
                        : '⏳ Your booking is currently Pending'}
                </p>
                <p className="mt-1 text-xs text-indigo-700">
                    You have reserved {existingBooking.seats_booked} seat{existingBooking.seats_booked !== 1 ? 's' : ''} on this ride.
                </p>
            </div>
        );
    }

    if (ride.status === 'cancelled') {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                This ride has been cancelled by the driver.
            </div>
        );
    }

    if (ride.status === 'in_progress' || ride.status === 'completed') {
        return (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                This ride is already {ride.status === 'in_progress' ? 'in progress' : 'completed'} and no longer accepting bookings.
            </div>
        );
    }

    if (ride.available_seats === 0) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                This ride is fully booked. No seats available.
            </div>
        );
    }

    const orderedStops = [...ride.stops].sort((a, b) => a.stop_order - b.stop_order);

    const pickupStop = orderedStops.find((s) => String(s.id) === data.pickup_stop_id);
    const dropoffCandidates = pickupStop
        ? orderedStops.filter((s) => s.stop_order > pickupStop.stop_order)
        : orderedStops.slice(1);

    const availableOptions = Array.from(
        { length: ride.available_seats },
        (_, i) => i + 1,
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pickup stop */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Pickup Stop
                </label>
                <select
                    value={data.pickup_stop_id}
                    onChange={(e) => {
                        setData((prev) => ({
                            ...prev,
                            pickup_stop_id: e.target.value,
                            dropoff_stop_id: '',
                        }));
                    }}
                    className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                >
                    <option value="">Select pickup landmark…</option>
                    {orderedStops.slice(0, -1).map((s) => (
                        <option key={s.id} value={String(s.id)}>
                            {s.stop_name}
                            {s.estimated_time ? ` (${formatTime(s.estimated_time)})` : ''}
                        </option>
                    ))}
                </select>
                {errors.pickup_stop_id && (
                    <p className="mt-1 text-xs text-red-600">{errors.pickup_stop_id}</p>
                )}
            </div>

            {/* Dropoff stop */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Drop-off Stop
                </label>
                <select
                    value={data.dropoff_stop_id}
                    onChange={(e) => setData('dropoff_stop_id', e.target.value)}
                    disabled={!data.pickup_stop_id}
                    className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                    required
                >
                    <option value="">Select drop-off landmark…</option>
                    {dropoffCandidates.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                            {s.stop_name}
                            {s.estimated_time ? ` (${formatTime(s.estimated_time)})` : ''}
                        </option>
                    ))}
                </select>
                {errors.dropoff_stop_id && (
                    <p className="mt-1 text-xs text-red-600">{errors.dropoff_stop_id}</p>
                )}
            </div>

            {/* Seats */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Seats Needed
                </label>
                <select
                    value={data.seats_booked}
                    onChange={(e) => setData('seats_booked', e.target.value)}
                    className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    {availableOptions.map((n) => (
                        <option key={n} value={String(n)}>
                            {n} seat{n !== 1 ? 's' : ''}
                        </option>
                    ))}
                </select>
                {errors.seats_booked && (
                    <p className="mt-1 text-xs text-red-600">{errors.seats_booked}</p>
                )}
            </div>

            {/* Price preview */}
            {data.seats_booked && Number(ride.price_per_seat) > 0 && (
                <div className="rounded-lg bg-indigo-50 px-4 py-3 text-sm">
                    <span className="font-medium text-indigo-700">Estimated cost: </span>
                    <span className="font-bold text-indigo-900">
                        ${(Number(data.seats_booked) * Number(ride.price_per_seat)).toFixed(2)}
                    </span>
                    <span className="text-indigo-500">
                        {' '}({data.seats_booked} × ${Number(ride.price_per_seat).toFixed(2)})
                    </span>
                </div>
            )}

            <button
                type="submit"
                disabled={processing || !data.pickup_stop_id || !data.dropoff_stop_id}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {processing ? 'Submitting…' : 'Request Booking'}
            </button>
        </form>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RidesShow({
    ride,
    isDriver: isDriverProp,
    bookings = [],
    existingBooking = null,
    driverRating = 0,
    driverReviewCount = 0,
}: Props) {
    const { auth } = usePage<Props>().props;
    const isOwnerDriver = Boolean(isDriverProp || (auth?.user && Number(auth.user.id) === Number(ride.driver_id)));
    const [showBooking, setShowBooking] = useState(false);

    // Modal state
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelModalMode, setCancelModalMode] = useState<'driver' | 'passenger'>('driver');

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewTargetBookingId, setReviewTargetBookingId] = useState<number | null>(null);
    const [reviewTargetName, setReviewTargetName] = useState<string>('');
    const [reviewTargetRole, setReviewTargetRole] = useState<'Driver' | 'Passenger'>('Driver');

    const hasActiveBooking = Boolean(
        existingBooking && ['pending', 'accepted'].includes(existingBooking.status),
    );
    const isCompletedBooking = Boolean(
        existingBooking && existingBooking.status === 'completed',
    );

    const pendingRequestsCount = bookings.filter((b) => b.status === 'pending').length;

    const seatsPercent = Math.round(
        ((ride.total_seats - ride.available_seats) / ride.total_seats) * 100,
    );

    // Check if current user has already reviewed the other party
    const passengerReviewForDriver = existingBooking?.reviews?.find(
        (r) => Number(r.reviewer_id) === Number(auth.user.id),
    );

    // ── Driver Lifecycle Handlers ──
    function handleStartTrip() {
        if (!confirm('Start this trip now? Cancellations will be locked once in progress.')) return;
        router.patch(route('rides.start', ride.id), {}, { preserveScroll: true });
    }

    function handleCompleteTrip() {
        if (!confirm('Complete this trip? All accepted passenger bookings will be marked completed.')) return;
        router.patch(route('rides.complete', ride.id), {}, { preserveScroll: true });
    }

    // ── Cancellation Handler ──
    function handleConfirmCancellation(reason: string) {
        if (cancelModalMode === 'driver') {
            router.patch(
                route('rides.cancel', ride.id),
                { reason },
                {
                    preserveScroll: true,
                    onSuccess: () => setCancelModalOpen(false),
                },
            );
        } else if (existingBooking) {
            router.patch(
                route('bookings.cancel', existingBooking.id),
                { reason },
                {
                    preserveScroll: true,
                    onSuccess: () => setCancelModalOpen(false),
                },
            );
        }
    }

    // ── Review Handler ──
    function handleSubmitReview(rating: number, comment: string) {
        if (!reviewTargetBookingId) return;
        router.post(
            route('bookings.reviews.store', reviewTargetBookingId),
            { rating, comment },
            {
                preserveScroll: true,
                onSuccess: () => setReviewModalOpen(false),
            },
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('rides.index')}
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        ← Rides
                    </Link>
                    <span className="text-gray-300">/</span>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Ride Details
                    </h2>
                </div>
            }
        >
            <Head title="Ride Details" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ── Driver Lifecycle Action Banner (Owner view) ── */}
                    {isOwnerDriver && (
                        <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                            Trip Management
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                ride.status === 'in_progress'
                                                    ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                                                    : ride.status === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                                                    : ride.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-800 ring-1 ring-red-300'
                                                    : 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300'
                                            }`}
                                        >
                                            {ride.status === 'in_progress' && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                            )}
                                            {ride.status === 'in_progress'
                                                ? 'In Progress'
                                                : ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                        {ride.status === 'scheduled' && 'Ready to hit the road? Start the trip when you begin driving.'}
                                        {ride.status === 'in_progress' && 'Trip is currently in progress! Cancellations are locked.'}
                                        {ride.status === 'completed' && 'Trip completed! You and your passengers can exchange mutual reviews below.'}
                                        {ride.status === 'cancelled' && `Trip was cancelled: ${ride.cancellation_reason ?? 'No reason provided'}`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2.5 flex-wrap">
                                    {ride.status === 'scheduled' && (
                                        <>
                                            <button
                                                onClick={handleStartTrip}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                                </svg>
                                                Start Trip
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCancelModalMode('driver');
                                                    setCancelModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                                            >
                                                Cancel Trip
                                            </button>
                                        </>
                                    )}

                                    {ride.status === 'in_progress' && (
                                        <button
                                            onClick={handleCompleteTrip}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                            Complete Trip
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Cancelled Banner (if ride cancelled) ── */}
                    {ride.status === 'cancelled' && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                            <h3 className="text-sm font-bold text-red-800">Trip Cancelled by Driver</h3>
                            <p className="mt-1 text-xs text-red-700">
                                {ride.cancellation_reason
                                    ? `Reason: ${ride.cancellation_reason}`
                                    : 'This trip has been cancelled.'}
                            </p>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* ── Left column: details ── */}
                        <div className="space-y-6 lg:col-span-2">

                            {/* Driver Bookings Management (if owner) */}
                            {isOwnerDriver && (
                                <DriverBookingsManagement
                                    ride={ride}
                                    bookings={bookings}
                                    currentUserId={auth.user.id}
                                    onOpenReviewModal={(bookingId, targetName) => {
                                        setReviewTargetBookingId(bookingId);
                                        setReviewTargetName(targetName);
                                        setReviewTargetRole('Passenger');
                                        setReviewModalOpen(true);
                                    }}
                                />
                            )}

                            {/* Driver card */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Driver
                                </h3>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                                            {ride.driver.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900">{ride.driver.name}</p>
                                                {driverRating > 0 ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                                        ★ {driverRating.toFixed(1)}
                                                        <span className="text-gray-400 font-normal">({driverReviewCount})</span>
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                                                        New Driver
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{ride.driver.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle card */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Vehicle
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                        <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {ride.vehicle.make} {ride.vehicle.model}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {ride.vehicle.license_plate}
                                            {ride.vehicle.color ? ` · ${ride.vehicle.color}` : ''}
                                            {' · '}{ride.vehicle.seat_capacity} seats total
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Route timeline */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Route Stops
                                </h3>
                                <StopTimeline stops={ride.stops} />
                            </div>

                            {/* Notes */}
                            {ride.notes && (
                                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        Driver Notes
                                    </h3>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">{ride.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* ── Right column: booking sidebar ── */}
                        <div className="space-y-4">

                            {/* Price & seats */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-baseline justify-between">
                                    <span className="text-3xl font-bold text-indigo-600">
                                        {Number(ride.price_per_seat) === 0
                                            ? 'Free'
                                            : `$${Number(ride.price_per_seat).toFixed(2)}`}
                                    </span>
                                    {Number(ride.price_per_seat) > 0 && (
                                        <span className="text-sm text-gray-400">/ seat</span>
                                    )}
                                </div>

                                <p className="mb-1 text-sm text-gray-600">
                                    <span className="font-medium">{ride.available_seats}</span> of{' '}
                                    <span className="font-medium">{ride.total_seats}</span> seats available
                                </p>

                                {/* Seat fill bar */}
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-indigo-500 transition-all"
                                        style={{ width: `${seatsPercent}%` }}
                                    />
                                </div>

                                <p className="mt-3 text-xs text-gray-400">
                                    🕐 {formatDateTime(ride.departure_time)}
                                </p>

                                {isOwnerDriver ? (
                                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                                                ✓
                                            </span>
                                            <span className="text-xs font-bold text-indigo-900">
                                                You are the Driver
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-indigo-700">
                                            {pendingRequestsCount > 0
                                                ? `You have ${pendingRequestsCount} pending booking request${pendingRequestsCount !== 1 ? 's' : ''} to review.`
                                                : 'Manage your passenger requests in the panel on the left.'}
                                        </p>
                                    </div>
                                ) : hasActiveBooking ? (
                                    <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold ${
                                                    existingBooking!.status === 'accepted'
                                                        ? 'bg-emerald-600'
                                                        : 'bg-amber-500'
                                                }`}
                                            >
                                                {existingBooking!.status === 'accepted' ? '✓' : '⏳'}
                                            </span>
                                            <span className="text-xs font-bold text-gray-900">
                                                {existingBooking!.status === 'accepted'
                                                    ? 'Booking Confirmed'
                                                    : 'Your booking is currently Pending'}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                                            {existingBooking!.status === 'accepted'
                                                ? `Your seat reservation (${existingBooking!.seats_booked} seat${existingBooking!.seats_booked !== 1 ? 's' : ''}) is confirmed.`
                                                : `You have submitted a request for ${existingBooking!.seats_booked} seat${existingBooking!.seats_booked !== 1 ? 's' : ''}. Awaiting driver review.`}
                                        </p>
                                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                                            <Link
                                                href={route('bookings.index')}
                                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                                            >
                                                View in My Trips
                                            </Link>
                                            {ride.status === 'in_progress' ? (
                                                <span className="text-[11px] text-gray-500 italic">
                                                    Trip in progress (cancellation locked)
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setCancelModalMode('passenger');
                                                        setCancelModalOpen(true);
                                                    }}
                                                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : isCompletedBooking ? (
                                    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                                                ✓
                                            </span>
                                            <span className="text-xs font-bold text-blue-900">
                                                Trip Completed
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs text-blue-700">
                                            Hope you had a pleasant ride!
                                        </p>
                                        <div className="mt-3">
                                            {passengerReviewForDriver ? (
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                                                    ★ {passengerReviewForDriver.rating} You reviewed this driver
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setReviewTargetBookingId(existingBooking!.id);
                                                        setReviewTargetName(ride.driver.name);
                                                        setReviewTargetRole('Driver');
                                                        setReviewModalOpen(true);
                                                    }}
                                                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 transition"
                                                >
                                                    Leave Driver a Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowBooking((v) => !v)}
                                        className={[
                                            'mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition',
                                            ride.available_seats === 0 || ride.status !== 'scheduled'
                                                ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700',
                                        ].join(' ')}
                                        disabled={ride.available_seats === 0 || ride.status !== 'scheduled'}
                                    >
                                        {ride.status === 'in_progress'
                                            ? 'Trip in Progress'
                                            : ride.status === 'completed'
                                            ? 'Trip Completed'
                                            : ride.status === 'cancelled'
                                            ? 'Trip Cancelled'
                                            : ride.available_seats === 0
                                            ? 'Fully Booked'
                                            : showBooking
                                            ? 'Cancel'
                                            : 'Book this Ride'}
                                    </button>
                                )}
                            </div>

                            {/* Booking form (collapsible, passenger only, hidden if already booked) */}
                            {!isOwnerDriver && !hasActiveBooking && !isCompletedBooking && showBooking && (
                                <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
                                    <h3 className="mb-4 text-sm font-semibold text-gray-700">
                                        Booking Details
                                    </h3>
                                    <BookingForm ride={ride} existingBooking={existingBooking} />
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </div>

            {/* ── Cancellation Modal ── */}
            <CancelModal
                isOpen={cancelModalOpen}
                title={cancelModalMode === 'driver' ? 'Cancel Entire Trip' : 'Cancel Your Booking'}
                description={
                    cancelModalMode === 'driver'
                        ? 'Cancelling this ride will immediately notify all booked passengers and mark their bookings as cancelled.'
                        : 'Cancelling your reservation will restore your booked seats to the ride for other passengers.'
                }
                isReasonRequired={cancelModalMode === 'driver'}
                reasonPlaceholder={
                    cancelModalMode === 'driver'
                        ? 'e.g., Vehicle breakdown, emergency, schedule conflict…'
                        : 'e.g., Plans changed, found another ride…'
                }
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleConfirmCancellation}
            />

            {/* ── Review Modal ── */}
            <ReviewModal
                isOpen={reviewModalOpen}
                targetName={reviewTargetName}
                roleLabel={reviewTargetRole}
                onClose={() => setReviewModalOpen(false)}
                onSubmit={handleSubmitReview}
            />
        </AuthenticatedLayout>
    );
}
