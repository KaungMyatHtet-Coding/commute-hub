import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';
import React from 'react';

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
    } | null;
    driverLicenseNumber?: string | null;
}

export default function Create({ status, rejectionReason, existingVehicle, driverLicenseNumber }: Props) {
    const isPending = status === 'pending_verification' || status === 'pending';
    const isRejected = status === 'rejected';

    const { data, setData, post, processing, errors } = useForm({
        driver_license_number: driverLicenseNumber || '',
        make: existingVehicle?.make || '',
        model: existingVehicle?.model || '',
        color: existingVehicle?.color || '',
        manufacture_year: existingVehicle?.manufacture_year ? String(existingVehicle.manufacture_year) : '',
        license_plate: existingVehicle?.license_plate || '',
        seat_capacity: existingVehicle?.seat_capacity ? String(existingVehicle.seat_capacity) : '4',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('driver-application.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold leading-tight text-gray-800">
                        Become a CommuteHub Driver
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
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
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-amber-900">Application Under Review</h3>
                                    <p className="mt-1 text-sm text-amber-800">
                                        Your driver application and vehicle details are currently being reviewed by our administrators.
                                        Once verified, you will be granted the driver role and can immediately start posting rides!
                                    </p>
                                    <div className="mt-3">
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center text-xs font-semibold text-amber-900 underline hover:text-amber-950"
                                        >
                                            ← Back to Dashboard
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isRejected && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-red-100 p-2.5 text-red-700">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-red-900">Previous Application Rejected</h3>
                                    <p className="mt-1 text-sm text-red-800">
                                        Reason: <span className="font-semibold">{rejectionReason || 'Details provided did not meet verification criteria.'}</span>
                                    </p>
                                    <p className="mt-1 text-xs text-red-700">
                                        You can update your license or vehicle details below and resubmit for verification.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Application Form */}
                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
                        <div className="border-b border-gray-100 bg-gray-50/70 px-8 py-5">
                            <h3 className="text-base font-bold text-gray-900">Driver & Vehicle Verification</h3>
                            <p className="mt-0.5 text-xs text-gray-500">
                                Please provide accurate details. All information is verified by administrators before ride creation is enabled.
                            </p>
                        </div>

                        <form onSubmit={submit} className="p-8 space-y-8">
                            {/* Section 1: Personal Identification */}
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-600">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs text-indigo-700">1</span>
                                    Driver Identification
                                </h4>
                                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <InputLabel htmlFor="driver_license_number" value="Driver License / National ID (NID) Number" />
                                        <TextInput
                                            id="driver_license_number"
                                            name="driver_license_number"
                                            value={data.driver_license_number}
                                            className="mt-1 block w-full rounded-xl"
                                            placeholder="e.g. B-1234567 or 12/LAMATA(N)123456"
                                            onChange={(e) => setData('driver_license_number', e.target.value)}
                                            required
                                            disabled={isPending}
                                        />
                                        <InputError message={errors.driver_license_number} className="mt-2" />
                                        <p className="mt-1 text-xs text-gray-400">
                                            This is strictly used for safety verification and kept confidential.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Vehicle Details */}
                            <div className="border-t border-gray-100 pt-6">
                                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-600">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs text-indigo-700">2</span>
                                    Vehicle Information
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
                                            placeholder="e.g. Prius, Fit, AD Van"
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
                                        <InputLabel htmlFor="seat_capacity" value="Passenger Seat Capacity (excl. driver)" />
                                        <TextInput
                                            id="seat_capacity"
                                            type="number"
                                            name="seat_capacity"
                                            value={data.seat_capacity}
                                            className="mt-1 block w-full rounded-xl"
                                            min="1"
                                            max="8"
                                            onChange={(e) => setData('seat_capacity', e.target.value)}
                                            required
                                            disabled={isPending}
                                        />
                                        <InputError message={errors.seat_capacity} className="mt-2" />
                                        <p className="mt-1 text-xs text-gray-400">Available seats for passengers (typically 1–4).</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Actions */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                <Link
                                    href={route('dashboard')}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
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
