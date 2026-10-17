import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

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
}

interface RecentCancellation {
    id: number;
    ride_id?: number;
    type: string;
    passenger_name: string;
    passenger_email: string;
    driver_name: string;
    vehicle: string;
    route: string;
    reason: string;
    cancelled_at: string;
}

interface Props {
    metrics: MetricProps;
    recentCancellations: RecentCancellation[];
}

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

export default function Dashboard({ metrics, recentCancellations }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-800">
                                Admin Portal
                            </span>
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-gray-900">Platform Overview & Metrics</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.verifications.index')}
                            className="relative inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                            Driver Verifications
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
            <Head title="Admin Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Top Alert if Pending Verifications */}
                    {metrics.pending_verifications > 0 && (
                        <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-amber-900">
                                        {metrics.pending_verifications} Driver Application{metrics.pending_verifications !== 1 ? 's' : ''} Pending Review
                                    </p>
                                    <p className="text-xs text-amber-700">
                                        New drivers submitted vehicle and identity documentation waiting for approval.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route('admin.verifications.index')}
                                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
                            >
                                Review Applications →
                            </Link>
                        </div>
                    )}

                    {/* Key Platform Metric Cards */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Platform Performance</h3>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Card 1: Users */}
                            <MetricCard
                                title="Total Registered Users"
                                value={metrics.total_users}
                                subtitle={`${metrics.drivers_count} Drivers · ${metrics.passengers_count} Passengers`}
                                color="bg-indigo-600"
                                icon={
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                    </svg>
                                }
                            />

                            {/* Card 2: Rides */}
                            <MetricCard
                                title="Active & Scheduled Rides"
                                value={metrics.active_rides}
                                subtitle={`${metrics.completed_rides} completed · ${metrics.cancelled_rides} cancelled`}
                                color="bg-sky-600"
                                icon={
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.5a2.25 2.25 0 00-2.25-2.25h-4.5A2.25 2.25 0 005.25 4.5v3" />
                                    </svg>
                                }
                            />

                            {/* Card 3: Successful Bookings */}
                            <MetricCard
                                title="Successful Bookings"
                                value={metrics.successful_bookings}
                                subtitle="Accepted & Completed trips"
                                color="bg-emerald-600"
                                icon={
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />

                            {/* Card 4: Cancellation Rate */}
                            <MetricCard
                                title="System Cancellation Rate"
                                value={`${metrics.cancellation_rate}%`}
                                subtitle={`${metrics.cancelled_rides} of total scheduled rides`}
                                color={metrics.cancellation_rate > 15 ? 'bg-red-600' : 'bg-purple-600'}
                                icon={
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            />
                        </div>
                    </div>

                    {/* Recent Cancellations Table */}
                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Recent Platform Cancellations</h3>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Auditing driver breakdowns and passenger cancellations with documented rationales.
                                    </p>
                                </div>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                    Last 10 Events
                                </span>
                            </div>
                        </div>

                        {recentCancellations && recentCancellations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3.5">Type & Trip</th>
                                            <th className="px-6 py-3.5">Passenger</th>
                                            <th className="px-6 py-3.5">Driver & Vehicle</th>
                                            <th className="px-6 py-3.5">Cancellation Reason</th>
                                            <th className="px-6 py-3.5 text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentCancellations.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/60 transition">
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                            item.type === 'Driver Cancelled'
                                                                ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200'
                                                                : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                                                        }`}
                                                    >
                                                        {item.type}
                                                    </span>
                                                    <div className="mt-1 text-xs font-medium text-gray-900">
                                                        {item.route}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900">{item.passenger_name}</p>
                                                    <p className="text-xs text-gray-400">{item.passenger_email}</p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900">{item.driver_name}</p>
                                                    <p className="text-xs text-gray-400">{item.vehicle}</p>
                                                </td>

                                                <td className="px-6 py-4 max-w-xs">
                                                    <div className="rounded-xl bg-gray-50 p-2.5 text-xs italic text-gray-700 ring-1 ring-gray-100">
                                                        "{item.reason}"
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-right text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(item.cancelled_at).toLocaleString([], {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-sm font-semibold text-gray-500">No cancellations recorded</p>
                                <p className="mt-1 text-xs text-gray-400">All scheduled rides and passenger bookings are running smoothly.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
