import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecentBooking {
    id: number;
    ride_id?: number;
    passenger_id?: number;
    status: string;
    seats_booked: number;
    price_per_seat: string;
    passenger?: { id: number; name: string } | null;
    ride?: {
        id?: number;
        driver_id?: number;
        departure_time?: string;
        driver?: { id?: number; name: string } | null;
        vehicle?: { make: string; model: string; color?: string | null } | null;
        stops?: { id: number; stop_name: string; stop_order: number }[];
    } | null;
    pickupStop?: { stop_name: string } | null;
    dropoffStop?: { stop_name: string } | null;
}


type DashboardProps = {
    stats: {
        rides_taken: number;
        rides_offered: number;
        average_rating?: number;
        review_count?: number;
    };
    recentBookings: RecentBooking[];
    activeRide?: {
        id: number;
        status: string;
        departure_time: string;
        vehicle?: { make: string; model: string } | null;
        stops?: { id: number; stop_name: string }[];
    } | null;
};


interface ActionCard {
    title: string;
    description: string;
    href: string;
    label: string;
    icon: React.ReactNode;
    gradient: string;
    ring: string;
    labelColor: string;
    disabled?: boolean;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-800 ring-amber-200',
    accepted:  'bg-emerald-100 text-emerald-800 ring-emerald-200',
    completed: 'bg-blue-100 text-blue-800 ring-blue-200',
    rejected:  'bg-red-100 text-red-800 ring-red-200',
    cancelled: 'bg-gray-100 text-gray-600 ring-gray-200',
};

function StatusBadge({ status }: { status: string }) {
    const cls = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 ring-gray-200';
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function SearchIcon() {
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
    );
}

function CarIcon() {
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M5 17H3a2 2 0 01-2-2v-5a2 2 0 012-2h1.5M19 17h2a2 2 0 002-2v-5a2 2 0 00-2-2h-1.5M5 10l1.5-4.5A2 2 0 018.4 4h7.2a2 2 0 011.9 1.5L19 10M5 10h14M7.5 17a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm6 0a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z"
            />
        </svg>
    );
}

function UserCheckIcon() {
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
        </svg>
    );
}

