import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { RIDE_RULES, YANGON_TOWNSHIPS } from '@/Constants/yangonTownships';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEvent, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Vehicle {
    id: number;
    make: string;
    model: string;
    color: string | null;
    manufacture_year: number | null;
    license_plate: string;
    seat_capacity: number;
    vehicle_photo_path?: string | null;
}

interface Stop {
    stop_name: string;
    stop_order: number;
    estimated_time: string;
}

interface RideFormData {
    vehicle_id: string;
    origin_township: string;
    destination_township: string;
    departure_time: string;
    available_seats: string;
    price_per_seat: string;
    notes: string;
    ride_rules: string[];
    stops: Stop[];
}

interface Props {
    vehicles: Vehicle[];
    townships?: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Return the local datetime string required by <input type="datetime-local"> */
function minDateTime(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5); // at least 5 minutes from now
    return d.toISOString().slice(0, 16);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateRide({ vehicles, townships }: Props) {
    const townshipList = townships && townships.length > 0 ? townships : YANGON_TOWNSHIPS;

    const { data, setData, post, processing, errors } = useForm<RideFormData>({
        vehicle_id: vehicles[0]?.id ? String(vehicles[0].id) : '',
        origin_township: 'Kamayut',
        destination_township: 'Kyauktada',
        departure_time: '',
        available_seats: vehicles[0]?.seat_capacity ? String(vehicles[0].seat_capacity) : '3',
        price_per_seat: '2500',
        notes: '',
        ride_rules: ['ac_on', 'no_smoking'],
        stops: [
            { stop_name: 'Kamayut (Start Point)', stop_order: 1, estimated_time: '' },
            { stop_name: 'Kyauktada (Destination)', stop_order: 2, estimated_time: '' },
        ],
    });

    // Find the currently selected vehicle to derive max seats.
    const selectedVehicle = vehicles.find((v) => v.id === Number(data.vehicle_id));

    // Handle vehicle selection change and auto-adjust seats
    const handleVehicleChange = (vehicleId: string) => {
        setData((prev) => {
            const v = vehicles.find((veh) => veh.id === Number(vehicleId));
            const max = v?.seat_capacity ?? 4;
            const currentSeats = Number(prev.available_seats) || 1;
            return {
                ...prev,
                vehicle_id: vehicleId,
                available_seats: String(Math.min(currentSeats, max)),
            };
        });
    };

    // Toggle rule
    const toggleRule = (ruleKey: string) => {
        setData((prev) => {
            const exists = prev.ride_rules.includes(ruleKey);
            return {
                ...prev,
                ride_rules: exists
                    ? prev.ride_rules.filter((r) => r !== ruleKey)
                    : [...prev.ride_rules, ruleKey],
            };
        });
    };

    // ── Stop helpers ──────────────────────────────────────────────────────────

    const addIntermediateStop = useCallback(() => {
        setData((prev) => {
            const stops = [...prev.stops];
            if (stops.length < 2) {
                // Ensure at least 2
                return {
                    ...prev,
                    stops: [
                        ...stops,
                        { stop_name: '', stop_order: stops.length + 1, estimated_time: '' },
                    ],
                };
            }
            // Insert before the last stop (destination)
            const lastStop = stops[stops.length - 1];
            const middleStops = stops.slice(0, stops.length - 1);
            const newStop: Stop = {
                stop_name: '',
                stop_order: middleStops.length + 1,
                estimated_time: '',
            };
            const updated = [...middleStops, newStop, { ...lastStop, stop_order: stops.length + 1 }];
            return {
                ...prev,
                stops: updated.map((s, idx) => ({ ...s, stop_order: idx + 1 })),
            };
        });
    }, [setData]);

    const removeStop = useCallback(
        (index: number) => {
            setData((prev) => {
                if (prev.stops.length <= 2) return prev; // Keep at least start and end
                const updated = prev.stops
                    .filter((_, i) => i !== index)
                    .map((s, i) => ({ ...s, stop_order: i + 1 }));
                return { ...prev, stops: updated };
            });
        },
        [setData],
    );

    const updateStop = useCallback(
        (index: number, field: keyof Stop, value: string | number) => {
            setData((prev) => {
                const updated = prev.stops.map((s, i) =>
                    i === index ? { ...s, [field]: value } : s,
                );
                return { ...prev, stops: updated };
            });
        },
        [setData],
    );

    // ── Form submit ───────────────────────────────────────────────────────────

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('rides.store'));
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    </span>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Offer a Commute Ride</h2>
                        <p className="text-xs text-gray-500">Connect with Yangon commuters along your regular route.</p>
                    </div>
                </div>
            }
        >
            <Head title="Offer a Ride" />

            {/* ── Page wrapper ── */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/40 py-10">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">

                    {/* ── No vehicles warning ── */}
                    {vehicles.length === 0 && (
                        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                                </svg>
                            </span>
                            <div>
                                <p className="font-semibold text-amber-800">No active vehicles registered</p>
                                <p className="mt-0.5 text-sm text-amber-700">
                                    You need an approved vehicle before posting a ride.{' '}
                                    <Link href={route('driver-application.create')} className="underline font-bold">
                                        Register a vehicle
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Form Card ── */}
                    <form
                        onSubmit={handleSubmit}
                        className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100"
                    >
                        {/* Header Banner */}
                        <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-8 py-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                                        ⚡ Instant Listing
                                    </span>
                                    <h3 className="mt-2 text-xl font-black">Plan Your Commute Route</h3>
                                    <p className="mt-0.5 text-xs text-indigo-100">
                                        Choose your Yangon origin & destination townships, stops, and preferences.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 p-8">

                            {/* ════════════════════════════════════════
                                Section 1 – Yangon Route Townships
                            ════════════════════════════════════════ */}
                            <Section title="Yangon Route Townships" icon="🗺️">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Field label="Origin Township (From)" error={errors.origin_township} required>
                                        <select
                                            id="origin_township"
                                            value={data.origin_township}
                                            onChange={(e) => setData('origin_township', e.target.value)}
                                            className={selectClass(!!errors.origin_township)}
                                            required
                                        >
                                            {townshipList.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field label="Destination Township (To)" error={errors.destination_township} required>
                                        <select
                                            id="destination_township"
                                            value={data.destination_township}
                                            onChange={(e) => setData('destination_township', e.target.value)}
                                            className={selectClass(!!errors.destination_township)}
                                            required
                                        >
                                            {townshipList.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                </div>

                                <div className="rounded-2xl bg-indigo-50/60 p-3.5 text-xs text-indigo-800 flex items-center gap-2.5">
                                    <span className="font-bold">Trip Route Preview:</span>
                                    <span className="font-black text-indigo-950">{data.origin_township}</span>
                                    <span>➔</span>
                                    <span className="font-black text-indigo-950">{data.destination_township}</span>
                                </div>
                            </Section>

                            {/* ════════════════════════════════════════
                                Section 2 – Vehicle & Schedule
                            ════════════════════════════════════════ */}
                            <Section title="Vehicle & Schedule" icon="🚗">
                                {/* Vehicle select */}
                                <Field label="Select Registered Vehicle" error={errors.vehicle_id} required>
                                    <select
                                        id="vehicle_id"
                                        value={data.vehicle_id}
                                        onChange={(e) => handleVehicleChange(e.target.value)}
                                        className={selectClass(!!errors.vehicle_id)}
                                        required
                                    >
                                        <option value="">— Select your vehicle —</option>
                                        {vehicles.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.make} {v.model} {v.color ? `· ${v.color}` : ''} ({v.license_plate}) — {v.seat_capacity} seats
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Departure time */}
                                <Field label="Departure Date & Time" error={errors.departure_time} required>
                                    <input
                                        id="departure_time"
                                        type="datetime-local"
                                        min={minDateTime()}
                                        value={data.departure_time}
                                        onChange={(e) => setData('departure_time', e.target.value)}
                                        className={inputClass(!!errors.departure_time)}
                                        required
                                    />
                                </Field>
                            </Section>

                            {/* ════════════════════════════════════════
                                Section 3 – Seats & Pricing
                            ════════════════════════════════════════ */}
                            <Section title="Seats & Pricing" icon="💺">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {/* Available seats */}
                                    <Field
                                        label="Seats Offered"
                                        error={errors.available_seats}
                                        hint={selectedVehicle ? `Max ${selectedVehicle.seat_capacity}` : undefined}
                                        required
                                    >
                                        <select
                                            id="available_seats"
                                            value={data.available_seats}
                                            onChange={(e) => setData('available_seats', e.target.value)}
                                            className={selectClass(!!errors.available_seats)}
                                            required
                                        >
                                            {Array.from({ length: selectedVehicle?.seat_capacity ?? 4 }, (_, i) => i + 1).map((n) => (
                                                <option key={n} value={n}>
                                                    {n} {n === 1 ? 'seat' : 'seats'}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    {/* Price per seat */}
                                    <Field label="Fare per Seat (MMK)" error={errors.price_per_seat} required>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                                Ks
                                            </span>
                                            <input
                                                id="price_per_seat"
                                                type="number"
                                                min={0}
                                                step="500"
                                                value={data.price_per_seat}
                                                onChange={(e) => setData('price_per_seat', e.target.value)}
                                                className={`${inputClass(!!errors.price_per_seat)} pl-9`}
                                                required
                                            />
                                        </div>
                                    </Field>
                                </div>
                            </Section>

                            {/* ════════════════════════════════════════
                                Section 4 – Ride Rules & Preferences
                            ════════════════════════════════════════ */}
                            <Section title="Ride Preferences & Rules" icon="🛡️">
                                <p className="text-xs text-gray-500 mb-2">
                                    Set expectations for your passengers to ensure a safe, comfortable commute.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {RIDE_RULES.map((rule) => {
                                        const isChecked = data.ride_rules.includes(rule.key);
                                        return (
                                            <label
                                                key={rule.key}
                                                onClick={() => toggleRule(rule.key)}
                                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
                                                    isChecked
                                                        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500'
                                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {}}
                                                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div className="flex-1 text-xs">
                                                    <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                                                        <span>{rule.badge}</span>
                                                    </span>
                                                    <span className="text-gray-500 text-[11px] block mt-0.5">
                                                        {rule.description}
                                                    </span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </Section>

                            {/* ════════════════════════════════════════
                                Section 5 – Landmark Route Stops
                            ════════════════════════════════════════ */}
                            <Section title="Route Landmarks & Stops" icon="📍">
                                <p className="mb-3 text-xs text-gray-500">
                                    Define your starting point, destination, and any intermediate landmarks for pickup and drop-off along the commute.
                                </p>

                                {/* Stop list */}
                                <div className="space-y-3">
                                    {data.stops.map((stop, idx) => {
                                        const isFirst = idx === 0;
                                        const isLast = idx === data.stops.length - 1;
                                        const isIntermediate = !isFirst && !isLast;

                                        return (
                                            <div
                                                key={idx}
                                                className={`group relative rounded-2xl border p-4 transition-shadow hover:shadow-sm ${
                                                    isFirst
                                                        ? 'border-indigo-200 bg-indigo-50/40'
                                                        : isLast
                                                        ? 'border-emerald-200 bg-emerald-50/40'
                                                        : 'border-gray-200 bg-gray-50'
                                                }`}
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                                                isFirst
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : isLast
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-gray-200 text-gray-700'
                                                            }`}
                                                        >
                                                            {stop.stop_order}
                                                        </span>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                                            {isFirst
                                                                ? `1. Starting Landmark (${data.origin_township})`
                                                                : isLast
                                                                ? `${stop.stop_order}. Final Destination (${data.destination_township})`
                                                                : `${stop.stop_order}. Intermediate Stop`}
                                                        </span>
                                                    </div>

                                                    {isIntermediate && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStop(idx)}
                                                            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                                                            title="Remove intermediate stop"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-600">
                                                            {isFirst ? 'Pickup Landmark / Start Location *' : isLast ? 'Destination Landmark *' : 'Intermediate Stop Landmark *'}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder={
                                                                isFirst
                                                                    ? `e.g. ${data.origin_township} Center / Bus Stop`
                                                                    : isLast
                                                                    ? `e.g. ${data.destination_township} Junction / Tower`
                                                                    : 'e.g. Myaynigone Junction, Times City'
                                                            }
                                                            value={stop.stop_name}
                                                            onChange={(e) => updateStop(idx, 'stop_name', e.target.value)}
                                                            className={inputClass(!!errors[`stops.${idx}.stop_name`])}
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-600">
                                                            Estimated Time {isFirst ? '(Departure)' : '(optional)'}
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            min={data.departure_time || minDateTime()}
                                                            value={stop.estimated_time}
                                                            onChange={(e) => updateStop(idx, 'estimated_time', e.target.value)}
                                                            className={inputClass(!!errors[`stops.${idx}.estimated_time`])}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={addIntermediateStop}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 py-2.5 text-xs font-bold text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    + Add Intermediate Stop
                                </button>
                            </Section>

                            {/* ════════════════════════════════════════
                                Section 6 – Additional Notes
                            ════════════════════════════════════════ */}
                            <Section title="Driver Notes" icon="📝">
                                <Field label="Notes for Passengers (optional)" error={errors.notes}>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        placeholder="e.g. Departing promptly at 7:45 AM. KPay accepted."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className={`${inputClass(!!errors.notes)} resize-none`}
                                    />
                                </Field>
                            </Section>

                            {/* ── Actions ── */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing || vehicles.length === 0}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-60"
                                >
                                    {processing ? 'Publishing Ride...' : 'Publish Ride'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
    title,
    icon,
    children,
}: {
    title: string;
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-3 flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">{title}</h3>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({
    label,
    error,
    hint,
    required,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between">
                <label className="block text-xs font-bold text-gray-700">
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
                {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
            </div>
            {children}
            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Style helpers ─────────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
    return [
        'block w-full rounded-xl border px-3.5 py-2 text-sm text-gray-900 shadow-sm',
        'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition',
        hasError
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200'
            : 'border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-100',
    ].join(' ');
}

function selectClass(hasError: boolean) {
    return [
        'block w-full rounded-xl border px-3.5 py-2 text-sm text-gray-900 shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 transition',
        hasError
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200'
            : 'border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-100',
    ].join(' ');
}
