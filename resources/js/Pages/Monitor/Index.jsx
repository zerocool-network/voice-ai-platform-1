import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import PageSection from '@/Components/PageSection';
import DataTable from '@/Components/DataTable';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Input } from '@/Components/catalyst/input';
import { show } from '@/actions/App/Http/Controllers/Web/CallController';
import { active } from '@/actions/App/Http/Controllers/Web/MonitorController';
import { transcript } from '@/routes/monitor';
import { useTranslation } from '@/hooks/useTranslation';
import { callStatusLabel } from '@/utils/callStatusLabel';
import { Headphones, ChevronDown, ChevronRight, Radio, Search, X } from 'lucide-react';

const statusColors = {
    initiated: 'blue',
    in_progress: 'amber',
    ringing: 'blue',
};

const STATUS_FILTERS = ['', 'in_progress', 'ringing', 'initiated'];

function elapsed(startedAt, now) {
    const diff = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000));
    const d = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export default function Monitor({ activeCalls: initial, tenantId }) {
    const { t, locale } = useTranslation();
    const [calls, setCalls] = useState(initial ?? []);
    const [now, setNow] = useState(Date.now());
    const [expandedId, setExpandedId] = useState(null);
    const [transcripts, setTranscripts] = useState({});
    const [fetchingId, setFetchingId] = useState(null);
    const [wsConnected, setWsConnected] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const pollRef = useRef(null);

    const upsertCall = useCallback((call) => {
        setCalls((prev) => {
            const idx = prev.findIndex((c) => c.id === call.id);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...call };
                return next;
            }
            return [call, ...prev];
        });
    }, []);

    useEffect(() => {
        if (!window.Echo || !tenantId) return;

        try {
            const channel = window.Echo.channel(`tenant.${tenantId}.calls`);

            channel.listen('.call.updated', (event) => {
                upsertCall(event);
            });

            channel.error(() => {
                setWsConnected(false);
            });

            const onConnected = () => setWsConnected(true);
            const onDisconnected = () => setWsConnected(false);

            window.Echo.connector.pusher?.connection?.bind('connected', onConnected);
            window.Echo.connector.pusher?.connection?.bind('disconnected', onDisconnected);

            return () => {
                window.Echo.leaveChannel(`tenant.${tenantId}.calls`);
                window.Echo.connector.pusher?.connection?.unbind('connected', onConnected);
                window.Echo.connector.pusher?.connection?.unbind('disconnected', onDisconnected);
            };
        } catch {
            setWsConnected(false);
        }
    }, [tenantId, upsertCall]);

    useEffect(() => {
        pollRef.current = setInterval(() => {
            fetch(active().url)
                .then((r) => r.json())
                .then((data) => setCalls(data.calls ?? []))
                .catch(() => setWsConnected(false));
        }, 15000);

        return () => clearInterval(pollRef.current);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleExpand = useCallback(async (call) => {
        if (expandedId === call.id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(call.id);

        if (!transcripts[call.id]) {
            setFetchingId(call.id);
            try {
                const res = await fetch(transcript({ call: call.id }).url);
                const data = await res.json();
                setTranscripts((prev) => ({ ...prev, [call.id]: data }));
            } catch {
                // silently fail
            } finally {
                setFetchingId(null);
            }
        }
    }, [expandedId, transcripts]);

    const filteredCalls = useMemo(() => {
        const q = search.trim().toLowerCase();
        return calls.filter((call) => {
            if (statusFilter && call.status !== statusFilter) return false;
            if (!q) return true;
            const hay = [
                call.from_number,
                call.to_number,
                call.flow_name,
                call.call_sid,
            ].filter(Boolean).join(' ').toLowerCase();
            return hay.includes(q);
        });
    }, [calls, search, statusFilter]);

    const hasFilters = Boolean(search.trim() || statusFilter);

    const avgDuration = calls.length > 0
        ? Math.round(calls.reduce((s, c) => s + (c.duration_seconds || 0), 0) / calls.length)
        : 0;

    const columns = useMemo(() => [
        {
            id: 'expand',
            header: '',
            headerClassName: 'w-12',
            className: 'w-12',
            cell: (call) => (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(call);
                    }}
                    aria-expanded={expandedId === call.id}
                    aria-label={t('ui.view')}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-800 hover:shadow-sm"
                >
                    {expandedId === call.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
            ),
        },
        {
            id: 'from',
            header: t('calls.from'),
            cell: (call) => (
                <span className="font-mono text-[13px] font-medium tabular-nums text-slate-900">
                    {call.from_number}
                </span>
            ),
        },
        {
            id: 'to',
            header: t('calls.to'),
            cell: (call) => (
                <span className="font-mono text-[13px] tabular-nums text-slate-700">
                    {call.to_number}
                </span>
            ),
        },
        {
            id: 'flow',
            header: t('calls.flow'),
            cell: (call) => call.flow_name
                ? <span className="font-medium text-slate-800">{call.flow_name}</span>
                : <span className="text-slate-400">&mdash;</span>,
        },
        {
            id: 'status',
            header: t('calls.status'),
            cell: (call) => (
                <span className="inline-flex items-center gap-2">
                    <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <Badge color={statusColors[call.status] || 'zinc'}>
                        {callStatusLabel(t, call.status)}
                    </Badge>
                </span>
            ),
        },
        {
            id: 'elapsed',
            header: t('ui.elapsed'),
            meta: { mono: true },
            cell: (call) => (
                <span className="font-metric text-[13px] text-slate-700">{elapsed(call.started_at, now)}</span>
            ),
        },
        {
            id: 'started',
            header: t('ui.started'),
            cell: (call) => (
                <span className="text-slate-600">
                    {call.started_at
                        ? new Date(call.started_at).toLocaleString(locale || undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
                        })
                        : '\u2014'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: t('common.actions'),
            meta: { align: 'right' },
            cell: (call) => (
                <div className="flex items-center justify-end gap-2">
                    {call.recording_url && (
                        <a
                            href={call.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-cyan-700 hover:shadow-sm"
                            title={t('ui.listen_to_recording')}
                        >
                            <Headphones size={15} />
                        </a>
                    )}
                    <Link
                        href={show({ call: call.id }).url}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-8 items-center rounded-lg px-2.5 text-[13px] font-semibold text-cyan-700 transition hover:bg-cyan-50"
                    >
                        {t('ui.view')}
                    </Link>
                </div>
            ),
        },
    ], [t, locale, now, expandedId, toggleExpand]);

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.live_monitor')} />

            <div className="space-y-8">
                <PageHeader
                    eyebrow={(
                        <>
                            <span className={`size-1.5 rounded-full ${wsConnected ? 'animate-pulse bg-emerald-500' : 'bg-rose-500'}`} />
                            {wsConnected ? t('ui.live_ops') : t('ui.connection_lost')}
                        </>
                    )}
                    title={t('ui.live_monitor')}
                    subtitle={t('ui.realtime_view_active_calls')}
                    actions={!wsConnected ? (
                        <Badge color="red" className="text-xs">
                            {t('ui.connection_lost')}
                        </Badge>
                    ) : null}
                />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                    {[
                        { label: t('ui.active_calls'), value: calls.length, live: true },
                        { label: t('ui.in_progress'), value: calls.filter((c) => c.status === 'in_progress').length },
                        { label: t('ui.ringing_initiated'), value: calls.filter((c) => c.status === 'ringing' || c.status === 'initiated').length },
                        { label: t('ui.avg_duration_card'), value: avgDuration > 0 ? elapsed(Date.now() - avgDuration * 1000, Date.now()) : '0s' },
                        { label: t('ui.peak_today'), value: calls.length },
                    ].map((kpi) => (
                        <PageSection key={kpi.label} className="!p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                {kpi.label}
                            </p>
                            <p className="font-metric mt-3 text-[28px] font-semibold leading-none tracking-tight text-slate-950">
                                {kpi.value}
                            </p>
                            {kpi.live && (
                                <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-600">
                                    <span className="size-1.5 animate-pulse rounded-full bg-cyan-500" />
                                    {t('ui.live')}
                                </span>
                            )}
                        </PageSection>
                    ))}
                </div>

                <DataTable
                    columns={columns}
                    data={filteredCalls}
                    getRowId={(row) => row.id}
                    expandedId={expandedId}
                    emptyIcon={Radio}
                    emptyTitle={hasFilters ? t('ui.monitor_no_match') : t('ui.no_active_calls')}
                    emptyDescription={hasFilters ? t('ui.monitor_no_match_desc') : t('ui.active_calls_appear')}
                    toolbar={(
                        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="relative min-w-0 flex-1">
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    className="h-10 pl-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('ui.monitor_search_placeholder')}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {STATUS_FILTERS.map((status) => {
                                    const activeChip = statusFilter === status;
                                    const label = status ? callStatusLabel(t, status) : t('ui.monitor_filter_all');
                                    return (
                                        <button
                                            key={status || 'all'}
                                            type="button"
                                            onClick={() => setStatusFilter(status)}
                                            className={`h-9 rounded-full px-3.5 text-[12px] font-semibold transition ${
                                                activeChip
                                                    ? 'bg-slate-950 text-white shadow-sm'
                                                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-3 lg:ml-auto">
                                <span className="font-metric text-[12px] font-medium text-slate-500">
                                    {t('ui.monitor_results_count', { count: filteredCalls.length })}
                                </span>
                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setStatusFilter('');
                                        }}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                                    >
                                        <X className="size-3.5" />
                                        {t('ui.monitor_clear_filters')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    renderExpandedRow={(call) => (
                        <CallDetailPanel
                            call={call}
                            transcript={transcripts[call.id]}
                            loading={fetchingId === call.id}
                            now={now}
                            t={t}
                        />
                    )}
                />
            </div>
        </AuthenticatedLayout>
    );
}

function CallDetailPanel({ call, transcript: transcriptData, loading, now, t }) {
    if (!call) return null;

    return (
        <div className="border-t border-slate-200/70 px-5 py-6 sm:px-6">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-[13px] font-semibold text-slate-950">
                    {t('ui.call_detail_sid', { sid: call.call_sid })}
                </h3>
                <Text className="font-metric text-sm text-slate-500">
                    {t('ui.elapsed_colon')} {elapsed(call.started_at, now)}
                </Text>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {t('ui.context_step_data')}
                    </h4>
                    {call.context ? (
                        <pre className="mt-2.5 max-h-64 overflow-auto rounded-xl border border-slate-100 bg-white p-4 font-mono text-xs text-slate-700">
                            {JSON.stringify(call.context, null, 2)}
                        </pre>
                    ) : (
                        <Text className="mt-2.5 text-sm">{t('ui.no_context_data')}</Text>
                    )}
                </div>

                <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {t('ui.transcript')}
                    </h4>
                    {loading ? (
                        <Text className="mt-2.5 text-sm">{t('ui.loading_transcript')}</Text>
                    ) : transcriptData && transcriptData.call_logs && transcriptData.call_logs.length > 0 ? (
                        <ul className="mt-2.5 max-h-64 space-y-2.5 overflow-auto rounded-xl border border-slate-100 bg-white p-4">
                            {transcriptData.call_logs.map((log) => (
                                <li key={log.id} className="text-xs leading-relaxed text-slate-700">
                                    <span className="font-semibold capitalize text-slate-900">
                                        {log.direction || t('ui.role_system')}:
                                    </span>{' '}
                                    {log.content || log.event || JSON.stringify(log)}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Text className="mt-2.5 text-sm">{t('ui.no_transcript_lines')}</Text>
                    )}
                </div>
            </div>
        </div>
    );
}
