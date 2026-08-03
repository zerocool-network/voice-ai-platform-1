import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.profile_title')} />

            <div className="mx-auto max-w-2xl space-y-6">
                <PageHeader
                    title={t('ui.profile_title')}
                    subtitle={t('ui.profile_subtitle')}
                />

                <PageSection>
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </PageSection>

                <PageSection>
                    <UpdatePasswordForm className="max-w-xl" />
                </PageSection>

                <PageSection>
                    <DeleteUserForm className="max-w-xl" />
                </PageSection>
            </div>
        </AuthenticatedLayout>
    );
}
