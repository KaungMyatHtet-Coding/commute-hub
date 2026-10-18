import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface RecentRide {
    id: number;
    origin_township: string;
    destination_township: string;
    departure_time: string;
    price_per_seat: string | number;
    available_seats: number;
    total_seats: number;
    ride_rules?: string[] | null;
    driver: {
        name: string;
        gender?: string | null;
        passport_photo_path?: string | null;
    };
    vehicle?: {
        make: string;
        model: string;
    } | null;
}

interface WelcomeProps extends PageProps {
    canLogin: boolean;
    canRegister: boolean;
    metrics: {
        verified_drivers: number;
        registered_commuters: number;
        completed_rides: number;
        active_routes: number;
        townships_count: number;
    };
    recentRides: RecentRide[];
    townships: string[];
}

export default function Welcome({
    auth,
    canLogin,
    canRegister,
    metrics,
    recentRides,
    townships,
}: WelcomeProps) {
    const [originTownship, setOriginTownship] = useState('');
    const [destinationTownship, setDestinationTownship] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('rides.index'), {
            origin_township: originTownship || undefined,
            destination_township: destinationTownship || undefined,
        });
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('en-US').format(Number(val)) + ' MMK';
    };

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900 selection:bg-indigo-600 selection:text-white">
            <Head title="CommuteHub - Smart, Safe Daily Carpooling in Yangon" />

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-100">
                            CH
                        </div>
                        <div>
                            <span className="font-extrabold text-gray-900 tracking-tight text-lg">CommuteHub</span>
                            <span className="ml-1 text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                                Yangon
                            </span>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-600">
                        <a href="#how-it-works" className="hover:text-indigo-600 transition">How It Works</a>
                        <a href="#safety-first" className="hover:text-indigo-600 transition">Safety & KYC</a>
                        <a href="#recent-rides" className="hover:text-indigo-600 transition">Live Rides</a>
                        <Link href={route('rides.index')} className="hover:text-indigo-600 transition">All Routes</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                            >
                                Go to Dashboard →
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                                    >
                                        Log In
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
                                    >
                                        Sign Up
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
                {/* Background ambient accents */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute top-1/4 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-2xl pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-xs font-semibold text-indigo-700 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Yangon's #1 Trusted Community Carpooling Network
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
                        Share Rides. Save Fuel. <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                            Commute Smarter Across Yangon.
                        </span>
                    </h1>

                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Say goodbye to cramped buses and surge taxi fares. Connect with verified drivers and fellow commuters traveling along Yangon's major townships every single day.
                    </p>

                    {/* Township Search Bar Box */}
                    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-4 sm:p-5 shadow-xl shadow-indigo-100/50 border border-gray-100 text-left mt-8">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            {/* Origin Township */}
                            <div className="sm:col-span-5">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Origin Township
                                </label>
                                <select
                                    value={originTownship}
                                    onChange={(e) => setOriginTownship(e.target.value)}
                                    className="w-full text-xs rounded-xl border-gray-200 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50"
                                >
                                    <option value="">Select departure township...</option>
                                    {townships.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Destination Township */}
                            <div className="sm:col-span-5">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Destination Township
                                </label>
                                <select
                                    value={destinationTownship}
                                    onChange={(e) => setDestinationTownship(e.target.value)}
                                    className="w-full text-xs rounded-xl border-gray-200 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50"
                                >
                                    <option value="">Select arrival township...</option>
                                    {townships.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search Button */}
                            <div className="sm:col-span-2 flex items-end">
                                <button
                                    type="submit"
                                    className="w-full h-[42px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5"
                                >
                                    <span>Find Rides</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Quick popular routes */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-gray-500">
                        <span className="font-semibold text-gray-400">Popular Routes:</span>
                        <button
                            onClick={() => {
                                setOriginTownship('Hlaingthaya');
                                setDestinationTownship('Kyauktada');
                            }}
                            className="px-3 py-1 rounded-full bg-white border border-gray-200/80 hover:border-indigo-500 hover:text-indigo-600 transition"
                        >
                            Hlaingthaya → Kyauktada
                        </button>
                        <button
                            onClick={() => {
                                setOriginTownship('North Dagon');
                                setDestinationTownship('Kamayut');
                            }}
                            className="px-3 py-1 rounded-full bg-white border border-gray-200/80 hover:border-indigo-500 hover:text-indigo-600 transition"
                        >
                            North Dagon → Kamayut
                        </button>
                        <button
                            onClick={() => {
                                setOriginTownship('Insein');
                                setDestinationTownship('Bahan');
                            }}
                            className="px-3 py-1 rounded-full bg-white border border-gray-200/80 hover:border-indigo-500 hover:text-indigo-600 transition"
                        >
                            Insein → Bahan
                        </button>
                    </div>
                </div>
            </section>

            {/* Cached Statistics Banner */}
            <section className="bg-white border-y border-gray-100 py-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-3xl sm:text-4xl font-black text-indigo-600">
                                {metrics.verified_drivers}+
                            </div>
                            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mt-1">Verified Drivers</div>
                            <p className="text-[11px] text-gray-400 mt-0.5">Vetted with NRC & License</p>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-4xl font-black text-gray-900">
                                {metrics.registered_commuters}+
                            </div>
                            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mt-1">Yangon Commuters</div>
                            <p className="text-[11px] text-gray-400 mt-0.5">Active daily passengers</p>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-4xl font-black text-emerald-600">
                                {metrics.completed_rides}+
                            </div>
                            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mt-1">Safe Trips Completed</div>
                            <p className="text-[11px] text-gray-400 mt-0.5">Reliable on-time commutes</p>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-4xl font-black text-purple-600">
                                {metrics.townships_count}
                            </div>
                            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mt-1">Townships Connected</div>
                            <p className="text-[11px] text-gray-400 mt-0.5">Complete city coverage</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Scheduled Rides Preview */}
            <section id="recent-rides" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Real-Time Available Trips</span>
                        <h2 className="text-2xl font-black text-gray-900 mt-1">Upcoming Scheduled Rides</h2>
                        <p className="text-xs text-gray-500">Book your seat in advance for tomorrow's morning or evening commute.</p>
                    </div>
                    <Link
                        href={route('rides.index')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                    >
                        Browse All Rides ({metrics.active_routes} active) →
                    </Link>
                </div>

                {recentRides.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
                        <div className="text-3xl">🚗</div>
                        <h3 className="text-base font-bold text-gray-800">No active rides scheduled right now</h3>
                        <p className="text-xs text-gray-500 max-w-md mx-auto">
                            Be the first to post a commute route or check back shortly as drivers publish their schedules.
                        </p>
                        <Link
                            href={auth.user ? route('rides.create') : route('register')}
                            className="inline-flex px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                        >
                            Post a Ride as Driver
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentRides.map((ride) => (
                            <div
                                key={ride.id}
                                className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md border border-gray-100 transition flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    {/* Departure & Price */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-gray-500">
                                            {ride.departure_time}
                                        </span>
                                        <span className="text-xs font-black text-indigo-600 font-mono">
                                            {formatCurrency(ride.price_per_seat)}
                                        </span>
                                    </div>

                                    {/* Route */}
                                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                            <span className="text-xs font-bold text-gray-900 truncate">
                                                {ride.origin_township}
                                            </span>
                                        </div>
                                        <div className="ml-1 my-1 border-l-2 border-dashed border-gray-200 h-3"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            <span className="text-xs font-bold text-gray-900 truncate">
                                                {ride.destination_township}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Driver & Vehicle */}
                                    <div className="flex items-center gap-2.5">
                                        {ride.driver.passport_photo_path ? (
                                            <img
                                                src={`/storage/${ride.driver.passport_photo_path}`}
                                                alt={ride.driver.name}
                                                className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-200"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                                {ride.driver.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="truncate">
                                            <div className="text-xs font-bold text-gray-900 truncate">{ride.driver.name}</div>
                                            <div className="text-[10px] text-gray-400">
                                                {ride.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : 'Verified Vehicle'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seats & CTA */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-emerald-600">
                                        {ride.available_seats} of {ride.total_seats} seats free
                                    </span>
                                    <Link
                                        href={route('rides.show', ride.id)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition"
                                    >
                                        View Trip →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-16 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Simple & Transparent</span>
                        <h2 className="text-3xl font-black text-gray-900">How CommuteHub Works</h2>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Whether you have an empty car seat or need a comfortable daily ride, getting started takes less than 2 minutes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-gray-100 space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                                1
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Find or Post a Route</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Drivers publish their daily commute route and price per seat. Passengers search by origin and destination Yangon townships.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-gray-100 space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                                2
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Book with KYC Confidence</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Reserve your pickup landmark. Review driver vehicle photos, government NRC status, ratings, and ride rules (e.g. AC on, no smoking).
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-gray-100 space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                                3
                            </div>
                            <h3 className="text-base font-bold text-gray-900">Ride & Pay Directly</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Meet at your designated landmark. Settle fare effortlessly using driver's KPay or WavePay QR, and leave mutual star reviews.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Safety & Anti-Fraud Guarantee */}
            <section id="safety-first" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-8">
                    <div className="max-w-3xl space-y-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Enterprise Trust & Compliance</span>
                        <h2 className="text-3xl font-black">Your Safety is Our Highest Priority</h2>
                        <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                            CommuteHub enforces rigorous identity checks and governance to ensure safe, courteous, and transparent carpooling across Myanmar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-2">
                            <div className="text-xl">🪪</div>
                            <div className="text-xs font-bold">Mandatory NRC Verification</div>
                            <p className="text-[11px] text-indigo-200">
                                Front and back National Registration Card verification prevents anonymous accounts.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-2">
                            <div className="text-xl">📷</div>
                            <div className="text-xs font-bold">Anti-Spoofing Photos</div>
                            <p className="text-[11px] text-indigo-200">
                                Real human face portraits and vehicle license plate verification before driving is permitted.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-2">
                            <div className="text-xl">🔒</div>
                            <div className="text-xs font-bold">Bi-Monthly Edit Approval</div>
                            <p className="text-[11px] text-indigo-200">
                                Sensitive profile changes are rate-limited to twice per month and manually audited by system administrators.
                            </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-2">
                            <div className="text-xl">🚨</div>
                            <div className="text-xs font-bold">Emergency Contacts</div>
                            <p className="text-[11px] text-indigo-200">
                                Instant trip share links and pre-configured emergency contacts for peace of mind.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-10 text-xs text-gray-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            CH
                        </div>
                        <span className="font-bold text-gray-800">CommuteHub Yangon</span>
                        <span>• &copy; {new Date().getFullYear()} All rights reserved.</span>
                    </div>

                    <div className="flex items-center gap-6 font-semibold">
                        <Link href={route('rides.index')} className="hover:text-indigo-600 transition">
                            Explore Rides
                        </Link>
                        <Link href={route('login')} className="hover:text-indigo-600 transition">
                            Sign In
                        </Link>
                        <Link href={route('register')} className="hover:text-indigo-600 transition">
                            Register
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
