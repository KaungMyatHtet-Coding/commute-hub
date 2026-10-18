import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { RIDE_RULES, YANGON_TOWNSHIPS } from '@/Constants/yangonTownships';
import { Head, Link, router } from '@inertiajs/react';
import React, { FormEvent, useState } from 'react';

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
    gender?: string | null;
    phone?: string | null;
    passport_photo_path?: string | null;
    driver_license_number?: string | null;
    average_rating?: number | string | null;
    reviews_received_count?: number;
}

interface RideVehicle {
    id: number;
    make: string;
    model: string;
    color: string | null;
    license_plate: string;
    vehicle_photo_path?: string | null;
}

interface Ride {
    id: number;
    driver: RideDriver;
    vehicle: RideVehicle;
    origin_township: string;
    destination_township: string;
    departure_time: string;
    available_seats: number;
    total_seats: number;
    price_per_seat: string;
    ride_rules?: string[] | null;
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
    origin_township?: string;
    destination_township?: string;
    pickup?: string;
    dropoff?: string;
    date?: string;
    ladies_only?: boolean | string;
}

interface Props {
    rides: PaginatedRides;
    stopNames: string[];
    townships?: string[];
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

function getRuleBadge(key: string) {
    const found = RIDE_RULES.find((r) => r.key === key);
    return found ? found.badge : key;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StopTag({ stop }: { stop: RideStop }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
            📍 {stop.stop_name}
            {stop.estimated_time && (
                <span className="text-slate-400">· {formatTime(stop.estimated_time)}</span>
            )}
        </span>
    );
}

function RideCard({ ride }: { ride: Ride }) {
    const isLadiesOnly = ride.ride_rules?.includes('ladies_only');

    return (
        <Link
            href={route('rides.show', ride.id)}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-xl hover:-translate-y-0.5 ${
                isLadiesOnly
                    ? 'border-pink-200 hover:border-pink-400'
                    : 'border-gray-200/80 hover:border-indigo-400'
            }`}
        >
            {/* Top Route & Status Bar */}
            <div>
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="rounded-xl bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">
                            {ride.origin_township}
                        </span>
                        <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                        <span className="rounded-xl bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">
                            {ride.destination_township}
                        </span>
                    </div>

                    <div className="text-right">
                        <span className="text-base font-black text-indigo-600">
                            {Number(ride.price_per_seat) === 0 ? 'Free' : `Ks ${Number(ride.price_per_seat).toLocaleString()}`}
                        </span>
                        <span className="text-[10px] text-gray-400 block -mt-0.5">per seat</span>
                    </div>
                </div>

                {/* Driver & Vehicle Details */}
                <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {ride.driver.passport_photo_path ? (
                            <img
                                src={`/storage/${ride.driver.passport_photo_path}`}
                                alt={ride.driver.name}
                                className="h-11 w-11 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-sm"
                            />
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white shadow-sm text-sm">
                                {ride.driver.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition">
                                    {ride.driver.name}
                                </h4>
                                {ride.driver.gender && (
                                    <span className="rounded-full bg-gray-100 px-1.5 py-0.2 text-[9px] font-bold text-gray-600 uppercase">
                                        {ride.driver.gender}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                                <span>{ride.vehicle.make} {ride.vehicle.model}</span>
                                <span>·</span>
                                <span className="font-mono text-gray-700">{ride.vehicle.license_plate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Driver Rating */}
                    <div>
                        {ride.driver.average_rating ? (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                                ★ {Number(ride.driver.average_rating).toFixed(1)}
                            </span>
                        ) : (
                            <span className="rounded-xl bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-500 ring-1 ring-gray-100">
                                Verified Driver
                            </span>
                        )}
                    </div>
                </div>

                {/* Ride Rule Badges */}
                {ride.ride_rules && ride.ride_rules.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {ride.ride_rules.map((rule) => {
                            const isLadies = rule === 'ladies_only';
                            return (
                                <span
                                    key={rule}
                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                                        isLadies
                                            ? 'bg-pink-50 text-pink-700 ring-pink-200'
                                            : 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                                    }`}
                                >
                                    {getRuleBadge(rule)}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Intermediate stops snippet */}
                {ride.stops.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {ride.stops.slice(0, 3).map((stop) => (
                            <StopTag key={stop.id} stop={stop} />
                        ))}
                        {ride.stops.length > 3 && (
                            <span className="text-[10px] text-gray-400 self-center">
                                +{ride.stops.length - 3} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer row */}
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
                <span className="flex items-center gap-1.5 font-medium">
                    <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(ride.departure_time)} · {formatTime(ride.departure_time)}
                </span>

                <span className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20H7m10 0a2 2 0 002-2v-1a2 2 0 00-2-2H7a2 2 0 00-2 2v1a2 2 0 002 2m10 0H7M12 3a4 4 0 110 8 4 4 0 010-8z" />
                    </svg>
                    {ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} left
                </span>
            </div>
        </Link>
    );
}

