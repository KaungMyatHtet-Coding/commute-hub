import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Vehicle {
    id: number;
    make: string;
    model: string;
    color: string | null;
    manufacture_year: number | null;
    license_plate: string;
    seat_capacity: number;
}

interface Stop {
    stop_name: string;
    stop_order: number;
    estimated_time: string;
}

interface RideFormData {
    vehicle_id: string;
    departure_time: string;
    available_seats: string;
    price_per_seat: string;
    notes: string;
    stops: Stop[];
}

interface Props {
    vehicles: Vehicle[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Return the local datetime string required by <input type="datetime-local"> */
function minDateTime(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5); // at least 5 minutes from now
    return d.toISOString().slice(0, 16);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateRide({ vehicles }: Props) {
    const { data, setData, post, processing, errors } = useForm<RideFormData>({
        vehicle_id: '',
        departure_time: '',
        available_seats: '1',
        price_per_seat: '0',
        notes: '',
        stops: [],
    });

    // Find the currently selected vehicle to derive max seats.
    const selectedVehicle = vehicles.find((v) => v.id === Number(data.vehicle_id));

    // ── Stop helpers ──────────────────────────────────────────────────────────

    const addStop = useCallback(() => {
        const nextOrder = data.stops.length + 1;
        setData('stops', [
            ...data.stops,
            { stop_name: '', stop_order: nextOrder, estimated_time: '' },
        ]);
    }, [data.stops, setData]);

    const removeStop = useCallback(
        (index: number) => {
            const updated = data.stops
                .filter((_, i) => i !== index)
                .map((s, i) => ({ ...s, stop_order: i + 1 }));
            setData('stops', updated);
        },
        [data.stops, setData],
    );

    const updateStop = useCallback(
        (index: number, field: keyof Stop, value: string | number) => {
            const updated = data.stops.map((s, i) =>
                i === index ? { ...s, [field]: value } : s,
            );
            setData('stops', updated);
        },
        [data.stops, setData],
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
                                d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
                            />
                        </svg>
                    </span>
                    <h2 className="text-xl font-bold text-gray-800">Offer a Ride</h2>
                </div>
            }
        >
            <Head title="Offer a Ride" />

            {/* ── Page wrapper ── */}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-10">
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
                                <p className="font-semibold text-amber-800">No active vehicles found</p>
                                <p className="mt-0.5 text-sm text-amber-700">
                                    You need at least one active vehicle before posting a ride.{' '}
                                    <Link href="/profile" className="underline">
                                        Add a vehicle
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Card ── */}
                    <form
                        onSubmit={handleSubmit}
                        className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100"
                    >
                        {/* Card hero */}
                        <div className="relative h-24 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                            <div className="absolute inset-0 opacity-20"
                                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 flex items-end px-8 pb-4">
                                <p className="text-sm font-medium text-indigo-200">
                                    Fill in the details below to list your ride for passengers
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8 p-8">

                            {/* ════════════════════════════════════════
                                Section 1 – Vehicle & Schedule
                            ════════════════════════════════════════ */}
                            <Section title="Vehicle & Schedule" icon="🚗">
                                {/* Vehicle select */}
                                <Field label="Vehicle" error={errors.vehicle_id} required>
                                    <select
                                        id="vehicle_id"
                                        value={data.vehicle_id}
                                        onChange={(e) => setData('vehicle_id', e.target.value)}
                                        className={selectClass(!!errors.vehicle_id)}
                                        required
                                    >
                                        <option value="">— Select your vehicle —</option>
                                        {vehicles.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.manufacture_year} {v.make} {v.model}
                                                {v.color ? ` · ${v.color}` : ''} · {v.license_plate}{' '}
                                                ({v.seat_capacity} seats)
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                {/* Departure time */}
                                <Field label="Departure Time" error={errors.departure_time} required>
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
                                Section 2 – Seats & Pricing
                            ════════════════════════════════════════ */}
                            <Section title="Seats & Pricing" icon="💺">
                                <div className="grid grid-cols-2 gap-5">
                                    {/* Available seats */}
                                    <Field
                                        label="Available Seats"
                                        error={errors.available_seats}
                                        hint={selectedVehicle ? `Max ${selectedVehicle.seat_capacity}` : undefined}
                                        required
                                    >
                                        <input
                                            id="available_seats"
                                            type="number"
                                            min={1}
                                            max={selectedVehicle?.seat_capacity ?? 8}
                                            value={data.available_seats}
                                            onChange={(e) => setData('available_seats', e.target.value)}
                                            className={inputClass(!!errors.available_seats)}
                                            required
                                        />
                                    </Field>

