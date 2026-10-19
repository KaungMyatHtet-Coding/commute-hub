import ApplicationLogo from '@/Components/ApplicationLogo';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ThemeToggle from '@/Components/ThemeToggle';
import { useLanguage } from '@/Contexts/LanguageContext';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { t } = useLanguage();

    return (
        <div className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-gray-100 dark:bg-[#121212] transition-colors duration-200 px-4 py-8 sm:justify-center">
            {/* Top Navigation Bar: Back to Home (top-left) & Language / Theme (top-right) */}
            <div className="w-full max-w-md flex items-center justify-between mb-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-[#1C1C22] shadow-sm ring-1 ring-gray-200/70 dark:ring-slate-800 transition"
                >
                    {t('nav.back_to_home', '← Back to Home')}
                </Link>

                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
            </div>

            <div>
                <Link href="/" className="flex flex-col items-center gap-2">
                    <ApplicationLogo size="lg" />
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        CommuteHub
                    </span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white dark:bg-[#1C1C22] px-6 py-6 shadow-xl dark:shadow-black/60 sm:max-w-md rounded-3xl border border-gray-100 dark:border-slate-800 transition-colors duration-200">
                {children}
            </div>
        </div>
    );
}
