import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import { Head, Link } from '@inertiajs/react';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { useTranslation } from '@/hooks/useTranslation';
import {
    Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

export default function Studio({ summary, schema, looker, export_url }) {
    const { t } = useTranslation();
    const byDay = Object.entries(summary?.by_day || {}).map(([date, count]) => ({ date, count }));

    return (
        <AuthenticatedLayout>
            <Head title={t('integrations.studio_title')} />
            <div className="max-w-5xl space-y-6">
                <PageHeader
                    title={t('integrations.studio_title')}
                    subtitle={t('integrations.studio_subtitle')}
                />

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/settings/integrations/looker-studio"
                        className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        {t('integrations.configure_looker')}
                    </Link>
                    <Badge color={looker?.is_connected ? 'emerald' : 'zinc'}>
                        Looker Studio: {looker?.status || 'disconnected'}
                    </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <PageSection>
                        <Text className="text-xs uppercase text-slate-500">{t('integrations.total_calls')}</Text>
                        <div className="text-3xl font-semibold">{summary?.total_calls ?? 0}</div>
                    </PageSection>
                    <PageSection>
                        <Text className="text-xs uppercase text-slate-500">{t('integrations.avg_duration')}</Text>
                        <div className="text-3xl font-semibold">{summary?.avg_duration_seconds ?? 0}s</div>
                    </PageSection>
                    <PageSection>
                        <Text className="text-xs uppercase text-slate-500">{t('integrations.export_endpoint')}</Text>
                        <code className="mt-1 block break-all text-xs">{export_url}</code>
                    </PageSection>
                </div>

                <PageSection>
                    <Text className="mb-4 font-medium">{t('integrations.calls_over_time')}</Text>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#0f766e" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </PageSection>

                <PageSection>
                    <Text className="mb-2 font-medium">{t('integrations.export_schema')}</Text>
                    <ul className="grid gap-1 sm:grid-cols-2">
                        {(schema || []).map((field) => (
                            <li key={field.name} className="text-sm text-slate-700">
                                <code>{field.name}</code> — {field.type}
                            </li>
                        ))}
                    </ul>
                </PageSection>
            </div>
        </AuthenticatedLayout>
    );
}
