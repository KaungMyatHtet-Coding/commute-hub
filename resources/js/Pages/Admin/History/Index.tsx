import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface StopItem {
    id: number;
    stop_name: string;
    stop_order: number;
    estimated_time?: string | null;
}

interface BookingPassenger {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
}

interface BookingItem {
    id: number;
    status: string;
    seats_booked: number;
    price_per_seat: string | number;
    total_fare: number;
    cancellation_reason?: string | null;
    created_at: string;
    passenger: BookingPassenger;
    pickup_stop?: string | null;
    dropoff_stop?: string | null;
}

interface RideItem {
    id: number;
    origin_township: string;
    destination_township: string;
    departure_time: string;
    status: string;
    total_seats: number;
    available_seats: number;
    booked_seats: number;
    price_per_seat: string | number;
    ride_rules?: string[] | null;
    cancellation_reason?: string | null;
    driver: {
        id?: number;
        name: string;
        email: string;
        phone?: string | null;
        gender?: string | null;
        passport_photo_path?: string | null;
    };
    vehicle?: {
        id: number;
        make: string;
        model: string;
        color?: string | null;
        license_plate: string;
    } | null;
    stops: StopItem[];
    bookings: BookingItem[];
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    rides: PaginatedData<RideItem>;
    summary: {
        total_filtered_rides: number;
        total_seats_taken: number;
        total_revenue_est: number;
        exported_at: string;
    };
    filters: {
        status: string;
        date?: string | null;
        month?: string | null;
        year?: string | null;
        township?: string | null;
    };
    townships: string[];
}

