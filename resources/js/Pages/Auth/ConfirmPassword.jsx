import { Head, useForm } from '@inertiajs/react';
import { login } from '@/routes';
import { confirm } from '@/routes/password';
import AuthLayout from '@/Layouts/AuthLayout';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Button } from '@/Components/catalyst/button';
import { TextLink } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';

export default function ConfirmPassword() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(confirm().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title={t('ui.confirm_password_title')}
            subtitle={t('ui.confirm_password_subtitle')}
        >
            <Head title={t('ui.confirm_password')} />

            <form onSubmit={submit} className="space-y-6">
                <Field>
                    <Label>{t('ui.password')}</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder={t('ui.password_placeholder')}
                        invalid={errors.password ? true : undefined}
                    />
                    {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </Field>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? t('ui.confirming') : t('common.confirm')}
                </Button>

                <p className="text-center text-sm text-slate-500">
                    <TextLink href={login().url}>{t('ui.back_to_sign_in')}</TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
