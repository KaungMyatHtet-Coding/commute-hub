import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEvent, useState } from 'react';

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface MetricProps {
    total_users: number;
    drivers_count: number;
    passengers_count: number;
    pending_verifications: number;
    active_rides: number;
    completed_rides: number;
    cancelled_rides: number;
    successful_bookings: number;
    cancellation_rate: number;
    today_drivers?: number;
    today_passengers?: number;
}

interface TripOutcomes {
    completed: number;
    completed_pct: number;
    driver_cancelled: number;
    driver_cancelled_pct: number;
    passenger_cancelled: number;
    passenger_cancelled_pct: number;
    total: number;
}

interface DailyUsageItem {
    date: string;
    label: string;
    drivers: number;
    passengers: number;
}

interface DriverLeaderboardItem {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    passport_photo_path?: string | null;
    rating: number;
    review_count: number;
    completed_rides_count?: number;
    cancelled_rides_count?: number;
    total_offered_count?: number;
    is_blocked: boolean;
}

interface RecentUnifiedItem {
    id: number;
    route: string;
    driver_name: string;
    vehicle: string;
    departure_time: string;
    status: string;
    passengers_count: number;
    seats_booked: number;
    cancellation_reason?: string | null;
    updated_at: string;
}

interface Props {
    metrics: MetricProps;
    tripOutcomes: TripOutcomes;
    dailyUsage: DailyUsageItem[];
    topDrivers: DriverLeaderboardItem[];
    lowRatedDrivers: DriverLeaderboardItem[];
    recentUnified: RecentUnifiedItem[];
}

// ─── Metric Card Helper ──────────────────────────────────────────────────────

function MetricCard({
    title,
    value,
    subtitle,
    icon,
    color,
    badge,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    badge?: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">{title}</span>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color} text-white shadow-sm`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-gray-900">{value}</span>
                {badge && (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-200">
                        {badge}
                    </span>
                )}
            </div>
            {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
    );
}

// ─── SVG Donut / Pie Chart Component ─────────────────────────────────────────

function TripOutcomesDonutChart({ outcomes }: { outcomes: TripOutcomes }) {
    const total = outcomes.total || 1;
    const completedAngle = (outcomes.completed / total) * 360;
    const driverAngle = (outcomes.driver_cancelled / total) * 360;
    const passengerAngle = (outcomes.passenger_cancelled / total) * 360;

    // Radius and circumference
    const radius = 60;
    const circumference = 2 * Math.PI * radius;

    const completedStroke = (outcomes.completed / total) * circumference;
    const driverStroke = (outcomes.driver_cancelled / total) * circumference;
    const passengerStroke = (outcomes.passenger_cancelled / total) * circumference;

    const driverOffset = -completedStroke;
    const passengerOffset = -(completedStroke + driverStroke);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
            <div className="relative flex items-center justify-center">
                <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="24" />
                    {outcomes.completed > 0 && (
                        <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="24"
                            strokeDasharray={`${completedStroke} ${circumference}`}
                            strokeDashoffset="0"
                            className="transition-all duration-700 ease-out"
                        />
                    )}
                    {outcomes.driver_cancelled > 0 && (
                        <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="24"
                            strokeDasharray={`${driverStroke} ${circumference}`}
                            strokeDashoffset={driverOffset}
                            className="transition-all duration-700 ease-out"
                        />
                    )}
                    {outcomes.passenger_cancelled > 0 && (
                        <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="24"
                            strokeDasharray={`${passengerStroke} ${circumference}`}
                            strokeDashoffset={passengerOffset}
                            className="transition-all duration-700 ease-out"
                        />
                    )}
                </svg>
                <div className="absolute text-center">
                    <span className="text-2xl font-black text-gray-900">{outcomes.total}</span>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Trips</span>
                </div>
            </div>

            <div className="space-y-3 min-w-[200px]">
                <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-gray-700">Completed Trips</span>
                    </div>
                    <span className="font-bold text-gray-900">{outcomes.completed} ({outcomes.completed_pct}%)</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="font-semibold text-gray-700">Driver Cancelled</span>
                    </div>
                    <span className="font-bold text-gray-900">{outcomes.driver_cancelled} ({outcomes.driver_cancelled_pct}%)</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="font-semibold text-gray-700">Passenger Cancelled</span>
                    </div>
                    <span className="font-bold text-gray-900">{outcomes.passenger_cancelled} ({outcomes.passenger_cancelled_pct}%)</span>
                </div>
            </div>
        </div>
    );
}