export default function Index({ rides, summary, filters, townships }: Props) {
    const [selectedRide, setSelectedRide] = useState<RideItem | null>(null);

    const [formFilters, setFormFilters] = useState({
        status: filters.status || 'all',
        date: filters.date || '',
        month: filters.month || '',
        year: filters.year || '',
        township: filters.township || '',
    });

    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.history.index'),
            {
                status: formFilters.status !== 'all' ? formFilters.status : undefined,
                date: formFilters.date || undefined,
                month: formFilters.month || undefined,
                year: formFilters.year || undefined,
                township: formFilters.township || undefined,
            },
            { preserveState: true }
        );
    };

    const handleResetFilters = () => {
        setFormFilters({
            status: 'all',
            date: '',
            month: '',
            year: '',
            township: '',
        });
        router.get(route('admin.history.index'));
    };

    const handlePrintPDF = () => {
        window.print();
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' MMK';
    };

    return (
        <AuthenticatedLayout header="Comprehensive Ride History & Audit Log">
            <Head title="Ride History & Audit Reports - Admin" />

            {/* Print-specific stylesheet */}
            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    nav, header, .no-print, button, form {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .shadow-sm, .shadow-xl, .shadow-2xl {
                        box-shadow: none !important;
                    }
                    .border {
                        border-color: #cbd5e1 !important;
                    }
                    .bg-white {
                        background-color: transparent !important;
                    }
                    table {
                        font-size: 10px !important;
                        width: 100% !important;
                    }
                    th, td {
                        padding: 4px 6px !important;
                    }
                }
                @media screen {
                    .print-only {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Header bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Ride Audit & History</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Search, audit, filter by date/township, and export full ride transcripts and passenger bookings for regulatory compliance.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrintPDF}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                    />
                                </svg>
                                Export Filtered History (PDF / Print)
                            </button>
                            <Link
                                href={route('admin.dashboard')}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                            >
                                ← Admin Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Print Only Header Banner */}
                    <div className="print-only mb-6 border-b pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">CommuteHub Enterprise Ride Audit Report</h1>
                                <p className="text-xs text-gray-500">Yangon Carpooling Platform • System Audit & Compliance</p>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                                <div>Exported: {summary.exported_at}</div>
                                <div>Status Filter: {filters.status.toUpperCase()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Cards / Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filtered Rides</span>
                            <div className="text-2xl font-black text-gray-900 mt-1">{summary.total_filtered_rides}</div>
                            <span className="text-[11px] text-gray-500">Rides matching current filter</span>
                        </div>
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Booked Passenger Seats</span>
                            <div className="text-2xl font-black text-indigo-600 mt-1">{summary.total_seats_taken}</div>
                            <span className="text-[11px] text-gray-500">Total commuter seats occupied</span>
                        </div>
                        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Commute Volume</span>
                            <div className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(summary.total_revenue_est)}</div>
                            <span className="text-[11px] text-gray-500">Estimated commuter fare value</span>
                        </div>
                    </div>

                    {/* Filter Controls Box */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 no-print">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Search & Filter Criteria</h3>
                        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Ride Status</label>
                                <select
                                    value={formFilters.status}
                                    onChange={(e) => setFormFilters({ ...formFilters, status: e.target.value })}
                                    className="w-full text-xs rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Specific Date */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Specific Day</label>
                                <input
                                    type="date"
                                    value={formFilters.date}
                                    onChange={(e) => setFormFilters({ ...formFilters, date: e.target.value })}
                                    className="w-full text-xs rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Month Select */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Month</label>
                                <input
                                    type="month"
                                    value={formFilters.month}
                                    onChange={(e) => setFormFilters({ ...formFilters, month: e.target.value })}
                                    className="w-full text-xs rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Yangon Township */}
                            <div>
                                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Yangon Township</label>
                                <select
                                    value={formFilters.township}
                                    onChange={(e) => setFormFilters({ ...formFilters, township: e.target.value })}
                                    className="w-full text-xs rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Townships</option>
                                    {townships.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex items-end gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                                >
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-semibold transition"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* History Table */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h2 className="text-sm font-bold text-gray-900">
                                Ride Records ({rides.total} Total)
                            </h2>
                            <span className="text-xs text-gray-400 no-print">Click 'Audit' for complete passenger booking breakdown</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-3">Trip ID & Time</th>
                                        <th className="py-3 px-3">Driver</th>
                                        <th className="py-3 px-3">Route (Yangon)</th>
                                        <th className="py-3 px-3">Status</th>
                                        <th className="py-3 px-3">Seats & Fare</th>
                                        <th className="py-3 px-3">Bookings</th>
                                        <th className="py-3 px-3 text-right no-print">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rides.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-gray-400">
                                                No ride records found matching the specified filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        rides.data.map((ride) => (
                                            <tr key={ride.id} className="hover:bg-gray-50/60 transition">
                                                {/* ID & Departure */}
                                                <td className="py-3.5 px-3">
                                                    <div className="font-bold text-gray-900">#{ride.id}</div>
                                                    <div className="text-[11px] text-gray-500">
                                                        {new Date(ride.departure_time).toLocaleDateString([], {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-gray-400">
                                                        {new Date(ride.departure_time).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </td>

                                                {/* Driver */}
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-2.5">
                                                        {ride.driver.passport_photo_path ? (
                                                            <img
                                                                src={`/storage/${ride.driver.passport_photo_path}`}
                                                                alt={ride.driver.name}
                                                                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                                                {ride.driver.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{ride.driver.name}</div>
                                                            {ride.vehicle && (
                                                                <div className="text-[10px] text-gray-400 font-mono">
                                                                    {ride.vehicle.make} • {ride.vehicle.license_plate}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Route */}
                                                <td className="py-3.5 px-3">
                                                    <div className="font-semibold text-gray-900">
                                                        {ride.origin_township} <span className="text-gray-400">→</span> {ride.destination_township}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {ride.stops.length} stop{ride.stops.length !== 1 ? 's' : ''} scheduled
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            ride.status === 'completed'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : ride.status === 'in_progress'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : ride.status === 'cancelled'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}
                                                    >
                                                        {ride.status.replace('_', ' ')}
                                                    </span>
                                                    {ride.cancellation_reason && (
                                                        <div className="text-[10px] text-red-500 italic truncate max-w-[150px]">
                                                            "{ride.cancellation_reason}"
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Seats & Price */}
                                                <td className="py-3.5 px-3">
                                                    <div className="font-bold text-gray-900">
                                                        {new Intl.NumberFormat('en-US').format(Number(ride.price_per_seat))} MMK
                                                    </div>
                                                    <div className="text-[10px] text-gray-500">
                                                        {ride.booked_seats} of {ride.total_seats} seats booked
                                                    </div>
                                                </td>

                                                {/* Bookings Count */}
                                                <td className="py-3.5 px-3">
                                                    <span className="font-medium text-gray-700">
                                                        {ride.bookings.length} passenger{ride.bookings.length !== 1 ? 's' : ''}
                                                    </span>
                                                </td>

                                                {/* Audit Button */}
                                                <td className="py-3.5 px-3 text-right no-print">
                                                    <button
                                                        onClick={() => setSelectedRide(ride)}
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                                    >
                                                        Audit Trip
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {rides.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs no-print">
                                <span className="text-gray-500">
                                    Showing page {rides.current_page} of {rides.last_page} ({rides.total} total)
                                </span>
                                <div className="flex items-center gap-1">
                                    {rides.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white font-bold'
                                                    : link.url
                                                    ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                    : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Ride Audit Details Modal */}
            {selectedRide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto no-print">
                    <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-100 my-8">
                        {/* Modal Header */}
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    Ride Audit Transcript #{selectedRide.id}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {selectedRide.origin_township} → {selectedRide.destination_township} •{' '}
                                    {new Date(selectedRide.departure_time).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedRide(null)}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* Trip Status & Driver Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-700 uppercase tracking-wider">Driver Profile</div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Name:</span>{' '}
                                        <span className="font-semibold text-gray-900">{selectedRide.driver.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Contact:</span>{' '}
                                        <span className="font-mono text-gray-900">{selectedRide.driver.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Email:</span>{' '}
                                        <span className="text-gray-900">{selectedRide.driver.email}</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-700 uppercase tracking-wider">Vehicle & Capacity</div>
                                    {selectedRide.vehicle ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Vehicle:</span>{' '}
                                                <span className="font-semibold text-gray-900">
                                                    {selectedRide.vehicle.make} {selectedRide.vehicle.model} ({selectedRide.vehicle.color || 'Standard'})
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">License Plate:</span>{' '}
                                                <span className="font-mono font-bold text-gray-900">{selectedRide.vehicle.license_plate}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-gray-400">No vehicle record linked</div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Seat Occupancy:</span>{' '}
                                        <span className="font-bold text-indigo-600">
                                            {selectedRide.booked_seats} / {selectedRide.total_seats} Seats Booked
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stops List */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Trip Route & Stops</h4>
                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                                    {selectedRide.stops.map((stop, idx) => (
                                        <div key={stop.id} className="flex items-center gap-3 text-xs">
                                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium text-gray-900">{stop.stop_name}</span>
                                            {stop.estimated_time && (
                                                <span className="text-gray-400 text-[10px]">
                                                    ({new Date(stop.estimated_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bookings Audit Table */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Passenger Bookings Audit ({selectedRide.bookings.length})
                                </h4>
                                {selectedRide.bookings.length === 0 ? (
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
                                        No passenger bookings recorded for this ride.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                                        <table className="w-full text-left text-xs text-gray-600">
                                            <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-wider">
                                                <tr>
                                                    <th className="py-2.5 px-3">Passenger</th>
                                                    <th className="py-2.5 px-3">Pickup / Drop-off</th>
                                                    <th className="py-2.5 px-3">Seats</th>
                                                    <th className="py-2.5 px-3">Total Fare</th>
                                                    <th className="py-2.5 px-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {selectedRide.bookings.map((b) => (
                                                    <tr key={b.id}>
                                                        <td className="py-2.5 px-3">
                                                            <div className="font-semibold text-gray-900">{b.passenger.name}</div>
                                                            {b.passenger.phone && (
                                                                <div className="text-[10px] text-gray-400 font-mono">{b.passenger.phone}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <div className="text-[11px] text-gray-800">
                                                                {b.pickup_stop || 'Start'} → {b.dropoff_stop || 'Destination'}
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-semibold text-gray-900">{b.seats_booked}</td>
                                                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                                                            {formatCurrency(b.total_fare)}
                                                        </td>
                                                        <td className="py-2.5 px-3">
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                    b.status === 'completed'
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : b.status === 'accepted'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : b.status === 'cancelled'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}
                                                            >
                                                                {b.status}
                                                            </span>
                                                            {b.cancellation_reason && (
                                                                <div className="text-[10px] text-red-500 italic truncate max-w-[120px]">
                                                                    "{b.cancellation_reason}"
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Ride Rules */}
                            {selectedRide.ride_rules && selectedRide.ride_rules.length > 0 && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Driver Ride Rules</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedRide.ride_rules.map((rule, idx) => (
                                            <span key={idx} className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium">
                                                ✓ {rule}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedRide(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                            >
                                Close Audit Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
