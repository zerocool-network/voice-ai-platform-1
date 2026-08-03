import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/catalyst/button';
import { Field, Label } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { useTranslation } from '@/hooks/useTranslation';
import DataTable from '@/Components/DataTable';

export default function N8n({ integration, templates, console: consoleData, inbound_webhook_url, plain_webhook_secret }) {
    const { t } = useTranslation();
    const connected = integration?.is_connected;
    const { data, setData, post, processing, errors } = useForm({
        mode: integration?.mode || 'cloud',
        base_url: integration?.base_url || 'https://your-instance.app.n8n.cloud/api/v1',
        api_key: '',
        mcp_enabled: integration?.mcp?.enabled || false,
        mcp_url: integration?.mcp?.url || '',
        mcp_token: '',
    });

    const [testing, setTesting] = useState(false);

    function connect(e) {
        e.preventDefault();
        post('/settings/integrations/n8n/connect');
    }

    function disconnect() {
        router.post('/settings/integrations/n8n/disconnect');
    }

    async function testConnection() {
        setTesting(true);
        try {
            await fetch('/settings/integrations/n8n/test', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    Accept: 'application/json',
                },
            });
            router.reload({ only: ['integration'] });
        } finally {
            setTesting(false);
        }
    }

    const workflowColumns = [
        { id: 'name', header: t('integrations.workflow_name'), cell: (w) => w.name },
        { id: 'active', header: t('integrations.active'), cell: (w) => (
            <Badge color={w.active ? 'emerald' : 'zinc'}>{w.active ? 'active' : 'inactive'}</Badge>
        ) },
        { id: 'actions', header: '', cell: (w) => (
            <div className="flex gap-2">
                <Button
                    type="button"
                    outline
                    onClick={() => router.post(`/settings/integrations/n8n/workflows/${w.id}/activate`)}
                >
                    {t('integrations.activate')}
                </Button>
                <Button
                    type="button"
                    outline
                    onClick={() => router.post(`/settings/integrations/n8n/workflows/${w.id}/deactivate`)}
                >
                    {t('integrations.deactivate')}
                </Button>
            </div>
        ) },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('integrations.n8n_title')} />
            <div className="max-w-4xl space-y-6">
                <PageHeader
                    title={t('integrations.n8n_title')}
                    subtitle={t('integrations.n8n_subtitle')}
                />

                <PageSection>
                    <div className="flex items-center justify-between">
                        <Text>{t('integrations.status')}: <Badge color={connected ? 'emerald' : 'zinc'}>{integration?.status}</Badge></Text>
                        {connected && (
                            <div className="flex gap-2">
                                <Button type="button" outline onClick={testConnection} disabled={testing}>
                                    {t('integrations.test_connection')}
                                </Button>
                                <Button type="button" color="red" onClick={disconnect}>
                                    {t('integrations.disconnect')}
                                </Button>
                            </div>
                        )}
                    </div>
                </PageSection>

                {!connected && (
                    <PageSection>
                        <form onSubmit={connect} className="space-y-4">
                            <Field>
                                <Label>{t('integrations.n8n_mode')}</Label>
                                <Select value={data.mode} onChange={(e) => setData('mode', e.target.value)}>
                                    <option value="cloud">Cloud</option>
                                    <option value="self_hosted">Self-hosted</option>
                                </Select>
                            </Field>
                            <Field>
                                <Label>{t('integrations.base_url')}</Label>
                                <Input value={data.base_url} onChange={(e) => setData('base_url', e.target.value)} />
                                {errors.base_url && <Text className="text-red-600">{errors.base_url}</Text>}
                            </Field>
                            <Field>
                                <Label>{t('integrations.api_key')}</Label>
                                <Input type="password" value={data.api_key} onChange={(e) => setData('api_key', e.target.value)} />
                                {errors.api_key && <Text className="text-red-600">{errors.api_key}</Text>}
                            </Field>
                            <Button type="submit" disabled={processing}>{t('integrations.connect_and_test')}</Button>
                        </form>
                    </PageSection>
                )}

                {connected && (
                    <>
                        <PageSection>
                            <Text className="mb-2 font-medium">{t('integrations.inbound_webhook')}</Text>
                            <code className="block break-all rounded bg-slate-50 p-2 text-xs">{inbound_webhook_url}</code>
                            {plain_webhook_secret && (
                                <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3">
                                    <Text className="font-medium text-amber-900">{t('integrations.copy_token_now')}</Text>
                                    <code className="mt-2 block break-all text-xs">{plain_webhook_secret}</code>
                                    <Text className="mt-2 text-xs">Header: X-Voice-Signature = HMAC-SHA256(body, secret)</Text>
                                </div>
                            )}
                        </PageSection>
                        <PageSection>
                            <Text className="mb-3 font-medium">{t('integrations.workflows')}</Text>
                            <DataTable
                                columns={workflowColumns}
                                data={consoleData?.workflows || []}
                                getRowId={(row) => row.id}
                                density="dense"
                            />
                        </PageSection>
                        <PageSection>
                            <Text className="mb-3 font-medium">{t('integrations.templates')}</Text>
                            <ul className="space-y-2">
                                {Object.entries(templates || {}).map(([key, tpl]) => (
                                    <li key={key} className="rounded border border-slate-200 p-3">
                                        <div className="font-medium">{tpl.name}</div>
                                        <Text>{tpl.description}</Text>
                                    </li>
                                ))}
                            </ul>
                        </PageSection>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
