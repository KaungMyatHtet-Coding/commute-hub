import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center overflow-x-hidden bg-gray-100 dark:bg-[#121212] transition-colors duration-200 pt-6 sm:justify-center sm:pt-0">
            {/* Theme toggle top-right */}
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div>
                <Link href="/" className="flex flex-col items-center gap-2">
                    <ApplicationLogo size="lg" />
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        CommuteHub
                    </span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white dark:bg-[#1C1C22] px-6 py-4 shadow-md dark:shadow-black/50 sm:max-w-md sm:rounded-2xl border border-transparent dark:border-slate-800 transition-colors duration-200">
                {children}
            </div>
        </div>
    );
}
