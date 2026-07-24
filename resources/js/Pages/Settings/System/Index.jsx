import { useEffect, useState, useRef, useCallback } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import { Heading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table'
import MetricCard from '@/Components/MetricCard'
import { RefreshCw, Database, HardDrive, Radio, Globe, Layers, AlertTriangle, Activity } from 'lucide-react'

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
            <Head title="System Health" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>System Health</Heading>
                    <Text className="mt-1">Monitor system services, queues, and error rates.</Text>
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-zinc-500">
                        <input
                            type="checkbox"
                            checked={polling}
                            onChange={(e) => setPolling(e.target.checked)}
                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Auto-refresh
                    </label>
                    <button
                        onClick={handleRefresh}
                        className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
                        title="Refresh now"
                    >
                        <RefreshCw className={`size-4 ${spinning ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                <Activity className="size-3" />
                Last checked: {lc ? new Date(lc).toLocaleTimeString() : '—'}
                <span className="ml-auto flex items-center gap-1">
                    <span className={`inline-block size-2 rounded-full bg-${scoreColor}-500`} />
                    Health score: <strong>{h.score}%</strong>
                </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
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

            <div className="mt-8">
                <Heading level={2}>Queues</Heading>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {qd.map((q) => (
                        <div key={q.queue} className="rounded-xl border border-zinc-200 bg-white p-5">
                            <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{q.queue}</Text>
                            <p className="mt-1 text-[28px] font-bold tracking-tight text-zinc-900">
                                {q.size}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <Heading level={2}>Error Rate (24h)</Heading>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MetricCard label="Total Calls" value={er.total} icon={Activity} color="zinc" />
                    <MetricCard label="Failed" value={er.failed} icon={AlertTriangle} color={er.failed > 0 ? 'red' : 'emerald'} />
                    <MetricCard label="Failure Rate" value={`${er.percentage}%`} icon={AlertTriangle} color={er.percentage > 10 ? 'red' : er.percentage > 0 ? 'amber' : 'emerald'} />
                </div>
            </div>

            <div className="mt-8">
                <Heading level={2}>Failed Jobs (24h)</Heading>
                {fj.length === 0 ? (
                    <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12">
                        <Activity className="size-8 text-zinc-300" />
                        <Text className="mt-2">No failed jobs in the last 24 hours.</Text>
                    </div>
                ) : (
                    <div className="mt-4">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Connection</TableHeader>
                                    <TableHeader>Queue</TableHeader>
                                    <TableHeader>Exception</TableHeader>
                                    <TableHeader>Failed At</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fj.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.connection}</TableCell>
                                        <TableCell>{job.queue}</TableCell>
                                        <TableCell className="max-w-xs truncate font-mono text-xs text-zinc-500">{job.exception}</TableCell>
                                        <TableCell>
                                            {new Date(job.failed_at).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    )
}