function HistoryIcon() {
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <div className="flex flex-col gap-1 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
            <span className="text-sm text-gray-500">{label}</span>
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString([], {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Dashboard() {
    const { auth, stats, recentBookings, activeRide } = usePage<PageProps<DashboardProps>>().props;
    const user = auth.user;
    const isDriver = user?.roles?.includes('driver') ?? false;
    const isAdmin = user?.roles?.includes('admin') ?? false;

    const cards: ActionCard[] = [
        ...(route().has('rides.index')
            ? [{
                title: 'Find a Ride',
                description: 'Browse available carpooling trips near you and book a seat.',
                href: route('rides.index'),
                label: 'Browse Rides',
                icon: <SearchIcon />,
                gradient: 'from-sky-500 to-cyan-500',
                ring: 'ring-sky-100',
                labelColor: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-300',
            }]
            : []),
        ...(isDriver
            ? [{
                title: 'Offer a Ride',
                description: 'Post a new trip, set your route and available seats.',
                href: route('rides.create'),
                label: 'Post a Ride',
                icon: <CarIcon />,
                gradient: 'from-indigo-500 to-violet-500',
                ring: 'ring-indigo-100',
                labelColor: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300',
            }]
            : [{
                title: 'Become a Driver',
                description: 'Register your vehicle and start offering rides to other commuters.',
                href: route('driver-application.create'),
                label: 'Apply Now',
                icon: <UserCheckIcon />,
                gradient: 'from-violet-500 to-purple-500',
                ring: 'ring-violet-100',
                labelColor: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-300',
            }]),
        {
            title: 'My Trips',
            description: 'View your past and upcoming rides as a passenger or driver.',
            href: route().has('bookings.index') ? route('bookings.index') : route('profile.edit'),
            label: 'View History',
            icon: <HistoryIcon />,
            gradient: 'from-emerald-500 to-teal-500',
            ring: 'ring-emerald-100',
            labelColor: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300',
        },
        ...(isAdmin
            ? [{
                title: 'Admin Panel',
                description: 'Manage driver verifications and monitor platform metrics.',
                href: route('admin.dashboard'),
                label: 'Open Admin',
                icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                ),
                gradient: 'from-purple-600 to-indigo-600',
                ring: 'ring-purple-100',
                labelColor: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-300',
            }]
            : []),
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Welcome back, <span className="text-indigo-600">{user.name}</span> 👋
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {isDriver ? 'Ready to offer a ride today?' : 'Find your next commute partner.'}
                        </p>
                    </div>
                    {isDriver && (
                        <span className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 sm:inline-flex">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Verified Driver
                        </span>
                    )}
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 py-10">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* ── Stats row ── */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard label="Rides Taken" value={stats?.rides_taken ?? '—'} color="text-sky-600" />
                        <StatCard label="Rides Offered" value={isDriver ? (stats?.rides_offered ?? '—') : 'N/A'} color="text-indigo-600" />
                        <StatCard
                            label="Rating"
                            value={stats?.average_rating && stats.average_rating > 0 ? `★ ${stats.average_rating}` : '★ New'}
                            color="text-amber-500"
                        />
                        <StatCard label="Reviews" value={stats?.review_count ?? 0} color="text-emerald-600" />
                    </div>

                    {/* ── Active Ride Action Banner (Driver) ── */}
                    {activeRide && (
                        <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-indigo-100">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                            Active Driving Trip
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                activeRide.status === 'in_progress'
                                                    ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                                                    : 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300'
                                            }`}
                                        >
                                            {activeRide.status === 'in_progress' && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                                            )}
                                            {activeRide.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                                        </span>
                                    </div>
                                    <p className="mt-1 font-bold text-gray-900">
                                        {activeRide.stops?.[0]?.stop_name ?? 'Origin'} → {activeRide.stops && activeRide.stops.length > 1 ? activeRide.stops[activeRide.stops.length - 1].stop_name : 'Destination'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {activeRide.vehicle ? `${activeRide.vehicle.make} ${activeRide.vehicle.model}` : 'Vehicle'} · {formatDateTime(activeRide.departure_time)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2.5 flex-wrap">
                                    {activeRide.status === 'scheduled' && (
                                        <button
                                            onClick={() => {
                                                if (!confirm('Start this trip now?')) return;
                                                router.patch(route('rides.start', activeRide.id), {}, { preserveScroll: true });
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                                        >
                                            Start Trip
                                        </button>
                                    )}
                                    {activeRide.status === 'in_progress' && (
                                        <button
                                            onClick={() => {
                                                if (!confirm('Complete this trip?')) return;
                                                router.patch(route('rides.complete', activeRide.id), {}, { preserveScroll: true });
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                                        >
                                            Complete Trip
                                        </button>
                                    )}
                                    <Link
                                        href={route('rides.show', activeRide.id)}
                                        className="rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        View Trip
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Quick action cards ── */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Actions</h3>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {cards.map((card) => (
                                <div
                                    key={card.title}
                                    className={`group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.ring}`}
                                >
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${card.gradient}`} />
                                    <div className="p-6">
                                        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-md`}>
                                            {card.icon}
                                        </div>
                                        <h4 className="text-base font-bold text-gray-800">{card.title}</h4>
                                        <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{card.description}</p>
                                        <div className="mt-5">
                                            <Link
                                                href={card.href}
                                                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${card.labelColor}`}
                                            >
                                                {card.label}
                                                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Recent activity ── */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Recent Activity</h3>
                        {recentBookings && recentBookings.length > 0 ? (
                            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                                <ul className="divide-y divide-gray-100">
                                    {recentBookings.map((booking) => {
                                        const rideId = booking.ride_id || booking.ride?.id;
                                        const isDriverForRide = Boolean(
                                            user && booking.ride?.driver_id && Number(user.id) === Number(booking.ride.driver_id)
                                        );

                                        const pickupName = booking.pickupStop?.stop_name
                                            || booking.ride?.stops?.[0]?.stop_name
                                            || 'Origin';
                                        const dropoffName = booking.dropoffStop?.stop_name
                                            || (booking.ride?.stops && booking.ride.stops.length > 1
                                                ? booking.ride.stops[booking.ride.stops.length - 1].stop_name
                                                : 'Destination');

                                        const content = (
                                            <div className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50/80">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <StatusBadge status={booking.status} />
                                                        <span className="text-sm font-medium text-gray-800 truncate">
                                                            {isDriverForRide ? (
                                                                <>
                                                                    <span className="font-semibold text-indigo-600">Passenger:</span>{' '}
                                                                    {booking.passenger?.name ?? 'Passenger'}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {booking.ride?.driver?.name ?? 'Driver'} ·{' '}
                                                                    {booking.ride?.vehicle
                                                                        ? `${booking.ride.vehicle.make} ${booking.ride.vehicle.model}`
                                                                        : 'Vehicle N/A'}
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                        <span className="font-medium text-gray-700">{pickupName}</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="font-medium text-gray-700">{dropoffName}</span>
                                                        <span className="text-gray-300">·</span>
                                                        <span>
                                                            {booking.ride?.departure_time
                                                                ? formatDateTime(booking.ride.departure_time)
                                                                : '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        ${(Number(booking.price_per_seat) * booking.seats_booked).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{booking.seats_booked} seat{booking.seats_booked !== 1 ? 's' : ''}</p>
                                                </div>
                                                <div className="shrink-0 text-gray-400">
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </div>
                                            </div>
                                        );

                                        return (
                                            <li key={booking.id}>
                                                {rideId ? (
                                                    <Link href={route('rides.show', rideId)} className="block">
                                                        {content}
                                                    </Link>
                                                ) : (
                                                    content
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                                {route().has('bookings.index') && (
                                    <div className="border-t border-gray-100 px-5 py-3">
                                        <Link href={route('bookings.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                            View all trips →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                                    <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-400">No recent activity yet</p>
                                <p className="mt-1 text-xs text-gray-300">Your upcoming and past rides will appear here.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
