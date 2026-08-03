import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Components/PageHeader'
import DataTable from '@/Components/DataTable'
import { Head, Link, router } from '@inertiajs/react'
import { useMemo, useState } from 'react'
import { Badge } from '@/Components/catalyst/badge'
import { Button } from '@/Components/catalyst/button'
import { Input } from '@/Components/catalyst/input'
import { Select } from '@/Components/catalyst/select'
import { show as callShow } from '@/actions/App/Http/Controllers/Web/CallController'
import calls from '@/routes/calls'
import { useTranslation } from '@/hooks/useTranslation'
import { callStatusLabel } from '@/utils/callStatusLabel'
import { Phone, Download, Headphones, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const statusColors = {
    completed: 'emerald',
    failed: 'red',
    busy: 'orange',
    'no-answer': 'zinc',
    cancelled: 'zinc',
    initiated: 'blue',
    ringing: 'blue',
    in_progress: 'amber',
}

export default function CallsIndex({ calls: callsData, filters }) {
    const { t, locale } = useTranslation()
    const [search, setSearch] = useState(filters.search ?? '')

    function applyFilter() {
        router.get('/calls', { search, status: filters.status }, { preserveState: true })
    }

    function setStatus(status) {
        router.get('/calls', { search, status }, { preserveState: true })
    }

    function exportCalls() {
        window.open(calls.export({ query: { search, status: filters.status ?? '' } }).url, '_blank', 'noopener,noreferrer')
    }

    const statuses = ['', 'completed', 'failed', 'in_progress', 'initiated', 'ringing', 'busy', 'no-answer', 'cancelled']

    const columns = useMemo(() => [
        {
            id: 'sid',
            header: t('calls.call_sid'),
            meta: { mono: true },
            cell: (call) => <span className="text-slate-600">{call.call_sid}</span>,
        },
        {
            id: 'from',
            header: t('calls.from'),
            cell: (call) => <span className="font-medium text-slate-900">{call.from_number}</span>,
        },
        {
            id: 'to',
            header: t('calls.to'),
            cell: (call) => call.to_number,
        },
        {
            id: 'flow',
            header: t('calls.flow'),
            cell: (call) => call.flow_name || <span className="italic text-slate-400">&mdash;</span>,
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
            id: 'duration',
            header: t('calls.duration'),
            meta: { mono: true },
            cell: (call) => (
                call.duration_seconds
                    ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                    : '\u2014'
            ),
        },
        {
            id: 'date',
            header: t('ui.date'),
            cell: (call) => new Date(call.created_at).toLocaleString(locale || undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            }),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            meta: { align: 'right' },
            cell: (call) => (
                <div className="flex items-center justify-end gap-2">
                    {call.recording_url && (
                        <a
                            href={`/recordings/${call.id}/play`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t('ui.play_recording')}
                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-cyan-700"
                        >
                            <Headphones className="size-4" />
                        </a>
                    )}
                    <Link
                        href={callShow({ call: call.id }).url}
                        className="text-[13px] font-semibold text-cyan-700 hover:text-cyan-600"
                    >
                        {t('ui.view')}
                    </Link>
                </div>
            ),
        },
    ], [t, locale])

    return (
        <AuthenticatedLayout>
            <Head title={t('calls.title')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.calls_title')}
                    subtitle={t('ui.calls_subtitle')}
                    actions={(
                        <>
                            <Button onClick={exportCalls} outline>
                                <Download className="size-4" />
                                {t('ui.export_csv')}
                            </Button>
                            <Link href={calls.scheduled().url}>
                                <Button outline>
                                    <Phone className="size-4" />
                                    {t('ui.scheduled')}
                                </Button>
                            </Link>
                        </>
                    )}
                />

                <DataTable
                    columns={columns}
                    data={callsData.data}
                    getRowId={(row) => row.id}
                    emptyIcon={Phone}
                    emptyTitle={t('ui.no_calls_found')}
                    emptyDescription={t('ui.adjust_filters')}
                    toolbar={(
                        <>
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    className="pl-9"
                                    placeholder={t('ui.search_calls')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                                />
                            </div>
                            <div className="w-44">
                                <Select value={filters.status ?? ''} onChange={(e) => setStatus(e.target.value)}>
                                    {statuses.map((s) => (
                                        <option key={s || 'all'} value={s}>
                                            {s ? callStatusLabel(t, s) : t('ui.all_statuses')}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </>
                    )}
                    footer={callsData.last_page > 1 ? (
                        <div className="flex items-center justify-center gap-1">
                            {callsData.prev_page_url && (
                                <Link
                                    href={callsData.prev_page_url}
                                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                                >
                                    <ChevronLeft className="size-4" />
                                    {t('ui.previous')}
                                </Link>
                            )}
                            {Array.from({ length: callsData.last_page }, (_, i) => i + 1).map((page) => (
                                <Link
                                    key={page}
                                    href={`/calls?page=${page}${filters.status ? `&status=${filters.status}` : ''}${search ? `&search=${search}` : ''}`}
                                    className={`min-w-9 rounded-md px-2.5 py-1.5 text-center text-sm font-medium transition-colors ${
                                        callsData.current_page === page
                                            ? 'bg-slate-950 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {page}
                                </Link>
                            ))}
                            {callsData.next_page_url && (
                                <Link
                                    href={callsData.next_page_url}
                                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                                >
                                    {t('ui.next')}
                                    <ChevronRight className="size-4" />
                                </Link>
                            )}
                        </div>
                    ) : null}
                />
            </div>
        </AuthenticatedLayout>
    )
}
