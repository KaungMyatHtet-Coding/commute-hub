import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
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
    vehicle_photo_path?: string | null;
}

interface ApplicationUser {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    gender?: string | null;
    nrc_number?: string | null;
    nrc_front_path?: string | null;
    nrc_back_path?: string | null;
    passport_photo_path?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    driver_license_number: string;
    driver_license_photo_path?: string | null;
    driver_verification_status: string;
    driver_rejection_reason?: string | null;
    driver_applied_at?: string | null;
    driver_verified_at?: string | null;
    pending_profile_data?: Record<string, any> | null;
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
        profile_updates: number;
    };
    currentFilter: 'pending' | 'verified' | 'rejected' | 'profile_updates' | string;
}

export default function Index({ applications, counts, currentFilter }: Props) {
    const [confirmModalState, setConfirmModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText: string;
        confirmColor: 'emerald' | 'red' | 'indigo' | 'purple';
        action: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        confirmColor: 'indigo',
        action: () => {},
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [rejectingUser, setRejectingUser] = useState<ApplicationUser | null>(null);
    const [rejectingProfileUser, setRejectingProfileUser] = useState<ApplicationUser | null>(null);

    const { data, setData, patch, processing, errors, reset } = useForm({
        reason: '',
    });

    const handleApproveDriver = (user: ApplicationUser) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Approve Driver Verification',
            message: `Are you sure you want to approve driver verification for ${user.name}? This will grant them the Driver role and verify their registered vehicle.`,
            confirmText: 'Approve Driver',
            confirmColor: 'emerald',
            action: () => {
                router.patch(route('admin.verifications.approve', user.id), {}, { preserveScroll: true });
            },
        });
    };

    const handleRejectDriverSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingUser) return;

        patch(route('admin.verifications.reject', rejectingUser.id), {
            preserveScroll: true,
            onSuccess: () => setRejectingUser(null),
        });
    };

    const handleApproveProfile = (user: ApplicationUser) => {
        setConfirmModalState({
            isOpen: true,
            title: 'Approve Profile Update',
            message: `Approve requested profile details for ${user.name}? This will immediately update their core identity records.`,
            confirmText: 'Approve Changes',
            confirmColor: 'indigo',
            action: () => {
                router.patch(route('admin.verifications.profile.approve', user.id), {}, { preserveScroll: true });
            },
        });
    };

    const handleRejectProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingProfileUser) return;

        patch(route('admin.verifications.profile.reject', rejectingProfileUser.id), {
            preserveScroll: true,
            onSuccess: () => setRejectingProfileUser(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href={route('admin.dashboard')} className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:underline">
                                ← Admin Dashboard
                            </Link>
                        </div>
                        <h2 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Driver & KYC Verifications</h2>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-2 rounded-2xl bg-gray-100 dark:bg-slate-800 p-1.5 flex-wrap">
                        <Link
                            href={route('admin.verifications.index', { status: 'pending' })}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                currentFilter === 'pending'
                                    ? 'bg-white dark:bg-[#1C1C22] text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Pending Drivers
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                currentFilter === 'pending' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                            }`}>
                                {counts.pending}
                            </span>
                        </Link>

                        <Link
                            href={route('admin.verifications.index', { status: 'verified' })}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                currentFilter === 'verified'
                                    ? 'bg-white dark:bg-[#1C1C22] text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Verified Drivers
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                currentFilter === 'verified' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                            }`}>
                                {counts.verified}
                            </span>
                        </Link>

                        <Link
                            href={route('admin.verifications.index', { status: 'rejected' })}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                currentFilter === 'rejected'
                                    ? 'bg-white dark:bg-[#1C1C22] text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Rejected
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                currentFilter === 'rejected' ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                            }`}>
                                {counts.rejected}
                            </span>
                        </Link>

                        <Link
                            href={route('admin.verifications.index', { status: 'profile_updates' })}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                currentFilter === 'profile_updates'
                                    ? 'bg-white dark:bg-[#1C1C22] text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            Profile Edits
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                                currentFilter === 'profile_updates' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                            }`}>
                                {counts.profile_updates}
                            </span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Driver & KYC Verifications" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#1C1C22] shadow-sm ring-1 ring-gray-100 dark:ring-slate-800">
                        <div className="border-b border-gray-100 dark:border-slate-800 px-6 py-5">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {currentFilter === 'profile_updates'
                                    ? 'Pending Profile Update Requests'
                                    : currentFilter === 'pending'
                                    ? 'Pending Driver Applications'
                                    : currentFilter === 'verified'
                                    ? 'Approved Drivers'
                                    : 'Rejected Driver Applications'}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-[#A1A1AA]">
                                Inspect license IDs, registered vehicles, and visual document thumbnails for anti-spoofing verification.
                            </p>
                        </div>

                        {applications.data.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                {applications.data.map((user) => {
                                    const vehicle = user.vehicles?.[0];
                                    const isPending = user.driver_verification_status === 'pending' || user.driver_verification_status === 'pending_verification';

                                    // Special View for Profile Updates
                                    if (currentFilter === 'profile_updates' && user.pending_profile_data) {
                                        const p = user.pending_profile_data;
                                        return (
                                            <div key={user.id} className="p-6 transition hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                                    <div className="space-y-3 flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white shadow-sm">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-base font-bold text-gray-900 dark:text-white">{user.name}</h4>
                                                                <p className="text-xs text-gray-500 dark:text-[#A1A1AA]">{user.email} · Submitted {p.submitted_at || 'Recently'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Diff table */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                            <div className="rounded-2xl bg-gray-50 dark:bg-slate-900/70 p-3 ring-1 ring-gray-100 dark:ring-slate-800">
                                                                <span className="font-bold text-gray-500 dark:text-slate-400 block uppercase text-[10px] tracking-wider">Current Info</span>
                                                                <p className="text-gray-700 dark:text-slate-300 mt-1"><span className="font-semibold text-gray-900 dark:text-white">Phone:</span> {user.phone || 'N/A'}</p>
                                                                <p className="text-gray-700 dark:text-slate-300"><span className="font-semibold text-gray-900 dark:text-white">Gender:</span> {user.gender || 'N/A'}</p>
                                                                <p className="text-gray-700 dark:text-slate-300"><span className="font-semibold text-gray-900 dark:text-white">NRC:</span> {user.nrc_number || 'N/A'}</p>
                                                                <p className="text-gray-700 dark:text-slate-300"><span className="font-semibold text-gray-900 dark:text-white">Emergency:</span> {user.emergency_contact_name || 'N/A'} ({user.emergency_contact_phone || 'N/A'})</p>
                                                            </div>

                                                            <div className="rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 p-3 ring-1 ring-indigo-100 dark:ring-indigo-900/50">
                                                                <span className="font-bold text-indigo-700 dark:text-indigo-400 block uppercase text-[10px] tracking-wider">Requested Changes</span>
                                                                <p className="text-indigo-900 dark:text-indigo-200 mt-1"><span className="font-semibold">Phone:</span> {p.phone || user.phone}</p>
                                                                <p className="text-indigo-900 dark:text-indigo-200"><span className="font-semibold">Gender:</span> {p.gender || user.gender}</p>
                                                                <p className="text-indigo-900 dark:text-indigo-200"><span className="font-semibold">NRC:</span> {p.nrc_number || user.nrc_number}</p>
                                                                <p className="text-indigo-900 dark:text-indigo-200"><span className="font-semibold">Emergency:</span> {p.emergency_contact_name || user.emergency_contact_name} ({p.emergency_contact_phone || user.emergency_contact_phone})</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2.5">
                                                        <button
                                                            onClick={() => handleApproveProfile(user)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                                                        >
                                                            Approve Update
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRejectingProfileUser(user);
                                                                reset();
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={user.id} className="p-6 transition hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                                                {/* Left: Driver and Verification Details */}
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 font-bold text-white shadow-sm text-lg">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-base font-bold text-gray-900 dark:text-white">{user.name}</h4>
                                                                <span
                                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                                        user.driver_verification_status === 'verified'
                                                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-900/50'
                                                                            : isPending
                                                                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-200 dark:ring-amber-900/50'
                                                                            : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-900/50'
                                                                    }`}
                                                                >
                                                                    {user.driver_verification_status === 'verified'
                                                                        ? 'Verified'
                                                                        : isPending
                                                                        ? 'Pending Verification'
                                                                        : 'Rejected'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-[#A1A1AA]">
                                                                {user.email} · Phone: <span className="font-semibold text-gray-700 dark:text-slate-300">{user.phone || 'N/A'}</span> · Gender: <span className="font-semibold text-gray-700 dark:text-slate-300">{user.gender || 'N/A'}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Identification & Vehicle specs badge bar */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                        <div className="rounded-2xl bg-gray-50 dark:bg-slate-900/70 p-3 ring-1 ring-gray-100 dark:ring-slate-800 space-y-1">
                                                            <span className="font-semibold text-gray-500 dark:text-slate-400 block uppercase text-[10px] tracking-wider">
                                                                Legal Identification
                                                            </span>
                                                            <p className="text-gray-700 dark:text-slate-300">
                                                                <span className="font-medium text-gray-500 dark:text-slate-400">Driver License:</span>{' '}
                                                                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{user.driver_license_number || 'N/A'}</span>
                                                            </p>
                                                            <p className="text-gray-700 dark:text-slate-300">
                                                                <span className="font-medium text-gray-500 dark:text-slate-400">NRC Number:</span>{' '}
                                                                <span className="font-mono font-bold text-gray-900 dark:text-white">{user.nrc_number || 'N/A'}</span>
                                                            </p>
                                                            {user.emergency_contact_name && (
                                                                <p className="text-gray-500 dark:text-slate-400 text-[11px]">
                                                                    Emergency: {user.emergency_contact_name} ({user.emergency_contact_phone})
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="rounded-2xl bg-gray-50 dark:bg-slate-900/70 p-3 ring-1 ring-gray-100 dark:ring-slate-800 space-y-1">
                                                            <span className="font-semibold text-gray-500 dark:text-slate-400 block uppercase text-[10px] tracking-wider">
                                                                Registered Vehicle
                                                            </span>
                                                            {vehicle ? (
                                                                <div>
                                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                                        {vehicle.make} {vehicle.model}
                                                                        {vehicle.color ? ` (${vehicle.color})` : ''}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-slate-400">
                                                                        <span className="font-mono font-semibold text-gray-700 dark:text-slate-300">{vehicle.license_plate}</span>
                                                                        <span>·</span>
                                                                        <span>{vehicle.seat_capacity} seats</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="italic text-gray-400 dark:text-slate-500">No vehicle registered</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Document Thumbnails Preview Bar */}
                                                    <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 p-3">
                                                        <span className="font-bold text-gray-500 dark:text-slate-400 block uppercase text-[10px] tracking-wider mb-2">
                                                            Visual Verification Thumbnails (Click to view full image)
                                                        </span>
                                                        <div className="flex items-center gap-3 overflow-x-auto pb-1">
                                                            {/* Passport Photo */}
                                                            {user.passport_photo_path && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedImage(`/storage/${user.passport_photo_path}`)}
                                                                    className="group relative flex flex-col items-center gap-1 shrink-0"
                                                                >
                                                                    <img
                                                                        src={`/storage/${user.passport_photo_path}`}
                                                                        alt="Passport"
                                                                        className="h-14 w-14 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-slate-700 group-hover:ring-indigo-500 transition"
                                                                    />
                                                                    <span className="text-[10px] text-gray-500 dark:text-slate-400">Passport</span>
                                                                </button>
                                                            )}

                                                            {/* NRC Front */}
                                                            {user.nrc_front_path && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedImage(`/storage/${user.nrc_front_path}`)}
                                                                    className="group relative flex flex-col items-center gap-1 shrink-0"
                                                                >
                                                                    <img
                                                                        src={`/storage/${user.nrc_front_path}`}
                                                                        alt="NRC Front"
                                                                        className="h-14 w-20 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-slate-700 group-hover:ring-indigo-500 transition"
                                                                    />
                                                                    <span className="text-[10px] text-gray-500 dark:text-slate-400">NRC Front</span>
                                                                </button>
                                                            )}

                                                            {/* NRC Back */}
                                                            {user.nrc_back_path && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedImage(`/storage/${user.nrc_back_path}`)}
                                                                    className="group relative flex flex-col items-center gap-1 shrink-0"
                                                                >
                                                                    <img
                                                                        src={`/storage/${user.nrc_back_path}`}
                                                                        alt="NRC Back"
                                                                        className="h-14 w-20 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-slate-700 group-hover:ring-indigo-500 transition"
                                                                    />
                                                                    <span className="text-[10px] text-gray-500 dark:text-slate-400">NRC Back</span>
                                                                </button>
                                                            )}

                                                            {/* Driver License Photo */}
                                                            {user.driver_license_photo_path && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedImage(`/storage/${user.driver_license_photo_path}`)}
                                                                    className="group relative flex flex-col items-center gap-1 shrink-0"
                                                                >
                                                                    <img
                                                                        src={`/storage/${user.driver_license_photo_path}`}
                                                                        alt="Driver License"
                                                                        className="h-14 w-20 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-slate-700 group-hover:ring-indigo-500 transition"
                                                                    />
                                                                    <span className="text-[10px] text-gray-500 dark:text-slate-400">License Card</span>
                                                                </button>
                                                            )}

                                                            {/* Vehicle Photo */}
                                                            {vehicle?.vehicle_photo_path && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedImage(`/storage/${vehicle.vehicle_photo_path}`)}
                                                                    className="group relative flex flex-col items-center gap-1 shrink-0"
                                                                >
                                                                    <img
                                                                        src={`/storage/${vehicle.vehicle_photo_path}`}
                                                                        alt="Vehicle"
                                                                        className="h-14 w-20 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-slate-700 group-hover:ring-indigo-500 transition"
                                                                    />
                                                                    <span className="text-[10px] text-gray-500 dark:text-slate-400">Vehicle Photo</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Show rejection reason if rejected */}
                                                    {user.driver_verification_status === 'rejected' && user.driver_rejection_reason && (
                                                        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/40 p-3 text-xs text-red-800 dark:text-red-300">
                                                            <span className="font-bold">Rejection Note:</span> {user.driver_rejection_reason}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex items-center gap-2.5 sm:self-center">
                                                    {user.driver_verification_status !== 'verified' && (
                                                        <button
                                                            onClick={() => handleApproveDriver(user)}
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
                                                            onClick={() => {
                                                                setRejectingUser(user);
                                                                reset();
                                                            }}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
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
                                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">No applications found in this section</p>
                                <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">Applications will appear here when commuters submit requests.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Lightbox Modal for Photo Thumbnails */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-3xl overflow-hidden rounded-2xl bg-white dark:bg-[#1C1C22] p-2 shadow-2xl ring-1 ring-gray-100 dark:ring-slate-800">
                        <img src={selectedImage} alt="Document Preview" className="max-h-[80vh] w-auto rounded-xl object-contain" />
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Tailwind Confirm Dialog Modal */}
            <ConfirmModal
                isOpen={confirmModalState.isOpen}
                title={confirmModalState.title}
                message={confirmModalState.message}
                confirmText={confirmModalState.confirmText}
                confirmColor={confirmModalState.confirmColor}
                onConfirm={confirmModalState.action}
                onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
            />

            {/* Driver Rejection Reason Modal */}
            {rejectingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-[#1C1C22] shadow-xl ring-1 ring-gray-100 dark:ring-slate-800">
                        <div className="border-b border-gray-100 dark:border-slate-800 px-6 py-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Reject Driver Application
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-[#A1A1AA]">
                                Rejecting <span className="font-semibold text-gray-800 dark:text-gray-200">{rejectingUser.name}</span>
                            </p>
                        </div>

                        <form onSubmit={handleRejectDriverSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                                    Reason for Rejection <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="e.g. Invalid license plate format or expired driving license."
                                    className="mt-1.5 block w-full rounded-2xl border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                    required
                                />
                                {errors.reason && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reason}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingUser(null)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.reason.trim()}
                                    className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
                                >
                                    {processing ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Update Rejection Reason Modal */}
            {rejectingProfileUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-[#1C1C22] shadow-xl ring-1 ring-gray-100 dark:ring-slate-800">
                        <div className="border-b border-gray-100 dark:border-slate-800 px-6 py-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Reject Profile Update Request
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-[#A1A1AA]">
                                Rejecting changes for <span className="font-semibold text-gray-800 dark:text-gray-200">{rejectingProfileUser.name}</span>
                            </p>
                        </div>

                        <form onSubmit={handleRejectProfileSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">
                                    Reason for Rejection <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    placeholder="e.g. NRC number mismatch or blurry document."
                                    className="mt-1.5 block w-full rounded-2xl border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                    required
                                />
                                {errors.reason && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.reason}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingProfileUser(null)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.reason.trim()}
                                    className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
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
