import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/Components/catalyst/badge';
import { Text } from '@/Components/catalyst/text';
import { useTranslation } from '@/hooks/useTranslation';
import { Plug, Workflow, BarChart3 } from 'lucide-react';

function StatusBadge({ status }) {
    const color = status === 'connected' ? 'emerald' : status === 'error' ? 'red' : 'zinc';
    return <Badge color={color}>{status}</Badge>;
}

export default function Index({ integrations, platform }) {
    const { t } = useTranslation();

    const cards = [
        {
            key: 'n8n',
            title: 'n8n',
            description: t('integrations.n8n_desc'),
            href: '/settings/integrations/n8n',
            icon: Workflow,
            status: integrations.n8n?.status,
        },
        {
            key: 'hubspot',
            title: 'HubSpot',
            description: t('integrations.hubspot_desc'),
            href: '/settings/integrations/hubspot',
            icon: Plug,
            status: integrations.hubspot?.status,
            warning: !platform.hubspot_configured ? t('integrations.platform_hubspot_missing') : null,
        },
        {
            key: 'looker_studio',
            title: 'Looker Studio',
            description: t('integrations.looker_desc'),
            href: '/settings/integrations/looker-studio',
            icon: BarChart3,
            status: integrations.looker_studio?.status,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('integrations.title')} />
            <div className="max-w-4xl space-y-6">
                <PageHeader
                    title={t('integrations.title')}
                    subtitle={t('integrations.subtitle')}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <PageSection key={card.key}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className="size-5 text-slate-600" />
                                        <h3 className="font-semibold text-slate-900">{card.title}</h3>
                                    </div>
                                    <StatusBadge status={card.status || 'disconnected'} />
                                </div>
                                <Text className="mt-2">{card.description}</Text>
                                {card.warning && (
                                    <Text className="mt-2 text-amber-700">{card.warning}</Text>
                                )}
                                <div className="mt-4">
                                    <Link
                                        href={card.href}
                                        className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        {t('integrations.configure')}
                                    </Link>
                                </div>
                            </PageSection>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
