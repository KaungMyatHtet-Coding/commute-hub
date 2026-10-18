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
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-gray-800">
                    Admin Governance Security Gate
                </h2>
            }
        >
            <Head title="Admin Security Gate" />

            <div className="py-12">
                <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50">
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900">
                                Secondary Admin Passcode
                            </h3>
                            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                                Accessing the Enterprise Admin Governance Suite requires secondary passcode verification.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                                    Admin Passcode
                                </label>
                                <input
                                    type="password"
                                    value={data.passcode}
                                    onChange={(e) => setData('passcode', e.target.value)}
                                    placeholder="Enter secondary admin passcode"
                                    className="w-full rounded-2xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                    autoFocus
                                />
                                {errors.passcode && (
                                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.passcode}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !data.passcode}
                                className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Verifying...' : 'Unlock Admin Panel'}
                            </button>

                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-center">
                                <p className="text-[11px] text-indigo-700 font-mono">
                                    Default demo passcode: <span className="font-bold underline">admin1234</span>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
