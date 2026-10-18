import React, { useEffect, useState } from 'react';

const THEME_KEY = 'commutehub_theme';

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Initialise from localStorage or current class state
        const saved = localStorage.getItem(THEME_KEY);
        const active = document.documentElement.classList.contains('dark');
        setIsDark(saved ? saved === 'dark' : active);
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem(THEME_KEY, 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem(THEME_KEY, 'light');
        }
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200
                bg-gray-100 hover:bg-gray-200 text-gray-600
                dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-400
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${className}`}
        >
            {isDark ? (
                /* Sun icon */
                <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                    <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            ) : (
                /* Moon icon */
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            )}
        </button>
    );
}
