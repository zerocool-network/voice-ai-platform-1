import HubSpotConsoleLayout from '@/Components/HubSpot/HubSpotConsoleLayout';
import ScopeGate from '@/Components/HubSpot/ScopeGate';
import { flattenRecords } from '@/Components/HubSpot/navigation';
import DataTable from '@/Components/DataTable';
import { Button } from '@/Components/catalyst/button';
import { Field, Label } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Text } from '@/Components/catalyst/text';
import { Textarea } from '@/Components/catalyst/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

function genericColumns(rows, t) {
    if (!rows.length) {
        return [{ id: 'empty', header: t('hubspot.record'), cell: () => '—' }];
    }
    const sample = rows[0];
    if (sample.properties && typeof sample.properties === 'object') {
        return [
            { id: 'id', header: 'ID', cell: (r) => r.id || '—' },
            ...Object.keys(sample.properties).slice(0, 4).map((key) => ({
                id: key,
                header: key,
                cell: (r) => r.properties?.[key] ?? '—',
            })),
        ];
    }
    return Object.keys(sample).filter((k) => k !== 'properties').slice(0, 6).map((key) => ({
        id: key,
        header: key,
        cell: (r) => {
            const val = r[key];
            if (val == null) return '—';
            if (typeof val === 'object') return JSON.stringify(val).slice(0, 80);
            return String(val);
        },
    }));
}

