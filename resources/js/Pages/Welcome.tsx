import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('rides.index'), {
            origin_township: originTownship || undefined,
            destination_township: destinationTownship || undefined,
        });
    };

    const handleSwapTownships = () => {
        setOriginTownship(destinationTownship);
        setDestinationTownship(originTownship);
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('en-US').format(Number(val)) + ' MMK';
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#121212] text-gray-900 dark:text-[#F2F2F2] selection:bg-indigo-600 selection:text-white transition-colors duration-200">
            <Head title="CommuteHub – Smart, Safe Daily Carpooling in Yangon" />

            {/* ── Top Navigation ── */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1C1C22]/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0">
                        <img
                            src="/images/commutehub-logo.jpg"
                            alt="CommuteHub"
                            className="h-9 w-9 rounded-xl object-contain shadow-sm"
                        />
                        <div className="hidden sm:block">
                            <div className="font-extrabold text-gray-900 dark:text-white tracking-tight text-base leading-none">
                                CommuteHub
                            </div>
                            <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                Yangon
                            </div>
                        </div>
                    </Link>

                    {/* Desktop nav links (hidden on mobile) */}
                    <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                        <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">How It Works</a>
                        <a href="#safety-first" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Safety & KYC</a>
                        <a href="#recent-rides" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Live Rides</a>
                        <Link href={route('rides.index')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">All Routes</Link>
                    </nav>

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 shadow-sm transition whitespace-nowrap"
                            >
                                Dashboard →
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition whitespace-nowrap"
                                    >
                                        Log In
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 shadow-sm transition whitespace-nowrap"
                                    >
                                        Sign Up
                                    </Link>
                                )}
                            </>
                        )}

                        {/* Mobile hamburger (hidden lg+) */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((v) => !v)}
                            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile slide-down menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden animate-slide-down border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#1C1C22] px-4 py-4 space-y-1">
                        <a
                            href="#how-it-works"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                            How It Works
                        </a>
                        <a
                            href="#safety-first"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                            Safety & KYC
                        </a>
                        <a
                            href="#recent-rides"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                            Live Rides
                        </a>
                        <Link
                            href={route('rides.index')}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                        >
                            All Routes
                        </Link>
                        {!auth.user && (
                            <div className="pt-2 grid grid-cols-2 gap-2">
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="py-2.5 rounded-xl text-center text-sm font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition whitespace-nowrap"
                                    >
                                        Log In
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="py-2.5 rounded-xl text-center text-sm font-bold bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 transition whitespace-nowrap"
                                    >
                                        Sign Up
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* ── Hero Section ── */}
            <section className="relative overflow-hidden pt-10 pb-16 lg:pt-20 lg:pb-28">
                {/* Ambient background blobs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-200/30 dark:bg-indigo-700/10 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute top-1/4 right-10 w-64 h-64 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-2xl pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100/80 dark:border-indigo-800/50 text-xs font-semibold text-indigo-700 dark:text-indigo-400 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Yangon's #1 Trusted Community Carpooling Network
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
                        Share Rides. Save Fuel.{' '}
                        <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                            Commute Smarter Across Yangon.
                        </span>
                    </h1>

                    <p className="text-sm sm:text-base text-gray-600 dark:text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
                        Say goodbye to cramped buses and surge taxi fares. Connect with verified drivers and fellow commuters traveling along Yangon's major townships every single day.
                    </p>

                    {/* Search Box */}
                    <div className="max-w-3xl mx-auto bg-white dark:bg-[#1C1C22] rounded-3xl p-4 sm:p-5 shadow-xl dark:shadow-black/60 border border-gray-100 dark:border-slate-800 text-left mt-6 transition-colors duration-200">
                        <form onSubmit={handleSearch} className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-3 sm:items-end">
                            {/* Origin Township */}
                            <div className="sm:col-span-5">
                                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                    Origin Township
                                </label>
                                <select
                                    value={originTownship}
                                    onChange={(e) => setOriginTownship(e.target.value)}
                                    className="w-full text-xs rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800 dark:text-gray-100 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-500 transition"
                                >
                                    <option value="">Select departure township...</option>
                                    {townships.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Swap button */}
                            <div className="sm:col-span-1 flex items-end justify-center sm:pb-1">
                                <button
                                    type="button"
                                    onClick={handleSwapTownships}
                                    title="Swap origin and destination"
                                    className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-center transition font-bold text-base select-none"
                                >
                                    ⇄
                                </button>
                            </div>

                            {/* Destination Township */}
                            <div className="sm:col-span-4">
                                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                    Destination Township
                                </label>
                                <select
                                    value={destinationTownship}
                                    onChange={(e) => setDestinationTownship(e.target.value)}
                                    className="w-full text-xs rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800 dark:text-gray-100 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-500 transition"
                                >
                                    <option value="">Select arrival township...</option>
                                    {townships.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search Button */}
                            <div className="sm:col-span-2 flex items-end">
                                <button
                                    type="submit"
                                    className="w-full h-[42px] bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-black/40 flex items-center justify-center gap-1.5 whitespace-nowrap"
                                >
                                    Find Rides
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Popular routes */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-gray-500 dark:text-gray-500">
                        <span className="font-semibold text-gray-400 dark:text-gray-600">Popular:</span>
                        {[
                            { from: 'Hlaingthaya', to: 'Kyauktada' },
                            { from: 'North Dagon', to: 'Kamayut' },
                            { from: 'Insein', to: 'Bahan' },
                        ].map((r) => (
                            <button
                                key={`${r.from}-${r.to}`}
                                onClick={() => { setOriginTownship(r.from); setDestinationTownship(r.to); }}
                                className="px-3 py-1 rounded-full bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 dark:hover:border-indigo-600 transition text-[11px] whitespace-nowrap"
                            >
                                {r.from} → {r.to}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Statistics Banner ── */}
            <section className="bg-white dark:bg-[#1C1C22] border-y border-gray-100 dark:border-slate-800 py-10 shadow-sm dark:shadow-black/30 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-600 dark:text-indigo-400">{metrics.verified_drivers}+</div>
                            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mt-1">Verified Drivers</div>
                            <p className="text-[11px] text-gray-400 dark:text-[#A1A1AA] mt-0.5">Vetted with NRC & License</p>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-[#F2F2F2]">{metrics.registered_commuters}+</div>
                            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mt-1">Yangon Commuters</div>
                            <p className="text-[11px] text-gray-400 dark:text-[#A1A1AA] mt-0.5">Active daily passengers</p>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-400">{metrics.completed_rides}+</div>
                            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mt-1">Safe Trips Completed</div>
                            <p className="text-[11px] text-gray-400 dark:text-[#A1A1AA] mt-0.5">Reliable on-time commutes</p>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-600 dark:text-purple-400">{metrics.townships_count}</div>
                            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mt-1">Townships Connected</div>
                            <p className="text-[11px] text-gray-400 dark:text-[#A1A1AA] mt-0.5">Complete city coverage</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Live Rides Preview ── */}
            <section id="recent-rides" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Real-Time Available Trips</span>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">Upcoming Scheduled Rides</h2>
                        <p className="text-xs text-gray-500 dark:text-[#A1A1AA]">Book your seat in advance for tomorrow's morning or evening commute.</p>
                    </div>
                    <Link
                        href={route('rides.index')}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition whitespace-nowrap"
                    >
                        Browse All ({metrics.active_routes} active) →
                    </Link>
                </div>

                {recentRides.length === 0 ? (
                    <div className="bg-white dark:bg-[#1C1C22] rounded-3xl p-10 sm:p-12 text-center border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-black/30 space-y-3 transition-colors">
                        <div className="text-3xl">🚗</div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">No active rides scheduled right now</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            Be the first to post a commute route or check back shortly.
                        </p>
                        <Link
                            href={auth.user ? route('rides.create') : route('register')}
                            className="inline-flex px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 transition"
                        >
                            Post a Ride as Driver
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {recentRides.map((ride) => (
                            <div
                                key={ride.id}
                                className="bg-white dark:bg-[#1C1C22] rounded-3xl p-5 shadow-sm dark:shadow-black/40 hover:shadow-md dark:hover:shadow-black/60 border border-gray-100 dark:border-slate-800 transition-all duration-200 flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-semibold text-gray-500 dark:text-[#A1A1AA]">{ride.departure_time}</span>
                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(ride.price_per_seat)}</span>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0"></span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-[#F2F2F2] truncate">{ride.origin_township}</span>
                                        </div>
                                        <div className="ml-1 my-1 border-l-2 border-dashed border-gray-200 dark:border-slate-600 h-3"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-[#F2F2F2] truncate">{ride.destination_township}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        {ride.driver.passport_photo_path ? (
                                            <img
                                                src={`/storage/${ride.driver.passport_photo_path}`}
                                                alt={ride.driver.name}
                                                className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-200 dark:ring-indigo-800 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                {ride.driver.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="text-xs font-bold text-gray-900 dark:text-[#F2F2F2] truncate">{ride.driver.name}</div>
                                            <div className="text-[10px] text-gray-400 dark:text-[#A1A1AA]">
                                                {ride.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : 'Verified Vehicle'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        {ride.available_seats}/{ride.total_seats} free
                                    </span>
                                    <Link
                                        href={route('rides.show', ride.id)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition whitespace-nowrap"
                                    >
                                        View Trip →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── How It Works ── */}
            <section id="how-it-works" className="py-12 sm:py-16 bg-white dark:bg-[#1C1C22] border-y border-gray-100 dark:border-slate-800 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Simple & Transparent</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">How CommuteHub Works</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-[#A1A1AA]">
                            Whether you have an empty car seat or need a comfortable daily ride, getting started takes less than 2 minutes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                step: 1,
                                title: 'Find or Post a Route',
                                body: 'Drivers publish their daily commute route and price per seat. Passengers search by origin and destination Yangon townships.',
                            },
                            {
                                step: 2,
                                title: 'Book with KYC Confidence',
                                body: 'Reserve your pickup landmark. Review driver vehicle photos, government NRC status, ratings, and ride rules (e.g. AC on, no smoking).',
                            },
                            {
                                step: 3,
                                title: 'Ride & Pay Directly',
                                body: 'Meet at your designated landmark. Settle fare using driver\'s KPay or WavePay QR, and leave mutual star reviews.',
                            },
                        ].map((s) => (
                            <div key={s.step} className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50 space-y-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                                    {s.step}
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">{s.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-[#A1A1AA] leading-relaxed">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Safety & Anti-Fraud ── */}
            <section id="safety-first" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 rounded-3xl p-6 sm:p-8 lg:p-12 text-white shadow-xl space-y-6 sm:space-y-8">
                    <div className="max-w-3xl space-y-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Enterprise Trust & Compliance</span>
                        <h2 className="text-2xl sm:text-3xl font-black">Your Safety is Our Highest Priority</h2>
                        <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                            CommuteHub enforces rigorous identity checks and governance to ensure safe, courteous, and transparent carpooling across Myanmar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            { icon: '🪪', title: 'Mandatory NRC Verification', body: 'Front and back National Registration Card verification prevents anonymous accounts.' },
                            { icon: '📷', title: 'Anti-Spoofing Photos', body: 'Real human face portraits and vehicle license plate verification before driving is permitted.' },
                            { icon: '🔒', title: 'Bi-Monthly Edit Approval', body: 'Sensitive profile changes are rate-limited to twice per month and manually audited by admins.' },
                            { icon: '🚨', title: 'Emergency Contacts', body: 'Instant trip share links and pre-configured emergency contacts for peace of mind.' },
                        ].map((s) => (
                            <div key={s.title} className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-2">
                                <div className="text-xl">{s.icon}</div>
                                <div className="text-xs font-bold">{s.title}</div>
                                <p className="text-[11px] text-indigo-200">{s.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-white dark:bg-[#1C1C22] border-t border-gray-100 dark:border-slate-800 py-8 sm:py-10 text-xs text-gray-500 dark:text-[#A1A1AA] transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img src="/images/commutehub-logo.jpg" alt="CH" className="h-6 w-6 rounded-lg object-contain" />
                        <span className="font-bold text-gray-800 dark:text-gray-200">CommuteHub Yangon</span>
                        <span>• © {new Date().getFullYear()}</span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 font-semibold flex-wrap justify-center">
                        <Link href={route('rides.index')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Explore Rides</Link>
                        <Link href={route('login')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Sign In</Link>
                        <Link href={route('register')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Register</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
