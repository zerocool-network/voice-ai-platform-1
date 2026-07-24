import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { show } from '@/actions/App/Http/Controllers/Web/CallController';
import { active } from '@/actions/App/Http/Controllers/Web/MonitorController';
import { transcript } from '@/routes/monitor';
import { Headphones, ChevronDown, ChevronRight } from 'lucide-react';

const statusColors = {
    initiated: 'blue',
    in_progress: 'amber',
    ringing: 'blue',
};

function elapsed(startedAt, now) {
    const diff = Math.floor((now - new Date(startedAt).getTime()) / 1000);
    if (diff < 0) return '0s';
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return m > 0 ? m + 'm ' + s + 's' : s + 's';
}

export default function Monitor({ activeCalls: initial, tenantId }) {
    const [calls, setCalls] = useState(initial ?? []);
    const [now, setNow] = useState(Date.now());
    const [expandedId, setExpandedId] = useState(null);
    const [transcripts, setTranscripts] = useState({});
    const [fetchingId, setFetchingId] = useState(null);
    const [wsConnected, setWsConnected] = useState(true);
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
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
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

    const avgDuration = calls.length > 0
        ? Math.round(calls.reduce((s, c) => s + (c.duration_seconds || 0), 0) / calls.length)
        : 0;

    const completedInLast24h = calls.filter(
        (c) => c.status === 'completed' && new Date(c.started_at) > Date.now() - 86400000
    ).length;

    return (
        <AuthenticatedLayout>
            <Head title="Live Monitor" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Live Monitor</Heading>
                    <Text className="mt-1">Real-time view of active calls via WebSocket.</Text>
                </div>
                {!wsConnected && (
                    <Badge color="red" className="text-xs">
                        Connection lost
                    </Badge>
                )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                    <Text className="text-sm">Active Calls</Text>
                    <p className="mt-1 text-[28px] font-bold text-zinc-950 dark:text-white">{calls.length}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                    <Text className="text-sm">In Progress</Text>
                    <p className="mt-1 text-[28px] font-bold text-zinc-950 dark:text-white">
                        {calls.filter((c) => c.status === 'in_progress').length}
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                    <Text className="text-sm">Ringing / Initiated</Text>
                    <p className="mt-1 text-[28px] font-bold text-zinc-950 dark:text-white">
                        {calls.filter((c) => c.status === 'ringing' || c.status === 'initiated').length}
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                    <Text className="text-sm">Avg Duration</Text>
                    <p className="mt-1 text-[28px] font-bold text-zinc-950 dark:text-white">{avgDuration}s</p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-white/5">
                    <Text className="text-sm">Peak Today</Text>
                    <p className="mt-1 text-[28px] font-bold text-zinc-950 dark:text-white">{calls.length}</p>
                </div>
            </div>

            {calls.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 dark:border-zinc-800">
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No active calls</p>
                    <Text className="mt-2">Active calls will appear here in real time.</Text>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader />
                                <TableHeader>From</TableHeader>
                                <TableHeader>To</TableHeader>
                                <TableHeader>Flow</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Elapsed</TableHeader>
                                <TableHeader>Started</TableHeader>
                                <TableHeader className="text-right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {calls.map((call) => (
                                <TableRow key={call.id}>
                                    <TableCell>
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(call)}
                                            className="flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                                        >
                                            {expandedId === call.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    </TableCell>
                                    <TableCell className="font-medium">{call.from_number}</TableCell>
                                    <TableCell>{call.to_number}</TableCell>
                                    <TableCell>{call.flow_name || <span className="italic">&mdash;</span>}</TableCell>
                                    <TableCell>
                                        <span className="flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                            </span>
                                            <Badge color={statusColors[call.status] || 'zinc'}>
                                                {call.status.replace('_', ' ')}
                                            </Badge>
                                        </span>
                                    </TableCell>
                                    <TableCell>{elapsed(call.started_at, now)}</TableCell>
                                    <TableCell>
                                        {call.started_at
                                            ? new Date(call.started_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
                                              })
                                            : '\u2014'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {call.recording_url && (
                                                <a
                                                    href={call.recording_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                                                    title="Listen to recording"
                                                >
                                                    <Headphones size={16} />
                                                </a>
                                            )}
                                            <Link
                                                href={show({ call: call.id }).url}
                                                className="text-sm font-medium text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {expandedId && (
                        <CallDetailPanel
                            call={calls.find((c) => c.id === expandedId)}
                            transcript={transcripts[expandedId]}
                            loading={fetchingId === expandedId}
                            now={now}
                        />
                    )}
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function CallDetailPanel({ call, transcript, loading, now }) {
    if (!call) return null;

    return (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-white/5">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-950 dark:text-white">
                    Call Detail — {call.call_sid}
                </h3>
                <Text className="text-sm">
                    Elapsed: {elapsed(call.started_at, now)}
                </Text>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                    <h4 className="text-sm font-medium text-zinc-950 dark:text-white">Context / Step Data</h4>
                    {call.context ? (
                        <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {JSON.stringify(call.context, null, 2)}
                        </pre>
                    ) : (
                        <Text className="mt-2 text-sm">No context data available.</Text>
                    )}
                </div>

                <div>
                    <h4 className="text-sm font-medium text-zinc-950 dark:text-white">Transcript</h4>
                    {loading ? (
                        <Text className="mt-2 text-sm">Loading transcript...</Text>
                    ) : transcript && transcript.call_logs && transcript.call_logs.length > 0 ? (
                        <ul className="mt-2 max-h-64 space-y-2 overflow-auto rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                            {transcript.call_logs.map((log) => (
                                <li key={log.id} className="text-xs text-zinc-700 dark:text-zinc-300">
                                    <span className="font-medium capitalize">{log.direction || 'system'}:</span>{' '}
                                    {log.content || log.event || JSON.stringify(log)}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Text className="mt-2 text-sm">No transcript lines available.</Text>
                    )}
                </div>
            </div>
        </div>
    );
}
