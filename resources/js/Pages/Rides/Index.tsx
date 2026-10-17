import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';

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
    driver: RideDriver;
    vehicle: RideVehicle;
    departure_time: string;
    available_seats: number;
    total_seats: number;
    price_per_seat: string;
    stops: RideStop[];
    notes: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRides {
    data: Ride[];
    links: PaginationLink[];
    total: number;
    from: number | null;
    to: number | null;
}

interface Filters {
    pickup?: string;
    dropoff?: string;
    date?: string;
}

interface Props {
    rides: PaginatedRides;
    stopNames: string[];
    filters: Filters;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StopTag({ stop }: { stop: RideStop }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
            {stop.stop_name}
            {stop.estimated_time && (
                <span className="text-indigo-400">· {formatTime(stop.estimated_time)}</span>
            )}
        </span>
    );
}

function RideCard({ ride }: { ride: Ride }) {
    const firstStop = ride.stops[0] ?? null;
    const lastStop = ride.stops[ride.stops.length - 1] ?? null;

    return (
        <Link
            href={route('rides.show', ride.id)}
            className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
        >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-500">Driver</p>
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600">
                        {ride.driver.name}
                    </p>
                    <p className="text-xs text-gray-400">
                        {ride.vehicle.make} {ride.vehicle.model}
                        {ride.vehicle.color ? ` · ${ride.vehicle.color}` : ''}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">
                        {Number(ride.price_per_seat) === 0
                            ? 'Free'
                            : `$${Number(ride.price_per_seat).toFixed(2)}`}
                    </p>
                    <p className="text-xs text-gray-400">per seat</p>
                </div>
            </div>

            {/* Route timeline */}
            {ride.stops.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {ride.stops.map((stop) => (
                        <StopTag key={stop.id} stop={stop} />
                    ))}
                </div>
            )}

            {/* Footer row */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                    {/* Clock icon */}
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(ride.departure_time)} · {formatTime(ride.departure_time)}
                </span>
                <span className="flex items-center gap-1.5">
                    {/* Seat icon */}
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20H7m10 0a2 2 0 002-2v-1a2 2 0 00-2-2H7a2 2 0 00-2 2v1a2 2 0 002 2m10 0H7M12 3a4 4 0 110 8 4 4 0 010-8z" />
                    </svg>
                    {ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left
                </span>
            </div>
        </Link>
    );
}

// ─── Autocomplete input ───────────────────────────────────────────────────────

function AutocompleteInput({
    id,
    name,
    value,
    onChange,
    placeholder,
    suggestions,
}: {
    id: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    suggestions: string[];
}) {
    const [open, setOpen] = useState(false);
    const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase()),
    ).slice(0, 8);

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type="text"
                value={value}
                autoComplete="off"
                placeholder={placeholder}
                onChange={(e) => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {open && filtered.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filtered.map((s) => (
                        <li
                            key={s}
                            onMouseDown={() => { onChange(s); setOpen(false); }}
                            className="cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RidesIndex({ rides, stopNames, filters }: Props) {
    const [pickup, setPickup] = useState(filters.pickup ?? '');
    const [dropoff, setDropoff] = useState(filters.dropoff ?? '');
    const [date, setDate] = useState(filters.date ?? '');

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            route('rides.index'),
            { pickup: pickup || undefined, dropoff: dropoff || undefined, date: date || undefined },
            { preserveState: true, replace: true },
        );
    }

    function handleClear() {
        setPickup(''); setDropoff(''); setDate('');
        router.get(route('rides.index'), {}, { preserveState: true, replace: true });
    }

    const hasFilters = pickup || dropoff || date;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Find a Ride
                </h2>
            }
        >
            <Head title="Find a Ride" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

                    {/* ── Search bar ── */}
                    <form
                        onSubmit={handleSearch}
                        className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label htmlFor="pickup" className="mb-1 block text-xs font-medium text-gray-600">
                                    From (Pickup stop)
                                </label>
                                <AutocompleteInput
                                    id="pickup"
                                    name="pickup"
                                    value={pickup}
                                    onChange={setPickup}
                                    placeholder="e.g. City Center"
                                    suggestions={stopNames}
                                />
                            </div>
                            <div>
                                <label htmlFor="dropoff" className="mb-1 block text-xs font-medium text-gray-600">
                                    To (Dropoff stop)
                                </label>
                                <AutocompleteInput
                                    id="dropoff"
                                    name="dropoff"
                                    value={dropoff}
                                    onChange={setDropoff}
                                    placeholder="e.g. Airport"
                                    suggestions={stopNames}
                                />
                            </div>
                            <div>
                                <label htmlFor="date" className="mb-1 block text-xs font-medium text-gray-600">
                                    Date
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                                </svg>
                                Search
                            </button>
                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="text-sm text-gray-500 underline hover:text-gray-700"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </form>

                    {/* ── Results summary ── */}
                    <p className="mb-4 text-sm text-gray-500">
                        {rides.total === 0
                            ? 'No rides found.'
                            : `Showing ${rides.from}–${rides.to} of ${rides.total} ride${rides.total !== 1 ? 's' : ''}`}
                    </p>

                    {/* ── Ride grid ── */}
                    {rides.data.length > 0 ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {rides.data.map((ride) => (
                                <RideCard key={ride.id} ride={ride} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-20 text-gray-400">
                            <svg className="mb-4 h-16 w-16 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                            <p className="text-lg font-medium">No rides available</p>
                            <p className="mt-1 text-sm">Try adjusting your search filters.</p>
                        </div>
                    )}

                    {/* ── Pagination ── */}
                    {rides.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-1">
                            {rides.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={[
                                            'rounded-lg px-3 py-2 text-sm',
                                            link.active
                                                ? 'bg-indigo-600 font-semibold text-white'
                                                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                                        ].join(' ')}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400"
                                    />
                                )
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
