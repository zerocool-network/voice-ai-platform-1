import { useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { login, register } from '@/routes';
import AuthLayout from '@/Layouts/AuthLayout';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Button } from '@/Components/catalyst/button';
import { TextLink } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';

export default function Register() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [visible, setVisible] = useState(false);

    const passwordStrength = useMemo(() => {
        const pw = data.password;
        if (!pw) return { score: 0, label: '', color: '', width: '0%' };
        let score = 0;
        if (pw.length >= 8) score += 25;
        if (pw.length >= 12) score += 10;
        if (/[a-z]/.test(pw)) score += 15;
        if (/[A-Z]/.test(pw)) score += 15;
        if (/[0-9]/.test(pw)) score += 15;
        if (/[^a-zA-Z0-9]/.test(pw)) score += 20;
        if (score < 30) return { score, label: t('ui.password_weak'), color: 'bg-red-500', width: '25%', textColor: 'text-red-600' };
        if (score < 60) return { score, label: t('ui.password_fair'), color: 'bg-amber-500', width: '55%', textColor: 'text-amber-600' };
        if (score < 80) return { score, label: t('ui.password_good'), color: 'bg-blue-500', width: '75%', textColor: 'text-blue-600' };
        return { score, label: t('ui.password_strong'), color: 'bg-emerald-500', width: '100%', textColor: 'text-emerald-600' };
    }, [data.password, t]);

    const submit = (e) => {
        e.preventDefault();
        post(register().url, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title={t('ui.create_account')}
            subtitle={t('ui.register_subtitle')}
        >
            <Head title={t('ui.register')} />

            <form onSubmit={submit} className="space-y-6">
                <Field>
                    <Label>{t('ui.full_name')}</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        autoComplete="name"
                        placeholder="Jane Smith"
                        invalid={errors.name ? true : undefined}
                    />
                    {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>{t('ui.email_address')}</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        placeholder="jane@company.com"
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
                            autoComplete="new-password"
                            placeholder={t('ui.min_chars')}
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
                    {data.password && (
                        <div className="mt-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: passwordStrength.width }} />
                            </div>
                            <p className={`mt-1 text-xs ${passwordStrength.textColor}`}>
                                {passwordStrength.label}
                            </p>
                        </div>
                    )}
                </Field>

                <Field>
                    <Label>{t('ui.confirm_password')}</Label>
                    <Input
                        id="password_confirmation"
                        type={visible ? 'text' : 'password'}
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        placeholder={t('ui.repeat_password')}
                        invalid={errors.password_confirmation ? true : undefined}
                    />
                    {errors.password_confirmation && <ErrorMessage>{errors.password_confirmation}</ErrorMessage>}
                </Field>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? t('ui.creating_account') : t('ui.create_account')}
                </Button>

                <p className="text-center text-sm text-slate-500">
                    {t('ui.already_have_account')}{' '}
                    <TextLink href={login().url}>{t('ui.sign_in')}</TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
