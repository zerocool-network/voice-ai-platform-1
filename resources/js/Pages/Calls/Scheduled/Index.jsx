import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import DataTable from '@/Components/DataTable';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Text } from '@/Components/catalyst/text';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Badge } from '@/Components/catalyst/badge';
import { Button } from '@/Components/catalyst/button';
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination';
import { useTranslation } from '@/hooks/useTranslation';
import { callStatusLabel } from '@/utils/callStatusLabel';
import { CalendarClock } from 'lucide-react';

const statusColors = { pending: 'blue', completed: 'emerald', failed: 'red', cancelled: 'zinc', in_progress: 'amber' };

const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Sao_Paulo', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid',
    'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney',
    'Pacific/Auckland',
];

export default function Index({ calls, flows, stats }) {
    const { t, locale } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        flow_id: '',
        phone_number: '',
        scheduled_at: '',
        frequency: 'once',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/calls/scheduled', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    }

    const columns = useMemo(() => {
        const frequencyLabels = {
            once: t('ui.once'),
            daily: t('ui.daily'),
            weekly: t('ui.weekly'),
            monthly: t('ui.monthly'),
        };

        const formatDate = (date) => {
            if (!date) return '\u2014';
            return new Date(date).toLocaleString(locale || undefined, {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
        };

        return [
        {
            id: 'phone',
            header: t('ui.phone'),
            cell: (call) => <span className="font-medium text-slate-900">{call.phone_number}</span>,
        },
        {
            id: 'flow',
            header: t('calls.flow'),
            cell: (call) => call.flow?.name || '\u2014',
        },
        {
            id: 'scheduled_at',
            header: t('ui.scheduled_at'),
            cell: (call) => formatDate(call.scheduled_at),
        },
        {
            id: 'frequency',
            header: t('ui.frequency'),
            cell: (call) => (
                <Badge color="purple">{frequencyLabels[call.frequency] || call.frequency}</Badge>
            ),
        },
        {
            id: 'status',
            header: t('calls.status'),
            cell: (call) => (
                <Badge color={statusColors[call.status] || 'zinc'}>
                    {callStatusLabel(t, call.status)}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            meta: { align: 'right' },
            cell: (call) => (
                <div className="flex justify-end gap-3">
                    {call.status === 'pending' && (
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm(t('ui.cancel_scheduled_call'))) {
                                    router.patch(`/calls/scheduled/${call.id}/cancel`);
                                }
                            }}
                            className="text-[13px] font-semibold text-amber-600 hover:text-amber-500"
                        >
                            {t('ui.cancel')}
                        </button>
                    )}
                    {call.status !== 'in_progress' && (
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm(t('ui.delete_scheduled_call'))) {
                                    router.delete(`/calls/scheduled/${call.id}`);
                                }
                            }}
                            className="text-[13px] font-semibold text-rose-600 hover:text-rose-500"
                        >
                            {t('common.delete')}
                        </button>
                    )}
                </div>
            ),
        },
    ];
    }, [t, locale]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.scheduled_calls')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.scheduled_calls')}
                    subtitle={t('ui.schedule_outbound_calls')}
                    actions={(
                        <>
                            <Link href="/calls">
                                <Button outline>{t('ui.back_to_call_logs')}</Button>
                            </Link>
                            <Button onClick={() => setShowModal(true)}>{t('ui.schedule_call')}</Button>
                        </>
                    )}
                />

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: t('ui.pending'), value: stats.pending },
                        { label: t('ui.due_today'), value: stats.dueToday },
                        { label: t('ui.completed_today'), value: stats.completedToday },
                    ].map((kpi) => (
                        <PageSection key={kpi.label} className="!p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{kpi.label}</p>
                            <p className="font-metric mt-2 text-[26px] font-semibold leading-none text-slate-950">{kpi.value}</p>
                        </PageSection>
                    ))}
                </div>

                <DataTable
                    columns={columns}
                    data={calls.data}
                    getRowId={(row) => row.id}
                    emptyIcon={CalendarClock}
                    emptyTitle={t('ui.no_scheduled_calls')}
                    emptyDescription={t('ui.schedule_first_call')}
                    emptyAction={{ label: t('ui.schedule_call'), onClick: () => setShowModal(true) }}
                    footer={calls.links ? (
                        <Pagination>
                            <PaginationPrevious href={calls.prev_page_url} />
                            <PaginationList>
                                {calls.links.map((link, i) => {
                                    if (link.url === null) return <PaginationGap key={link.label || i} />;
                                    const label = link.label.replace(/&laquo;|&raquo;/g, '').trim();
                                    const pageNum = parseInt(label);
                                    if (isNaN(pageNum)) return null;
                                    return (
                                        <PaginationPage key={link.url} href={link.url} current={link.active}>
                                            {pageNum}
                                        </PaginationPage>
                                    );
                                })}
                            </PaginationList>
                            <PaginationNext href={calls.next_page_url} />
                        </Pagination>
                    ) : null}
                />
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <PageSection className="w-full max-w-md shadow-xl">
                        <h2 className="text-lg font-semibold text-slate-950">{t('ui.schedule_a_call')}</h2>
                        <Text className="mt-1 mb-4">{t('ui.set_up_automated_call')}</Text>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-950">{t('calls.flow')}</label>
                                <Select
                                    className="mt-1 w-full"
                                    value={data.flow_id}
                                    onChange={(e) => setData('flow_id', e.target.value)}
                                    required
                                >
                                    <option value="">{t('ui.select_flow')}</option>
                                    {flows.map((flow) => (
                                        <option key={flow.id} value={flow.id}>
                                            {flow.name}{flow.phone_number ? ` (${flow.phone_number})` : ''}
                                        </option>
                                    ))}
                                </Select>
                                {errors.flow_id && <Text className="mt-1 text-sm text-red-600">{errors.flow_id}</Text>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-950">{t('ui.phone_number')}</label>
                                <Input
                                    className="mt-1 w-full"
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    placeholder="+1234567890"
                                    required
                                />
                                {errors.phone_number && <Text className="mt-1 text-sm text-red-600">{errors.phone_number}</Text>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-950">{t('ui.scheduled_at')}</label>
                                <Input
                                    className="mt-1 w-full"
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                    required
                                />
                                {errors.scheduled_at && <Text className="mt-1 text-sm text-red-600">{errors.scheduled_at}</Text>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-950">{t('ui.frequency')}</label>
                                <Select
                                    className="mt-1 w-full"
                                    value={data.frequency}
                                    onChange={(e) => setData('frequency', e.target.value)}
                                >
                                    <option value="once">{t('ui.once')}</option>
                                    <option value="daily">{t('ui.daily')}</option>
                                    <option value="weekly">{t('ui.weekly')}</option>
                                    <option value="monthly">{t('ui.monthly')}</option>
                                </Select>
                                {errors.frequency && <Text className="mt-1 text-sm text-red-600">{errors.frequency}</Text>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-950">{t('ui.timezone')}</label>
                                <Select
                                    className="mt-1 w-full"
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                >
                                    {timezones.map((tz) => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </Select>
                                {errors.timezone && <Text className="mt-1 text-sm text-red-600">{errors.timezone}</Text>}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    outline
                                    type="button"
                                    onClick={() => { setShowModal(false); reset(); }}
                                >
                                    {t('ui.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? t('ui.scheduling') : t('ui.schedule_call')}
                                </Button>
                            </div>
                        </form>
                    </PageSection>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
