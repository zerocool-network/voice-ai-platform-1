import { Link, router, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
    LayoutDashboard, Radio, Phone, FileText, GitBranch, Mic, BarChart3,
    BookOpen, Webhook, Settings, Bell, LogOut, User, Users, Key, Smartphone,
    Globe, CreditCard, Activity, Bot, Server, Shield, Award, AlertTriangle,
    UserCheck, MessageSquare, MessageSquareText, ChevronDown, Hexagon, Plug,
} from 'lucide-react'
import CommandPalette from '@/Components/CommandPalette'
import LanguageSwitcher from '@/Components/LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'
import { dashboard, logout } from '@/routes'
import { index as notificationsIndex } from '@/routes/notifications'
import { index as transcriptsIndex } from '@/routes/transcripts'
import { index as qualityIndex } from '@/routes/quality'
import { index as analyticsIndex } from '@/actions/App/Http/Controllers/Web/AnalyticsController'
import { index as flowsIndex } from '@/actions/App/Http/Controllers/Web/FlowController'
import { index as callsIndex } from '@/actions/App/Http/Controllers/Web/CallController'
import { index as monitorIndex } from '@/actions/App/Http/Controllers/Web/MonitorController'
import { index as apiTokensIndex } from '@/actions/App/Http/Controllers/Web/ApiTokenController'
import { edit as profileEdit } from '@/routes/profile'
import { index as teamIndex } from '@/routes/team'
import { tenant as settingsTenant, phoneNumbers, roles } from '@/routes/settings'
import { index as errorsIndex } from '@/routes/settings/errors'
import { stop as stopImpersonating } from '@/routes/admin/impersonate'
import { edit as settingsVoice } from '@/actions/App/Http/Controllers/Web/VoiceSettingsController'
import { index as documentsIndex } from '@/actions/App/Http/Controllers/Web/DocumentsController'
import { index as webhooksIndex } from '@/actions/App/Http/Controllers/Web/WebhookDestinationController'
import { index as webhookDeliveriesIndex } from '@/actions/App/Http/Controllers/Web/WebhookDeliveryController'
import { index as smsIndex } from '@/actions/App/Http/Controllers/Web/SmsController'
import { index as billingIndex } from '@/actions/App/Http/Controllers/Web/BillingController'
import { index as activityIndex } from '@/actions/App/Http/Controllers/Web/ActivityLogController'
import { index as voicesIndex } from '@/actions/App/Http/Controllers/Web/VoiceController'
import { index as agentsIndex } from '@/actions/App/Http/Controllers/Web/ElevenLabsAgentController'
import { index as systemIndex } from '@/actions/App/Http/Controllers/Web/SystemHealthController'

