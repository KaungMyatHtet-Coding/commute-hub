import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import PrivacyPolicyModal from '@/Components/PrivacyPolicyModal';
import TextInput from '@/Components/TextInput';
import { useLanguage } from '@/Contexts/LanguageContext';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Register() {
    const { t } = useLanguage();
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        privacy_policy_accepted: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('nav.register', 'Sign Up')} />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {t('auth.register_title', 'Create your commuter account')}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#A1A1AA]">
                    {t('footer.tagline', 'Yangon’s Verified Daily Office Carpool Platform.')}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value={t('auth.full_name', 'Full Name')} />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t('auth.email', 'Email Address')} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value={t('auth.confirm_password', 'Confirm Password')}
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full rounded-xl"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5"
                    />
                </div>

                {/* Mandatory Privacy Policy Consent Checkbox */}
                <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                        <Checkbox
                            name="privacy_policy_accepted"
                            checked={data.privacy_policy_accepted}
                            onChange={(e) =>
                                setData('privacy_policy_accepted', (e.target.checked || false) as false)
                            }
                            className="mt-0.5"
                            required
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-300 leading-normal select-none">
                            {t('auth.privacy_consent_prefix', 'I have read and agree to the CommuteHub')}{' '}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsPrivacyModalOpen(true);
                                }}
                                className="font-bold text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700 dark:hover:text-indigo-300"
                            >
                                {t('auth.privacy_policy_link', 'Privacy Policy & Safety Terms')}
                            </button>{' '}
                            {t('auth.privacy_consent_suffix', '')}
                            <span className="text-red-500 font-bold ml-0.5">*</span>
                        </span>
                    </label>

                    <InputError
                        message={errors.privacy_policy_accepted}
                        className="mt-1.5"
                    />
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center py-3 text-sm font-bold shadow-md" disabled={processing || !data.privacy_policy_accepted}>
                        {processing ? 'Creating account...' : t('auth.register_btn', 'Create Account')}
                    </PrimaryButton>
                </div>

                {/* Bottom Already Registered prompt */}
                <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-4 text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('auth.already_registered', 'Already registered?')}{' '}
                        <Link
                            href={route('login')}
                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            {t('auth.login_btn', 'Log In')}
                        </Link>
                    </p>
                </div>
            </form>

            {/* Privacy Policy Modal */}
            <PrivacyPolicyModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
            />
        </GuestLayout>
    );
}
