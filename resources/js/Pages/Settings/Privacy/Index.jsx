import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import DataTable from '@/Components/DataTable';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { Subheading } from '@/Components/catalyst/heading';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { Shield } from 'lucide-react';

export default function Index({ summary, dataProtection, consentLogs }) {
    const { t, locale } = useTranslation();
    const retentionDays = dataProtection?.retention_days ?? 90;

    const dataMapRows = useMemo(() => [
        {
            id: 'recordings',
            data_type: t('ui.call_recordings'),
            storage: t('ui.local_filesystem'),
            retention: `${retentionDays} ${t('ui.days')}`,
            encrypted: 'yes',
        },
        {
            id: 'logs',
            data_type: t('ui.call_logs'),
            storage: t('ui.database'),
            retention: `${retentionDays} ${t('ui.days')}`,
            encrypted: 'no',
        },
        {
            id: 'users',
            data_type: t('ui.user_accounts'),
            storage: t('ui.database'),
            retention: t('ui.lifetime'),
            encrypted: 'no',
        },
        {
            id: 'config',
            data_type: t('ui.configuration'),
            storage: t('ui.database_json'),
            retention: t('ui.lifetime'),
            encrypted: 'partial',
        },
    ], [t, retentionDays]);

    const dataMapColumns = useMemo(() => [
        {
            id: 'data_type',
            header: t('ui.data_type'),
            cell: (row) => <span className="font-medium">{row.data_type}</span>,
        },
        { id: 'storage', header: t('ui.storage'), cell: (row) => row.storage },
        { id: 'retention', header: t('ui.retention'), cell: (row) => row.retention },
        {
            id: 'encrypted',
            header: t('ui.encrypted'),
            cell: (row) => {
                if (row.encrypted === 'yes') return <Badge color="emerald">{t('ui.yes_label')}</Badge>;
                if (row.encrypted === 'partial') return <Badge color="emerald">{t('ui.partial')}</Badge>;
                return <Badge color="zinc">{t('ui.no_label')}</Badge>;
            },
        },
    ], [t]);

    const consentColumns = useMemo(() => [
        {
            id: 'event',
            header: t('ui.event'),
            cell: (log) => (
                <Badge color={log.event === 'consent_granted' ? 'emerald' : 'red'}>
                    {log.event === 'consent_granted' ? t('ui.granted') : t('ui.declined')}
                </Badge>
            ),
        },
        {
            id: 'caller',
            header: t('ui.caller'),
            cell: (log) => log.properties?.caller ?? '-',
        },
        {
            id: 'date',
            header: t('ui.date'),
            cell: (log) => new Date(log.created_at).toLocaleString(locale || undefined),
        },
    ], [t, locale]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.privacy_compliance')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.privacy_compliance')}
                    subtitle={t('ui.privacy_compliance_desc')}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <PageSection className="!p-5">
                        <p className="text-sm text-slate-500">{t('ui.total_calls')}</p>
                        <p className="mt-1 text-2xl font-semibold">{summary.total_calls}</p>
                    </PageSection>
                    <PageSection className="!p-5">
                        <p className="text-sm text-slate-500">{t('ui.users')}</p>
                        <p className="mt-1 text-2xl font-semibold">{summary.total_users}</p>
                    </PageSection>
                    <PageSection className="!p-5">
                        <p className="text-sm text-slate-500">{t('ui.flows')}</p>
                        <p className="mt-1 text-2xl font-semibold">{summary.total_flows}</p>
                    </PageSection>
                    <PageSection className="!p-5">
                        <p className="text-sm text-slate-500">{t('ui.retention')}</p>
                        <p className="mt-1 text-2xl font-semibold">{retentionDays} {t('ui.days')}</p>
                    </PageSection>
                </div>

                <div>
                    <Subheading>{t('ui.data_map')}</Subheading>
                    <DataTable
                        className="mt-4"
                        columns={dataMapColumns}
                        data={dataMapRows}
                        getRowId={(row) => row.id}
                        density="dense"
                    />
                </div>

                <div>
                    <Subheading>{t('ui.actions_section')}</Subheading>
                    <div className="mt-4 flex gap-4">
                        <Link href="/api/tenant/data/export">
                            <Button>{t('ui.export_data')}</Button>
                        </Link>
                        <Link href="/settings/data-protection">
                            <Button outline>{t('ui.data_protection_settings')}</Button>
                        </Link>
                    </div>
                </div>

                <div>
                    <Subheading>{t('ui.recent_consent_activity')}</Subheading>
                    <DataTable
                        className="mt-4"
                        columns={consentColumns}
                        data={consentLogs.data}
                        getRowId={(row) => row.id}
                        emptyIcon={Shield}
                        emptyTitle={t('ui.no_consent_events')}
                        emptyDescription={t('ui.consent_events_appear')}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
