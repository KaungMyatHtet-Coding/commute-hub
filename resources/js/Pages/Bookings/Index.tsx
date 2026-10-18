import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CancelModal from '@/Components/CancelModal';
import ConfirmModal from '@/Components/ConfirmModal';
import ReviewModal from '@/Components/ReviewModal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RideStop {
    id: number;
    stop_name: string;
    estimated_time: string | null;
}

interface RideDriver {
    id: number;
    name: string;
}

interface RideVehicle {
    id: number;
    make: string;
    model: string;
    color: string | null;
    license_plate: string;
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
    departure_time?: string;
    price_per_seat: string;
    available_seats: number;
    status: string; // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    cancellation_reason?: string | null;
    driver?: RideDriver | null;
    vehicle?: RideVehicle | null;
    stops?: RideStop[];
}

interface Booking {
    id: number;
    status: string; // 'pending' | 'accepted' | 'completed' | 'cancelled' | 'cancelled_by_driver' | 'rejected'
    seats_booked: number;
    price_per_seat: string;
    accepted_at: string | null;
    cancelled_at: string | null;
    cancellation_reason?: string | null;
    ride: Ride;
    pickupStop: RideStop | null;
    dropoffStop: RideStop | null;
    reviews?: Review[];
}

interface OfferedRide {
    id: number;
    driver_id: number;
    departure_time: string;
    total_seats: number;
    available_seats: number;
    price_per_seat: string;
    status: string; // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    notes?: string | null;
    cancellation_reason?: string | null;
    pending_bookings_count?: number;
    accepted_bookings_count?: number;
    vehicle?: RideVehicle | null;
    stops?: RideStop[];
    bookings?: Array<{
        id: number;
        status: string;
        seats_booked: number;
        passenger?: { id: number; name: string; email: string };
        reviews?: Review[];
    }>;
}

