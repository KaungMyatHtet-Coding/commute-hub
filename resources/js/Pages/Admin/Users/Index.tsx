import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Vehicle {
    id: number;
    make: string;
    model: string;
    color?: string | null;
    license_plate: string;
    seat_capacity: number;
    is_verified?: boolean;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    gender?: string | null;
    nrc_number?: string | null;
    nrc_front_path?: string | null;
    nrc_back_path?: string | null;
    passport_photo_path?: string | null;
    driver_license_number?: string | null;
    driver_license_photo_path?: string | null;
    payment_qr_path?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    kyc_status: string;
    driver_verification_status?: string | null;
    is_blocked: boolean;
    blocked_reason?: string | null;
    roles: string[];
    vehicles: Vehicle[];
    rides_offered_count: number;
    bookings_made_count: number;
    average_rating: number;
    review_count: number;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props extends PageProps {
    users: PaginatedData<UserItem>;
    filters: {
        tab: string;
        search?: string | null;
    };
    counts: {
        all: number;
        drivers: number;
        passengers: number;
        pending_kyc: number;
        blocked: number;
    };
}

export default function Index({ auth, users, filters, counts }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    const [inspectPhoto, setInspectPhoto] = useState<{ src: string; title: string } | null>(null);

    // Block modal state
    const [blockingUser, setBlockingUser] = useState<UserItem | null>(null);
    const [blockReason, setBlockReason] = useState('');
    const [blockError, setBlockError] = useState('');

    // Unblock modal state
    const [unblockingUser, setUnblockingUser] = useState<UserItem | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.users.index'),
            { tab: filters.tab, search: searchQuery || undefined },
            { preserveState: true }
        );
    };

    const handleTabChange = (newTab: string) => {
        router.get(
            route('admin.users.index'),
            { tab: newTab, search: searchQuery || undefined },
            { preserveState: true }
        );
    };

    const handleConfirmBlock = () => {
        if (!blockingUser) return;
        if (!blockReason.trim()) {
            setBlockError('Please provide a reason for blocking this user.');
            return;
        }

        router.patch(
            route('admin.users.toggle-block', blockingUser.id),
            { reason: blockReason },
            {
                onSuccess: () => {
                    setBlockingUser(null);
                    setBlockReason('');
                    setBlockError('');
                },
            }
        );
    };

    const handleConfirmUnblock = () => {
        if (!unblockingUser) return;
        router.patch(
            route('admin.users.toggle-block', unblockingUser.id),
            {},
            {
                onSuccess: () => {
                    setUnblockingUser(null);
                },
            }
        );
    };

    const tabs = [
        { key: 'all', label: 'All Users', count: counts.all },
        { key: 'drivers', label: 'Drivers', count: counts.drivers },
        { key: 'passengers', label: 'Passengers', count: counts.passengers },
        { key: 'pending_kyc', label: 'Pending KYC', count: counts.pending_kyc },
        { key: 'blocked', label: 'Blocked / Suspended', count: counts.blocked },
    ];

    return (
        <AuthenticatedLayout header="User Management & Governance">
            <Head title="User Management - Admin Governance" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Header bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform User Management</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Inspect user credentials, oversee KYC verification, enforce safety compliance, and manage account suspensions.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('admin.dashboard')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                            >
                                ← Admin Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Filter Tabs & Search Bar */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                            {/* Filter Tabs */}
                            <div className="flex flex-wrap gap-2">
                                {tabs.map((tab) => {
                                    const active = filters.tab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleTabChange(tab.key)}
                                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                                                active
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {tab.label}
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                                    active ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-700'
                                                }`}
                                            >
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-72">
                                    <input
                                        type="text"
                                        placeholder="Search name, email, phone, NRC..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full text-xs rounded-xl border-gray-200 pl-8 pr-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <svg
                                        className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                                >
                                    Search
                                </button>
                                {filters.search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            router.get(
                                                route('admin.users.index'),
                                                { tab: filters.tab },
                                                { preserveState: true }
                                            );
                                        }}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium transition"
                                    >
                                        Clear
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Users Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-3">User</th>
                                        <th className="py-3 px-3">Roles</th>
                                        <th className="py-3 px-3">KYC & Verification</th>
                                        <th className="py-3 px-3">Activity</th>
                                        <th className="py-3 px-3">Rating</th>
                                        <th className="py-3 px-3">Status</th>
                                        <th className="py-3 px-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-gray-400">
                                                No users found matching current filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50/60 transition">
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-3">
                                                        {user.passport_photo_path ? (
                                                            <img
                                                                src={`/storage/${user.passport_photo_path}`}
                                                                alt={user.name}
                                                                className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                                                            />
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs ring-2 ring-gray-100">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{user.name}</div>
                                                            <div className="text-gray-400 text-[11px]">{user.email}</div>
                                                            {user.phone && (
                                                                <div className="text-gray-500 text-[10px] font-mono">{user.phone}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Roles */}
                                                <td className="py-3.5 px-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((r) => (
                                                            <span
                                                                key={r}
                                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                    r === 'admin'
                                                                        ? 'bg-purple-100 text-purple-700'
                                                                        : r === 'driver'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-emerald-100 text-emerald-700'
                                                                }`}
                                                            >
                                                                {r}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* KYC & Verification */}
                                                <td className="py-3.5 px-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] text-gray-400">KYC:</span>
                                                            <span
                                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                                                    user.kyc_status === 'verified'
                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                        : user.kyc_status === 'pending'
                                                                        ? 'bg-amber-50 text-amber-700'
                                                                        : user.kyc_status === 'rejected'
                                                                        ? 'bg-red-50 text-red-700'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                }`}
                                                            >
                                                                {user.kyc_status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        {user.driver_verification_status && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] text-gray-400">Driver:</span>
                                                                <span
                                                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                                                        user.driver_verification_status === 'verified'
                                                                            ? 'bg-emerald-50 text-emerald-700'
                                                                            : user.driver_verification_status === 'pending' ||
                                                                              user.driver_verification_status === 'pending_verification'
                                                                            ? 'bg-amber-50 text-amber-700'
                                                                            : 'bg-gray-100 text-gray-600'
                                                                    }`}
                                                                >
                                                                    {user.driver_verification_status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Activity */}
                                                <td className="py-3.5 px-3">
                                                    <div className="text-[11px] text-gray-700">
                                                        <div>
                                                            <span className="font-semibold text-gray-900">{user.rides_offered_count}</span>{' '}
                                                            <span className="text-gray-400">rides driven</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-gray-900">{user.bookings_made_count}</span>{' '}
                                                            <span className="text-gray-400">bookings</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Rating */}
                                                <td className="py-3.5 px-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-amber-500 font-bold">★ {user.average_rating}</span>
                                                        <span className="text-gray-400 text-[10px]">({user.review_count})</span>
                                                    </div>
                                                </td>

                                                {/* Status (Blocked or Active) */}
                                                <td className="py-3.5 px-3">
                                                    {user.is_blocked ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                            Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Active
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-3 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedUser(user)}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                                        >
                                                            Inspect Profile
                                                        </button>

                                                        {user.id !== auth.user.id && (
                                                            user.is_blocked ? (
                                                                <button
                                                                    onClick={() => setUnblockingUser(user)}
                                                                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                                                >
                                                                    Unblock
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setBlockingUser(user);
                                                                        setBlockReason('');
                                                                        setBlockError('');
                                                                    }}
                                                                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition"
                                                                >
                                                                    Block User
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs">
                                <span className="text-gray-500">
                                    Showing page {users.current_page} of {users.last_page} ({users.total} total)
                                </span>
                                <div className="flex items-center gap-1">
                                    {users.links.map((link, idx) => (
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

            {/* Profile & KYC Inspector Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-100 my-8">
                        {/* Modal Header */}
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                {selectedUser.passport_photo_path ? (
                                    <img
                                        src={`/storage/${selectedUser.passport_photo_path}`}
                                        alt={selectedUser.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">{selectedUser.name}</h3>
                                    <p className="text-xs text-gray-500">User ID #{selectedUser.id} • Joined {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* Block warning banner if blocked */}
                            {selectedUser.is_blocked && (
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
                                    <div className="font-bold mb-1">Account Suspended / Blocked</div>
                                    <div>Reason: {selectedUser.blocked_reason || 'No specific reason provided.'}</div>
                                </div>
                            )}

                            {/* Essential Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-700 text-xs uppercase tracking-wider">Contact & Profile</div>
                                    <div className="flex justify-between"><span className="text-gray-400">Email:</span> <span className="font-medium text-gray-900">{selectedUser.email}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Phone:</span> <span className="font-medium text-gray-900 font-mono">{selectedUser.phone || 'N/A'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Gender:</span> <span className="font-medium text-gray-900 capitalize">{selectedUser.gender || 'N/A'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Roles:</span> <span className="font-medium text-gray-900 capitalize">{selectedUser.roles.join(', ')}</span></div>
                                </div>

                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                                    <div className="font-bold text-gray-700 text-xs uppercase tracking-wider">Emergency Contact & Safety</div>
                                    <div className="flex justify-between"><span className="text-gray-400">Contact Name:</span> <span className="font-medium text-gray-900">{selectedUser.emergency_contact_name || 'Not set'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Contact Phone:</span> <span className="font-medium text-gray-900 font-mono">{selectedUser.emergency_contact_phone || 'Not set'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Average Rating:</span> <span className="font-bold text-amber-600">★ {selectedUser.average_rating} ({selectedUser.review_count} reviews)</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Activity Stats:</span> <span className="font-medium text-gray-900">{selectedUser.rides_offered_count} driven / {selectedUser.bookings_made_count} booked</span></div>
                                </div>
                            </div>

                            {/* KYC Documents Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">National Identity (NRC) & KYC</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        selectedUser.kyc_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                        selectedUser.kyc_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        Status: {selectedUser.kyc_status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                                    <span className="text-gray-400">NRC Number:</span>{' '}
                                    <span className="font-mono font-bold text-gray-900">{selectedUser.nrc_number || 'Not provided'}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[11px] font-semibold text-gray-500 mb-1">NRC Front Document</div>
                                        {selectedUser.nrc_front_path ? (
                                            <div
                                                onClick={() => setInspectPhoto({ src: `/storage/${selectedUser.nrc_front_path}`, title: 'NRC Front Photo' })}
                                                className="cursor-pointer group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 h-40 flex items-center justify-center"
                                            >
                                                <img
                                                    src={`/storage/${selectedUser.nrc_front_path}`}
                                                    alt="NRC Front"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                                                    Click to Zoom
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-40 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
                                                No NRC Front Uploaded
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <div className="text-[11px] font-semibold text-gray-500 mb-1">NRC Back Document</div>
                                        {selectedUser.nrc_back_path ? (
                                            <div
                                                onClick={() => setInspectPhoto({ src: `/storage/${selectedUser.nrc_back_path}`, title: 'NRC Back Photo' })}
                                                className="cursor-pointer group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 h-40 flex items-center justify-center"
                                            >
                                                <img
                                                    src={`/storage/${selectedUser.nrc_back_path}`}
                                                    alt="NRC Back"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                                                    Click to Zoom
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-40 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
                                                No NRC Back Uploaded
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Driver License & Vehicles (if applicable) */}
                            {(selectedUser.driver_license_number || selectedUser.vehicles.length > 0) && (
                                <div className="space-y-3 border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Driver Credentials & Vehicles</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            selectedUser.driver_verification_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                            selectedUser.driver_verification_status === 'pending' || selectedUser.driver_verification_status === 'pending_verification' ? 'bg-amber-100 text-amber-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            Status: {(selectedUser.driver_verification_status || 'N/A').toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                                            <div>
                                                <span className="text-gray-400">License Number:</span>{' '}
                                                <span className="font-mono font-bold text-gray-900">{selectedUser.driver_license_number || 'N/A'}</span>
                                            </div>
                                            {selectedUser.driver_license_photo_path && (
                                                <div
                                                    onClick={() => setInspectPhoto({ src: `/storage/${selectedUser.driver_license_photo_path}`, title: 'Driver License' })}
                                                    className="mt-2 cursor-pointer group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 h-28 flex items-center justify-center"
                                                >
                                                    <img
                                                        src={`/storage/${selectedUser.driver_license_photo_path}`}
                                                        alt="Driver License"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                                                        Zoom License
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                                            <div className="font-semibold text-gray-700 mb-2">Registered Vehicles ({selectedUser.vehicles.length})</div>
                                            {selectedUser.vehicles.length === 0 ? (
                                                <div className="text-gray-400">No vehicles registered.</div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {selectedUser.vehicles.map((v) => (
                                                        <div key={v.id} className="p-2 bg-white rounded-xl border border-gray-200/60 flex items-center justify-between">
                                                            <div>
                                                                <div className="font-bold text-gray-900">{v.make} {v.model} ({v.color || 'Standard'})</div>
                                                                <div className="text-[10px] font-mono text-gray-500">{v.license_plate}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                                                    {v.seat_capacity} seats
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment QR if uploaded */}
                            {selectedUser.payment_qr_path && (
                                <div className="border-t border-gray-100 pt-4 space-y-2">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Payment QR (KPay / WavePay)</h4>
                                    <div
                                        onClick={() => setInspectPhoto({ src: `/storage/${selectedUser.payment_qr_path}`, title: 'Payment QR' })}
                                        className="w-32 h-32 cursor-pointer group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 flex items-center justify-center"
                                    >
                                        <img
                                            src={`/storage/${selectedUser.payment_qr_path}`}
                                            alt="Payment QR"
                                            className="w-full h-full object-contain p-1 group-hover:scale-105 transition"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                                            Zoom QR
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between">
                            <div>
                                {selectedUser.id !== auth.user.id && (
                                    selectedUser.is_blocked ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const u = selectedUser;
                                                setSelectedUser(null);
                                                setUnblockingUser(u);
                                            }}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                        >
                                            Unblock User Account
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const u = selectedUser;
                                                setSelectedUser(null);
                                                setBlockingUser(u);
                                                setBlockReason('');
                                                setBlockError('');
                                            }}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition"
                                        >
                                            Block / Suspend Account
                                        </button>
                                    )
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox / Zoomed Photo Modal */}
            {inspectPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
                    onClick={() => setInspectPhoto(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-3 border-b border-gray-100">
                            <span className="text-xs font-bold text-gray-800">{inspectPhoto.title}</span>
                            <button onClick={() => setInspectPhoto(null)} className="text-gray-400 hover:text-gray-600 text-sm font-bold px-2 py-1">✕</button>
                        </div>
                        <img
                            src={inspectPhoto.src}
                            alt={inspectPhoto.title}
                            className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg mt-2"
                        />
                    </div>
                </div>
            )}

            {/* Block Modal */}
            {blockingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-100">
                        <div className="border-b border-gray-100 px-6 py-4 bg-red-50/60">
                            <h3 className="text-base font-bold text-red-900">Suspend / Block User</h3>
                            <p className="text-xs text-red-600 mt-0.5">
                                User: {blockingUser.name} ({blockingUser.email})
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Blocking this user will immediately terminate their active session, cancel unfulfilled bookings, and prevent them from logging in.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                    Reason for Suspension <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={blockReason}
                                    onChange={(e) => {
                                        setBlockReason(e.target.value);
                                        setBlockError('');
                                    }}
                                    placeholder="e.g. Repeated ride cancellations, abusive behavior, failed KYC spoof verification..."
                                    rows={3}
                                    className="w-full text-xs rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                                />
                                {blockError && <p className="text-xs text-red-600 mt-1">{blockError}</p>}
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setBlockingUser(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmBlock}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
                                >
                                    Confirm Block
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Unblock Confirm Modal */}
            <ConfirmModal
                isOpen={!!unblockingUser}
                title="Restore User Account"
                message={
                    unblockingUser
                        ? `Are you sure you want to lift the suspension and restore access for ${unblockingUser.name}? They will immediately be permitted to log in and use the platform.`
                        : ''
                }
                confirmText="Unblock Account"
                confirmColor="emerald"
                onConfirm={handleConfirmUnblock}
                onClose={() => setUnblockingUser(null)}
            />
        </AuthenticatedLayout>
    );
}
