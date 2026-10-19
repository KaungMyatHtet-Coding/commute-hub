import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useLanguage } from '@/Contexts/LanguageContext';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useLanguage();

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.forgot_password', 'Forgot Password')} />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {t('auth.forgot_password', 'Forgot your password?')}
                </h2>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Just let us know your registered email address and we will send you a password reset link to choose a new one.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full rounded-xl"
                        isFocused={true}
                        placeholder={t('auth.email', 'Email Address')}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center py-3 text-sm font-bold shadow-md" disabled={processing}>
                        {processing ? 'Sending...' : 'Email Password Reset Link'}
                    </PrimaryButton>
                </div>

                <div className="mt-4 text-center">
                    <Link
                        href={route('login')}
                        className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline transition"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
