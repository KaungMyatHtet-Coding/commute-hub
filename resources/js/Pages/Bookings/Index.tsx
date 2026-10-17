import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

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

interface Ride {
    id: number;
    departure_time?: string;
    price_per_seat: string;
    available_seats: number;
    status: string;
    driver?: RideDriver | null;
    vehicle?: RideVehicle | null;
    stops?: RideStop[];
}

interface Booking {
    id: number;
    status: string;
    seats_booked: number;
    price_per_seat: string;
    accepted_at: string | null;
    cancelled_at: string | null;
    ride: Ride;
    pickupStop: RideStop | null;
    dropoffStop: RideStop | null;
}

interface OfferedRide {
    id: number;
    driver_id: number;
    departure_time: string;
    total_seats: number;
    available_seats: number;
    price_per_seat: string;
    status: string;
    notes?: string | null;
    pending_bookings_count?: number;
    accepted_bookings_count?: number;
    vehicle?: RideVehicle | null;
    stops?: RideStop[];
    bookings?: Array<{
        id: number;
        status: string;
        seats_booked: number;
        passenger?: { id: number; name: string; email: string };
    }>;
}

interface Props {
    upcoming: Booking[];
    past: Booking[];
    offeredRides?: OfferedRide[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    accepted:  'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    completed: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
    rejected:  'bg-red-100 text-red-800 ring-1 ring-red-200',
    cancelled: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
    pending:   'Pending',
    accepted:  'Confirmed',
    completed: 'Completed',
    rejected:  'Rejected',
    cancelled: 'Cancelled',
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

function OfferedRideCard({ ride }: { ride: OfferedRide }) {
    const isFree = Number(ride.price_per_seat) === 0;
    const pendingCount = ride.pending_bookings_count ?? 0;
    const bookedSeats = ride.total_seats - ride.available_seats;
    const origin = ride.stops?.[0]?.stop_name ?? 'Origin';
    const destination = ride.stops && ride.stops.length > 1
        ? ride.stops[ride.stops.length - 1].stop_name
        : 'Destination';

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            {/* Status bar */}
            <div className={`h-1.5 w-full ${pendingCount > 0 ? 'bg-amber-400' : 'bg-indigo-600'}`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                                Driving
                            </span>
                            {pendingCount > 0 ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                                    0 Pending Requests
                                </span>
                            )}
                        </div>
                        <p className="mt-2 font-semibold text-gray-900">
                            {ride.vehicle
                                ? `${ride.vehicle.make} ${ride.vehicle.model}`
                                : 'Vehicle N/A'}
                        </p>
                        {ride.vehicle?.license_plate && (
                            <p className="text-xs text-gray-500">
                                Plate: {ride.vehicle.license_plate}
                                {ride.vehicle.color ? ` · ${ride.vehicle.color}` : ''}
                            </p>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-indigo-600">
                            {isFree ? 'Free' : `$${Number(ride.price_per_seat).toFixed(2)}`}
                            <span className="text-xs font-normal text-gray-400"> / seat</span>
                        </p>
                        <p className="text-xs text-gray-400">
                            {ride.available_seats} of {ride.total_seats} seats free
                        </p>
                    </div>
                </div>

                {/* Route */}
                <div className="mt-4 flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        <div className="my-1 h-8 w-px bg-gray-200" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-400">Departure</p>
                            <p className="text-sm font-medium text-gray-800">{origin}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Destination</p>
                            <p className="text-sm font-medium text-gray-800">{destination}</p>
                        </div>
                    </div>
                </div>

                {/* Departure Time */}
                <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-600">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {ride.departure_time ? formatDateTime(ride.departure_time) : '—'}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-xs text-gray-500">
                        {bookedSeats} seat{bookedSeats !== 1 ? 's' : ''} reserved
                    </span>
                    <Link
                        href={route('rides.show', ride.id)}
                        className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                    >
                        Manage Bookings & View Ride
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Booking Card (Passenger view) ────────────────────────────────────────────

function BookingCard({ booking }: { booking: Booking }) {
    const totalFare = (Number(booking.price_per_seat) * booking.seats_booked).toFixed(2);
    const isFree = Number(booking.price_per_seat) === 0;

    function handleCancel() {
        if (!confirm('Cancel this booking?')) return;
        router.patch(route('bookings.cancel', booking.id), {}, {
            preserveScroll: true,
        });
    }

    const pickupName = booking.pickupStop?.stop_name 
        || booking.ride?.stops?.[0]?.stop_name 
        || '—';
    const dropoffName = booking.dropoffStop?.stop_name 
        || (booking.ride?.stops && booking.ride.stops.length > 1 ? booking.ride.stops[booking.ride.stops.length - 1].stop_name : '—');

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            {/* Status bar */}
            <div className={`h-1.5 w-full ${
                booking.status === 'accepted' ? 'bg-emerald-500' :
                booking.status === 'pending'  ? 'bg-amber-400' :
                booking.status === 'rejected' ? 'bg-red-400' :
                'bg-gray-300'
            }`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <StatusBadge status={booking.status} />
                        <p className="mt-2 font-semibold text-gray-900">
                            {booking.ride?.vehicle
                                ? `${booking.ride.vehicle.make} ${booking.ride.vehicle.model}`
                                : 'Vehicle N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                            Driver: {booking.ride?.driver?.name ?? 'Driver'}
                            {booking.ride?.vehicle?.license_plate && (
                                <>
                                    <span className="mx-1.5 text-gray-300">·</span>
                                    {booking.ride.vehicle.license_plate}
                                </>
                            )}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-indigo-600">
                            {isFree ? 'Free' : `$${totalFare}`}
                        </p>
                        <p className="text-xs text-gray-400">
                            {booking.seats_booked} seat{booking.seats_booked !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Route */}
                <div className="mt-4 flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        <div className="my-1 h-8 w-px bg-gray-200" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-400">Pickup</p>
                            <p className="text-sm font-medium text-gray-800">
                                {pickupName}
                                <span className="text-xs text-gray-400">
                                    {formatTime(booking.pickupStop?.estimated_time ?? null)}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Dropoff</p>
                            <p className="text-sm font-medium text-gray-800">
                                {dropoffName}
                                <span className="text-xs text-gray-400">
                                    {formatTime(booking.dropoffStop?.estimated_time ?? null)}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Departure */}
                <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-600">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {booking.ride?.departure_time
                        ? formatDateTime(booking.ride.departure_time)
                        : '—'}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                    {booking.ride?.id && (
                        <Link
                            href={route('rides.show', booking.ride.id)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                            View Ride
                        </Link>
                    )}

                    {['pending', 'accepted'].includes(booking.status) && (
                        <button
                            onClick={handleCancel}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                            Cancel Booking
                        </button>
                    )}
                    {booking.status === 'pending' && (
                        <p className="ms-auto text-xs text-amber-600 italic">
                            Awaiting driver approval…
                        </p>
                    )}
                    {booking.status === 'rejected' && (
                        <p className="ms-auto text-xs text-red-500 italic">
                            Driver declined this request.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BookingsIndex({ upcoming = [], past = [], offeredRides = [] }: Props) {
    const hasOfferedRides = offeredRides.length > 0;
    const [mainView, setMainView] = useState<'offering' | 'riding'>(
        hasOfferedRides ? 'offering' : 'riding',
    );
    const [passengerTab, setPassengerTab] = useState<'upcoming' | 'past'>('upcoming');

    const totalPassengerCount = upcoming.length + past.length;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">My Trips</h2>
            }
        >
            <Head title="My Trips" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

                    {/* ── Main Dual Tab Switcher ── */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                        <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                            <button
                                onClick={() => setMainView('offering')}
                                className={[
                                    'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition',
                                    mainView === 'offering'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800',
                                ].join(' ')}
                            >
                                <span>Rides I'm Offering</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        mainView === 'offering'
                                            ? 'bg-indigo-700 text-white'
                                            : 'bg-gray-100 text-gray-700'
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
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800',
                                ].join(' ')}
                            >
                                <span>Rides I'm Riding</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        mainView === 'riding'
                                            ? 'bg-indigo-700 text-white'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {totalPassengerCount}
                                </span>
                            </button>
                        </div>

                        {mainView === 'offering' && (
                            <Link
                                href={route('rides.create')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
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
                                    <OfferedRideCard key={ride.id} ride={ride} />
                                ))}
                            </div>
                        )
                    )}

                    {/* ── View 2: Rides I'm Riding ── */}
                    {mainView === 'riding' && (
                        <div>
                            {/* Sub-tabs: Upcoming / Past */}
                            <div className="mb-5 flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
                                {(['upcoming', 'past'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setPassengerTab(t)}
                                        className={[
                                            'rounded-lg px-4 py-1.5 text-xs font-semibold transition',
                                            passengerTab === t
                                                ? 'bg-gray-900 text-white shadow-sm'
                                                : 'text-gray-600 hover:text-gray-800',
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
                                        {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
                                    </div>
                                )
                            )}

                            {passengerTab === 'past' && (
                                past.length === 0 ? (
                                    <EmptyState message="No past trips" sub="Completed trips will appear here." />
                                ) : (
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {past.map((b) => <BookingCard key={b.id} booking={b} />)}
                                    </div>
                                )
                            )}
                        </div>
                    )}

                </div>
            </div>
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
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
            <svg className="mb-4 h-14 w-14 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="font-medium text-gray-400">{message}</p>
            <p className="mt-1 text-sm text-gray-300">{sub}</p>
            {action && (
                <Link
                    href={action.href}
                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    {action.label}
                </Link>
            )}
        </div>
    );
}
