import { useLanguage } from '@/Contexts/LanguageContext';
import React from 'react';

interface Props {
    className?: string;
}

export default function LanguageSwitcher({ className = '' }: Props) {
    const { lang, setLang } = useLanguage();

    return (
        <div
            className={`inline-flex items-center rounded-xl bg-gray-100 dark:bg-slate-800 p-1 ring-1 ring-gray-200/60 dark:ring-slate-700/60 text-xs font-bold transition ${className}`}
            role="group"
            aria-label="Language selector"
        >
            <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg transition-all duration-150 ${
                    lang === 'en'
                        ? 'bg-white dark:bg-[#1C1C22] text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Switch to English"
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => setLang('mm')}
                className={`px-2.5 py-1 rounded-lg transition-all duration-150 font-sans ${
                    lang === 'mm'
                        ? 'bg-white dark:bg-[#1C1C22] text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="မြန်မာဘာသာသို့ ပြောင်းမည်"
            >
                မြန်မာ
            </button>
        </div>
    );
}