export default function ModulePage({ integration, module, payload, extra = {}, filters = {}, api_meta, nav }) {
    const { t } = useTranslation();
    const rows = flattenRecords(payload);

    const mutate = (action, payloadData = {}) => {
        router.post(`/settings/integrations/hubspot/modules/${module.key}`, {
            action,
            payload: payloadData,
        }, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t(module.label_key)} />
            <HubSpotConsoleLayout integration={integration} nav={nav} title={t(module.label_key)}>
                <ScopeGate apiMeta={api_meta} connected={integration?.is_connected}>
                    <div className="space-y-6">
                        <div>
                            <Text className="text-lg font-semibold">{t(module.label_key)}</Text>
                            <Text className="text-sm text-slate-500">{module.group}</Text>
                        </div>

                        {module.key === 'conversations' && (
                            <ConversationsInbox
                                rows={rows}
                                thread={extra.thread}
                                filters={filters}
                                onReply={(threadId, text) => mutate('reply', { threadId, message: { text, type: 'MESSAGE' } })}
                                onAssign={(threadId, assignedTo) => mutate('assign', { threadId, assignedTo })}
                                t={t}
                            />
                        )}

                        {module.key === 'files' && (
                            <FilesPanel onUpload={(name) => mutate('upload', { name, options: { access: 'PRIVATE' } })} t={t} />
                        )}

                        {module.key === 'webhooks' && (
                            <WebhooksPanel
                                rows={rows}
                                events={extra.webhook_events || []}
                                webhookUrl={extra.webhook_url}
                                onCreate={(body) => mutate('create', body)}
                                onDelete={(id) => mutate('delete', { id })}
                                t={t}
                            />
                        )}

                        {module.key === 'privacy' && (
                            <PrivacyPanel onSubmit={(email) => mutate('gdpr_delete', { idProperty: 'email', value: email })} t={t} />
                        )}

                        {module.key === 'properties' && (
                            <div className="flex gap-2">
                                <Select
                                    value={filters.objectType || 'contacts'}
                                    onChange={(e) => router.get('/settings/integrations/hubspot/modules/properties', { objectType: e.target.value })}
                                >
                                    {['contacts', 'companies', 'deals', 'tickets', 'leads', 'products'].map((o) => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </Select>
                                <Button
                                    type="button"
                                    onClick={() => mutate('create', {
                                        objectType: filters.objectType || 'contacts',
                                        property: {
                                            name: `zv_${Date.now()}`,
                                            label: 'ZeroVoice Prop',
                                            type: 'string',
                                            groupName: 'contactinformation',
                                        },
                                    })}
                                >
                                    {t('hubspot.create')}
                                </Button>
                            </div>
                        )}

                        {module.key !== 'conversations' && (
                            <DataTable
                                columns={genericColumns(rows.length ? rows : (payload && !payload.results ? [payload] : []), t)}
                                data={rows.length ? rows : (payload && typeof payload === 'object' && !payload.results ? [payload] : [])}
                                emptyTitle={t('hubspot.empty_records')}
                                emptyDescription={t('hubspot.empty_module_hint')}
                            />
                        )}

                        {['forms', 'lists', 'schemas', 'pipelines', 'cms-pages', 'cms-blogs', 'hubdb', 'redirects', 'timeline', 'marketing-emails', 'comms-prefs'].includes(module.key) && (
                            <Button type="button" onClick={() => mutate('create', { name: `ZeroVoice ${module.key} ${Date.now()}` })}>
                                {t('hubspot.create')}
                            </Button>
                        )}

                        {module.key === 'extensions' && (
                            <div className="grid gap-3 sm:grid-cols-3">
                                {Object.entries(payload || {}).map(([key, value]) => (
                                    <div key={key} className="rounded-xl border border-slate-100 p-4">
                                        <Text className="font-medium capitalize">{key}</Text>
                                        <pre className="mt-2 overflow-auto text-xs text-slate-500">{JSON.stringify(value, null, 2)}</pre>
                                    </div>
                                ))}
                            </div>
                        )}

                        {module.key === 'developer' && (
                            <div className="space-y-3">
                                <Text>{t('hubspot.developer_components')}</Text>
                                <div className="flex flex-wrap gap-2">
                                    {(payload?.components || []).map((c) => (
                                        <span key={c} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScopeGate>
            </HubSpotConsoleLayout>
        </>
    );
}

function ConversationsInbox({ rows, thread, filters, onReply, onAssign, t }) {
    const [text, setText] = useState('');

    return (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-100">
                {rows.map((row) => (
                    <button
                        key={row.id}
                        type="button"
                        className={`block w-full border-b border-slate-50 px-3 py-3 text-left text-sm hover:bg-slate-50 ${String(filters.threadId) === String(row.id) ? 'bg-orange-50' : ''}`}
                        onClick={() => router.get('/settings/integrations/hubspot/modules/conversations', { threadId: row.id })}
                    >
                        <div className="font-medium">#{row.id}</div>
                        <div className="text-xs text-slate-500">{row.status || row.originalChannelId || 'thread'}</div>
                    </button>
                ))}
                {!rows.length && <div className="p-4 text-sm text-slate-500">{t('hubspot.empty_records')}</div>}
            </div>
            <div className="space-y-3 rounded-xl border border-slate-100 p-4">
                {!thread ? (
                    <Text className="text-slate-500">{t('hubspot.select_thread')}</Text>
                ) : (
                    <>
                        <Text className="font-medium">{t('hubspot.thread')} #{thread.id}</Text>
                        <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-xs">{JSON.stringify(thread, null, 2)}</pre>
                        <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('hubspot.reply_placeholder')} />
                        <div className="flex gap-2">
                            <Button type="button" onClick={() => onReply(thread.id, text)}>{t('hubspot.reply')}</Button>
                            <Button type="button" outline onClick={() => onAssign(thread.id, '0')}>{t('hubspot.assign')}</Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function FilesPanel({ onUpload, t }) {
    const [name, setName] = useState('zerovoice-upload.txt');
    return (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-slate-300 p-4">
            <Field className="min-w-64 flex-1">
                <Label>{t('hubspot.file_name')}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Button type="button" onClick={() => onUpload(name)}>{t('hubspot.upload')}</Button>
        </div>
    );
}

function WebhooksPanel({ rows, events, webhookUrl, onCreate, onDelete, t }) {
    return (
        <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <Text className="font-medium">{t('hubspot.webhook_target')}</Text>
                <code className="mt-1 block break-all">{webhookUrl}</code>
            </div>
            <Button type="button" onClick={() => onCreate({ eventType: 'contact.creation', active: true })}>
                {t('hubspot.create_subscription')}
            </Button>
            <DataTable
                columns={[
                    { id: 'id', header: 'ID', cell: (r) => r.id },
                    { id: 'event', header: 'Event', cell: (r) => r.eventType || r.subscriptionType || '—' },
                    { id: 'active', header: t('integrations.active'), cell: (r) => String(r.active ?? true) },
                    {
                        id: 'actions',
                        header: '',
                        cell: (r) => (
                            <Button color="red" type="button" onClick={() => onDelete(r.id)}>{t('hubspot.delete')}</Button>
                        ),
                    },
                ]}
                data={rows}
                emptyTitle={t('hubspot.empty_records')}
            />
            <Text className="font-medium">{t('hubspot.webhook_events')}</Text>
            <DataTable
                columns={[
                    { id: 'id', header: 'ID', cell: (r) => r.id },
                    { id: 'type', header: 'Type', cell: (r) => r.subscription_type },
                    { id: 'object', header: 'Object', cell: (r) => r.object_id || '—' },
                    { id: 'at', header: t('hubspot.updated'), cell: (r) => r.created_at },
                ]}
                data={events}
                emptyTitle={t('hubspot.empty_records')}
            />
        </div>
    );
}

function PrivacyPanel({ onSubmit, t }) {
    const [email, setEmail] = useState('');
    return (
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-rose-100 bg-rose-50/40 p-4">
            <Field className="min-w-64 flex-1">
                <Label>{t('hubspot.gdpr_email')}</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Button color="red" type="button" onClick={() => onSubmit(email)}>{t('hubspot.gdpr_delete')}</Button>
        </div>
    );
}
