import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { Heading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Badge } from '@/Components/catalyst/badge'
import { Button } from '@/Components/catalyst/button'
import { Input } from '@/Components/catalyst/input'
import { Select } from '@/Components/catalyst/select'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table'
import { show as callShow } from '@/actions/App/Http/Controllers/Web/CallController'
import calls from '@/routes/calls'
import { Phone, Download, Headphones, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

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

export default function CallsIndex({ calls, filters }) {
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

    return (
        <AuthenticatedLayout>
            <Head title="Call Records" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Call Records</Heading>
                    <Text className="mt-1">Browse all calls with recordings, transcripts, and quality scores.</Text>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={exportCalls} outline>
                        <Download className="size-4" />
                        Export CSV
                    </Button>
                    <Link href={calls.scheduled().url}>
                        <Button outline>
                            <Phone className="size-4" />
                            Scheduled
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        className="pl-9"
                        placeholder="Search by number or call SID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                    />
                </div>
                <div className="w-44">
                    <Select value={filters.status ?? ''} onChange={(e) => setStatus(e.target.value)}>
                        {statuses.map((s) => (
                            <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All Statuses'}</option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                {calls.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Phone className="size-10 text-zinc-400" />
                        <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No calls found</p>
                        <Text className="mt-2">Adjust filters or wait for incoming calls.</Text>
                    </div>
                ) : (
                    <div>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Call SID</TableHeader>
                                    <TableHeader>From</TableHeader>
                                    <TableHeader>To</TableHeader>
                                    <TableHeader>Flow</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Duration</TableHeader>
                                    <TableHeader>Date</TableHeader>
                                    <TableHeader className="text-right">Actions</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {calls.data.map((call) => (
                                    <TableRow key={call.id}>
                                        <TableCell className="font-mono text-xs">{call.call_sid}</TableCell>
                                        <TableCell className="font-medium">{call.from_number}</TableCell>
                                        <TableCell>{call.to_number}</TableCell>
                                        <TableCell>{call.flow_name || <span className="italic">&mdash;</span>}</TableCell>
                                        <TableCell>
                                            <Badge color={statusColors[call.status] || 'zinc'}>
                                                {call.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {call.duration_seconds
                                                ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
                                                : '\u2014'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(call.created_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {call.recording_url && (
                                                    <a href={`/recordings/${call.id}/play`} target="_blank" rel="noopener noreferrer" title="Play recording">
                                                        <Headphones className="size-4 text-zinc-500 hover:text-zinc-950 dark:hover:text-white" />
                                                    </a>
                                                )}
                                                <Link href={callShow({ call: call.id }).url} className="text-sm font-medium text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white">
                                                    View
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {calls.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1 border-t border-zinc-200 px-6 py-4">
                                {calls.prev_page_url && (
                                    <Link
                                        href={calls.prev_page_url}
                                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                                    >
                                        <ChevronLeft className="size-4" />
                                        Previous
                                    </Link>
                                )}
                                {Array.from({ length: calls.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/calls?page=${page}${filters.status ? `&status=${filters.status}` : ''}${search ? `&search=${search}` : ''}`}
                                        className={`min-w-9 rounded-md px-2.5 py-1.5 text-center text-sm font-medium transition-colors ${
                                            calls.current_page === page
                                                ? 'bg-zinc-950 text-white'
                                                : 'text-zinc-600 hover:bg-zinc-100'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                                {calls.next_page_url && (
                                    <Link
                                        href={calls.next_page_url}
                                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                                    >
                                        Next
                                        <ChevronRight className="size-4" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    )
}
