import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import DataTable from '@/Components/DataTable';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Input } from '@/Components/catalyst/input';
import { Badge } from '@/Components/catalyst/badge';
import { store, update, destroy, test } from '@/actions/App/Http/Controllers/Web/WebhookDestinationController';
import { useTranslation } from '@/hooks/useTranslation';
import { Webhook } from 'lucide-react';

const STATUS_COLORS = {
    success: 'emerald',
    failed: 'red',
    pending: 'amber',
    dead: 'zinc',
};

function DeliveriesTable({ deliveries, t, locale }) {
    const [bodyId, setBodyId] = useState(null);

    const columns = useMemo(() => [
        {
            id: 'status',
            header: t('ui.status_label'),
            cell: (d) => <Badge color={STATUS_COLORS[d.status] || 'zinc'}>{d.status}</Badge>,
        },
        { id: 'event', header: t('ui.event'), cell: (d) => d.event },
        { id: 'response_code', header: t('ui.response_code'), cell: (d) => d.response_code },
        { id: 'attempt', header: t('ui.attempt_label'), cell: (d) => `#${d.attempt}` },
        {
            id: 'time',
            header: t('ui.time'),
            cell: (d) => (
                <span className="text-xs text-slate-500">
                    {new Date(d.created_at).toLocaleString(locale || undefined)}
                </span>
            ),
        },
        {
            id: 'body',
            header: t('ui.body_label'),
            cell: (d) => (
                d.response_body ? (
                    <button
                        type="button"
                        onClick={() => setBodyId(bodyId === d.id ? null : d.id)}
                        className="text-xs text-indigo-600 hover:underline"
                    >
                        {bodyId === d.id ? t('ui.hide_body') : t('ui.view_body')}
                    </button>
                ) : null
            ),
        },
    ], [t, locale, bodyId]);

    return (
        <div className="space-y-2">
            <DataTable
                columns={columns}
                data={deliveries}
                getRowId={(row) => row.id}
                density="dense"
                className="border-0 shadow-none"
            />
            {bodyId && deliveries.find((d) => d.id === bodyId)?.response_body && (
                <pre className="max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 text-xs whitespace-pre-wrap text-slate-700">
                    {deliveries.find((d) => d.id === bodyId).response_body}
                </pre>
            )}
        </div>
    );
}