// ─── SVG / Tailwind Bar Chart Component ───────────────────────────────────────

function DailyUsageBarChart({ data }: { data: DailyUsageItem[] }) {
    const maxVal = Math.max(1, ...data.map((d) => Math.max(d.drivers, d.passengers)));

    return (
        <div className="space-y-4 pt-2">
            <div className="flex items-center justify-end gap-5 text-xs">
                <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-indigo-600" />
                    <span className="text-gray-600 font-medium">Drivers Offering Rides</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-purple-500" />
                    <span className="text-gray-600 font-medium">Passengers Booking</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 border-b border-gray-100">
                {data.map((item, idx) => {
                    const driverHeightPct = Math.round((item.drivers / maxVal) * 100);
                    const passengerHeightPct = Math.round((item.passengers / maxVal) * 100);

                    return (
                        <div key={idx} className="flex flex-col items-center h-full justify-end group">
                            <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center h-32">
                                {/* Driver bar */}
                                <div
                                    style={{ height: `${Math.max(6, driverHeightPct)}%` }}
                                    className="w-3 sm:w-5 bg-indigo-600 rounded-t-md transition-all group-hover:bg-indigo-700 relative"
                                    title={`${item.drivers} drivers`}
                                >
                                    {item.drivers > 0 && (
                                        <span className="opacity-0 group-hover:opacity-100 transition absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                                            {item.drivers}
                                        </span>
                                    )}
                                </div>
                                {/* Passenger bar */}
                                <div
                                    style={{ height: `${Math.max(6, passengerHeightPct)}%` }}
                                    className="w-3 sm:w-5 bg-purple-500 rounded-t-md transition-all group-hover:bg-purple-600 relative"
                                    title={`${item.passengers} passengers`}
                                >
                                    {item.passengers > 0 && (
                                        <span className="opacity-0 group-hover:opacity-100 transition absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-purple-700 bg-purple-50 px-1 rounded">
                                            {item.passengers}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="mt-2 text-[11px] font-semibold text-gray-500 truncate w-full text-center">
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Change Passcode Modal ───────────────────────────────────────────────────

function ChangePasscodeModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        current_passcode: '',
        new_passcode: '',
        new_passcode_confirmation: '',
    });

    if (!isOpen) return null;

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        patch(route('admin.passcode.update'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-100">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h3 className="text-base font-bold text-gray-900">Change Admin Panel Passcode</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                            Current Passcode
                        </label>
                        <input
                            type="password"
                            value={data.current_passcode}
                            onChange={(e) => setData('current_passcode', e.target.value)}
                            className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            required
                        />
                        {errors.current_passcode && (
                            <p className="mt-1 text-xs text-red-600">{errors.current_passcode}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                            New Passcode (Min 6 characters)
                        </label>
                        <input
                            type="password"
                            value={data.new_passcode}
                            onChange={(e) => setData('new_passcode', e.target.value)}
                            className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            required
                        />
                        {errors.new_passcode && (
                            <p className="mt-1 text-xs text-red-600">{errors.new_passcode}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                            Confirm New Passcode
                        </label>
                        <input
                            type="password"
                            value={data.new_passcode_confirmation}
                            onChange={(e) => setData('new_passcode_confirmation', e.target.value)}
                            className="w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Update Passcode'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Dashboard({
    metrics,
    tripOutcomes,
    dailyUsage,
    topDrivers,
    lowRatedDrivers,
    recentUnified,
}: Props) {
    const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
    const [inspectTrip, setInspectTrip] = useState<RecentUnifiedItem | null>(null);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-800">
                                Enterprise Admin Governance
                            </span>
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-gray-900">Platform Analytics & Governance</h2>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setPasscodeModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition"
                        >
                            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            Passcode Settings
                        </button>

                        <Link
                            href={route('admin.users.index')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition"
                        >
                            User Governance
                        </Link>

                        <Link
                            href={route('admin.history.index')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition"
                        >
                            Full Ride History
                        </Link>

                        <Link
                            href={route('admin.verifications.index')}
                            className="relative inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
                        >
                            Verifications
                            {metrics.pending_verifications > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-gray-900 shadow">
                                    {metrics.pending_verifications}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Admin Overview & Governance" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* Today's Live Snapshot Banner */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Today's Drivers</span>
                            <p className="mt-1 text-2xl font-extrabold text-indigo-950">{metrics.today_drivers ?? 0} active</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Drivers posting commute rides today</p>
                        </div>
                        <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Today's Passengers</span>
                            <p className="mt-1 text-2xl font-extrabold text-purple-950">{metrics.today_passengers ?? 0} active</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">Commuters booking seats today</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Successful Bookings</span>
                            <p className="mt-1 text-2xl font-extrabold text-emerald-950">{metrics.successful_bookings}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">All-time confirmed seats</p>
                        </div>
                        <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Cancellation Rate</span>
                            <p className="mt-1 text-2xl font-extrabold text-amber-950">{metrics.cancellation_rate}%</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{metrics.cancelled_rides} cancelled trips</p>
                        </div>
                    </div>

                    {/* Key Platform Stats */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="Total Registered Users"
                            value={metrics.total_users}
                            subtitle={`${metrics.drivers_count} Drivers · ${metrics.passengers_count} Passengers`}
                            color="bg-indigo-600"
                            icon={<span className="text-lg">👥</span>}
                        />
                        <MetricCard
                            title="Active & Scheduled Rides"
                            value={metrics.active_rides}
                            subtitle="Rides open or currently in transit"
                            color="bg-emerald-600"
                            icon={<span className="text-lg">🚗</span>}
                        />
                        <MetricCard
                            title="Completed Commutes"
                            value={metrics.completed_rides}
                            subtitle="Safely delivered trips"
                            color="bg-blue-600"
                            icon={<span className="text-lg">✓</span>}
                        />
                        <MetricCard
                            title="Pending Verifications"
                            value={metrics.pending_verifications}
                            subtitle="Driver & Profile applications"
                            color={metrics.pending_verifications > 0 ? 'bg-amber-500' : 'bg-gray-400'}
                            badge={metrics.pending_verifications > 0 ? 'Action Needed' : undefined}
                            icon={<span className="text-lg">🛡️</span>}
                        />
                    </div>

                    {/* ── Visual Analytics Charts ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Donut Chart: Trip Outcomes */}
                        <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <div className="border-b border-gray-100 pb-3 mb-4">
                                <h3 className="text-base font-bold text-gray-900">Trip Outcomes Breakdown</h3>
                                <p className="text-xs text-gray-500">Visualizing completed vs. cancelled trip ratios</p>
                            </div>
                            <TripOutcomesDonutChart outcomes={tripOutcomes} />
                        </div>

                        {/* Bar Chart: Last 7 Days Daily Usage */}
                        <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Last 7 Days Platform Activity</h3>
                                    <p className="text-xs text-gray-500">Daily unique active drivers vs. active passengers</p>
                                </div>
                                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                                    7-Day Trend
                                </span>
                            </div>
                            <DailyUsageBarChart data={dailyUsage} />
                        </div>
                    </div>

                    {/* ── Driver Rating Leaderboards ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Rated Drivers */}
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <span>🌟 Top Rated Drivers</span>
                                    </h3>
                                    <p className="text-xs text-gray-500">Highest passenger satisfaction & completed rides</p>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                    Trusted Champions
                                </span>
                            </div>

                            {topDrivers.length === 0 ? (
                                <p className="text-xs text-gray-400 py-6 text-center italic">No rated drivers yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {topDrivers.map((d, idx) => (
                                        <div key={d.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 hover:bg-gray-100/60 transition">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-800">
                                                    #{idx + 1}
                                                </span>
                                                {d.passport_photo_path ? (
                                                    <img src={`/storage/${d.passport_photo_path}`} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 font-bold text-indigo-600 flex items-center justify-center text-sm">
                                                        {d.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{d.name}</p>
                                                    <p className="text-xs text-gray-500">{d.completed_rides_count ?? 0} completed rides</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-sm">
                                                    ★ {d.rating.toFixed(1)}
                                                </span>
                                                <p className="text-[11px] text-gray-400">({d.review_count} reviews)</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lowest Rated / High Cancellation Drivers */}
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                            <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                        <span>⚠️ High-Risk & High-Cancellation Drivers</span>
                                    </h3>
                                    <p className="text-xs text-gray-500">Drivers requiring monitoring, warnings, or suspension</p>
                                </div>
                                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                                    Watchlist
                                </span>
                            </div>

                            {lowRatedDrivers.length === 0 ? (
                                <p className="text-xs text-gray-400 py-6 text-center italic">Zero high-cancellation or low-rated drivers. Great platform health!</p>
                            ) : (
                                <div className="space-y-3">
                                    {lowRatedDrivers.map((d) => (
                                        <div key={d.id} className="flex items-center justify-between p-3 rounded-2xl bg-red-50/40 border border-red-100">
                                            <div className="flex items-center gap-3">
                                                {d.passport_photo_path ? (
                                                    <img src={`/storage/${d.passport_photo_path}`} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-red-100 font-bold text-red-600 flex items-center justify-center text-sm">
                                                        {d.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-gray-900">{d.name}</p>
                                                        {d.is_blocked && (
                                                            <span className="rounded bg-red-600 text-white px-1.5 py-0.2 text-[10px] font-bold">BLOCKED</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-red-700 font-medium">
                                                        {d.cancelled_rides_count ?? 0} cancelled rides ({d.total_offered_count ?? 0} total)
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-red-600 text-sm">
                                                    {d.review_count > 0 ? `★ ${d.rating.toFixed(1)}` : 'No reviews'}
                                                </span>
                                                <div className="mt-1">
                                                    <Link
                                                        href={`/admin/users?search=${encodeURIComponent(d.email)}`}
                                                        className="text-xs font-semibold text-purple-700 hover:underline"
                                                    >
                                                        Inspect User →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Unified Recent 10 Platform Records ── */}
                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="border-b border-gray-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Recent 10 Platform Activity Records</h3>
                                <p className="mt-0.5 text-xs text-gray-500">Live operational ledger of completed and cancelled trips across Yangon.</p>
                            </div>
                            <Link
                                href={route('admin.history.index')}
                                className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline"
                            >
                                View Full Filterable History (PDF Export) →
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3.5">Status & Route</th>
                                        <th className="px-6 py-3.5">Driver & Vehicle</th>
                                        <th className="px-6 py-3.5">Passengers</th>
                                        <th className="px-6 py-3.5">Departure</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentUnified.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/60 transition">
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                                                        item.status === 'completed'
                                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                            : item.status === 'cancelled'
                                                            ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                                                            : item.status === 'in_progress'
                                                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                            : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                                                    }`}
                                                >
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                                <div className="mt-1 font-bold text-gray-900 text-xs">{item.route}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">{item.driver_name}</p>
                                                <p className="text-xs text-gray-400">{item.vehicle}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-indigo-700">{item.seats_booked} seats</span>
                                                <p className="text-xs text-gray-400">{item.passengers_count} bookings</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                                                {item.departure_time}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setInspectTrip(item)}
                                                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
                                                >
                                                    Inspect
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Change Passcode Modal */}
            <ChangePasscodeModal
                isOpen={passcodeModalOpen}
                onClose={() => setPasscodeModalOpen(false)}
            />

            {/* Quick Trip Inspector Modal */}
            {inspectTrip && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs animate-in fade-in"
                    onClick={() => setInspectTrip(null)}
                >
                    <div
                        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-gray-900">Trip Audit #{inspectTrip.id}</h3>
                            <button
                                type="button"
                                onClick={() => setInspectTrip(null)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-3 text-xs">
                            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                                <span className="font-bold text-gray-500 uppercase">Route</span>
                                <p className="text-sm font-bold text-gray-900">{inspectTrip.route}</p>
                                <p className="text-gray-500">Departure: {inspectTrip.departure_time}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <span className="font-bold text-gray-500 uppercase">Driver</span>
                                    <p className="font-bold text-gray-900 mt-1">{inspectTrip.driver_name}</p>
                                    <p className="text-gray-500">{inspectTrip.vehicle}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <span className="font-bold text-gray-500 uppercase">Status</span>
                                    <p className="font-bold capitalize text-gray-900 mt-1">{inspectTrip.status.replace('_', ' ')}</p>
                                    <p className="text-gray-500">{inspectTrip.seats_booked} seats reserved</p>
                                </div>
                            </div>
                            {inspectTrip.cancellation_reason && (
                                <div className="p-3 bg-red-50 rounded-xl text-red-800">
                                    <span className="font-bold uppercase">Cancellation Rationale</span>
                                    <p className="mt-1 italic">"{inspectTrip.cancellation_reason}"</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setInspectTrip(null)}
                                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
