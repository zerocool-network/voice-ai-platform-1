import { Head, useForm } from '@inertiajs/react';
import { login } from '@/routes';
import { store } from '@/routes/password';
import AuthLayout from '@/Layouts/AuthLayout';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Button } from '@/Components/catalyst/button';
import { TextLink } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';

export default function ResetPassword({ token, email }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(store().url, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title={t('ui.set_new_password')}
            subtitle={t('ui.set_new_password_subtitle')}
        >
            <Head title={t('ui.reset_password')} />

            <form onSubmit={submit} className="space-y-6">
                <Field>
                    <Label>{t('ui.email_address')}</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        invalid={errors.email ? true : undefined}
                    />
                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>{t('ui.new_password')}</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        placeholder={t('ui.min_chars')}
                        invalid={errors.password ? true : undefined}
                    />
                    {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>{t('ui.confirm_password')}</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        placeholder={t('ui.repeat_password')}
                        invalid={errors.password_confirmation ? true : undefined}
                    />
                    {errors.password_confirmation && <ErrorMessage>{errors.password_confirmation}</ErrorMessage>}
                </Field>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? t('ui.resetting') : t('ui.reset_password')}
                </Button>

                <p className="text-center text-sm text-slate-500">
                    <TextLink href={login().url}>{t('ui.back_to_sign_in')}</TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
