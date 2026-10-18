import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import FlashToast from '@/Components/FlashToast';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import NotificationBell from '@/Components/NotificationBell';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth } = usePage().props;
    const user = auth.user;

    const hasRole = (role: string) => user?.roles?.includes(role) ?? false;
    const isDriver = hasRole('driver');
    const isAdmin = hasRole('admin');

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#121212] transition-colors duration-200 overflow-x-hidden">
            <FlashToast />

            {/* ── Top Navbar ── */}
            <nav className="border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-[#1C1C22] shadow-sm dark:shadow-black/40 sticky top-0 z-30 transition-colors duration-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">

                        {/* Left: Logo + primary nav */}
                        <div className="flex items-center">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2">
                                    <ApplicationLogo size="sm" showText={true} />
                                </Link>
                            </div>

                            {/* Desktop nav links */}
                            <div className="hidden space-x-1 sm:-my-px sm:ms-6 sm:flex sm:items-center">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>

                                {route().has('rides.index') && (
                                    <NavLink
                                        href={route('rides.index')}
                                        active={route().current('rides.index') || route().current('rides.show')}
                                    >
                                        Find a Ride
                                    </NavLink>
                                )}

                                {route().has('bookings.index') && (
                                    <NavLink href={route('bookings.index')} active={route().current('bookings.index')}>
                                        My Trips
                                    </NavLink>
                                )}

                                {isDriver ? (
                                    <NavLink href={route('rides.create')} active={route().current('rides.create')}>
                                        <span className="flex items-center gap-1.5">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Offer a Ride
                                        </span>
                                    </NavLink>
                                ) : (
                                    <NavLink
                                        href={route('driver-application.create')}
                                        active={route().current('driver-application.*')}
                                        className="hidden lg:inline-flex"
                                    >
                                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Become a Driver
                                        </span>
                                    </NavLink>
                                )}

                                {isAdmin && (
                                    <>
                                        <NavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                            <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-semibold">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                                </svg>
                                                Admin
                                            </span>
                                        </NavLink>
                                        <NavLink href={route('admin.users.index')} active={route().current('admin.users.*')}>
                                            Users
                                        </NavLink>
                                        <NavLink href={route('admin.history.index')} active={route().current('admin.history.*')}>
                                            History
                                        </NavLink>
                                        <NavLink href={route('admin.verifications.index')} active={route().current('admin.verifications.*')}>
                                            Verifications
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: Theme toggle, notification, user dropdown */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center sm:gap-2">
                            <ThemeToggle />
                            <NotificationBell />

                            {isAdmin && (
                                <span className="ms-1 inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/30 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-200 dark:ring-purple-700/50">
                                    Admin
                                </span>
                            )}
                            {isDriver && (
                                <span className="ms-1 inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-700/50">
                                    Driver
                                </span>
                            )}

                            <div className="relative ms-2">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-xl border border-transparent bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium leading-4 text-gray-500 dark:text-gray-300 transition duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-gray-100 focus:outline-none"
                                            >
                                                {user.name}
                                                <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        {isAdmin && (
                                            <Dropdown.Link href={route('admin.dashboard')}>Admin Panel</Dropdown.Link>
                                        )}
                                        {route().has('bookings.index') && (
                                            <Dropdown.Link href={route('bookings.index')}>My Trips</Dropdown.Link>
                                        )}
                                        {isDriver ? (
                                            <Dropdown.Link href={route('rides.create')}>Offer a Ride</Dropdown.Link>
                                        ) : (
                                            <Dropdown.Link href={route('driver-application.create')}>Become a Driver</Dropdown.Link>
                                        )}
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Hamburger & Mobile right controls */}
                        <div className="-me-2 flex items-center gap-1 sm:hidden">
                            <ThemeToggle className="h-8 w-8" />
                            <NotificationBell />
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-xl p-2 text-gray-400 dark:text-gray-500 transition duration-150 ease-in-out hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile dropdown menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden animate-slide-down'}>
                    <div className="space-y-1 pb-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>

                        {isAdmin && (
                            <ResponsiveNavLink href={route('admin.dashboard')} active={route().current('admin.*')}>
                                Admin Panel
                            </ResponsiveNavLink>
                        )}

                        {route().has('rides.index') && (
                            <ResponsiveNavLink
                                href={route('rides.index')}
                                active={route().current('rides.index') || route().current('rides.show')}
                            >
                                Find a Ride
                            </ResponsiveNavLink>
                        )}

                        {route().has('bookings.index') && (
                            <ResponsiveNavLink href={route('bookings.index')} active={route().current('bookings.index')}>
                                My Trips
                            </ResponsiveNavLink>
                        )}

                        {isDriver ? (
                            <ResponsiveNavLink href={route('rides.create')} active={route().current('rides.create')}>
                                Offer a Ride
                            </ResponsiveNavLink>
                        ) : (
                            <ResponsiveNavLink href={route('driver-application.create')} active={route().current('driver-application.*')}>
                                Become a Driver
                            </ResponsiveNavLink>
                        )}

                        {isAdmin && (
                            <>
                                <ResponsiveNavLink href={route('admin.users.index')} active={route().current('admin.users.*')}>
                                    Admin Users
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.history.index')} active={route().current('admin.history.*')}>
                                    Admin Ride History
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.verifications.index')} active={route().current('admin.verifications.*')}>
                                    Admin Verifications
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    {/* Mobile user info */}
                    <div className="border-t border-gray-200 dark:border-slate-800 pb-1 pt-4">
                        <div className="px-4">
                            <div className="flex items-center gap-2">
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                                {isAdmin && (
                                    <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-200 dark:ring-purple-700/50">
                                        Admin
                                    </span>
                                )}
                                {isDriver && (
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-700/50">
                                        Driver
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page header */}
            {header && (
                <header className="bg-white dark:bg-[#1C1C22] shadow-sm dark:shadow-black/30 border-b border-gray-100 dark:border-slate-800 transition-colors duration-200">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {typeof header === 'string' ? (
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{header}</h2>
                        ) : header}
                    </div>
                </header>
            )}

            {/* Main content – add pb-20 for bottom nav clearance on mobile */}
            <main className="pb-20 md:pb-0">
                {children}
            </main>

            {/* ── Fixed Bottom Navigation Bar (mobile only) ── */}
            <nav className="fixed bottom-0 inset-x-0 md:hidden z-40 bg-white dark:bg-[#1C1C22] border-t border-gray-200 dark:border-slate-800 shadow-lg dark:shadow-black/60">
                <div className="grid grid-cols-5 h-16">
                    {/* Dashboard */}
                    <Link
                        href={route('dashboard')}
                        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                            route().current('dashboard')
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={route().current('dashboard') ? 2.5 : 1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </Link>

                    {/* Find a Ride */}
                    {route().has('rides.index') && (
                        <Link
                            href={route('rides.index')}
                            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                                route().current('rides.index') || route().current('rides.show')
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Find
                        </Link>
                    )}

                    {/* Offer/Create Ride (centre focal button) */}
                    <Link
                        href={isDriver ? route('rides.create') : route('driver-application.create')}
                        className="flex flex-col items-center justify-center -mt-4"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                            route().current('rides.create')
                                ? 'bg-indigo-700 shadow-indigo-300 dark:shadow-indigo-900'
                                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 shadow-indigo-200 dark:shadow-black/50'
                        }`}>
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {isDriver ? 'Offer' : 'Drive'}
                        </span>
                    </Link>

                    {/* My Trips */}
                    {route().has('bookings.index') && (
                        <Link
                            href={route('bookings.index')}
                            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                                route().current('bookings.index')
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            My Trips
                        </Link>
                    )}

                    {/* Profile (or Admin) */}
                    <Link
                        href={isAdmin ? route('admin.dashboard') : route('profile.edit')}
                        className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                            route().current('profile.edit') || route().current('admin.*')
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {isAdmin ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )}
                        {isAdmin ? 'Admin' : 'Profile'}
                    </Link>
                </div>
            </nav>
        </div>
    );
}
