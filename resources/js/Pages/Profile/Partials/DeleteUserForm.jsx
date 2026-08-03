import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { destroy as profileDestroy } from '@/routes/profile';

export default function DeleteUserForm({ className = '' }) {
    const { t } = useTranslation();
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(profileDestroy().url, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirming(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <Subheading>{t('ui.delete_account')}</Subheading>
                <Text className="mt-1">
                    {t('ui.delete_account_desc')}
                </Text>
            </header>

            <Button color="red" onClick={() => setConfirming(true)}>
                {t('ui.delete_account')}
            </Button>

            <Dialog open={confirming} onClose={closeModal}>
                <DialogTitle>{t('ui.delete_account_confirm_title')}</DialogTitle>
                <DialogDescription>
                    {t('ui.delete_account_confirm_desc')}
                </DialogDescription>
                <DialogBody>
                    <form onSubmit={deleteUser} id="delete-user-form">
                        <Field>
                            <Label className="sr-only">{t('ui.password')}</Label>
                            <Input
                                ref={passwordInput}
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoFocus
                                placeholder={t('ui.password')}
                                invalid={errors.password ? true : undefined}
                            />
                            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button plain onClick={closeModal}>
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" form="delete-user-form" color="red" disabled={processing}>
                        {processing ? t('ui.deleting') : t('ui.delete_account')}
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    );
}
