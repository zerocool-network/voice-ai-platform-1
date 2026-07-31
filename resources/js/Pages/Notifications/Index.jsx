import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Components/PageHeader'
import PageSection from '@/Components/PageSection'
import { Head, router, Link } from '@inertiajs/react'
import { useState } from 'react'
import { Text } from '@/Components/catalyst/text'
import { Button } from '@/Components/catalyst/button'
import { markAllRead as markAllReadRoute } from '@/routes/notifications'
import { useTranslation } from '@/hooks/useTranslation'
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

export default function Index({ notifications, types, filters = {} }) {
    const { t } = useTranslation()
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

    const filtered = notifications.data.filter((n) => !dismissed.has(n.id))
    const grouped = groupByDate(filtered)
    const hasActive = Object.values(grouped).some((g) => g.length > 0)

    const groupLabels = {
        today: t('ui.today'),
        yesterday: t('ui.yesterday'),
        earlier: t('ui.earlier'),
    }

    const groups = [
        { key: 'today', items: grouped.today },
        { key: 'yesterday', items: grouped.yesterday },
        { key: 'earlier', items: grouped.earlier },
    ].filter((g) => g.items.length > 0)

    return (
        <AuthenticatedLayout>
            <Head title={t('ui.notifications_heading')} />

            <div className="space-y-6">
                <PageHeader
                    title={t('ui.notifications_heading')}
                    subtitle={t('ui.notifications_desc')}
                    actions={notifications.data.some((n) => !n.read_at) ? (
                        <Button outline onClick={markAllRead}>
                            <Check className="size-4" />
                            {t('ui.mark_all_read')}
                        </Button>
                    ) : null}
                />

                <div className="flex items-center gap-2">
                    <Filter className="size-4 text-slate-400" />
                    <div className="flex flex-wrap gap-1">
                        <button
                            onClick={() => setTypeFilter('')}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                !activeFilter
                                    ? 'bg-slate-950 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {t('ui.all')}
                        </button>
                        {types.map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                    activeFilter === type
                                        ? 'bg-slate-950 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {!hasActive ? (
                    <PageSection>
                        <div className="flex flex-col items-center justify-center py-8">
                            <Bell className="size-10 text-slate-400" />
                            <p className="mt-4 text-base font-semibold text-slate-950">{t('ui.no_notifications')}</p>
                            <Text className="mt-2 text-center">
                                {activeFilter
                                    ? `${t('ui.no_notifications_type', { type: activeFilter.replace('_', ' ') })} ${t('ui.try_different_filter')}`
                                    : t('ui.no_notifications_desc')}
                            </Text>
                        </div>
                    </PageSection>
                ) : (
                    <div className="space-y-6">
                        {groups.map(({ key, items }) => (
                            <div key={key}>
                                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {groupLabels[key]}
                                </Text>
                                <div className="space-y-2">
                                    {items.map((n) => {
                                        const Icon = typeIcons[n.type] || Bell
                                        return (
                                            <PageSection key={n.id} className={`!p-4 ${n.read_at ? '' : '!border-indigo-200 !bg-indigo-50/50'}`}>
                                                <div className="group flex items-start gap-3">
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className={`mt-0.5 rounded-lg p-1.5 ${
                                                            !n.read_at
                                                                ? 'bg-indigo-100 text-indigo-600'
                                                                : 'bg-slate-100 text-slate-400'
                                                        }`}
                                                        title={n.read_at ? t('ui.dismiss') : t('ui.mark_as_read')}
                                                    >
                                                        <Icon className="size-4" />
                                                    </button>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-sm ${n.read_at ? 'text-slate-700' : 'font-medium text-slate-950'}`}>
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
                                                            className="shrink-0 rounded-md p-1 text-slate-300 opacity-0 transition-opacity hover:text-slate-500 group-hover:opacity-100"
                                                            title={t('ui.dismiss')}
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </PageSection>
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
                                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                                    >
                                        <ChevronLeft className="size-4" />
                                        {t('ui.previous')}
                                    </Link>
                                )}
                                {Array.from({ length: notifications.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/notifications?page=${page}${activeFilter ? `&type=${activeFilter}` : ''}`}
                                        className={`min-w-9 rounded-md px-2.5 py-1.5 text-center text-sm font-medium transition-colors ${
                                            notifications.current_page === page
                                                ? 'bg-slate-950 text-white'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                                {notifications.next_page_url && (
                                    <Link
                                        href={notifications.next_page_url}
                                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                                    >
                                        {t('ui.next')}
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