interface Props extends PageProps {
    upcoming: Booking[];
    past: Booking[];
    offeredRides?: OfferedRide[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    pending:             'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-700/50',
    accepted:            'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700/50',
    in_progress:         'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700/50',
    completed:           'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-700/50',
    rejected:            'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-700/50',
    cancelled:           'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-slate-700',
    cancelled_by_driver: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-700/50',
};

const STATUS_LABELS: Record<string, string> = {
    pending:             'Pending',
    accepted:            'Confirmed',
    in_progress:         'In Progress',
    completed:           'Completed',
    rejected:            'Rejected',
    cancelled:           'Cancelled',
    cancelled_by_driver: 'Cancelled by Driver',
};

function StatusBadge({ status }: { status: string }) {
    const cls = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
    const label = STATUS_LABELS[status] ?? status;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
            {label}
        </span>
    );
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString([], {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function formatTime(iso: string | null): string {
    if (!iso) return '';
    return ' (' + new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')';
}

// ─── Offered Ride Card (Driver view) ──────────────────────────────────────────

function OfferedRideCard({
    ride,
    onStartRide,
    onCompleteRide,
    onCancelRide,
}: {
    ride: OfferedRide;
    onStartRide: (ride: OfferedRide) => void;
    onCompleteRide: (ride: OfferedRide) => void;
    onCancelRide: (ride: OfferedRide) => void;
}) {
    const isFree = Number(ride.price_per_seat) === 0;
    const pendingCount = ride.pending_bookings_count ?? 0;
    const bookedSeats = ride.total_seats - ride.available_seats;
    const origin = ride.stops?.[0]?.stop_name ?? 'Origin';
    const destination = ride.stops && ride.stops.length > 1
        ? ride.stops[ride.stops.length - 1].stop_name
        : 'Destination';

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1C1C22] shadow-sm dark:shadow-black/40 transition hover:shadow-md dark:hover:shadow-black/60">
            {/* Status bar */}
            <div className={`h-1.5 w-full ${
                ride.status === 'in_progress' ? 'bg-blue-500' :
                ride.status === 'completed'   ? 'bg-emerald-500' :
                ride.status === 'cancelled'   ? 'bg-red-400' :
                pendingCount > 0              ? 'bg-amber-400' :
                'bg-indigo-600'
            }`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-700/50">
                                Driving
                            </span>
                            <StatusBadge status={ride.status} />
                            {pendingCount > 0 && ride.status === 'scheduled' && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-700/50">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                            {ride.vehicle
                                ? `${ride.vehicle.make} ${ride.vehicle.model}`
                                : 'Vehicle N/A'}
                        </p>
                        {ride.vehicle?.license_plate && (
                            <p className="text-xs text-gray-500 dark:text-[#A1A1AA]">
                                Plate: {ride.vehicle.license_plate}
                                {ride.vehicle.color ? ` · ${ride.vehicle.color}` : ''}
                            </p>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {isFree ? 'Free' : `$${Number(ride.price_per_seat).toFixed(2)}`}
                            <span className="text-xs font-normal text-gray-400 dark:text-gray-500"> / seat</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {ride.available_seats} of {ride.total_seats} seats free
                        </p>
                    </div>
                </div>

                {/* Route */}
                <div className="mt-4 flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                        <div className="my-1 h-8 w-px bg-gray-200 dark:bg-slate-700" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 dark:bg-green-400" />
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Departure</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{origin}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Destination</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{destination}</p>
                        </div>
                    </div>
                </div>

                {/* Departure Time */}
                <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {ride.departure_time ? formatDateTime(ride.departure_time) : '—'}
                </div>

                {/* Cancellation Reason if cancelled */}
                {ride.cancellation_reason && (
                    <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-2.5 text-xs text-red-700 dark:text-red-400 border border-transparent dark:border-red-800/40">
                        <span className="font-semibold">Cancelled: </span>
                        {ride.cancellation_reason}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-slate-800 pt-4">
                    <div className="flex items-center gap-2">
                        {ride.status === 'scheduled' && (
                            <>
                                <button
                                    onClick={() => onStartRide(ride)}
                                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
                                >
                                    Start Trip
                                </button>
                                <button
                                    onClick={() => onCancelRide(ride)}
                                    className="rounded-lg border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                        {ride.status === 'in_progress' && (
                            <button
                                onClick={() => onCompleteRide(ride)}
                                className="rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
                            >
                                Complete Trip
                            </button>
                        )}
                    </div>

                    <Link
                        href={route('rides.show', ride.id)}
                        className="rounded-lg border border-gray-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition ms-auto"
                    >
                        Manage & View Ride
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Booking Card (Passenger view) ────────────────────────────────────────────

function BookingCard({
    booking,
    currentUserId,
    onCancelBooking,
    onReviewBooking,
}: {
    booking: Booking;
    currentUserId: number;
    onCancelBooking: (booking: Booking) => void;
    onReviewBooking: (booking: Booking) => void;
}) {
    const totalFare = (Number(booking.price_per_seat) * booking.seats_booked).toFixed(2);
    const isFree = Number(booking.price_per_seat) === 0;

    const isCompleted = booking.status === 'completed' || booking.ride?.status === 'completed';
    const isCancelled = booking.status === 'cancelled' || booking.status === 'cancelled_by_driver';

    const myReview = booking.reviews?.find(
        (r) => Number(r.reviewer_id) === Number(currentUserId),
    );

    const pickupName = booking.pickupStop?.stop_name 
        || booking.ride?.stops?.[0]?.stop_name 
        || '—';
    const dropoffName = booking.dropoffStop?.stop_name 
        || (booking.ride?.stops && booking.ride.stops.length > 1 ? booking.ride.stops[booking.ride.stops.length - 1].stop_name : '—');

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1C1C22] shadow-sm dark:shadow-black/40 transition hover:shadow-md dark:hover:shadow-black/60">
            {/* Status bar */}
            <div className={`h-1.5 w-full ${
                isCompleted                   ? 'bg-blue-500' :
                booking.status === 'accepted' ? 'bg-emerald-500' :
                booking.status === 'pending'  ? 'bg-amber-400' :
                isCancelled                   ? 'bg-gray-400' :
                'bg-red-400'
            }`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <StatusBadge status={booking.status} />
                        <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                            {booking.ride?.vehicle
                                ? `${booking.ride.vehicle.make} ${booking.ride.vehicle.model}`
                                : 'Vehicle N/A'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-[#A1A1AA]">
                            Driver: {booking.ride?.driver?.name ?? 'Driver'}
                            {booking.ride?.vehicle?.license_plate && (
                                <>
                                    <span className="mx-1.5 text-gray-300 dark:text-slate-700">·</span>
                                    {booking.ride.vehicle.license_plate}
                                </>
                            )}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {isFree ? 'Free' : `$${totalFare}`}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {booking.seats_booked} seat{booking.seats_booked !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Route */}
                <div className="mt-4 flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                        <div className="my-1 h-8 w-px bg-gray-200 dark:bg-slate-700" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 dark:bg-green-400" />
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Pickup</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {pickupName}
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {formatTime(booking.pickupStop?.estimated_time ?? null)}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Dropoff</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {dropoffName}
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {formatTime(booking.dropoffStop?.estimated_time ?? null)}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Departure */}
                <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {booking.ride?.departure_time
                        ? formatDateTime(booking.ride.departure_time)
                        : '—'}
                </div>

                {/* Reason note if cancelled */}
                {booking.cancellation_reason && (
                    <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-2.5 text-xs text-red-700 dark:text-red-400 border border-transparent dark:border-red-800/40">
                        <span className="font-semibold">Reason: </span>
                        {booking.cancellation_reason}
                    </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-slate-800 pt-4">
                    <div className="flex items-center gap-2">
                        {booking.ride?.id && (
                            <Link
                                href={route('rides.show', booking.ride.id)}
                                className="rounded-lg border border-gray-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                            >
                                View Ride
                            </Link>
                        )}

                        {/* Review option on completed trips */}
                        {isCompleted && (
                            myReview ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-700/50">
                                    ★ {myReview.rating} Reviewed
                                </span>
                            ) : (
                                <button
                                    onClick={() => onReviewBooking(booking)}
                                    className="rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
                                >
                                    Leave a Review
                                </button>
                            )
                        )}

                        {/* Cancel button before trip is in progress/completed */}
                        {['pending', 'accepted'].includes(booking.status) && booking.ride?.status !== 'in_progress' && booking.ride?.status !== 'completed' && (
                            <button
                                onClick={() => onCancelBooking(booking)}
                                className="rounded-lg border border-red-200 dark:border-red-900/60 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                                Cancel Booking
                            </button>
                        )}
                    </div>

                    {booking.status === 'pending' && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                            Awaiting driver approval…
                        </p>
                    )}
                    {booking.status === 'rejected' && (
                        <p className="text-xs text-red-500 dark:text-red-400 italic">
                            Driver declined this request.
                        </p>
                    )}
                    {booking.status === 'cancelled_by_driver' && (
                        <p className="text-xs text-red-500 dark:text-red-400 italic">
                            Driver cancelled this trip.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BookingsIndex({ upcoming = [], past = [], offeredRides = [] }: Props) {
    const { auth } = usePage<Props>().props;
    const hasOfferedRides = offeredRides.length > 0;
    const [mainView, setMainView] = useState<'offering' | 'riding'>(
        hasOfferedRides ? 'offering' : 'riding',
    );
    const [passengerTab, setPassengerTab] = useState<'upcoming' | 'past'>('upcoming');

    // Modal state
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelTargetType, setCancelTargetType] = useState<'booking' | 'ride'>('booking');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [selectedRide, setSelectedRide] = useState<OfferedRide | null>(null);

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewTargetBooking, setReviewTargetBooking] = useState<Booking | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        message: string;
        confirmText: string;
        confirmColor: 'red' | 'emerald' | 'indigo' | 'purple';
        onConfirm: () => void;
    }>({
        title: '',
        message: '',
        confirmText: 'Confirm',
        confirmColor: 'indigo',
        onConfirm: () => {},
    });

    const totalPassengerCount = upcoming.length + past.length;

    // ── Driver Trip Lifecycle Actions ──
    function handleStartRide(ride: OfferedRide) {
        setConfirmConfig({
            title: 'Start Trip',
            message: 'Start this trip now? Cancellations will be locked once in progress.',
            confirmText: 'Start Trip',
            confirmColor: 'emerald',
            onConfirm: () => {
                router.patch(route('rides.start', ride.id), {}, { preserveScroll: true });
            },
        });
        setConfirmModalOpen(true);
    }

    function handleCompleteRide(ride: OfferedRide) {
        setConfirmConfig({
            title: 'Complete Trip',
            message: 'Complete this trip? All accepted passenger bookings will be marked completed.',
            confirmText: 'Complete Trip',
            confirmColor: 'indigo',
            onConfirm: () => {
                router.patch(route('rides.complete', ride.id), {}, { preserveScroll: true });
            },
        });
        setConfirmModalOpen(true);
    }

    function handleOpenCancelRide(ride: OfferedRide) {
        setSelectedRide(ride);
        setCancelTargetType('ride');
        setCancelModalOpen(true);
    }

    function handleOpenCancelBooking(booking: Booking) {
        setSelectedBooking(booking);
        setCancelTargetType('booking');
        setCancelModalOpen(true);
    }

    function handleConfirmCancellation(reason: string) {
        if (cancelTargetType === 'ride' && selectedRide) {
            router.patch(
                route('rides.cancel', selectedRide.id),
                { reason },
                {
                    preserveScroll: true,
                    onSuccess: () => setCancelModalOpen(false),
                },
            );
        } else if (cancelTargetType === 'booking' && selectedBooking) {
            router.patch(
                route('bookings.cancel', selectedBooking.id),
                { reason },
                {
                    preserveScroll: true,
                    onSuccess: () => setCancelModalOpen(false),
                },
            );
        }
    }

    function handleOpenReview(booking: Booking) {
        setReviewTargetBooking(booking);
        setReviewModalOpen(true);
    }

    function handleSubmitReview(rating: number, comment: string) {
        if (!reviewTargetBooking) return;
        router.post(
            route('bookings.reviews.store', reviewTargetBooking.id),
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
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">My Trips</h2>
            }
        >
            <Head title="My Trips" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

                    {/* ── Main Dual Tab Switcher ── */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
                        <div className="flex rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1C1C22] p-1 shadow-sm dark:shadow-black/40">
                            <button
                                onClick={() => setMainView('offering')}
                                className={[
                                    'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition',
                                    mainView === 'offering'
                                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
                                ].join(' ')}
                            >
                                <span>Rides I'm Offering</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        mainView === 'offering'
                                            ? 'bg-indigo-700 dark:bg-indigo-600 text-white'
                                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {offeredRides.length}
                                </span>
                            </button>

                            <button
                                onClick={() => setMainView('riding')}
                                className={[
                                    'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition',
                                    mainView === 'riding'
                                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
                                ].join(' ')}
                            >
                                <span>Rides I'm Riding</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        mainView === 'riding'
                                            ? 'bg-indigo-700 dark:bg-indigo-600 text-white'
                                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {totalPassengerCount}
                                </span>
                            </button>
                        </div>

                        {mainView === 'offering' && (
                            <Link
                                href={route('rides.create')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-400 transition"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Offer a Ride
                            </Link>
                        )}
                    </div>

                    {/* ── View 1: Rides I'm Offering ── */}
                    {mainView === 'offering' && (
                        offeredRides.length === 0 ? (
                            <EmptyState
                                message="No rides offered yet"
                                sub="Create a trip, choose your route, and start carpooling with other commuters!"
                                action={{ label: 'Offer a Ride', href: route('rides.create') }}
                            />
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2">
                                {offeredRides.map((ride) => (
                                    <OfferedRideCard
                                        key={ride.id}
                                        ride={ride}
                                        onStartRide={handleStartRide}
                                        onCompleteRide={handleCompleteRide}
                                        onCancelRide={handleOpenCancelRide}
                                    />
                                ))}
                            </div>
                        )
                    )}

                    {/* ── View 2: Rides I'm Riding ── */}
                    {mainView === 'riding' && (
                        <div>
                            {/* Sub-tabs: Upcoming / Past */}
                            <div className="mb-5 flex rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1C1C22] p-1 shadow-sm dark:shadow-black/40 w-fit">
                                {(['upcoming', 'past'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setPassengerTab(t)}
                                        className={[
                                            'rounded-lg px-4 py-1.5 text-xs font-semibold transition',
                                            passengerTab === t
                                                ? 'bg-gray-900 dark:bg-indigo-600 text-white shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
                                        ].join(' ')}
                                    >
                                        {t === 'upcoming'
                                            ? `Upcoming (${upcoming.length})`
                                            : `Past (${past.length})`}
                                    </button>
                                ))}
                            </div>

                            {passengerTab === 'upcoming' && (
                                upcoming.length === 0 ? (
                                    <EmptyState
                                        message="No upcoming trips"
                                        sub="Book a ride to get started!"
                                        action={{ label: 'Find a Ride', href: route('rides.index') }}
                                    />
                                ) : (
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {upcoming.map((b) => (
                                            <BookingCard
                                                key={b.id}
                                                booking={b}
                                                currentUserId={auth.user.id}
                                                onCancelBooking={handleOpenCancelBooking}
                                                onReviewBooking={handleOpenReview}
                                            />
                                        ))}
                                    </div>
                                )
                            )}

                            {passengerTab === 'past' && (
                                past.length === 0 ? (
                                    <EmptyState message="No past trips" sub="Completed trips will appear here." />
                                ) : (
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {past.map((b) => (
                                            <BookingCard
                                                key={b.id}
                                                booking={b}
                                                currentUserId={auth.user.id}
                                                onCancelBooking={handleOpenCancelBooking}
                                                onReviewBooking={handleOpenReview}
                                            />
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* ── Cancellation Modal ── */}
            <CancelModal
                isOpen={cancelModalOpen}
                title={cancelTargetType === 'ride' ? 'Cancel Entire Trip' : 'Cancel Booking'}
                description={
                    cancelTargetType === 'ride'
                        ? 'Cancelling this ride will immediately notify all booked passengers and restore availability.'
                        : 'Are you sure you want to cancel your seat reservation?'
                }
                isReasonRequired={cancelTargetType === 'ride'}
                reasonPlaceholder={
                    cancelTargetType === 'ride'
                        ? 'e.g., Vehicle issue, emergency, schedule conflict…'
                        : 'e.g., Plans changed, found another ride…'
                }
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleConfirmCancellation}
            />

            {/* ── Review Modal ── */}
            <ReviewModal
                isOpen={reviewModalOpen}
                targetName={reviewTargetBooking?.ride?.driver?.name ?? 'Driver'}
                roleLabel="Driver"
                onClose={() => setReviewModalOpen(false)}
                onSubmit={handleSubmitReview}
            />

            {/* ── Confirm Modal ── */}
            <ConfirmModal
                isOpen={confirmModalOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                confirmColor={confirmConfig.confirmColor}
                onConfirm={confirmConfig.onConfirm}
                onClose={() => setConfirmModalOpen(false)}
            />
        </AuthenticatedLayout>
    );
}

function EmptyState({
    message,
    sub,
    action,
}: {
    message: string;
    sub: string;
    action?: { label: string; href: string };
}) {
    return (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 bg-white dark:bg-[#1C1C22] py-16 text-center transition-colors">
            <svg className="mb-4 h-14 w-14 text-gray-200 dark:text-slate-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="font-medium text-gray-400 dark:text-[#A1A1AA]">{message}</p>
            <p className="mt-1 text-sm text-gray-300 dark:text-gray-600">{sub}</p>
            {action && (
                <Link
                    href={action.href}
                    className="mt-5 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}
