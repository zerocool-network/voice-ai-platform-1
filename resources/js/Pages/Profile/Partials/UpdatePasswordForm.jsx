import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { useTranslation } from '@/hooks/useTranslation';
import { update } from '@/routes/password';

export default function UpdatePasswordForm({ className = '' }) {
    const { t } = useTranslation();
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(update().url, {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <Subheading>{t('ui.update_password')}</Subheading>
                <Text className="mt-1">
                    {t('ui.update_password_desc')}
                </Text>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <Field>
                    <Label>{t('ui.current_password')}</Label>
                    <Input
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        autoComplete="current-password"
                        invalid={errors.current_password ? true : undefined}
                    />
                    {errors.current_password && <ErrorMessage>{errors.current_password}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>{t('ui.new_password')}</Label>
                    <Input
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        invalid={errors.password ? true : undefined}
                    />
                    {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>{t('ui.confirm_password_label')}</Label>
                    <Input
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        invalid={errors.password_confirmation ? true : undefined}
                    />
                    {errors.password_confirmation && <ErrorMessage>{errors.password_confirmation}</ErrorMessage>}
                </Field>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={processing}>{t('common.save')}</Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-slate-600">{t('ui.saved')}</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
