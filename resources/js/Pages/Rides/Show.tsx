import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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

interface Ride {
    id: number;
    driver_id: number;
    driver: RideDriver;
    vehicle: RideVehicle;
    departure_time: string;
    available_seats: number;
    total_seats: number;
    price_per_seat: string;
    status: string;
    notes: string | null;
    stops: RideStop[];
}

interface BookingFormData {
    pickup_stop_id: string;
    dropoff_stop_id: string;
    seats_booked: string;
}

interface Props extends PageProps {
    ride: Ride;
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
                                // Origin dot
                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="6" />
                                </svg>
                            ) : isLast ? (
                                // Destination flag
                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zm0 0v8" />
                                </svg>
                            ) : (
                                // Intermediate stop
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

// ─── Booking Form ─────────────────────────────────────────────────────────────

function BookingForm({ ride }: { ride: Ride }) {
    const { auth } = usePage<Props>().props;
    const isDriver = ride.driver_id === auth.user.id;

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

    if (ride.available_seats === 0) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                This ride is fully booked. No seats available.
            </div>
        );
    }

    const orderedStops = [...ride.stops].sort((a, b) => a.stop_order - b.stop_order);

    // Determine valid dropoff options based on selected pickup
    const pickupStop = orderedStops.find((s) => String(s.id) === data.pickup_stop_id);
    const dropoffOptions = pickupStop
        ? orderedStops.filter((s) => s.stop_order > pickupStop.stop_order)
        : orderedStops.slice(1);

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pickup stop */}
            <div>
                <label htmlFor="pickup_stop_id" className="block text-sm font-medium text-gray-700">
                    Pickup Stop <span className="text-red-500">*</span>
                </label>
                <select
                    id="pickup_stop_id"
                    value={data.pickup_stop_id}
                    onChange={(e) => {
                        setData('pickup_stop_id', e.target.value);
                        setData('dropoff_stop_id', ''); // reset dropoff
                    }}
                    className={[
                        'mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1',
                        errors.pickup_stop_id
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                    ].join(' ')}
                >
                    <option value="">— Select pickup stop —</option>
                    {orderedStops.slice(0, -1).map((stop) => (
                        <option key={stop.id} value={stop.id}>
                            {stop.stop_name}
                            {stop.estimated_time ? ` (${formatTime(stop.estimated_time)})` : ''}
                        </option>
                    ))}
                </select>
                {errors.pickup_stop_id && (
                    <p className="mt-1 text-xs text-red-600">{errors.pickup_stop_id}</p>
                )}
            </div>

            {/* Dropoff stop */}
            <div>
                <label htmlFor="dropoff_stop_id" className="block text-sm font-medium text-gray-700">
                    Dropoff Stop <span className="text-red-500">*</span>
                </label>
                <select
                    id="dropoff_stop_id"
                    value={data.dropoff_stop_id}
                    onChange={(e) => setData('dropoff_stop_id', e.target.value)}
                    disabled={!data.pickup_stop_id}
                    className={[
                        'mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400',
                        errors.dropoff_stop_id
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                    ].join(' ')}
                >
                    <option value="">— Select dropoff stop —</option>
                    {dropoffOptions.map((stop) => (
                        <option key={stop.id} value={stop.id}>
                            {stop.stop_name}
                            {stop.estimated_time ? ` (${formatTime(stop.estimated_time)})` : ''}
                        </option>
                    ))}
                </select>
                {errors.dropoff_stop_id && (
                    <p className="mt-1 text-xs text-red-600">{errors.dropoff_stop_id}</p>
                )}
            </div>

            {/* Seats */}
            <div>
                <label htmlFor="seats_booked" className="block text-sm font-medium text-gray-700">
                    Seats Requested <span className="text-red-500">*</span>
                </label>
                <input
                    id="seats_booked"
                    type="number"
                    min={1}
                    max={ride.available_seats}
                    value={data.seats_booked}
                    onChange={(e) => setData('seats_booked', e.target.value)}
                    className={[
                        'mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1',
                        errors.seats_booked
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                    ].join(' ')}
                />
                <p className="mt-1 text-xs text-gray-500">
                    Up to {ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} available
                </p>
                {errors.seats_booked && (
                    <p className="mt-1 text-xs text-red-600">{errors.seats_booked}</p>
                )}
            </div>

            {/* General errors */}
            {(errors as Record<string, string>).ride && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {(errors as Record<string, string>).ride}
                </p>
            )}
            {(errors as Record<string, string>).stops && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {(errors as Record<string, string>).stops}
                </p>
            )}

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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RidesShow({ ride }: Props) {
    const [showBooking, setShowBooking] = useState(false);

    const seatsPercent = Math.round(
        ((ride.total_seats - ride.available_seats) / ride.total_seats) * 100,
    );

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
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* ── Left column: details ── */}
                        <div className="space-y-6 lg:col-span-2">

                            {/* Driver card */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Driver
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                                        {ride.driver.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{ride.driver.name}</p>
                                        <p className="text-sm text-gray-500">{ride.driver.email}</p>
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

                                <button
                                    onClick={() => setShowBooking((v) => !v)}
                                    className={[
                                        'mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition',
                                        ride.available_seats === 0
                                            ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700',
                                    ].join(' ')}
                                    disabled={ride.available_seats === 0}
                                >
                                    {ride.available_seats === 0
                                        ? 'Fully Booked'
                                        : showBooking
                                        ? 'Cancel'
                                        : 'Book this Ride'}
                                </button>
                            </div>

                            {/* Booking form (collapsible) */}
                            {showBooking && (
                                <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
                                    <h3 className="mb-4 text-sm font-semibold text-gray-700">
                                        Booking Details
                                    </h3>
                                    <BookingForm ride={ride} />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
