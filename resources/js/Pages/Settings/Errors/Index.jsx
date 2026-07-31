import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { resolve as resolveError } from '@/routes/settings/errors';
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

function StatCard({ label, value, icon: Icon }) {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="size-4 text-slate-400" />}
                <Text className="text-sm">{label}</Text>
            </div>
            <p className="mt-1 text-[28px] font-bold text-slate-950">{value}</p>
        </div>
    );
}

export default function Index({ errors, stats, filter }) {
    const { t, locale } = useTranslation();

    const filters = [
        { key: 'all', label: t('ui.all_label') },
        { key: 'unresolved', label: t('ui.unresolved') },
        { key: 'resolved', label: t('ui.resolved') },
    ];

    function resolve(hash) {
        router.patch(resolveError({ hash }).url, {}, {
            preserveScroll: true,
        });
    }

    const columns = useMemo(() => [
        {
            id: 'class',
            header: t('ui.error_class'),
            cell: (err) => <Badge color="red">{err.class.replace(/^.*\\/, '')}</Badge>,
        },
        {
            id: 'message',
            header: t('ui.message'),
            className: 'max-w-xs truncate',
            cell: (err) => err.message,
        },
        {
            id: 'file',
            header: t('ui.file_line'),
            cell: (err) => (
                <span className="text-sm text-slate-500">
                    {err.file.replace(/^.*\//, '')}:{err.line}
                </span>
            ),
        },
        {
            id: 'occurrences',
            header: t('ui.occurrences'),
            meta: { align: 'right' },
            cell: (err) => <span className="font-medium">{err.occurrence_count}</span>,
        },
        {
            id: 'last_seen',
            header: t('ui.last_seen'),
            cell: (err) => (
                <span className="text-sm text-slate-500">
                    {new Date(err.last_seen_at).toLocaleString(locale || undefined)}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            meta: { align: 'right' },
            cell: (err) => (
                <div className="flex items-center justify-end gap-2">
                    <Link
                        href={`/settings/errors/${err.hash}`}
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        {t('ui.details')}
                    </Link>
                    {!err.resolved_at && (
                        <Button plain size="sm" onClick={() => resolve(err.hash)}>
                            {t('ui.resolve_label')}
                        </Button>
                    )}
                </div>
            ),
        },
    ], [t, locale]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.error_tracking')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.error_tracking')}
                    subtitle={t('ui.error_tracking_desc')}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label={t('ui.total_errors')} value={stats.total} icon={AlertTriangle} />
                    <StatCard label={t('ui.unresolved')} value={stats.unresolved} icon={AlertTriangle} />
                    <StatCard label={t('ui.today')} value={stats.today} icon={Clock} />
                    <StatCard label={t('ui.this_week')} value={stats.this_week} icon={Clock} />
                </div>

                <DataTable
                    columns={columns}
                    data={errors.data}
                    getRowId={(row) => row.hash}
                    emptyIcon={CheckCircle2}
                    emptyTitle={t('ui.no_errors_found')}
                    emptyDescription={t('ui.all_clear')}
                    toolbar={(
                        <div className="flex items-center gap-2">
                            {filters.map((f) => (
                                <Link
                                    key={f.key}
                                    href={`/settings/errors?filter=${f.key}`}
                                    preserveScroll
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                        filter === f.key
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {f.label}
                                </Link>
                            ))}
                        </div>
                    )}
                    footer={errors.last_page > 1 ? (
                        <div className="flex items-center justify-center gap-1">
                            {errors.prev_page_url && (
                                <Link href={errors.prev_page_url} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                                    <ChevronLeft className="size-4" /> {t('ui.previous_label')}
                                </Link>
                            )}
                            {Array.from({ length: errors.last_page }, (_, i) => i + 1).map((page) => (
                                <Link
                                    key={page}
                                    href={`/settings/errors?page=${page}&filter=${filter}`}
                                    className={`min-w-9 rounded-md px-2.5 py-1.5 text-center text-sm font-medium transition-colors ${
                                        errors.current_page === page ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {page}
                                </Link>
                            ))}
                            {errors.next_page_url && (
                                <Link href={errors.next_page_url} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                                    {t('ui.next_label')} <ChevronRight className="size-4" />
                                </Link>
                            )}
                        </div>
                    ) : null}
                />
            </div>
        </AuthenticatedLayout>
    );
}
