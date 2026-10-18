import React from 'react';

interface Props {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export default function ApplicationLogo({ className = '', size = 'md', showText = false }: Props) {
    const sizeMap = {
        sm: 'h-7 w-7',
        md: 'h-9 w-9',
        lg: 'h-12 w-12',
    };

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <img
                src="/images/commutehub-logo.jpg"
                alt="CommuteHub Logo"
                className={`${sizeMap[size]} rounded-xl object-contain flex-shrink-0 shadow-sm`}
                onError={(e) => {
                    // Fallback to text initials if image fails
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
            {showText && (
                <div className="flex flex-col leading-tight">
                    <span className="font-extrabold text-gray-900 dark:text-white tracking-tight text-sm">
                        CommuteHub
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                        Yangon
                    </span>
                </div>
            )}
        </div>
    );
}
