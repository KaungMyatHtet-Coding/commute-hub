import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import FlashToast from '@/Components/FlashToast';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth } = usePage().props;
    const user = auth.user;

    // Helper – check if the authenticated user has a given Spatie role.
    const hasRole = (role: string) => user?.roles?.includes(role) ?? false;

    const isDriver = hasRole('driver');

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <FlashToast />
            <nav className="border-b border-gray-100 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">

                        {/* ── Left: Logo + primary nav ── */}
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            {/* Desktop nav links */}
                            <div className="hidden space-x-1 sm:-my-px sm:ms-8 sm:flex sm:items-center">
                                {/* Dashboard */}
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>

                                {/* Find a Ride — all authenticated users */}
                                {/* Only show when the route exists (rides.index will be added later) */}
                                {route().has('rides.index') && (
                                    <NavLink
                                        href={route('rides.index')}
                                        active={
                                            route().current('rides.index') ||
                                            route().current('rides.show')
                                        }
                                    >
                                        Find a Ride
                                    </NavLink>
                                )}

                                {route().has('bookings.index') && (
                                    <NavLink
                                        href={route('bookings.index')}
                                        active={route().current('bookings.index')}
                                    >
                                        My Trips
                                    </NavLink>
                                )}

                                {/* Driver-only: Offer a Ride */}
                                {isDriver ? (
                                    <NavLink
                                        href={route('rides.create')}
                                        active={route().current('rides.create')}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            <svg
                                                className="h-4 w-4"
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
                                            Offer a Ride
                                        </span>
                                    </NavLink>
                                ) : (
                                    /* Passenger: nudge towards becoming a driver */
                                    <NavLink
                                        href={route('profile.edit')}
                                        active={false}
                                        className="hidden lg:inline-flex"
                                    >
                                        <span className="flex items-center gap-1.5 text-indigo-600">
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                            Become a Driver
                                        </span>
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* ── Right: User dropdown ── */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            {/* Role badge */}
                            {isDriver && (
                                <span className="me-3 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                                    Driver
                                </span>
                            )}

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}
                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                        {route().has('bookings.index') && (
                                            <Dropdown.Link href={route('bookings.index')}>
                                                My Trips
                                            </Dropdown.Link>
                                        )}
                                        {isDriver && (
                                            <Dropdown.Link href={route('rides.create')}>
                                                Offer a Ride
                                            </Dropdown.Link>
                                        )}
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* ── Hamburger (mobile) ── */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (prev) => !prev,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Mobile menu ── */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>

                        {route().has('rides.index') && (
                            <ResponsiveNavLink
                                href={route('rides.index')}
                                active={
                                    route().current('rides.index') ||
                                    route().current('rides.show')
                                }
                            >
                                Find a Ride
                            </ResponsiveNavLink>
                        )}

                        {route().has('bookings.index') && (
                            <ResponsiveNavLink
                                href={route('bookings.index')}
                                active={route().current('bookings.index')}
                            >
                                My Trips
                            </ResponsiveNavLink>
                        )}


                        {isDriver ? (
                            <ResponsiveNavLink
                                href={route('rides.create')}
                                active={route().current('rides.create')}
                            >
                                Offer a Ride
                            </ResponsiveNavLink>
                        ) : (
                            <ResponsiveNavLink
                                href={route('profile.edit')}
                                active={false}
                            >
                                Become a Driver
                            </ResponsiveNavLink>
                        )}
                    </div>

                    {/* Mobile user info */}
                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="flex items-center gap-2">
                                <div className="text-base font-medium text-gray-800">
                                    {user.name}
                                </div>
                                {isDriver && (
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                                        Driver
                                    </span>
                                )}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Page header ── */}
            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