const NAV_GROUPS = [
    {
        id: 'operate',
        labelKey: 'navigation.group_operate',
        defaultOpen: true,
        items: [
            { labelKey: 'navigation.dashboard', href: dashboard().url, icon: LayoutDashboard, active: 'dashboard', badge: null },
            { labelKey: 'navigation.monitor', href: monitorIndex().url, icon: Radio, active: 'monitor.*' },
            { labelKey: 'navigation.calls', href: callsIndex().url, icon: Phone, active: 'calls.*' },
            { labelKey: 'navigation.transcripts', href: transcriptsIndex().url, icon: MessageSquareText, active: 'transcripts.*' },
            { labelKey: 'navigation.quality', href: qualityIndex().url, icon: Award, active: 'quality.*' },
            { labelKey: 'navigation.sms', href: smsIndex().url, icon: MessageSquare, active: 'sms.*' },
            { labelKey: 'navigation.notifications', href: notificationsIndex().url, icon: Bell, active: 'notifications.*', badge: 'notifications' },
        ],
    },
    {
        id: 'build',
        labelKey: 'navigation.group_build',
        defaultOpen: true,
        items: [
            { labelKey: 'navigation.flows', href: flowsIndex().url, icon: GitBranch, active: 'flows.*' },
            { labelKey: 'navigation.agents', href: agentsIndex().url, icon: Bot, active: 'settings.agents.*' },
            { labelKey: 'navigation.voices', href: voicesIndex().url, icon: Mic, active: 'settings.voices.*' },
            { labelKey: 'navigation.documents', href: documentsIndex().url, icon: FileText, active: 'settings.documents.*' },
            { labelKey: 'navigation.voice_language', href: settingsVoice().url, icon: Globe, active: 'settings.voice' },
        ],
    },
    {
        id: 'configure',
        labelKey: 'navigation.group_configure',
        defaultOpen: false,
        items: [
            { labelKey: 'navigation.analytics', href: analyticsIndex().url, icon: BarChart3, active: 'analytics.*' },
            { labelKey: 'navigation.integrations', href: '/settings/integrations', icon: Plug, active: 'settings.integrations.*' },
            { labelKey: 'navigation.team', href: teamIndex().url, icon: Users, active: 'team.*' },
            { labelKey: 'navigation.billing', href: billingIndex().url, icon: CreditCard, active: 'billing.*' },
            { labelKey: 'navigation.api_tokens', href: apiTokensIndex().url, icon: Key, active: 'api-tokens.*' },
            { labelKey: 'navigation.api_docs', href: '/docs', icon: BookOpen, active: 'docs' },
            { labelKey: 'navigation.webhooks', href: webhooksIndex().url, icon: Webhook, active: 'settings.webhooks.*' },
            { labelKey: 'navigation.webhook_deliveries', href: webhookDeliveriesIndex().url, icon: Activity, active: 'settings.webhooks.deliveries*' },
            { labelKey: 'navigation.phone_numbers', href: phoneNumbers().url, icon: Smartphone, active: 'settings.phone-numbers' },
            { labelKey: 'navigation.settings', href: settingsTenant().url, icon: Settings, active: 'settings.tenant' },
            { labelKey: 'navigation.roles', href: roles().url, icon: Shield, active: 'settings.roles' },
            { labelKey: 'navigation.system', href: systemIndex().url, icon: Server, active: 'settings.system' },
            { labelKey: 'navigation.activity_log', href: activityIndex().url, icon: Activity, active: 'settings.activity.*' },
            { labelKey: 'navigation.errors', href: errorsIndex().url, icon: AlertTriangle, active: 'settings.errors.*' },
        ],
    },
]

function groupHasActive(group) {
    return group.items.some((item) => {
        try {
            return route().current(item.active)
        } catch {
            return false
        }
    })
}

