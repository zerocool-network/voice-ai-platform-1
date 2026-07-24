import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Heading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Button } from '@/Components/catalyst/button'
import { markAllRead as markAllReadRoute } from '@/routes/notifications'
import {
    Bell, MessageSquare, GitBranch, Users, CreditCard, Server, Check, X, Filter, ChevronLeft, ChevronRight,
} from 'lucide-react'

const typeIcons = {
    comment: MessageSquare,
    flow_update: GitBranch,
    invite: Users,
    billing: CreditCard,
    system: Server,
}

const typeColors = {
    comment: 'blue',
    flow_update: 'purple',
    invite: 'emerald',
    billing: 'amber',
    system: 'zinc',
}

function groupByDate(items) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 86400000)
    const groups = { today: [], yesterday: [], earlier: [] }

    items.forEach((n) => {
        const d = new Date(n.created_at)
        const dateStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        if (dateStart.getTime() === today.getTime()) {
            groups.today.push(n)
        } else if (dateStart.getTime() === yesterday.getTime()) {
            groups.yesterday.push(n)
        } else {
            groups.earlier.push(n)
        }
    })

    return groups
}

const groupLabels = {
    today: 'Today',
    yesterday: 'Yesterday',
    earlier: 'Earlier',
}

export default function Index({ notifications, types, filters = {} }) {
    const [dismissed, setDismissed] = useState(new Set())
    const [activeFilter, setActiveFilter] = useState(filters.type ?? '')

    function markAllRead() {
        router.post(markAllReadRoute().url)
    }

    async function markAsRead(id) {
        setDismissed((prev) => new Set([...prev, id]))
        try {
            await fetch(`/notifications/${id}/read`, { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content } })
        } catch {}
    }

    function setTypeFilter(type) {
        setActiveFilter(type)
        const params = type ? { type } : {}
        router.get('/notifications', params, { preserveState: true, replace: true })
    }

    const filtered = notifications.data.filter((n) => !dismissed.has(n.id))
    const grouped = groupByDate(filtered)
    const hasActive = Object.values(grouped).some((g) => g.length > 0)

    const groups = [
        { key: 'today', items: grouped.today },
        { key: 'yesterday', items: grouped.yesterday },
        { key: 'earlier', items: grouped.earlier },
    ].filter((g) => g.items.length > 0)

    return (
        <AuthenticatedLayout>
            <Head title="Notifications" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Notifications</Heading>
                    <Text className="mt-1">Your recent notifications and updates.</Text>
                </div>
                <div className="flex items-center gap-2">
                    {notifications.data.some((n) => !n.read_at) && (
                        <Button outline onClick={markAllRead}>
                            <Check className="size-4" />
                            Mark all read
                        </Button>
                    )}
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                <Filter className="size-4 text-zinc-400" />
                <div className="flex flex-wrap gap-1">
                    <button
                        onClick={() => setTypeFilter('')}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            !activeFilter
                                ? 'bg-zinc-950 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                    >
                        All
                    </button>
                    {types.map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                activeFilter === type
                                    ? 'bg-zinc-950 text-white'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                        >
                            {type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {!hasActive ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16">
                    <Bell className="size-10 text-zinc-400" />
                    <p className="mt-4 text-base font-semibold text-zinc-950">No notifications</p>
                    <Text className="mt-2">
                        {activeFilter
                            ? `No ${activeFilter.replace('_', ' ')} notifications.`
                            : 'You will see notifications here when team members mention you or flows are updated.'}
                        {activeFilter && ' Try a different filter.'}
                    </Text>
                </div>
            ) : (
                <div className="mt-6 space-y-6">
                    {groups.map(({ key, items }) => (
                        <div key={key}>
                            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                {groupLabels[key]}
                            </Text>
                            <div className="space-y-2">
                                {items.map((n) => {
                                    const Icon = typeIcons[n.type] || Bell
                                    return (
                                        <div
                                            key={n.id}
                                            className={`group flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                                                n.read_at
                                                    ? 'border-zinc-200 bg-white'
                                                    : 'border-indigo-200 bg-indigo-50'
                                            }`}
                                        >
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                className={`mt-0.5 rounded-lg p-1.5 ${
                                                    !n.read_at
                                                        ? 'bg-indigo-100 text-indigo-600'
                                                        : 'bg-zinc-100 text-zinc-400'
                                                }`}
                                                title={n.read_at ? 'Dismiss' : 'Mark as read'}
                                            >
                                                <Icon className="size-4" />
                                            </button>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-sm ${n.read_at ? 'text-zinc-700' : 'font-medium text-zinc-950'}`}>
                                                    {n.title}
                                                </p>
                                                {n.body && (
                                                    <Text className="mt-0.5 text-xs">{n.body}</Text>
                                                )}
                                                <Text className="mt-1 text-xs">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </Text>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!n.read_at && (
                                                    <div className="size-2 shrink-0 rounded-full bg-indigo-500" />
                                                )}
                                                <button
                                                    onClick={() => markAsRead(n.id)}
                                                    className="shrink-0 rounded-md p-1 text-zinc-300 opacity-0 transition-opacity hover:text-zinc-500 group-hover:opacity-100"
                                                    title="Dismiss"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {notifications.last_page > 1 && (
                        <div className="flex items-center justify-center gap-1">
                            {notifications.prev_page_url && (
                                <Link
                                    href={notifications.prev_page_url}
                                    className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                                >
                                    <ChevronLeft className="size-4" />
                                    Previous
                                </Link>
                            )}
                            {Array.from({ length: notifications.last_page }, (_, i) => i + 1).map((page) => (
                                <Link
                                    key={page}
                                    href={`/notifications?page=${page}${activeFilter ? `&type=${activeFilter}` : ''}`}
                                    className={`min-w-9 rounded-md px-2.5 py-1.5 text-center text-sm font-medium transition-colors ${
                                        notifications.current_page === page
                                            ? 'bg-zinc-950 text-white'
                                            : 'text-zinc-600 hover:bg-zinc-100'
                                    }`}
                                >
                                    {page}
                                </Link>
                            ))}
                            {notifications.next_page_url && (
                                <Link
                                    href={notifications.next_page_url}
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
        </AuthenticatedLayout>
    )
}
