import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useLanguage } from '@/Contexts/LanguageContext';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { t } = useLanguage();

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('nav.login', 'Log In')} />

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <div className="mb-6 text-center">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {t('auth.login_title', 'Log in to your account')}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#A1A1AA]">
                    {t('footer.tagline', 'Yangon’s Verified Daily Office Carpool Platform.')}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value={t('auth.email', 'Email Address')} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value={t('auth.password', 'Password')} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                            {t('auth.remember_me', 'Remember me')}
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline transition"
                        >
                            {t('auth.forgot_password', 'Forgot your password?')}
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center py-3 text-sm font-bold shadow-md" disabled={processing}>
                        {processing ? 'Logging in...' : t('auth.login_btn', 'Log In')}
                    </PrimaryButton>
                </div>

                {/* Bottom Sign up prompt */}
                <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('auth.no_account', "Don't have an account?")}{' '}
                        <Link
                            href={route('register')}
                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            {t('auth.sign_up', 'Sign up')}
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