export default function Index({ webhooks }) {
    const { t, locale } = useTranslation();
    const eventOptions = useMemo(() => [
        { value: 'call.initiated', label: t('ui.event_call_initiated') },
        { value: 'call.in_progress', label: t('ui.event_call_in_progress') },
        { value: 'call.completed', label: t('ui.event_call_completed') },
        { value: 'call.failed', label: t('ui.event_call_failed') },
        { value: 'call.transferred', label: t('ui.event_call_transferred') },
    ], [t]);

    const [showForm, setShowForm] = useState(false);
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [signingSecret, setSigningSecret] = useState('');
    const [events, setEvents] = useState(['call.completed']);
    const [urlError, setUrlError] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    function validateUrl(value) {
        setUrl(value);
        if (value && !value.startsWith('https://') && !value.startsWith('http://')) {
            setUrlError(t('ui.webhook_url_must_http'));
        } else if (value && !/^https?:\/\/.+\..+/.test(value)) {
            setUrlError(t('ui.webhook_valid_url'));
        } else {
            setUrlError('');
        }
    }

    function toggleEvent(event) {
        setEvents((prev) =>
            prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
        );
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (urlError) return;
        router.post(store().url, { url, description, sign_secret: signingSecret, events }, {
            onSuccess: () => {
                setShowForm(false);
                setUrl('');
                setDescription('');
                setSigningSecret('');
                setEvents(['call.completed']);
                setUrlError('');
            },
        });
    }

    function handleDelete(id) {
        if (confirm(t('ui.remove_webhook_confirm'))) {
            router.delete(destroy({ webhook: id }).url);
        }
    }

    function toggleActive(webhook) {
        router.patch(update({ webhook: webhook.id }).url, {
            url: webhook.url,
            events: webhook.events,
            description: webhook.description,
            is_active: !webhook.is_active,
        });
    }

    function handleTest(webhook) {
        router.post(test({ webhook: webhook.id }).url);
    }

    const webhookColumns = useMemo(() => [
        {
            id: 'url',
            header: t('ui.url'),
            className: 'max-w-xs truncate font-medium',
            cell: (wh) => (
                <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === wh.id ? null : wh.id)}
                    className="text-left hover:underline"
                >
                    {wh.url}
                </button>
            ),
        },
        {
            id: 'events',
            header: t('ui.events'),
            cell: (wh) => (
                <div className="flex flex-wrap gap-1">
                    {wh.events.map((e) => (
                        <Badge key={e} color="zinc">{e}</Badge>
                    ))}
                </div>
            ),
        },
        {
            id: 'status',
            header: t('ui.status_label'),
            cell: (wh) => (
                <Badge color={wh.is_active ? 'emerald' : 'zinc'}>
                    {wh.is_active ? t('ui.active') : t('ui.inactive')}
                </Badge>
            ),
        },
        {
            id: 'deliveries',
            header: t('ui.deliveries'),
            cell: (wh) => <Badge color="zinc">{wh.deliveries_count ?? 0}</Badge>,
        },
        {
            id: 'actions',
            header: '',
            meta: { align: 'right' },
            cell: (wh) => (
                <div className="flex justify-end gap-2">
                    <Button outline onClick={() => handleTest(wh)}>
                        {t('ui.test')}
                    </Button>
                    <Button outline onClick={() => toggleActive(wh)}>
                        {wh.is_active ? t('ui.deactivate') : t('ui.activate')}
                    </Button>
                    <Button outline onClick={() => handleDelete(wh.id)}>
                        {t('ui.delete_label')}
                    </Button>
                </div>
            ),
        },
    ], [t, expandedId]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.webhooks_title')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.webhooks_title')}
                    subtitle={t('ui.webhooks_subtitle')}
                    actions={(
                        <Button onClick={() => setShowForm(!showForm)}>
                            {showForm ? t('ui.cancel') : t('ui.add_webhook')}
                        </Button>
                    )}
                />

                {showForm && (
                    <PageSection>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">{t('ui.url')}</label>
                                <Input
                                    value={url}
                                    onChange={(e) => validateUrl(e.target.value)}
                                    placeholder={t('ui.webhook_url_placeholder')}
                                    required
                                    invalid={urlError ? true : undefined}
                                />
                                {urlError && <p className="mt-1 text-xs text-red-600">{urlError}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">{t('ui.description')}</label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('ui.optional_description')} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">{t('ui.signing_secret')}</label>
                                <Input type="password" value={signingSecret} onChange={(e) => setSigningSecret(e.target.value)} placeholder={t('ui.hmac_secret')} />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">{t('ui.events')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {eventOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => toggleEvent(opt.value)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                                events.includes(opt.value)
                                                    ? 'bg-indigo-100 text-indigo-700'
                                                    : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" disabled={events.length === 0 || !url}>
                                {t('ui.save_webhook')}
                            </Button>
                        </form>
                    </PageSection>
                )}

                {webhooks.length > 0 && (
                    <DataTable
                        columns={webhookColumns}
                        data={webhooks}
                        getRowId={(row) => row.id}
                        expandedId={expandedId}
                        emptyIcon={Webhook}
                        emptyTitle={t('ui.no_webhooks')}
                        emptyDescription={t('ui.add_webhook_realtime')}
                        renderExpandedRow={(wh) => (
                            <div className="p-4">
                                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider">{t('ui.recent_deliveries')}</Text>
                                {wh.deliveries && wh.deliveries.length > 0 ? (
                                    <DeliveriesTable deliveries={wh.deliveries} t={t} locale={locale} />
                                ) : (
                                    <Text className="py-3 text-center text-xs text-slate-500">{t('ui.no_deliveries')}</Text>
                                )}
                            </div>
                        )}
                    />
                )}

                {webhooks.length === 0 && !showForm && (
                    <DataTable
                        columns={[]}
                        data={[]}
                        emptyIcon={Webhook}
                        emptyTitle={t('ui.no_webhooks')}
                        emptyDescription={t('ui.add_webhook_realtime')}
                        emptyAction={{ label: t('ui.add_webhook'), onClick: () => setShowForm(true) }}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
