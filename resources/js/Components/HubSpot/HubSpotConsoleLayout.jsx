import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import HubSpotStatusBadge from '@/Components/HubSpot/HubSpotStatusBadge';
import { GROUP_LABEL_KEYS } from '@/Components/HubSpot/navigation';
import { Text } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';
import { Link, usePage } from '@inertiajs/react';

export default function HubSpotConsoleLayout({ title, subtitle, integration, nav = [], children }) {
    const { t } = useTranslation();
    const { url } = usePage();

    return (
        <AuthenticatedLayout>
            <div className="space-y-6">
                <PageHeader
                    title={title || t('integrations.hubspot_title')}
                    subtitle={subtitle || t('hubspot.console_subtitle')}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div className="space-y-1">
                        <Text className="font-medium">{t('integrations.status')}</Text>
                        <HubSpotStatusBadge
                            connected={integration?.is_connected}
                            status={integration?.status}
                            authSource={integration?.auth_source}
                        />
                    </div>
                    {integration?.portal_id && (
                        <Text className="text-sm text-slate-500">Portal {integration.portal_id}</Text>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="h-fit max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <nav className="space-y-4">
                            {nav.map((group) => (
                                <div key={group.group}>
                                    <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        {t(GROUP_LABEL_KEYS[group.group] || `hubspot.groups.${group.group}`)}
                                    </div>
                                    <ul className="space-y-0.5">
                                        {group.items.map((item) => {
                                            const active = url === item.href || url.startsWith(`${item.href}?`) || url.startsWith(`${item.href}/`);
                                            return (
                                                <li key={item.key}>
                                                    <Link
                                                        href={item.href}
                                                        className={`block rounded-lg px-2.5 py-1.5 text-sm transition ${
                                                            active
                                                                ? 'bg-orange-50 font-medium text-orange-800'
                                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        {t(item.label_key)}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
