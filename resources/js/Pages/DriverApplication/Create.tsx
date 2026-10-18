import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import React, { useState } from 'react';

interface Props {
    status: 'not_applied' | 'pending' | 'pending_verification' | 'verified' | 'rejected' | string;
    rejectionReason?: string | null;
    existingVehicle?: {
        make: string;
        model: string;
        color?: string | null;
        manufacture_year?: number | null;
        license_plate: string;
        seat_capacity: number;
        vehicle_photo_path?: string | null;
    } | null;
    driverLicenseNumber?: string | null;
}

export default function Create({ status, rejectionReason, existingVehicle, driverLicenseNumber }: Props) {
    const user = usePage().props.auth.user;
    const isPending = status === 'pending_verification' || status === 'pending';
    const isRejected = status === 'rejected';

    const [previews, setPreviews] = useState<{
        driver_license_photo?: string | null;
        vehicle_photo?: string | null;
    }>({
        driver_license_photo: user.driver_license_photo_path ? `/storage/${user.driver_license_photo_path}` : null,
        vehicle_photo: existingVehicle?.vehicle_photo_path ? `/storage/${existingVehicle.vehicle_photo_path}` : null,
    });

    const [fileNames, setFileNames] = useState<{
        driver_license_photo?: string;
        vehicle_photo?: string;
    }>({});

    const { data, setData, post, processing, errors } = useForm<{
        driver_license_number: string;
        driver_license_photo: File | null;
        make: string;
        model: string;
        color: string;
        manufacture_year: string;
        license_plate: string;
        vehicle_photo: File | null;
        seat_capacity: string;
    }>({
        driver_license_number: driverLicenseNumber || user.driver_license_number || '',
        driver_license_photo: null,
        make: existingVehicle?.make || '',
        model: existingVehicle?.model || '',
        color: existingVehicle?.color || '',
        manufacture_year: existingVehicle?.manufacture_year ? String(existingVehicle.manufacture_year) : '',
        license_plate: existingVehicle?.license_plate || '',
        vehicle_photo: null,
        seat_capacity: existingVehicle?.seat_capacity ? String(existingVehicle.seat_capacity) : '4',
    });

    const handleFileChange = (field: 'driver_license_photo' | 'vehicle_photo', file: File | null) => {
        setData(field, file);
        setFileNames((prev) => ({ ...prev, [field]: file?.name }));
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
        post(route('driver-application.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-white">
                        Become a CommuteHub Driver
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-[#A1A1AA]">
                        Share your daily commute, help fellow passengers, and offset your fuel costs.
                    </p>
                </div>
            }
        >
            <Head title="Become a Driver" />

            <div className="py-10">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">

                    {/* Status Alert Banners */}
                    {isPending && (
                        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-6 text-amber-900 dark:text-amber-200 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-amber-100 dark:bg-amber-900/50 p-2.5 text-amber-700 dark:text-amber-300">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">Application Under Review</h3>
                                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                                        Your driver application and vehicle details are currently being reviewed by our administrators.
                                        Once verified, you will be granted the driver role and can immediately start posting rides!
                                    </p>
                                    <div className="mt-3">
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center text-xs font-semibold text-amber-900 dark:text-amber-300 underline hover:text-amber-950 dark:hover:text-amber-200"
                                        >
                                            ← Back to Dashboard
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isRejected && (
                        <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-6 text-red-900 dark:text-red-200 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-red-100 dark:bg-red-900/50 p-2.5 text-red-700 dark:text-red-300">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-red-900 dark:text-red-200">Previous Application Rejected</h3>
                                    <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                                        Reason: <span className="font-semibold">{rejectionReason || 'Details provided did not meet verification criteria.'}</span>
                                    </p>
                                    <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                                        You can update your license or vehicle details below and resubmit for verification.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step A: Read-Only Verified KYC Safety Information (Anti-Spoofing) */}
                    <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#1C1C22] shadow-sm ring-1 ring-gray-100 dark:ring-slate-800">
                        <div className="border-b border-gray-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/30 px-8 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                        Step 1 of 2: Verified Identity
                                    </span>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        Your Passenger KYC Information (Locked)
                                    </h3>
                                </div>
                                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800">
                                    ✓ Anti-Spoofing Protected
                                </span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                                {user.passport_photo_path ? (
                                    <img
                                        src={`/storage/${user.passport_photo_path}`}
                                        alt={user.name}
                                        className="h-20 w-20 rounded-2xl object-cover ring-2 ring-indigo-500 shadow"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-2xl shadow">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Legal Name</span>
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</span>
                                        <span className="font-semibold text-gray-800 dark:text-slate-200">{user.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Phone Number</span>
                                        <span className="font-semibold text-gray-800 dark:text-slate-200">{user.phone || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 dark:text-slate-500 uppercase tracking-wider block">NRC Number</span>
                                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{user.nrc_number || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-gray-400 dark:text-slate-500">
                                To update personal details, please edit your <Link href={route('profile.edit')} className="text-indigo-600 dark:text-indigo-400 underline">Profile KYC page</Link>.
                            </p>
                        </div>
                    </div>

                    {/* Step B: Driver License & Vehicle Details Form */}
                    <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#1C1C22] shadow-sm ring-1 ring-gray-100 dark:ring-slate-800">
                        <div className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 px-8 py-5">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Step 2 of 2: Driver & Vehicle Registration
                            </span>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Driver License & Vehicle Details</h3>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-8">
                            {/* Section 1: Driver License Details & Photo */}
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-xs text-indigo-700 dark:text-indigo-300">1</span>
                                    Driver License Details & Card Photo
                                </h4>
                                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <InputLabel htmlFor="driver_license_number" value="Driver License Number" />
                                        <TextInput
                                            id="driver_license_number"
                                            name="driver_license_number"
                                            value={data.driver_license_number}
                                            className="mt-1 block w-full rounded-xl uppercase font-mono"
                                            placeholder="e.g. B-1234567 or MM-YGN-DR-10001"
                                            onChange={(e) => setData('driver_license_number', e.target.value)}
                                            required
                                            disabled={isPending}
                                        />
                                        <InputError message={errors.driver_license_number} className="mt-2" />
                                    </div>

                                    <div className="sm:col-span-2 overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 p-4">
                                        <InputLabel value="Driver License Card Photo (Required for Driver Verification)" />
                                        <div className="mt-2 flex items-center gap-3">
                                            {previews.driver_license_photo ? (
                                                <img
                                                    src={previews.driver_license_photo}
                                                    alt="Driver License Card"
                                                    className="h-16 w-24 shrink-0 rounded-xl object-cover ring-2 ring-indigo-500"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500">
                                                    <span className="text-[10px] font-bold">License Card</span>
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <label className={`inline-flex cursor-pointer items-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-sm ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
                                                    Choose Photo
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        onChange={(e) => handleFileChange('driver_license_photo', e.target.files?.[0] || null)}
                                                        disabled={isPending}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <span className="mt-1 block truncate text-xs text-gray-500 dark:text-slate-400" title={fileNames.driver_license_photo || undefined}>
                                                    {fileNames.driver_license_photo || (user.driver_license_photo_path ? 'Current license photo saved' : 'No file chosen')}
                                                </span>
                                            </div>
                                        </div>
                                        <InputError message={errors.driver_license_photo} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Vehicle Details & Photo */}
                            <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-xs text-indigo-700 dark:text-indigo-300">2</span>
                                    Vehicle Specifications & Photo
                                </h4>
                                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="make" value="Vehicle Make" />
                                        <TextInput
                                            id="make"
                                            name="make"
                                            value={data.make}
                                            className="mt-1 block w-full rounded-xl"
                                            placeholder="e.g. Toyota, Honda, Nissan"
                                            onChange={(e) => setData('make', e.target.value)}
                                            required
                                            disabled={isPending}
                                        />
                                        <InputError message={errors.make} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="model" value="Vehicle Model" />
                                        <TextInput
                                            id="model"
                                            name="model"
                                            value={data.model}
                                            className="mt-1 block w-full rounded-xl"
                                            placeholder="e.g. Prius, Fit, Probox"
                                            onChange={(e) => setData('model', e.target.value)}
                                            required
                                            disabled={isPending}
                                        />
                                        <InputError message={errors.model} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="color" value="Color" />
                                        <TextInput
                                            id="color"
                                            name="color"
                                            value={data.color}
                                            className="mt-1 block w-full rounded-xl"
                                            placeholder="e.g. Pearl White, Silver, Black"
                                            onChange={(e) => setData('color', e.target.value)}
                                            disabled={isPending}
                                        />
                                        <InputError message={errors.color} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="manufacture_year" value="Year of Manufacture (Optional)" />
                                        <TextInput
                                            id="manufacture_year"
                                            type="number"
                                            name="manufacture_year"
                                            value={data.manufacture_year}
                                            className="mt-1 block w-full rounded-xl"
                                            placeholder="e.g. 2018"
                                            min="1990"
                                            max={new Date().getFullYear() + 1}
                                            onChange={(e) => setData('manufacture_year', e.target.value)}
                                            disabled={isPending}
                                        />
                                        <InputError message={errors.manufacture_year} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="license_plate" value="License Plate Number" />
                                        <TextInput
                                            id="license_plate"
                                            name="license_plate"
                                            value={data.license_plate}
                                            className="mt-1 block w-full uppercase rounded-xl font-mono"
                                            placeholder="e.g. YGN-7K-1234"
                                            onChange={(e) => setData('license_plate', e.target.value)}
                                            required
                                            disabled={isPending}
                                        />
                                        <InputError message={errors.license_plate} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="seat_capacity" value="Passenger Seat Capacity" />
                                        <select
                                            id="seat_capacity"
                                            name="seat_capacity"
                                            value={data.seat_capacity}
                                            className="mt-1 block w-full rounded-xl border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            onChange={(e) => setData('seat_capacity', e.target.value)}
                                            required
                                            disabled={isPending}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                                <option key={num} value={num}>
                                                    {num} {num === 1 ? 'seat' : 'seats'}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.seat_capacity} className="mt-2" />
                                        <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">Available seats for passengers (typically 1–4).</p>
                                    </div>

                                    <div className="sm:col-span-2 overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 p-4">
                                        <InputLabel value="Vehicle Photo (Clearly showing license plate number)" />
                                        <div className="mt-2 flex items-center gap-3">
                                            {previews.vehicle_photo ? (
                                                <img
                                                    src={previews.vehicle_photo}
                                                    alt="Vehicle Preview"
                                                    className="h-16 w-24 shrink-0 rounded-xl object-cover ring-2 ring-indigo-500"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500">
                                                    <span className="text-[10px] font-bold">Vehicle Photo</span>
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <label className={`inline-flex cursor-pointer items-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-sm ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
                                                    Choose Photo
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/webp"
                                                        onChange={(e) => handleFileChange('vehicle_photo', e.target.files?.[0] || null)}
                                                        disabled={isPending}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <span className="mt-1 block truncate text-xs text-gray-500 dark:text-slate-400" title={fileNames.vehicle_photo || undefined}>
                                                    {fileNames.vehicle_photo || (existingVehicle?.vehicle_photo_path ? 'Current vehicle photo saved' : 'No file chosen')}
                                                </span>
                                            </div>
                                        </div>
                                        <InputError message={errors.vehicle_photo} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Actions */}
                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-6">
                                <Link
                                    href={route('dashboard')}
                                    className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </Link>

                                <PrimaryButton
                                    className="rounded-xl px-6 py-2.5 shadow-md"
                                    disabled={processing || isPending}
                                >
                                    {processing ? 'Submitting...' : isPending ? 'Pending Verification' : isRejected ? 'Resubmit Application' : 'Submit Driver Application'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
