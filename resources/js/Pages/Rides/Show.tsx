import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CancelModal from '@/Components/CancelModal';
import ConfirmModal from '@/Components/ConfirmModal';
import ReviewModal from '@/Components/ReviewModal';
import { RIDE_RULES } from '@/Constants/yangonTownships';
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
    phone?: string | null;
    gender?: string | null;
    passport_photo_path?: string | null;
    payment_qr_path?: string | null;
    driver_license_number?: string | null;
}

interface RideVehicle {
    id: number;
    make: string;
    model: string;
    color: string | null;
    manufacture_year?: number | null;
    license_plate: string;
    seat_capacity: number;
    vehicle_photo_path?: string | null;
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
    origin_township: string;
    destination_township: string;
    departure_time: string;
    available_seats: number;
    total_seats: number;
    price_per_seat: string;
    status: string; // 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    notes: string | null;
    ride_rules?: string[] | null;
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
        phone?: string | null;
        passport_photo_path?: string | null;
        gender?: string | null;
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
    maskedLicense?: string | null;
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
    onRejectRequest,
}: {
    ride: Ride;
    bookings: PassengerBooking[];
    currentUserId: number;
    onOpenReviewModal: (bookingId: number, targetName: string) => void;
    onRejectRequest: (bookingId: number, passengerName: string) => void;
}) {
    const pendingBookings = bookings.filter((b) => b.status === 'pending');
    const otherBookings = bookings.filter((b) => b.status !== 'pending');
    const acceptedCount = bookings.filter((b) => b.status === 'accepted' || b.status === 'completed').length;

    function handleAccept(id: number) {
        router.patch(route('bookings.accept', id), {}, {
            preserveScroll: true,
        });
    }

    function handleReject(id: number, passengerName: string) {
        onRejectRequest(id, passengerName);
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
                                                        onClick={() => handleReject(booking.id, booking.passenger.name)}
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
                                                            onClick={() => handleReject(booking.id, booking.passenger.name)}
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

    // If there is only 1 stop (edge case), create a virtual destination
    const effectiveStops = orderedStops.length >= 2
        ? orderedStops
        : [
            orderedStops[0] ?? {
                id: 1,
                stop_name: `${ride.origin_township} (Start)`,
                stop_order: 1,
                estimated_time: ride.departure_time,
            },
            {
                id: 999999,
                stop_name: `${ride.destination_township} (End)`,
                stop_order: 2,
                estimated_time: null,
            },
        ];

    // Pickup candidates are all stops except the final destination
    const pickupCandidates = effectiveStops.slice(0, -1);

    const pickupStop = effectiveStops.find((s) => String(s.id) === data.pickup_stop_id);
    const dropoffCandidates = pickupStop
        ? effectiveStops.filter((s) => s.stop_order > pickupStop.stop_order)
        : effectiveStops.slice(1);

    const availableOptions = Array.from(
        { length: ride.available_seats },
        (_, i) => i + 1,
    );

    const handlePickupChange = (pickupId: string) => {
        const selected = effectiveStops.find((s) => String(s.id) === pickupId);
        const nextDropoffs = selected
            ? effectiveStops.filter((s) => s.stop_order > selected.stop_order)
            : [];
        
        // Auto-select the final stop as the default drop-off for quick booking
        const defaultDropoff = nextDropoffs.length > 0 ? String(nextDropoffs[nextDropoffs.length - 1].id) : '';

        setData((prev) => ({
            ...prev,
            pickup_stop_id: pickupId,
            dropoff_stop_id: defaultDropoff,
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pickup stop */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Pickup Stop
                </label>
                <select
                    value={data.pickup_stop_id}
                    onChange={(e) => handlePickupChange(e.target.value)}
                    className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                >
                    <option value="">Select pickup landmark…</option>
                    {pickupCandidates.map((s, idx) => {
                        const isStart = idx === 0;
                        const timeStr = s.estimated_time ? ` - ${formatTime(s.estimated_time)}` : '';
                        const tag = isStart ? ' (Start)' : '';
                        return (
                            <option key={s.id} value={String(s.id)}>
                                {s.stop_order}. {s.stop_name}{tag}{timeStr}
                            </option>
                        );
                    })}
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
                    {dropoffCandidates.map((s, idx) => {
                        const isFinal = idx === dropoffCandidates.length - 1;
                        const timeStr = s.estimated_time ? ` - ${formatTime(s.estimated_time)}` : '';
                        const tag = isFinal ? ' (Final Destination)' : '';
                        return (
                            <option key={s.id} value={String(s.id)}>
                                {s.stop_order}. {s.stop_name}{tag}{timeStr}
                            </option>
                        );
                    })}
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
    maskedLicense = null,
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

    // Rich Inspection Modals & Share State
    const [vehicleLightboxOpen, setVehicleLightboxOpen] = useState(false);
    const [paymentQrModalOpen, setPaymentQrModalOpen] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

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

    // ── Share Trip / Emergency Info Handler ──
    function handleShareTrip() {
        const text = [
            `🚨 CommuteHub Trip & Safety Info:`,
            `Route: ${ride.origin_township} ➔ ${ride.destination_township}`,
            `Departure: ${formatDateTime(ride.departure_time)}`,
            `Driver: ${ride.driver.name} (Phone: ${ride.driver.phone || 'N/A'})`,
            `Vehicle: ${ride.vehicle.make} ${ride.vehicle.model}${ride.vehicle.color ? ` (${ride.vehicle.color})` : ''}`,
            `License Plate: ${ride.vehicle.license_plate}`,
            `Tracking Link: ${window.location.href}`,
        ].join('\n');

        navigator.clipboard.writeText(text);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3500);
    }

    // ── Driver Lifecycle Handlers ──
    function handleStartTrip() {
        setConfirmConfig({
            title: 'Start Trip',
            message: 'Are you ready to start this trip now? Cancellations will be locked once in progress.',
            confirmText: 'Start Trip',
            confirmColor: 'emerald',
            onConfirm: () => {
                router.patch(route('rides.start', ride.id), {}, { preserveScroll: true });
            },
        });
        setConfirmModalOpen(true);
    }

    function handleCompleteTrip() {
        setConfirmConfig({
            title: 'Complete Trip',
            message: 'Are you sure you want to mark this trip as completed? All accepted passenger bookings will be updated to completed.',
            confirmText: 'Complete Trip',
            confirmColor: 'indigo',
            onConfirm: () => {
                router.patch(route('rides.complete', ride.id), {}, { preserveScroll: true });
            },
        });
        setConfirmModalOpen(true);
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
                                    onRejectRequest={(bookingId, passengerName) => {
                                        setConfirmConfig({
                                            title: 'Decline Booking Request',
                                            message: `Are you sure you want to decline ${passengerName}'s booking request?`,
                                            confirmText: 'Decline Request',
                                            confirmColor: 'red',
                                            onConfirm: () => {
                                                router.patch(route('bookings.reject', bookingId), {}, {
                                                    preserveScroll: true,
                                                });
                                            },
                                        });
                                        setConfirmModalOpen(true);
                                    }}
                                />
                            )}

                            {/* Route & Rules Township Banner */}
                            <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 p-5 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                                            <span>Yangon Commute Route</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-lg font-extrabold text-gray-900">{ride.origin_township}</span>
                                            <span className="text-gray-400 font-bold">➔</span>
                                            <span className="text-lg font-extrabold text-indigo-700">{ride.destination_township}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Departure: <span className="font-medium text-gray-800">{formatDateTime(ride.departure_time)}</span>
                                        </p>
                                    </div>

                                    {/* Emergency / Share Trip Button */}
                                    <button
                                        type="button"
                                        onClick={handleShareTrip}
                                        className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition shrink-0"
                                    >
                                        {shareCopied ? (
                                            <>
                                                <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                <span className="text-emerald-700">Copied to Clipboard!</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                                </svg>
                                                <span>Share Trip / Emergency Info</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Ride Rules Badges */}
                                {ride.ride_rules && ride.ride_rules.length > 0 && (
                                    <div className="mt-4 border-t border-indigo-100 pt-3">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                                            Ride Preferences & Rules
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                             {ride.ride_rules.map((ruleKey) => {
                                                const rule = RIDE_RULES.find((r) => r.key === ruleKey);
                                                if (!rule) return null;
                                                const isLadies = rule.key === 'ladies_only';
                                                return (
                                                    <span
                                                        key={rule.key}
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            isLadies
                                                                ? 'bg-pink-100 text-pink-800 ring-1 ring-pink-300'
                                                                : 'bg-white text-gray-700 ring-1 ring-gray-200 shadow-2xs'
                                                        }`}
                                                    >
                                                        <span>{rule.icon}</span>
                                                        <span>{rule.label}</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Driver Card */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Driver Information
                                </h3>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {ride.driver.passport_photo_path ? (
                                            <img
                                                src={`/storage/${ride.driver.passport_photo_path}`}
                                                alt={ride.driver.name}
                                                className="h-14 w-14 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                                            />
                                        ) : (
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                                                {ride.driver.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-gray-900 text-base">{ride.driver.name}</p>
                                                {ride.driver.gender && (
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                        ride.driver.gender === 'female'
                                                            ? 'bg-pink-50 text-pink-700 ring-1 ring-pink-200'
                                                            : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                    }`}>
                                                        {ride.driver.gender}
                                                    </span>
                                                )}
                                                {maskedLicense && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 ring-1 ring-purple-200">
                                                        <span>🛡️ License</span>
                                                        <span>{maskedLicense}</span>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                                {driverRating > 0 ? (
                                                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                                                        ★ {driverRating.toFixed(1)}
                                                        <span className="text-gray-400 font-normal">({driverReviewCount} reviews)</span>
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                                                        New Driver
                                                    </span>
                                                )}
                                                <span>·</span>
                                                <span>{ride.driver.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Click to Call Driver */}
                                    {ride.driver.phone && (
                                        <a
                                            href={`tel:${ride.driver.phone}`}
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition shrink-0"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                            </svg>
                                            <span>Call {ride.driver.phone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Vehicle Card with Photo & Lightbox */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Vehicle Inspection
                                </h3>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        {ride.vehicle.vehicle_photo_path ? (
                                            <div
                                                onClick={() => setVehicleLightboxOpen(true)}
                                                className="group relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition hover:opacity-90"
                                            >
                                                <img
                                                    src={`/storage/${ride.vehicle.vehicle_photo_path}`}
                                                    alt={`${ride.vehicle.make} ${ride.vehicle.model}`}
                                                    className="h-full w-full object-cover transition group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Inspect</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                                <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                </svg>
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900 text-base">
                                                    {ride.vehicle.make} {ride.vehicle.model}
                                                    {ride.vehicle.manufacture_year ? ` (${ride.vehicle.manufacture_year})` : ''}
                                                </p>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                                                <span className="rounded-md bg-gray-900 px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider text-yellow-300 shadow-2xs">
                                                    {ride.vehicle.license_plate}
                                                </span>
                                                {ride.vehicle.color && (
                                                    <span className="text-xs text-gray-500">Color: {ride.vehicle.color}</span>
                                                )}
                                                <span className="text-xs text-gray-400">·</span>
                                                <span className="text-xs text-gray-600 font-medium">{ride.vehicle.seat_capacity} passenger seats</span>
                                            </div>
                                        </div>
                                    </div>

                                    {ride.vehicle.vehicle_photo_path && (
                                        <button
                                            type="button"
                                            onClick={() => setVehicleLightboxOpen(true)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition self-start sm:self-center shrink-0"
                                        >
                                            <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                            <span>View Car Photo</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Digital Payment / KPay QR Section */}
                            {ride.driver.payment_qr_path && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs">
                                                PAY
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">KPay / WavePay QR Code Available</h4>
                                                <p className="text-xs text-gray-600">Scan to pay fare directly without carrying cash.</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentQrModalOpen(true)}
                                            className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition shrink-0"
                                        >
                                            View QR Code
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Route timeline */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Route Stops & Schedule
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

            {/* ── Vehicle Lightbox Inspection Modal ── */}
            {vehicleLightboxOpen && ride.vehicle.vehicle_photo_path && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setVehicleLightboxOpen(false)}
                >
                    <div
                        className="relative max-w-3xl w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {ride.vehicle.make} {ride.vehicle.model}
                                </h3>
                                <p className="text-xs text-gray-500 font-mono">
                                    Plate: {ride.vehicle.license_plate} · Capacity: {ride.vehicle.seat_capacity} seats
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setVehicleLightboxOpen(false)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-gray-900 p-2 flex items-center justify-center max-h-[75vh]">
                            <img
                                src={`/storage/${ride.vehicle.vehicle_photo_path}`}
                                alt={`${ride.vehicle.make} ${ride.vehicle.model}`}
                                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
                            />
                        </div>
                        <div className="px-6 py-3 bg-gray-50 text-right">
                            <button
                                type="button"
                                onClick={() => setVehicleLightboxOpen(false)}
                                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
                            >
                                Close Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Payment QR Code Modal ── */}
            {paymentQrModalOpen && ride.driver.payment_qr_path && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setPaymentQrModalOpen(false)}
                >
                    <div
                        className="relative max-w-md w-full overflow-hidden rounded-2xl bg-white shadow-2xl p-6 text-center space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 text-left">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Driver Payment QR
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {ride.driver.name} · {ride.driver.phone || 'Cashless payment'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPaymentQrModalOpen(false)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 inline-block mx-auto">
                            <img
                                src={`/storage/${ride.driver.payment_qr_path}`}
                                alt="Driver Payment QR"
                                className="max-h-72 w-auto max-w-full object-contain mx-auto rounded-lg shadow-xs"
                            />
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">
                            Open KBZPay or WavePay app, scan this QR code, and transfer the agreed ride fare (${ride.price_per_seat} / seat).
                        </p>

                        <button
                            type="button"
                            onClick={() => setPaymentQrModalOpen(false)}
                            className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

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
