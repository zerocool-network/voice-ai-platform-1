import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/catalyst/button';
import { Field, Label } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Checkbox } from '@/Components/catalyst/checkbox';
import { useTranslation } from '@/hooks/useTranslation';

export default function LookerStudio({ integration, export_url, schema, studio, plain_token }) {
    const { t } = useTranslation();
    const connected = integration?.is_connected;
    const bq = integration?.bigquery || {};
    const { data, setData, post, processing } = useForm({
        enabled: bq.enabled ?? false,
        project_id: bq.project_id || '',
        dataset: bq.dataset || '',
    });

    return (
        <AuthenticatedLayout>
            <Head title={t('integrations.looker_title')} />
            <div className="max-w-3xl space-y-6">
                <PageHeader
                    title={t('integrations.looker_title')}
                    subtitle={t('integrations.looker_subtitle')}
                />

                <PageSection>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Text>
                            {t('integrations.status')}:{' '}
                            <Badge color={connected ? 'emerald' : 'zinc'}>{integration?.status}</Badge>
                        </Text>
                        <div className="flex gap-2">
                            <Button type="button" onClick={() => router.post('/settings/integrations/looker-studio/connect')}>
                                {connected ? t('integrations.rotate_token') : t('integrations.generate_token')}
                            </Button>
                            {connected && (
                                <Button type="button" color="red" onClick={() => router.post('/settings/integrations/looker-studio/disconnect')}>
                                    {t('integrations.disconnect')}
                                </Button>
                            )}
                        </div>
                    </div>
                    {plain_token && (
                        <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3">
                            <Text className="font-medium text-amber-900">{t('integrations.copy_token_now')}</Text>
                            <code className="mt-2 block break-all text-xs">{plain_token}</code>
                        </div>
                    )}
                </PageSection>

                <PageSection>
                    <Text className="mb-2 font-medium">{t('integrations.export_endpoint')}</Text>
                    <code className="block break-all rounded bg-slate-50 p-2 text-xs">{export_url}?tenant_id=YOUR_TENANT_ID</code>
                    <Text className="mt-3 mb-2 font-medium">{t('integrations.export_schema')}</Text>
                    <ul className="space-y-1 text-sm text-slate-700">
                        {(schema || []).map((field) => (
                            <li key={field.name}><code>{field.name}</code> — {field.type}</li>
                        ))}
                    </ul>
                </PageSection>

                <PageSection>
                    <Text className="mb-2 font-medium">{t('integrations.studio_preview')}</Text>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded border p-3">
                            <Text className="text-xs uppercase text-slate-500">{t('integrations.total_calls')}</Text>
                            <div className="text-2xl font-semibold">{studio?.total_calls ?? 0}</div>
                        </div>
                        <div className="rounded border p-3">
                            <Text className="text-xs uppercase text-slate-500">{t('integrations.avg_duration')}</Text>
                            <div className="text-2xl font-semibold">{studio?.avg_duration_seconds ?? 0}s</div>
                        </div>
                    </div>
                </PageSection>

                {connected && (
                    <PageSection>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                post('/settings/integrations/looker-studio/bigquery');
                            }}
                            className="space-y-4"
                        >
                            <Field className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.enabled}
                                    onChange={(checked) => setData('enabled', checked)}
                                />
                                <Label>{t('integrations.enable_bigquery')}</Label>
                            </Field>
                            <Field>
                                <Label>{t('integrations.bq_project')}</Label>
                                <Input value={data.project_id} onChange={(e) => setData('project_id', e.target.value)} />
                            </Field>
                            <Field>
                                <Label>{t('integrations.bq_dataset')}</Label>
                                <Input value={data.dataset} onChange={(e) => setData('dataset', e.target.value)} />
                            </Field>
                            <Button type="submit" disabled={processing}>{t('integrations.save_bigquery')}</Button>
                        </form>
                    </PageSection>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
