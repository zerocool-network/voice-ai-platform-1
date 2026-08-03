import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/catalyst/button';
import { Field, Label } from '@/Components/catalyst/fieldset';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Checkbox } from '@/Components/catalyst/checkbox';
import { useTranslation } from '@/hooks/useTranslation';

export default function HubSpot({ integration, platform_configured, scopes }) {
    const { t } = useTranslation();
    const connected = integration?.is_connected;
    const sync = integration?.sync || {};
    const { data, setData, post, processing } = useForm({
        create_contact: sync.create_contact ?? true,
        log_call_engagement: sync.log_call_engagement ?? true,
        create_ticket_on_transfer: sync.create_ticket_on_transfer ?? false,
    });

    return (
        <AuthenticatedLayout>
            <Head title={t('integrations.hubspot_title')} />
            <div className="max-w-3xl space-y-6">
                <PageHeader
                    title={t('integrations.hubspot_title')}
                    subtitle={t('integrations.hubspot_subtitle')}
                />

                <PageSection>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Text>
                            {t('integrations.status')}:{' '}
                            <Badge color={connected ? 'emerald' : 'zinc'}>{integration?.status}</Badge>
                        </Text>
                        <div className="flex gap-2">
                            {!connected && (
                                <Button
                                    type="button"
                                    disabled={!platform_configured}
                                    onClick={() => router.post('/settings/integrations/hubspot/connect')}
                                >
                                    {t('integrations.connect_oauth')}
                                </Button>
                            )}
                            {connected && (
                                <Button type="button" color="red" onClick={() => router.post('/settings/integrations/hubspot/disconnect')}>
                                    {t('integrations.disconnect')}
                                </Button>
                            )}
                        </div>
                    </div>
                    {!platform_configured && (
                        <Text className="mt-3 text-amber-700">{t('integrations.platform_hubspot_missing')}</Text>
                    )}
                    {integration?.portal_id && (
                        <Text className="mt-2">Portal ID: {integration.portal_id}</Text>
                    )}
                </PageSection>

                <PageSection>
                    <Text className="mb-2 font-medium">{t('integrations.requested_scopes')}</Text>
                    <ul className="flex flex-wrap gap-2">
                        {(scopes || []).map((scope) => (
                            <Badge key={scope} color="zinc">{scope}</Badge>
                        ))}
                    </ul>
                </PageSection>

                {connected && (
                    <PageSection>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                post('/settings/integrations/hubspot/sync');
                            }}
                            className="space-y-4"
                        >
                            <Field className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.create_contact}
                                    onChange={(checked) => setData('create_contact', checked)}
                                />
                                <Label>{t('integrations.sync_create_contact')}</Label>
                            </Field>
                            <Field className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.log_call_engagement}
                                    onChange={(checked) => setData('log_call_engagement', checked)}
                                />
                                <Label>{t('integrations.sync_log_call')}</Label>
                            </Field>
                            <Field className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.create_ticket_on_transfer}
                                    onChange={(checked) => setData('create_ticket_on_transfer', checked)}
                                />
                                <Label>{t('integrations.sync_ticket_on_transfer')}</Label>
                            </Field>
                            <Button type="submit" disabled={processing}>{t('integrations.save_sync')}</Button>
                        </form>
                    </PageSection>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