                                    {/* Price per seat */}
                                    <Field label="Price per Seat (MMK)" error={errors.price_per_seat} required>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                                                K
                                            </span>
                                            <input
                                                id="price_per_seat"
                                                type="number"
                                                min={0}
                                                step="any"
                                                value={data.price_per_seat}
                                                onChange={(e) => setData('price_per_seat', e.target.value)}
                                                className={`${inputClass(!!errors.price_per_seat)} pl-7`}
                                                required
                                            />
                                        </div>
                                    </Field>
                                </div>
                            </Section>

                            {/* ════════════════════════════════════════
                                Section 3 – Stops
                            ════════════════════════════════════════ */}
                            <Section title="Route Stops" icon="📍">
                                <p className="mb-4 text-sm text-gray-500">
                                    Add intermediate landmark stops passengers can use as pickup or drop-off points.
                                </p>

                                {/* Stop list */}
                                <div className="space-y-3">
                                    {data.stops.map((stop, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-shadow hover:shadow-sm"
                                        >
                                            {/* Stop number badge */}
                                            <span className="mb-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                                {stop.stop_order}
                                            </span>

                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {/* Stop name */}
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                                        Stop Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Sule Pagoda"
                                                        value={stop.stop_name}
                                                        onChange={(e) => updateStop(idx, 'stop_name', e.target.value)}
                                                        className={inputClass(!!errors[`stops.${idx}.stop_name`])}
                                                    />
                                                    {errors[`stops.${idx}.stop_name`] && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {errors[`stops.${idx}.stop_name`]}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Estimated time */}
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                                        Estimated Arrival (optional)
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        min={data.departure_time || minDateTime()}
                                                        value={stop.estimated_time}
                                                        onChange={(e) =>
                                                            updateStop(idx, 'estimated_time', e.target.value)
                                                        }
                                                        className={inputClass(!!errors[`stops.${idx}.estimated_time`])}
                                                    />
                                                    {errors[`stops.${idx}.estimated_time`] && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {errors[`stops.${idx}.estimated_time`]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={() => removeStop(idx)}
                                                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                                aria-label="Remove stop"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add stop button */}
                                <button
                                    type="button"
                                    onClick={addStop}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 py-3 text-sm font-medium text-indigo-600 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Stop
                                </button>
                            </Section>

                            {/* ════════════════════════════════════════
                                Section 4 – Notes
                            ════════════════════════════════════════ */}
                            <Section title="Additional Notes" icon="📝">
                                <Field label="Notes (optional)" error={errors.notes}>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        placeholder="Any extra information for passengers…"
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
                                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing || vehicles.length === 0}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg hover:shadow-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Posting…
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Post Ride
                                        </>
                                    )}
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
            <div className="mb-4 flex items-center gap-2">
                <span className="text-lg leading-none">{icon}</span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
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
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="ml-0.5 text-red-500">*</span>}
                </label>
                {hint && <span className="text-xs text-gray-400">{hint}</span>}
            </div>
            {children}
            {error && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Style helpers ─────────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
    return [
        'block w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 shadow-sm',
        'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all',
        hasError
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200'
            : 'border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-200',
    ].join(' ');
}

function selectClass(hasError: boolean) {
    return [
        'block w-full appearance-none rounded-xl border px-4 py-2.5 text-sm text-gray-900 shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all',
        hasError
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200'
            : 'border-gray-200 bg-white focus:border-indigo-400 focus:ring-indigo-200',
    ].join(' ');
}
