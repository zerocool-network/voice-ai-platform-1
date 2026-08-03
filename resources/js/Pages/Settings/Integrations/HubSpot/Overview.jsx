import HubSpotConsoleLayout from '@/Components/HubSpot/HubSpotConsoleLayout';
import HubSpotStatusBadge from '@/Components/HubSpot/HubSpotStatusBadge';
import ScopeGate from '@/Components/HubSpot/ScopeGate';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Text } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';
import { Head, Link, router } from '@inertiajs/react';

export default function Overview({ integration, platform_configured, scopes, account, api_meta, object_types, nav }) {
    const { t } = useTranslation();
    const connected = integration?.is_connected;
    const granted = scopes?.granted || [];
    const required = scopes?.required || [];
    const optional = scopes?.optional || [];

    return (
        <>
            <Head title={t('integrations.hubspot_title')} />
            <HubSpotConsoleLayout integration={integration} nav={nav}>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <Text className="text-lg font-semibold">{t('hubspot.modules.overview')}</Text>
                            <Text className="text-sm text-slate-500">{t('hubspot.overview_hint')}</Text>
                        </div>
                        <div className="flex gap-2">
                            {!connected && (
                                <Button type="button" disabled={!platform_configured} onClick={() => router.post('/settings/integrations/hubspot/connect')}>
                                    {t('integrations.connect_oauth')}
                                </Button>
                            )}
                            {connected && (
                                <>
                                    <Button type="button" outline onClick={() => router.post('/settings/integrations/hubspot/connect')}>
                                        {t('hubspot.reconnect')}
                                    </Button>
                                    <Button type="button" color="red" onClick={() => router.post('/settings/integrations/hubspot/disconnect')}>
                                        {t('integrations.disconnect')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {!platform_configured && (
                        <Text className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">{t('integrations.platform_hubspot_missing')}</Text>
                    )}

                    {integration?.auth_source === 'hubspot_cli' && (
                        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
                            <Text className="font-medium text-sky-900">{t('hubspot.cli_token_title')}</Text>
                            <Text className="mt-1 text-sky-800">{t('hubspot.cli_token_body')}</Text>
                            <Button className="mt-3" type="button" onClick={() => router.post('/settings/integrations/hubspot/connect')}>
                                {t('hubspot.migrate_to_oauth')}
                            </Button>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-100 p-4">
                            <Text className="text-xs uppercase text-slate-400">{t('integrations.status')}</Text>
                            <div className="mt-2"><HubSpotStatusBadge connected={connected} status={integration?.status} authSource={integration?.auth_source} /></div>
                        </div>
                        <div className="rounded-xl border border-slate-100 p-4">
                            <Text className="text-xs uppercase text-slate-400">{t('hubspot.portal')}</Text>
                            <Text className="mt-2 font-medium">{integration?.portal_id || '—'}</Text>
                        </div>
                        <div className="rounded-xl border border-slate-100 p-4">
                            <Text className="text-xs uppercase text-slate-400">{t('hubspot.last_sync')}</Text>
                            <Text className="mt-2 font-medium">{integration?.last_sync_at || '—'}</Text>
                        </div>
                    </div>

                    <ScopeGate apiMeta={api_meta} connected={connected}>
                        {account && (
                            <div className="rounded-xl border border-slate-100 p-4">
                                <Text className="mb-2 font-medium">{t('hubspot.account_health')}</Text>
                                <dl className="grid gap-2 sm:grid-cols-2 text-sm">
                                    <div><span className="text-slate-400">UTC</span> · {account.utcOffset || account.timeZone || '—'}</div>
                                    <div><span className="text-slate-400">Currency</span> · {account.companyCurrency || '—'}</div>
                                    <div><span className="text-slate-400">UI Domain</span> · {account.uiDomain || '—'}</div>
                                    <div><span className="text-slate-400">Data Hosting</span> · {account.dataHostingLocation || '—'}</div>
                                </dl>
                            </div>
                        )}
                    </ScopeGate>

                    <div>
                        <Text className="mb-2 font-medium">{t('hubspot.scopes_matrix')}</Text>
                        <div className="flex flex-wrap gap-2">
                            {required.map((scope) => (
                                <Badge key={scope} color={granted.includes(scope) || granted.length === 0 ? 'emerald' : 'amber'}>{scope}</Badge>
                            ))}
                            {optional.map((scope) => (
                                <Badge key={scope} color="zinc">{scope} (optional)</Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Text className="mb-2 font-medium">{t('hubspot.crm_catalog')}</Text>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {object_types.map((type) => (
                                <Link
                                    key={type.slug}
                                    href={`/settings/integrations/hubspot/objects/${type.slug}`}
                                    className="rounded-xl border border-slate-100 px-3 py-3 text-sm hover:border-orange-200 hover:bg-orange-50/40"
                                >
                                    <div className="font-medium text-slate-800">{t(type.label_key)}</div>
                                    <div className="text-xs text-slate-400">{type.object_type_id}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button outline href="/settings/integrations/hubspot/voice-sync">{t('hubspot.modules.voice-sync')}</Button>
                        <Button outline href="/settings/integrations/hubspot/modules/webhooks">{t('hubspot.modules.webhooks')}</Button>
                        <Button outline href="/settings/integrations/hubspot/search">{t('hubspot.modules.search')}</Button>
                    </div>
                </div>
            </HubSpotConsoleLayout>
        </>
    );
}