export default function AuthenticatedLayout({ children }) {
    const page = usePage()
    const { t } = useTranslation()
    const user = page.props.auth.user
    const flash = page.props.flash
    const isImpersonating = page.props.isImpersonating
    const impersonatedUser = page.props.impersonatedUser
    const [unreadCount, setUnreadCount] = useState(0)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    const [openGroups, setOpenGroups] = useState(() => {
        const open = {}
        NAV_GROUPS.forEach((group) => {
            open[group.id] = group.defaultOpen || groupHasActive(group)
        })
        return open
    })

    useEffect(() => {
        setOpenGroups((prev) => {
            const next = { ...prev }
            let changed = false
            NAV_GROUPS.forEach((group) => {
                if (groupHasActive(group) && !next[group.id]) {
                    next[group.id] = true
                    changed = true
                }
            })
            return changed ? next : prev
        })
    }, [page.url])

    function handleStopImpersonating() {
        router.post(stopImpersonating().url, {}, { preserveScroll: true })
    }

    function handleLogout(e) {
        e.preventDefault()
        router.post(logout().url)
    }

    useEffect(() => {
        if (flash?.success) toast.success(flash.success)
        if (flash?.error) toast.error(flash.error)
    }, [flash?.success, flash?.error])

    useEffect(() => {
        let cancelled = false
        function fetchUnread() {
            fetch('/notifications/unread')
                .then((r) => r.json())
                .then((data) => { if (!cancelled) setUnreadCount(data.count ?? 0) })
                .catch(() => {})
        }
        fetchUnread()
        const interval = setInterval(fetchUnread, 30000)
        return () => { cancelled = true; clearInterval(interval) }
    }, [])

    function isActive(pattern) {
        try {
            return route().current(pattern)
        } catch {
            return false
        }
    }

    function toggleGroup(id) {
        setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="min-h-screen bg-surface">
            <aside className="fixed left-0 top-0 z-[110] flex h-full w-[248px] flex-col border-r border-white/5 bg-sidebar">
                <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/10 ring-1 ring-cyan-400/30">
                        <Hexagon className="size-4 text-cyan-300" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0">
                        <Link href={dashboard().url} className="block truncate text-[15px] font-semibold tracking-tight text-white">
                            {t('ui.app_name')}
                        </Link>
                        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {t('navigation.ops_console')}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 pb-4">
                    {NAV_GROUPS.map((group) => {
                        const isOpen = openGroups[group.id]
                        return (
                            <div key={group.id} className="mb-1">
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(group.id)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                                >
                                    <ChevronDown
                                        className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                                    />
                                    {t(group.labelKey)}
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-200 ${
                                        isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="flex flex-col gap-0.5 pb-2">
                                        {group.items.map((item) => {
                                            const active = isActive(item.active)
                                            const Icon = item.icon
                                            const label = t(item.labelKey)
                                            return (
                                                <Link
                                                    key={item.labelKey}
                                                    href={item.href}
                                                    className={`group relative flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-150 ${
                                                        active
                                                            ? 'bg-cyan-500/10 text-cyan-300'
                                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    {active && (
                                                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.55)]" />
                                                    )}
                                                    <Icon className={`size-[18px] shrink-0 ${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                                    <span className={`truncate text-[13px] ${active ? 'font-semibold' : 'font-medium'}`}>
                                                        {label}
                                                        {item.badge === 'notifications' && unreadCount > 0 && (
                                                            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold text-white">
                                                                {unreadCount > 99 ? '99+' : unreadCount}
                                                            </span>
                                                        )}
                                                    </span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </nav>
            </aside>

            <header className="fixed left-0 right-0 top-0 z-40 flex h-[60px] items-center justify-between border-b border-slate-200/60 bg-white/80 pl-[248px] pr-5 backdrop-blur-xl">
                <div className="flex flex-1 items-center pl-5">
                    <CommandPalette />
                </div>

                <div className="flex items-center gap-1">
                    <Link
                        href="/notifications"
                        className="relative inline-flex size-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        aria-label={t('navigation.notifications')}
                    >
                        <Bell className="size-[17px]" />
                        {unreadCount > 0 && (
                            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>

                    <LanguageSwitcher />

                    <div className="mx-1.5 h-5 w-px bg-slate-200/80" />

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white py-1 pl-1 pr-2.5 shadow-sm transition hover:border-slate-300 hover:shadow-card"
                        >
                            <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-700 text-[10px] font-bold text-white">
                                {initials}
                            </span>
                            <span className="hidden max-w-[110px] truncate text-[13px] font-medium text-slate-700 sm:block">
                                {user.name.split(' ')[0]}
                            </span>
                        </button>

                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1 shadow-elevated">
                                    <div className="border-b border-slate-100 px-4 py-3">
                                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                                    </div>
                                    <Link
                                        href={profileEdit().url}
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        <User className="size-4 text-slate-400" />
                                        {t('navigation.profile')}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                        <LogOut className="size-4 text-slate-400" />
                                        {t('navigation.logout')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="ml-[248px] mt-[60px] min-h-[calc(100vh-60px)] p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-[1280px]">
                    {isImpersonating && (
                        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-4" />
                                <span>{t('navigation.impersonating')} <strong>{impersonatedUser}</strong></span>
                            </div>
                            <button
                                type="button"
                                onClick={handleStopImpersonating}
                                className="rounded-lg bg-amber-200 px-3 py-1 text-xs font-semibold hover:bg-amber-300"
                            >
                                {t('navigation.stop')}
                            </button>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    )
}