// ─── Main Index Page ─────────────────────────────────────────────────────────

export default function RidesIndex({ rides, stopNames, townships, filters }: Props) {
    const townshipList = townships && townships.length > 0 ? townships : YANGON_TOWNSHIPS;

    const [originTownship, setOriginTownship] = useState(filters.origin_township ?? '');
    const [destinationTownship, setDestinationTownship] = useState(filters.destination_township ?? '');
    const [pickup, setPickup] = useState(filters.pickup ?? '');
    const [date, setDate] = useState(filters.date ?? '');
    const [ladiesOnly, setLadiesOnly] = useState(Boolean(filters.ladies_only));

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            route('rides.index'),
            {
                origin_township: originTownship || undefined,
                destination_township: destinationTownship || undefined,
                pickup: pickup || undefined,
                date: date || undefined,
                ladies_only: ladiesOnly ? '1' : undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    function handleClear() {
        setOriginTownship('');
        setDestinationTownship('');
        setPickup('');
        setDate('');
        setLadiesOnly(false);
        router.get(route('rides.index'), {}, { preserveState: true, replace: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Find a Yangon Ride</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Search daily carpools by Yangon township, route stops, and schedule.
                        </p>
                    </div>

                    <Link
                        href={route('rides.create')}
                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Offer a Ride
                    </Link>
                </div>
            }
        >
            <Head title="Find a Ride" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Filter Card */}
                    <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Origin Township */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        From (Township)
                                    </label>
                                    <select
                                        value={originTownship}
                                        onChange={(e) => setOriginTownship(e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">All Townships</option>
                                        {townshipList.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Destination Township */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        To (Township)
                                    </label>
                                    <select
                                        value={destinationTownship}
                                        onChange={(e) => setDestinationTownship(e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">All Townships</option>
                                        {townshipList.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stop Keyword */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Landmark / Bus Stop
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Hledan, Sule"
                                        value={pickup}
                                        onChange={(e) => setPickup(e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-400"
                                    />
                                </div>

                                {/* Departure Date */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full rounded-2xl border-gray-200 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-gray-100">
                                {/* Ladies only filter */}
                                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={ladiesOnly}
                                        onChange={(e) => setLadiesOnly(e.target.checked)}
                                        className="rounded text-pink-600 focus:ring-pink-500"
                                    />
                                    <span className="flex items-center gap-1 text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full ring-1 ring-pink-200">
                                        🌸 Ladies Only Rides Only
                                    </span>
                                </label>

                                <div className="flex items-center gap-2">
                                    {(originTownship || destinationTownship || pickup || date || ladiesOnly) && (
                                        <button
                                            type="button"
                                            onClick={handleClear}
                                            className="rounded-xl px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                                        >
                                            Reset Filters
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        className="rounded-2xl bg-indigo-600 px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                                    >
                                        Search Rides
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Rides Grid */}
                    {rides.data.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
                            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 text-2xl">
                                🚗
                            </span>
                            <h3 className="mt-3 text-base font-bold text-gray-900">No rides found matching your filters</h3>
                            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                                Try adjusting your origin/destination township, clearing keyword filters, or check back later as drivers post new trips daily.
                            </p>
                            <div className="mt-4">
                                <button
                                    onClick={handleClear}
                                    className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rides.data.map((ride) => (
                                <RideCard key={ride.id} ride={ride} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {rides.links.length > 3 && (
                        <div className="flex justify-center gap-1 pt-4">
                            {rides.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                        link.active
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : link.url
                                            ? 'bg-white text-gray-700 hover:bg-gray-50'
                                            : 'cursor-not-allowed text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
