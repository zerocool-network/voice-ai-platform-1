import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { index as activityIndex } from '@/actions/App/Http/Controllers/Web/ActivityLogController';
import { ChevronLeft, ChevronRight, Activity as ActivityIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const EVENT_COLORS = {
    login: 'emerald', logout: 'zinc', login_failed: 'red',
    created: 'emerald', updated: 'blue', deleted: 'red',
    api_token_created: 'emerald', api_token_revoked: 'red',
    plan_changed: 'amber', invite_sent: 'blue', invite_accepted: 'emerald',
    role_changed: 'amber', member_removed: 'red',
};

export default function Index({ activities, filters }) {
    const { t } = useTranslation();
    const [logName, setLogName] = useState(filters.log_name || '');
    const [search, setSearch] = useState(filters.search || '');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');

    const logNames = useMemo(() => [
        { value: '', label: t('ui.all_events') },
        { value: 'security', label: 'Security' },
        { value: 'team', label: t('ui.team_title') },
        { value: 'billing', label: t('settings.billing') },
        { value: 'flow', label: t('ui.flow') },
        { value: 'webhook', label: t('ui.webhooks_title') },
        { value: 'document', label: t('ui.documents') },
        { value: 'settings', label: t('settings.title') },
    ], [t]);

    function applyFilters() {
        router.get(activityIndex().url, { log_name: logName, search, from, to }, {
            preserveState: true, replace: true,
        });
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') applyFilters();
    }

    const columns = useMemo(() => [
        {
            id: 'time',
            header: t('ui.time'),
            cell: (item) => (
                <span className="text-sm text-slate-500" title={item.created_at_exact}>
                    {item.created_at}
                </span>
            ),
        },
        {
            id: 'user',
            header: t('ui.user_label'),
            cell: (item) => (
                item.causer ? (
                    <span className="font-medium">{item.causer.name}</span>
                ) : (
                    <span className="text-slate-400">{t('ui.system_label')}</span>
                )
            ),
        },
        {
            id: 'action',
            header: t('ui.action'),
            cell: (item) => <Badge color={EVENT_COLORS[item.event] || 'zinc'}>{item.event}</Badge>,
        },
        {
            id: 'description',
            header: t('ui.description'),
            className: 'max-w-md truncate',
            cell: (item) => item.description,
        },
    ], [t]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.activity_title')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.activity_title')}
                    subtitle={t('ui.activity_subtitle_track')}
                />

                <DataTable
                    columns={columns}
                    data={activities.data}
                    getRowId={(row) => row.id}
                    emptyIcon={ActivityIcon}
                    emptyTitle={t('ui.no_activity_found')}
                    emptyDescription={t('ui.activity_will_appear')}
                    toolbar={(
                        <>
                            <div className="min-w-40">
                                <Select value={logName} onChange={(e) => { setLogName(e.target.value); applyFilters(); }}>
                                    {logNames.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="min-w-40">
                                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                            </div>
                            <div className="min-w-40">
                                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                            </div>
                            <div className="min-w-60 flex-1">
                                <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('ui.search_description')} />
                            </div>
                            <Button outline onClick={applyFilters}>{t('ui.search_label')}</Button>
                        </>
                    )}
                    footer={activities.last_page > 1 ? (
                        <div className="flex items-center justify-center gap-1">
                            {activities.prev_page_url && (
                                <Link href={activities.prev_page_url} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
                                    <ChevronLeft className="size-4" /> {t('ui.previous_label')}
                                </Link>
                            )}
                            {Array.from({ length: activities.last_page }, (_, i) => i + 1).map((page) => (
                                <Link
                                    key={page}
                                    href={`${activityIndex().url}?page=${page}${logName ? `&log_name=${logName}` : ''}${search ? `&search=${search}` : ''}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`}
                                    className={`min-w-9 rounded-md px-2.5 py-1.5 text-center text-sm font-medium transition-colors ${
                                        activities.current_page === page ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {page}
                                </Link>
                            ))}
                            {activities.next_page_url && (
                                <Link href={activities.next_page_url} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
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
