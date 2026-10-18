import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateKycInformationForm from './Partials/UpdateKycInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#1C1C22] p-4 shadow sm:rounded-2xl sm:p-8 ring-1 ring-gray-100 dark:ring-slate-800">
                        <UpdateKycInformationForm className="max-w-2xl" />
                    </div>

                    <div className="bg-white dark:bg-[#1C1C22] p-4 shadow sm:rounded-2xl sm:p-8 ring-1 ring-gray-100 dark:ring-slate-800">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white dark:bg-[#1C1C22] p-4 shadow sm:rounded-2xl sm:p-8 ring-1 ring-gray-100 dark:ring-slate-800">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
