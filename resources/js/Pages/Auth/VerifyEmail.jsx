import { Head, Link, useForm } from '@inertiajs/react';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import AuthLayout from '@/Layouts/AuthLayout';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { useTranslation } from '@/hooks/useTranslation';

export default function VerifyEmail({ status }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(send().url);
    };

    return (
        <AuthLayout
            title={t('ui.verify_email_title')}
            subtitle={t('ui.verify_email_subtitle')}
        >
            <Head title={t('ui.email_verification')} />

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {t('ui.verification_sent')}
                </div>
            )}

            <Text className="mb-6">
                {t('ui.verify_email_body')}
            </Text>

            <form onSubmit={submit} className="space-y-4">
                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? t('ui.sending') : t('ui.resend_verification_email')}
                </Button>

                <Link
                    href={logout().url}
                    method="post"
                    as="button"
                    className="flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 focus:outline-none"
                >
                    {t('ui.log_out')}
                </Link>
            </form>
        </AuthLayout>
    );
}
