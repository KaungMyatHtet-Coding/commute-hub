import ApplicationLogo from '@/Components/ApplicationLogo';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function AdminGate() {
    const { data, setData, post, processing, errors } = useForm({
        passcode: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('admin.gate.verify'));
    }

    return (
        <AuthenticatedLayout header="Admin Governance Security Gate">
            <Head title="Admin Security Gate" />

            <div className="py-12">
                <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#1C1C22] p-8 shadow-xl dark:shadow-black/60 ring-1 ring-gray-100 dark:ring-slate-800 transition-colors duration-200">
                        <div className="text-center space-y-3">
                            {/* Brand logo */}
                            <div className="flex justify-center mb-2">
                                <ApplicationLogo size="lg" />
                            </div>

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ring-8 ring-indigo-50/50 dark:ring-indigo-900/20">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                                Secondary Admin Passcode
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Accessing the Enterprise Admin Governance Suite requires secondary passcode verification.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                    Admin Passcode
                                </label>
                                <input
                                    type="password"
                                    value={data.passcode}
                                    onChange={(e) => setData('passcode', e.target.value)}
                                    placeholder="Enter secondary admin passcode"
                                    className="w-full rounded-2xl border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm shadow-sm focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    required
                                    autoFocus
                                />
                                {errors.passcode && (
                                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{errors.passcode}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !data.passcode}
                                className="w-full rounded-2xl bg-indigo-600 dark:bg-indigo-500 py-3 text-sm font-bold text-white shadow-md dark:shadow-indigo-900/40 hover:bg-indigo-700 dark:hover:bg-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Verifying...' : 'Unlock Admin Panel'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
