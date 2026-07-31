import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Components/PageHeader'
import PageSection from '@/Components/PageSection'
import { Head } from '@inertiajs/react'
import { Subheading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import DataTable from '@/Components/DataTable'
import MetricCard from '@/Components/MetricCard'
import { RefreshCw, Database, HardDrive, Radio, Globe, Layers, AlertTriangle, Activity } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

const statusColor = (s) => {
    if (s === 'ok') return 'emerald'
    if (s === 'warning') return 'amber'
    return 'red'
}

const statusIcon = (s) => {
    if (s === 'ok') return '✓'
    if (s === 'warning') return '!'
    return '✕'
}

const serviceIcons = {
    Database: Database,
    Redis: HardDrive,
    Cache: Layers,
    Twilio: Globe,
}

function formatLatency(us) {
    if (!us) return null
    if (us < 1000) return `${us}µs`
    return `${(us / 1000).toFixed(1)}ms`
}

export default function SystemIndex({ health, failedJobs, queueDepth, errorRate, lastChecked }) {
    const { t, locale } = useTranslation()

    const failedJobColumns = useMemo(() => [
        {
            id: 'connection',
            header: t('ui.connection'),
            cell: (job) => <span className="font-medium">{job.connection}</span>,
        },
        {
            id: 'queue',
            header: t('ui.queue_label'),
            cell: (job) => job.queue,
        },
        {
            id: 'exception',
            header: t('ui.exception'),
            className: 'max-w-xs truncate font-mono text-xs text-slate-500',
            cell: (job) => job.exception,
        },
        {
            id: 'failed_at',
            header: t('ui.failed_at'),
            cell: (job) => new Date(job.failed_at).toLocaleString(locale || undefined),
        },
    ], [t, locale])
    const [data, setData] = useState({ health, failedJobs, queueDepth, errorRate, lastChecked })
    const [polling, setPolling] = useState(true)
    const [spinning, setSpinning] = useState(false)
    const intervalRef = useRef(null)

    const fetchHealth = useCallback(async () => {
        try {
            const res = await fetch('/settings/system/poll')
            if (res.ok) setData(await res.json())
        } catch {}
    }, [])

    useEffect(() => {
        if (!polling) {
            clearInterval(intervalRef.current)
            return
        }
        intervalRef.current = setInterval(fetchHealth, 15000)
        return () => clearInterval(intervalRef.current)
    }, [polling, fetchHealth])

    const handleRefresh = useCallback(async () => {
        setSpinning(true)
        await fetchHealth()
        setSpinning(false)
    }, [fetchHealth])

    const { health: h, failedJobs: fj, queueDepth: qd, errorRate: er, lastChecked: lc } = data
    const services = Object.entries(h ?? {}).reduce((acc, [k, v]) => { if (k !== 'score') acc.push(v); return acc; }, [])
    const scoreColor = (h?.score ?? 0) >= 80 ? 'emerald' : (h?.score ?? 0) >= 50 ? 'amber' : 'red'

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.system_title')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.system_title')}
                    subtitle={t('ui.system_subtitle_health')}
                    actions={(
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm text-slate-500">
                                <input
                                    type="checkbox"
                                    checked={polling}
                                    onChange={(e) => setPolling(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                {t('ui.auto_refresh')}
                            </label>
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                                title={t('ui.refresh_now')}
                            >
                                <RefreshCw className={`size-4 ${spinning ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    )}
                />

            <div className="flex items-center gap-2 text-xs text-slate-400">
                <Activity className="size-3" />
                {t('ui.last_checked')} {lc ? new Date(lc).toLocaleTimeString(locale || undefined) : '—'}
                <span className="ml-auto flex items-center gap-1">
                    <span className={`inline-block size-2 rounded-full bg-${scoreColor}-500`} />
                    {t('ui.health_score')} <strong>{h.score}%</strong>
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {services.map((svc) => {
                    const Icon = serviceIcons[svc.label] || Radio
                    return (
                        <MetricCard
                            key={svc.label}
                            label={svc.label}
                            value={
                                <span className="flex items-center gap-2">
                                    <Badge color={statusColor(svc.status)}>{statusIcon(svc.status)} {svc.status}</Badge>
                                </span>
                            }
                            icon={Icon}
                            color={svc.status === 'ok' ? 'emerald' : svc.status === 'warning' ? 'amber' : 'red'}
                            trend={svc.latency ? formatLatency(svc.latency) : null}
                        />
                    )
                })}
            </div>

            <div>
                <Subheading>{t('ui.queues')}</Subheading>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {qd.map((q) => (
                        <PageSection key={q.queue} className="!p-5">
                            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">{q.queue}</Text>
                            <p className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
                                {q.size}
                            </p>
                        </PageSection>
                    ))}
                </div>
            </div>

            <div>
                <Subheading>{t('ui.error_rate_24h')}</Subheading>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MetricCard label={t('ui.total_calls')} value={er.total} icon={Activity} color="zinc" />
                    <MetricCard label={t('ui.failed_label')} value={er.failed} icon={AlertTriangle} color={er.failed > 0 ? 'red' : 'emerald'} />
                    <MetricCard label={t('ui.failure_rate')} value={`${er.percentage}%`} icon={AlertTriangle} color={er.percentage > 10 ? 'red' : er.percentage > 0 ? 'amber' : 'emerald'} />
                </div>
            </div>

            <div>
                <Subheading>{t('ui.failed_jobs_24h')}</Subheading>
                <div className="mt-4">
                    <DataTable
                        columns={failedJobColumns}
                        data={fj}
                        getRowId={(row) => row.id}
                        emptyIcon={Activity}
                        emptyTitle={t('ui.no_failed_jobs')}
                        density="dense"
                    />
                </div>
            </div>
            </div>
        </AuthenticatedLayout>
    )
}
