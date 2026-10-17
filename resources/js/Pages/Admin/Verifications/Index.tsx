import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface Vehicle {
    id: number;
    make: string;
    model: string;
    color?: string | null;
    manufacture_year?: number | null;
    license_plate: string;
    seat_capacity: number;
    is_verified: boolean;
}

interface ApplicationUser {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    driver_license_number: string;
    driver_verification_status: string;
    driver_rejection_reason?: string | null;
    driver_applied_at?: string | null;
    driver_verified_at?: string | null;
    vehicles: Vehicle[];
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    applications: PaginatedData<ApplicationUser>;
    counts: {
        pending: number;
        verified: number;
        rejected: number;
    };
    currentFilter: 'pending' | 'verified' | 'rejected' | string;
}

export default function Index({ applications, counts, currentFilter }: Props) {
    const [rejectingUser, setRejectingUser] = useState<ApplicationUser | null>(null);

    const { data, setData, patch, processing, errors, reset } = useForm({
        reason: '',
    });

    const handleApprove = (user: ApplicationUser) => {
        if (!confirm(`Are you sure you want to approve driver verification for ${user.name}? This will grant them the Driver role.`)) {
            return;
        }
        router.patch(route('admin.verifications.approve', user.id), {}, { preserveScroll: true });
    };

    const handleOpenReject = (user: ApplicationUser) => {
        setRejectingUser(user);
        reset();
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingUser) return;

        patch(route('admin.verifications.reject', rejectingUser.id), {
            preserveScroll: true,
            onSuccess: () => setRejectingUser(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href={route('admin.dashboard')} className="text-xs font-bold uppercase tracking-wider text-purple-600 hover:underline">
                                ← Admin Dashboard
                            </Link>
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-gray-900">Driver Verifications</h2>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-2 rounded-2xl bg-gray-100 p-1.5">
                        <Link
                            href={route('admin.verifications.index', { status: 'pending' })}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                currentFilter === 'pending'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Pending
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                currentFilter === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-700'
                            }`}>
                                {counts.pending}
                            </span>
                        </Link>

                        <Link
                            href={route('admin.verifications.index', { status: 'verified' })}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                currentFilter === 'verified'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Verified
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                currentFilter === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                            }`}>
                                {counts.verified}
                            </span>
                        </Link>

                        <Link
                            href={route('admin.verifications.index', { status: 'rejected' })}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                currentFilter === 'rejected'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Rejected
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                currentFilter === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'
                            }`}>
                                {counts.rejected}
                            </span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Driver Verifications" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h3 className="text-base font-bold text-gray-900">
                                {currentFilter === 'pending'
                                    ? 'Pending Applications'
                                    : currentFilter === 'verified'
                                    ? 'Approved Drivers'
                                    : 'Rejected Applications'}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Inspect license IDs, registered vehicles, and approve or reject driver privileges.
                            </p>
                        </div>

                        {applications.data.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {applications.data.map((user) => {
                                    const vehicle = user.vehicles?.[0];
                                    const isPending = user.driver_verification_status === 'pending' || user.driver_verification_status === 'pending_verification';

                                    return (
                                        <div key={user.id} className="p-6 transition hover:bg-gray-50/50">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                                {/* Left: Driver and Verification Details */}
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 font-bold text-white shadow-sm">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-base font-bold text-gray-900">{user.name}</h4>
                                                                <span
                                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                                        user.driver_verification_status === 'verified'
                                                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                                                                            : isPending
                                                                            ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
                                                                            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200'
                                                                    }`}
                                                                >
                                                                    {user.driver_verification_status === 'verified'
                                                                        ? 'Verified'
                                                                        : isPending
                                                                        ? 'Pending Verification'
                                                                        : 'Rejected'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                {user.email} {user.phone ? `· ${user.phone}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Identification & Vehicle specs badge bar */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                        <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-100">
                                                            <span className="font-semibold text-gray-500 block uppercase text-[10px] tracking-wider">
                                                                Driver License / NID
                                                            </span>
                                                            <span className="font-mono font-bold text-gray-900 text-sm">
                                                                {user.driver_license_number || 'None'}
                                                            </span>
                                                            {user.driver_applied_at && (
                                                                <span className="block text-[11px] text-gray-400 mt-0.5">
                                                                    Applied {new Date(user.driver_applied_at).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-100">
                                                            <span className="font-semibold text-gray-500 block uppercase text-[10px] tracking-wider">
                                                                Registered Vehicle
                                                            </span>
                                                            {vehicle ? (
                                                                <div>
                                                                    <span className="font-bold text-gray-900">
                                                                        {vehicle.make} {vehicle.model}
                                                                        {vehicle.color ? ` (${vehicle.color})` : ''}
                                                                    </span>
                                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                                                                        <span className="font-mono font-semibold text-gray-700">{vehicle.license_plate}</span>
                                                                        <span>·</span>
                                                                        <span>{vehicle.seat_capacity} seats</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="italic text-gray-400">No vehicle registered</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Show rejection reason if rejected */}
                                                    {user.driver_verification_status === 'rejected' && user.driver_rejection_reason && (
                                                        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs text-red-800">
                                                            <span className="font-bold">Rejection Note:</span> {user.driver_rejection_reason}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex items-center gap-2.5 sm:self-center">
                                                    {user.driver_verification_status !== 'verified' && (
                                                        <button
                                                            onClick={() => handleApprove(user)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                            Approve Driver
                                                        </button>
                                                    )}

                                                    {user.driver_verification_status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleOpenReject(user)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <div className="mb-2 flex justify-center text-gray-300">
                                    <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-500">No applications found in this section</p>
                                <p className="mt-0.5 text-xs text-gray-400">Applications will appear here when passengers apply to become drivers.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Rejection Reason Modal */}
            {rejectingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h3 className="text-base font-bold text-gray-900">
                                Reject Driver Application
                            </h3>
                            <p className="text-xs text-gray-500">
                                Rejecting <span className="font-semibold text-gray-800">{rejectingUser.name}</span>
                            </p>
                        </div>

                        <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                    Reason for Rejection <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="e.g. Invalid license plate format or expired driving license."
                                    className="mt-1.5 block w-full rounded-2xl border-gray-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                    required
                                />
                                {errors.reason && (
                                    <p className="mt-1 text-xs text-red-600">{errors.reason}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingUser(null)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.reason.trim()}
                                    className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
