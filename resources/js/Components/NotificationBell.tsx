import { AppNotification } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

export default function NotificationBell() {
    const { notifications } = usePage().props as {
        notifications?: {
            unread_count: number;
            recent: AppNotification[];
        } | null;
    };

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications?.unread_count ?? 0;
    const recent = notifications?.recent ?? [];

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAllRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true,
        });
    };

    const handleNotificationClick = (notification: AppNotification) => {
        setIsOpen(false);
        if (!notification.read_at) {
            router.patch(route('notifications.read', notification.id), {}, {
                preserveScroll: true,
            });
        } else if (notification.action_url) {
            router.visit(notification.action_url);
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

            if (diffSeconds < 60) return 'Just now';
            if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
            if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition focus:outline-none"
                aria-label="Open notifications"
            >
                <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden divide-y divide-gray-100">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/70">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
                        {recent.length === 0 ? (
                            <div className="py-8 text-center text-xs text-gray-400">
                                No notifications yet.
                            </div>
                        ) : (
                            recent.map((n) => {
                                const isUnread = !n.read_at;
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`cursor-pointer px-4 py-3 text-xs transition hover:bg-gray-50 flex items-start gap-3 ${
                                            isUnread ? 'bg-indigo-50/30' : ''
                                        }`}
                                    >
                                        <div className="mt-1">
                                            {isUnread ? (
                                                <span className="block h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
                                            ) : (
                                                <span className="block h-2 w-2 rounded-full bg-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className={`truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {n.title}
                                                </h4>
                                                <span className="shrink-0 text-[10px] text-gray-400">
                                                    {formatTime(n.created_at)}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-gray-600 line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
