import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { login, register } from '@/routes';
import { request } from '@/routes/password';
import AuthLayout from '@/Layouts/AuthLayout';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Button } from '@/Components/catalyst/button';
import { Checkbox, CheckboxField } from '@/Components/catalyst/checkbox';
import { TextLink } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';

export default function Login({ status, canResetPassword }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [visible, setVisible] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(login().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title={t('ui.sign_in')}
            subtitle={t('ui.sign_in_welcome')}
        >
            <Head title={t('ui.sign_in')} />

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
                        autoComplete="email"
                        placeholder="you@company.com"
                        invalid={errors.email ? true : undefined}
                    />
                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>{t('ui.password')}</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={visible ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            placeholder={t('ui.password_placeholder')}
                            invalid={errors.password ? true : undefined}
                        />
                        <button
                            type="button"
                            onClick={() => setVisible(!visible)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                            tabIndex={-1}
                            aria-label={visible ? t('ui.hide_password') : t('ui.show_password')}
                        >
                            {visible ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </Field>

                <div className="flex items-center justify-between">
                    <CheckboxField>
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e)}
                        />
                        <Label>{t('ui.remember_me')}</Label>
                    </CheckboxField>

                    {canResetPassword && (
                        <Link
                            href={request().url}
                            className="text-sm font-medium text-slate-950 underline decoration-slate-950/50 transition-colors hover:decoration-slate-950"
                        >
                            {t('ui.forgot_password')}
                        </Link>
                    )}
                </div>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? t('ui.signing_in') : t('ui.sign_in')}
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-50 px-2 text-slate-500">{t('ui.or_divider')}</span>
                    </div>
                </div>

                <a href="/sso/login" className="flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                    {t('ui.continue_with_sso')}
                </a>

                <p className="text-center text-sm text-slate-500">
                    {t('ui.no_account')}{' '}
                    <TextLink href={register().url}>{t('ui.create_one')}</TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
