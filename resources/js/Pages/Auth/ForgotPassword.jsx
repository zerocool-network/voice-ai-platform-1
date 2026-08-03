import { Head, useForm } from '@inertiajs/react';
import { login } from '@/routes';
import { email } from '@/routes/password';
import AuthLayout from '@/Layouts/AuthLayout';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Button } from '@/Components/catalyst/button';
import { TextLink } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';

export default function ForgotPassword({ status }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(email().url);
    };

    return (
        <AuthLayout
            title={t('ui.reset_your_password')}
            subtitle={t('ui.forgot_password_subtitle')}
        >
            <Head title={t('ui.forgot_password_title')} />

            {status && (
                <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <Field>
                    <Label>{t('ui.email_address')}</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@company.com"
                        invalid={errors.email ? true : undefined}
                    />
                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </Field>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? t('ui.sending') : t('ui.send_reset_link')}
                </Button>

                <p className="text-center text-sm text-slate-500">
                    {t('ui.remember_password')}{' '}
                    <TextLink href={login().url}>{t('ui.sign_in')}</TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
