import { useState, useCallback, useMemo } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { Activity, CheckCircle, XCircle, Clock, Percent, RotateCcw, ExternalLink, Search } from 'lucide-react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Components/PageHeader'
import DataTable from '@/Components/DataTable'
import MetricCard from '@/Components/MetricCard'
import WebhookDeliveryDrawer from '@/Components/WebhookDeliveryDrawer'
import { Button } from '@/Components/catalyst/button'
import { Badge } from '@/Components/catalyst/badge'
import { Input } from '@/Components/catalyst/input'
import { Select } from '@/Components/catalyst/select'
import { Pagination, PaginationList, PaginationPage, PaginationGap, PaginationNext, PaginationPrevious } from '@/Components/catalyst/pagination'
import { useTranslation } from '@/hooks/useTranslation'

const statusColors = { success: 'emerald', failed: 'red', pending: 'amber', dead: 'zinc' }

export default function Index({ deliveries, stats, successRate, filters = {}, destinations }) {
    const { t, locale } = useTranslation()
    const [detail, setDetail] = useState(null)
    const [searchText, setSearchText] = useState(filters.search ?? '')

    const pushFilters = useCallback((overrides) => {
        const next = {
            status: filters.status ?? '',
            event: filters.event ?? '',
            destination_id: filters.destination_id ?? '',
            search: filters.search ?? '',
            ...overrides,
        }
        const params = Object.fromEntries(Object.entries(next).filter(([, v]) => v))
        router.get('/settings/webhooks/deliveries', params, { preserveState: true })
    }, [filters])

    const setFilter = useCallback((key, value) => {
        pushFilters({ [key]: value, page: '' })
    }, [pushFilters])

    const handleSearch = useCallback((e) => {
        e.preventDefault()
        pushFilters({ search: searchText, page: '' })
    }, [searchText, pushFilters])

    const handleRetry = useCallback((e, delivery) => {
        e.stopPropagation()
        router.post(`/settings/webhooks/deliveries/${delivery.id}/retry`, {}, { preserveScroll: true })
    }, [])

    const uniqueEvents = [...new Set(destinations.flatMap((d) => d.events).filter(Boolean))]

    const columns = useMemo(() => [
        {
            id: 'time',
            header: t('ui.time'),
            cell: (d) => (
                <span className="text-xs text-zinc-500">
                    {new Date(d.created_at).toLocaleDateString(locale || undefined, {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                    })}
                </span>
            ),
        },
        {
            id: 'event',
            header: t('ui.event'),
            meta: { mono: true },
            cell: (d) => <span className="text-xs font-medium">{d.event}</span>,
        },
        {
            id: 'destination',
            header: t('ui.destination'),
            className: 'max-w-[180px] truncate text-xs text-zinc-500',
            cell: (d) => d.webhook_destination?.url,
        },
        {
            id: 'status',
            header: t('ui.status_label'),
            cell: (d) => <Badge color={statusColors[d.status] || 'zinc'}>{d.status}</Badge>,
        },
        {
            id: 'response',
            header: t('ui.response'),
            cell: (d) => (
                d.response_code ? (
                    <span className={`font-mono text-xs ${d.response_code >= 400 ? 'text-red-500' : 'text-zinc-500'}`}>
                        {d.response_code}
                    </span>
                ) : (
                    <span className="text-zinc-300">&mdash;</span>
                )
            ),
        },
        {
            id: 'attempts',
            header: t('ui.attempts'),
            cell: (d) => (
                <span className="text-xs text-zinc-500">
                    {d.attempt}
                    {d.next_attempt_at && (
                        <span className="ml-1 text-amber-500">*</span>
                    )}
                </span>
            ),
        },
        {
            id: 'actions',
            header: t('ui.actions'),
            meta: { align: 'right' },
            cell: (d) => (
                <div className="flex items-center justify-end gap-1">
                    {d.status === 'failed' && (
                        <Button
                            size="sm"
                            outline
                            onClick={(e) => handleRetry(e, d)}
                            data-testid={`retry-btn-${d.id}`}
                        >
                            <RotateCcw className="size-3" />
                            {t('ui.retry_button')}
                        </Button>
                    )}
                </div>
            ),
        },
    ], [t, locale, handleRetry])

    return (
        <AuthenticatedLayout>
            <div data-testid="webhook-deliveries-page" className="space-y-6">
                <Head title={t('ui.webhook_deliveries')} />

                <PageHeader
                    title={t('ui.webhook_deliveries')}
                    subtitle={t('ui.webhook_deliveries_desc')}
                    actions={(
                        <div className="flex items-center gap-2">
                            <Button outline onClick={() => setFilter('status', 'failed')}>
                                <XCircle className="size-4" />
                                {t('ui.view_failed')}
                            </Button>
                            <Link href="/settings/webhooks">
                                <Button>
                                    <ExternalLink className="size-4" />
                                    {t('ui.destinations')}
                                </Button>
                            </Link>
                        </div>
                    )}
                />

                <div className="grid grid-cols-5 gap-4" data-testid="kpi-row">
                    <MetricCard
                        label={t('ui.total')}
                        value={stats?.total ?? 0}
                        icon={Activity}
                        color="zinc"
                        testid="kpi-total"
                    />
                    <MetricCard
                        label={t('ui.successful')}
                        value={stats?.successful ?? 0}
                        icon={CheckCircle}
                        color="emerald"
                        testid="kpi-successful"
                    />
                    <MetricCard
                        label={t('ui.failed')}
                        value={stats?.failed ?? 0}
                        icon={XCircle}
                        color="red"
                        testid="kpi-failed"
                    />
                    <MetricCard
                        label={t('ui.pending')}
                        value={stats?.pending ?? 0}
                        icon={Clock}
                        color="amber"
                        testid="kpi-pending"
                    />
                    <MetricCard
                        label={t('ui.success_rate')}
                        value={successRate !== null ? `${successRate}%` : '—'}
                        icon={Percent}
                        color={successRate >= 90 ? 'emerald' : successRate >= 50 ? 'amber' : 'red'}
                        subtitle={stats?.total > 0 ? `${stats.successful}/${stats.total}` : undefined}
                        testid="kpi-success-rate"
                    />
                </div>

                <div data-testid="deliveries-table">
                    <DataTable
                        columns={columns}
                        data={deliveries.data}
                        getRowId={(row) => row.id}
                        onRowClick={(d) => setDetail(d)}
                        emptyIcon={Activity}
                        emptyTitle={t('ui.no_deliveries_found')}
                        emptyDescription={
                            filters.status || filters.event || filters.destination_id || filters.search
                                ? t('ui.no_deliveries_filter')
                                : t('ui.configure_webhook_desc')
                        }
                        emptyAction={
                            !filters.status && !filters.event && !filters.destination_id && !filters.search
                                ? { label: t('ui.configure_webhook'), href: '/settings/webhooks' }
                                : undefined
                        }
                        toolbar={(
                            <>
                                <div className="relative w-64">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                        placeholder={t('ui.search_event_or_url')}
                                        className="!pl-9"
                                    />
                                </div>
                                <div className="w-40">
                                    <Select
                                        value={filters.status ?? ''}
                                        onChange={(e) => setFilter('status', e.target.value)}
                                    >
                                        <option value="">{t('ui.all_statuses')}</option>
                                        <option value="success">{t('ui.success')}</option>
                                        <option value="failed">{t('ui.failed')}</option>
                                        <option value="pending">{t('ui.pending')}</option>
                                    </Select>
                                </div>
                                <div className="w-40">
                                    <Select
                                        value={filters.event ?? ''}
                                        onChange={(e) => setFilter('event', e.target.value)}
                                    >
                                        <option value="">{t('ui.all_events')}</option>
                                        {uniqueEvents.map((ev) => (
                                            <option key={ev} value={ev}>{ev}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="w-52">
                                    <Select
                                        value={filters.destination_id ?? ''}
                                        onChange={(e) => setFilter('destination_id', e.target.value)}
                                    >
                                        <option value="">{t('ui.all_destinations')}</option>
                                        {destinations.map((d) => (
                                            <option key={d.id} value={d.id}>{d.url}</option>
                                        ))}
                                    </Select>
                                </div>
                                {(filters.status || filters.event || filters.destination_id || filters.search) && (
                                    <Button plain onClick={() => {
                                        setSearchText('')
                                        router.get('/settings/webhooks/deliveries', {}, { preserveState: true })
                                    }}>
                                        {t('ui.clear')}
                                    </Button>
                                )}
                            </>
                        )}
                        footer={deliveries.last_page > 1 ? (
                            <Pagination>
                                <PaginationPrevious href={deliveries.prev_page_url} />
                                <PaginationList>
                                    {deliveries.links.map((link, i) => {
                                        if (link.url === null) return <PaginationGap key={link.label || i} />
                                        const label = link.label.replace(/&laquo;|&raquo;/g, '').trim()
                                        const pageNum = parseInt(label)
                                        if (isNaN(pageNum)) return null
                                        return (
                                            <PaginationPage key={link.url} href={link.url} current={link.active}>
                                                {pageNum}
                                            </PaginationPage>
                                        )
                                    })}
                                </PaginationList>
                                <PaginationNext href={deliveries.next_page_url} />
                            </Pagination>
                        ) : null}
                    />
                </div>

                {detail && (
                    <WebhookDeliveryDrawer delivery={detail} onClose={() => setDetail(null)} />
                )}
            </div>
        </AuthenticatedLayout>
    )
}
