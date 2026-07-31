import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Badge } from '@/Components/catalyst/badge';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Alert, AlertTitle, AlertDescription, AlertBody, AlertActions } from '@/Components/catalyst/alert';
import { store, destroy } from '@/actions/App/Http/Controllers/Web/ApiTokenController';
import { useTranslation } from '@/hooks/useTranslation';
import { KeyRound } from 'lucide-react';

export default function Index({ tokens, flash }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        abilities: '*',
        expires_in: 'never',
    });
    const [showCreate, setShowCreate] = useState(false);
    const [newToken, setNewToken] = useState(flash?.token ?? null);
    const [confirmingRevoke, setConfirmingRevoke] = useState(null);

    const columns = useMemo(() => [
        {
            id: 'name',
            header: t('ui.name'),
            cell: (token) => <span className="font-medium">{token.name}</span>,
        },
        {
            id: 'abilities',
            header: t('ui.abilities'),
            cell: (token) => (
                token.abilities?.length === 1 && token.abilities[0] === '*'
                    ? <Badge color="zinc">{t('ui.full_access')}</Badge>
                    : token.abilities?.map((a) => (
                        <Badge key={a} color="zinc" className="mr-1">{a}</Badge>
                    ))
            ),
        },
        {
            id: 'created',
            header: t('ui.created'),
            cell: (token) => <span className="text-slate-500">{token.created_at}</span>,
        },
        {
            id: 'last_used',
            header: t('ui.last_used'),
            cell: (token) => <span className="text-slate-500">{token.last_used_at || t('ui.never')}</span>,
        },
        {
            id: 'expires',
            header: t('ui.expires'),
            cell: (token) => <span className="text-slate-500">{token.expires_at || t('ui.never')}</span>,
        },
        {
            id: 'actions',
            header: '',
            meta: { align: 'right' },
            cell: (token) => (
                <button
                    onClick={() => setConfirmingRevoke(token)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                    aria-label={`${t('api-tokens.revoke')} ${token.name}`}
                >
                    {t('api-tokens.revoke')}
                </button>
            ),
        },
    ], [t]);

    function submit(e) {
        e.preventDefault();
        post(store().url, {
            onSuccess: (page) => {
                const tokenValue = page.props.flash?.token;
                if (tokenValue) setNewToken(tokenValue);
                reset();
                setShowCreate(false);
            },
        });
    }

    function revoke() {
        const token = confirmingRevoke;
        setConfirmingRevoke(null);
        if (token) {
            router.delete(destroy({ token: token.id }).url);
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.api_tokens_title')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.api_tokens_title')}
                    subtitle={t('ui.api_tokens_subtitle')}
                    actions={(
                        <Button onClick={() => setShowCreate(true)}>
                            {t('ui.new_token')}
                        </Button>
                    )}
                />

                <DataTable
                    className="max-w-3xl"
                    columns={columns}
                    data={tokens}
                    getRowId={(row) => row.id}
                    emptyIcon={KeyRound}
                    emptyTitle={t('ui.no_tokens')}
                    emptyDescription={t('ui.generate_token')}
                    emptyAction={{ label: t('ui.new_token'), onClick: () => setShowCreate(true) }}
                />
            </div>

            <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
                <DialogTitle>{t('ui.create_token')}</DialogTitle>
                <DialogDescription>
                    {t('ui.generate_new_token')}
                </DialogDescription>
                <DialogBody>
                    <form onSubmit={submit} id="create-token-form" className="space-y-4">
                        <Field>
                            <Label>{t('ui.name')}</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t('ui.token_name_placeholder')}
                                invalid={errors.name ? true : undefined}
                            />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.abilities_comma')}</Label>
                            <Input
                                value={data.abilities}
                                onChange={(e) => setData('abilities', e.target.value)}
                                placeholder={t('ui.abilities_placeholder')}
                                invalid={errors.abilities ? true : undefined}
                            />
                            <Text>{t('ui.abilities_hint')}</Text>
                            {errors.abilities && <ErrorMessage>{errors.abilities}</ErrorMessage>}
                        </Field>
                        <Field>
                            <Label>{t('ui.expires_in')}</Label>
                            <Select
                                value={data.expires_in}
                                onChange={(e) => setData('expires_in', e.target.value)}
                            >
                                <option value="never">{t('ui.never')}</option>
                                <option value="30">{t('ui.days_30')}</option>
                                <option value="90">{t('ui.days_90')}</option>
                                <option value="365">{t('ui.year_1')}</option>
                            </Select>
                            {errors.expires_in && <ErrorMessage>{errors.expires_in}</ErrorMessage>}
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button plain onClick={() => setShowCreate(false)}>{t('ui.cancel')}</Button>
                    <Button type="submit" form="create-token-form" disabled={processing}>
                        {processing ? t('ui.creating') : t('ui.generate')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Alert open={newToken !== null} onClose={() => setNewToken(null)}>
                <AlertTitle>{t('ui.token_created_title')}</AlertTitle>
                <AlertDescription>
                    {t('ui.token_created_desc')}
                </AlertDescription>
                <AlertBody>
                    <div className="mt-3">
                        <code className="block overflow-x-auto rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                            {newToken}
                        </code>
                    </div>
                </AlertBody>
                <AlertActions>
                    <Button onClick={() => { navigator.clipboard.writeText(newToken); setNewToken(null); }}>
                        {t('ui.copy_close')}
                    </Button>
                    <Button plain onClick={() => setNewToken(null)}>{t('ui.dismiss')}</Button>
                </AlertActions>
            </Alert>

            <Alert open={confirmingRevoke !== null} onClose={() => setConfirmingRevoke(null)}>
                <AlertTitle>{t('ui.revoke_token_title')}</AlertTitle>
                <AlertDescription>
                    {t('ui.revoke_token_desc', { name: confirmingRevoke?.name ?? '' })}
                </AlertDescription>
                <AlertActions>
                    <Button plain onClick={() => setConfirmingRevoke(null)}>{t('ui.cancel')}</Button>
                    <Button color="red" onClick={revoke}>{t('api-tokens.revoke')}</Button>
                </AlertActions>
            </Alert>
        </AuthenticatedLayout>
    );
}
