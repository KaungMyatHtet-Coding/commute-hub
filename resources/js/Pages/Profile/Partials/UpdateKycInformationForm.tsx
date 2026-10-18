import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

export default function UpdateKycInformationForm({ className = '' }: { className?: string }) {
    const user = usePage().props.auth.user;
    const isVerified = user.kyc_status === 'verified';
    const isPending = user.kyc_status === 'pending';
    const isRejected = user.kyc_status === 'rejected';

    const updatesCount = user.profile_updates_this_month ?? 0;
    const hasPendingChanges = Boolean(user.pending_profile_data);

    const [previews, setPreviews] = useState<{
        passport_photo?: string | null;
        nrc_front?: string | null;
        nrc_back?: string | null;
        payment_qr?: string | null;
    }>({
        passport_photo: user.passport_photo_path ? `/storage/${user.passport_photo_path}` : null,
        nrc_front: user.nrc_front_path ? `/storage/${user.nrc_front_path}` : null,
        nrc_back: user.nrc_back_path ? `/storage/${user.nrc_back_path}` : null,
        payment_qr: user.payment_qr_path ? `/storage/${user.payment_qr_path}` : null,
    });

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<{
        name: string;
        email: string;
        phone: string;
        gender: string;
        nrc_number: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
        passport_photo: File | null;
        nrc_front: File | null;
        nrc_back: File | null;
        payment_qr: File | null;
    }>({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'male',
        nrc_number: user.nrc_number || '',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        passport_photo: null,
        nrc_front: null,
        nrc_back: null,
        payment_qr: null,
    });

    const [fileNames, setFileNames] = useState<{
        passport_photo?: string | null;
        nrc_front?: string | null;
        nrc_back?: string | null;
        payment_qr?: string | null;
    }>({});

    const handleFileChange = (field: 'passport_photo' | 'nrc_front' | 'nrc_back' | 'payment_qr', file: File | null) => {
        setData(field, file);
        setFileNames((prev) => ({ ...prev, [field]: file ? file.name : null }));
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews((prev) => ({ ...prev, [field]: e.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <section className={className}>
            <header className="border-b border-gray-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Identity Verification (KYC) & Safety Profile
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Mandatory identity verification required before posting or booking carpooling rides.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
                                isVerified
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                    : isPending
                                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                    : isRejected
                                    ? 'bg-red-50 text-red-700 ring-red-200'
                                    : 'bg-gray-100 text-gray-700 ring-gray-200'
                            }`}
                        >
                            {isVerified
                                ? '✓ Verified Identity'
                                : isPending
                                ? '⏳ Verification Pending'
                                : isRejected
                                ? '✕ Verification Rejected'
                                : '⚠ Incomplete KYC'}
                        </span>
                    </div>
                </div>

                {/* 2-per-month Limit & Pending Approval Banners */}
                {isVerified && (
                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-indigo-50/70 p-3.5 text-xs text-indigo-900 ring-1 ring-indigo-100">
                        <span className="font-medium">
                            Profile Updates this month: <span className="font-bold">{updatesCount} / 2</span>
                        </span>
                        <span className="text-indigo-600">
                            Updates are limited to 2 times per month for security and fraud prevention.
                        </span>
                    </div>
                )}

                {hasPendingChanges && (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                        <div className="flex items-start gap-2">
                            <span className="font-bold">Pending Admin Review:</span>
                            <span>Your profile update request has been submitted and is awaiting Admin approval. Core verified details remain active until approved.</span>
                        </div>
                    </div>
                )}

                {isRejected && user.kyc_rejection_reason && (
                    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">
                        <span className="font-bold">Rejection Reason:</span> {user.kyc_rejection_reason}
                    </div>
                )}
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Section 1: Personal Info */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="name" value="Full Name" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full rounded-xl"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError className="mt-1" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email Address" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full rounded-xl"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError className="mt-1" message={errors.email} />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="Phone Number (e.g. 09123456789)" />
                        <TextInput
                            id="phone"
                            className="mt-1 block w-full rounded-xl"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="09..."
                            required
                        />
                        <InputError className="mt-1" message={errors.phone} />
                    </div>

                    <div>
                        <InputLabel htmlFor="gender" value="Gender" />
                        <select
                            id="gender"
                            className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                            required
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <InputError className="mt-1" message={errors.gender} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="nrc_number" value="National Registration Card (NRC) Number" />
                        <TextInput
                            id="nrc_number"
                            className="mt-1 block w-full rounded-xl font-mono uppercase"
                            value={data.nrc_number}
                            onChange={(e) => setData('nrc_number', e.target.value)}
                            placeholder="e.g. 12/LAMATA(N)123456"
                            required
                        />
                        <InputError className="mt-1" message={errors.nrc_number} />
                    </div>
                </div>

                {/* Section 2: Emergency Contact */}
                <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                        Emergency Safety Contact
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="emergency_contact_name" value="Emergency Contact Full Name" />
                            <TextInput
                                id="emergency_contact_name"
                                className="mt-1 block w-full rounded-xl"
                                value={data.emergency_contact_name}
                                onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                placeholder="Parent, spouse, or sibling"
                                required
                            />
                            <InputError className="mt-1" message={errors.emergency_contact_name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="emergency_contact_phone" value="Emergency Contact Phone" />
                            <TextInput
                                id="emergency_contact_phone"
                                className="mt-1 block w-full rounded-xl"
                                value={data.emergency_contact_phone}
                                onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                placeholder="09..."
                                required
                            />
                            <InputError className="mt-1" message={errors.emergency_contact_phone} />
                        </div>
                    </div>
                </div>

                {/* Section 3: Anti-Spoofing Document & Photo Uploads */}
                <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                        Identity Verification Documents & Photos
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                        Upload high-clarity photos. Accepted formats: JPG, JPEG, PNG, WEBP (max 2MB each).
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* 1. Passport-style photo */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 p-4">
                            <InputLabel value="1. Passport-style Face Photo" />
                            <div className="mt-2 flex items-center gap-3">
                                {previews.passport_photo ? (
                                    <img
                                        src={previews.passport_photo}
                                        alt="Passport Preview"
                                        className="h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-indigo-500"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <label className="inline-flex cursor-pointer items-center rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-sm">
                                        Choose Photo
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(e) => handleFileChange('passport_photo', e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="mt-1 block truncate text-xs text-gray-500" title={fileNames.passport_photo || undefined}>
                                        {fileNames.passport_photo || (user.passport_photo_path ? 'Current photo saved' : 'No file chosen')}
                                    </span>
                                </div>
                            </div>
                            <InputError className="mt-1" message={errors.passport_photo} />
                        </div>

                        {/* 2. NRC Front Photo */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 p-4">
                            <InputLabel value="2. NRC Front Card Photo" />
                            <div className="mt-2 flex items-center gap-3">
                                {previews.nrc_front ? (
                                    <img
                                        src={previews.nrc_front}
                                        alt="NRC Front"
                                        className="h-16 w-20 shrink-0 rounded-xl object-cover ring-2 ring-indigo-500"
                                    />
                                ) : (
                                    <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                        <span className="text-[10px] font-bold">NRC Front</span>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <label className="inline-flex cursor-pointer items-center rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-sm">
                                        Choose Photo
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(e) => handleFileChange('nrc_front', e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="mt-1 block truncate text-xs text-gray-500" title={fileNames.nrc_front || undefined}>
                                        {fileNames.nrc_front || (user.nrc_front_path ? 'Current photo saved' : 'No file chosen')}
                                    </span>
                                </div>
                            </div>
                            <InputError className="mt-1" message={errors.nrc_front} />
                        </div>

                        {/* 3. NRC Back Photo */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 p-4">
                            <InputLabel value="3. NRC Back Card Photo" />
                            <div className="mt-2 flex items-center gap-3">
                                {previews.nrc_back ? (
                                    <img
                                        src={previews.nrc_back}
                                        alt="NRC Back"
                                        className="h-16 w-20 shrink-0 rounded-xl object-cover ring-2 ring-indigo-500"
                                    />
                                ) : (
                                    <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                        <span className="text-[10px] font-bold">NRC Back</span>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <label className="inline-flex cursor-pointer items-center rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-sm">
                                        Choose Photo
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(e) => handleFileChange('nrc_back', e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="mt-1 block truncate text-xs text-gray-500" title={fileNames.nrc_back || undefined}>
                                        {fileNames.nrc_back || (user.nrc_back_path ? 'Current photo saved' : 'No file chosen')}
                                    </span>
                                </div>
                            </div>
                            <InputError className="mt-1" message={errors.nrc_back} />
                        </div>

                        {/* 4. Payment QR (KPay / WavePay) */}
                        <div className="overflow-hidden rounded-2xl border border-gray-200 p-4">
                            <InputLabel value="4. Payment QR Code (KPay / WavePay - Optional)" />
                            <div className="mt-2 flex items-center gap-3">
                                {previews.payment_qr ? (
                                    <img
                                        src={previews.payment_qr}
                                        alt="Payment QR"
                                        className="h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-indigo-500"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                        <span className="text-[10px] font-bold">QR</span>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <label className="inline-flex cursor-pointer items-center rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-sm">
                                        Choose QR Image
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(e) => handleFileChange('payment_qr', e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="mt-1 block truncate text-xs text-gray-500" title={fileNames.payment_qr || undefined}>
                                        {fileNames.payment_qr || (user.payment_qr_path ? 'Current QR saved' : 'No file chosen')}
                                    </span>
                                </div>
                            </div>
                            <InputError className="mt-1" message={errors.payment_qr} />
                        </div>
                    </div>
                </div>

                {(errors as Record<string, string | undefined>).profile_limit && (
                    <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                        {(errors as Record<string, string | undefined>).profile_limit}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing || (isVerified && updatesCount >= 2)}>
                        {processing
                            ? 'Submitting...'
                            : isVerified
                            ? 'Request Profile Update'
                            : 'Submit KYC Verification'}
                    </PrimaryButton>

                    {recentlySuccessful && (
                        <p className="text-xs font-semibold text-emerald-600">Saved successfully.</p>
                    )}
                </div>
            </form>
        </section>
    );
}
