import { Link, router, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
    LayoutDashboard, Radio, Phone, FileText, GitBranch, Mic, BarChart3,
    BookOpen, Webhook, Settings, Bell, Download, Plus, Calendar,
    LogOut, User, ChevronUp, Users, Key, Smartphone, Globe, CreditCard,
    Activity, Bot, Server, Shield, Award, AlertTriangle, UserCheck,
    MessageSquare, MessageSquareText, Hexagon,
} from 'lucide-react'
import SearchBar from '@/Components/SearchBar'
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

const NAV_PRIMARY = [
    { label: 'Dashboard', href: dashboard().url, icon: LayoutDashboard, active: 'dashboard' },
    { label: 'Notifications', href: notificationsIndex().url, icon: Bell, active: 'notifications.*' },
    { label: 'Analytics', href: analyticsIndex().url, icon: BarChart3, active: 'analytics.*' },
    { label: 'Flows', href: flowsIndex().url, icon: GitBranch, active: 'flows.*' },
    { label: 'Calls', href: callsIndex().url, icon: Phone, active: 'calls.*' },
    { label: 'Transcripts', href: transcriptsIndex().url, icon: MessageSquareText, active: 'transcripts.*' },
    { label: 'Quality', href: qualityIndex().url, icon: Award, active: 'quality.*' },
    { label: 'Monitor', href: monitorIndex().url, icon: Radio, active: 'monitor.*' },
    { label: 'SMS', href: smsIndex().url, icon: MessageSquare, active: 'sms.*' },
]

const NAV_DEVELOPMENT = [
    { label: 'API Docs', href: '/docs', icon: BookOpen, active: 'docs' },
    { label: 'Team', href: teamIndex().url, icon: Users, active: 'team.*' },
    { label: 'API Tokens', href: apiTokensIndex().url, icon: Key, active: 'api-tokens.*' },
    { label: 'Settings', href: settingsTenant().url, icon: Settings, active: 'settings.tenant' },
    { label: 'Voice & Language', href: settingsVoice().url, icon: Mic, active: 'settings.voice' },
    { label: 'Voices', href: voicesIndex().url, icon: Mic, active: 'settings.voices.*' },
    { label: 'Documents', href: documentsIndex().url, icon: FileText, active: 'settings.documents.*' },
    { label: 'Webhooks', href: webhooksIndex().url, icon: Webhook, active: 'settings.webhooks.*' },
    { label: 'Webhook Deliveries', href: webhookDeliveriesIndex().url, icon: Activity, active: 'settings.webhooks.deliveries*' },
    { label: 'Billing', href: billingIndex().url, icon: CreditCard, active: 'billing.*' },
    { label: 'Activity Log', href: activityIndex().url, icon: Activity, active: 'settings.activity.*' },
    { label: 'Errors', href: errorsIndex().url, icon: AlertTriangle, active: 'settings.errors.*' },
    { label: 'Agents', href: agentsIndex().url, icon: Bot, active: 'settings.agents.*' },
    { label: 'Phone Numbers', href: phoneNumbers().url, icon: Smartphone, active: 'settings.phone-numbers' },
    { label: 'System', href: systemIndex().url, icon: Server, active: 'settings.system' },
    { label: 'Roles', href: roles().url, icon: Shield, active: 'settings.roles' },
]

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user
    const flash = usePage().props.flash
    const isImpersonating = usePage().props.isImpersonating
    const impersonatedUser = usePage().props.impersonatedUser
    const locale = usePage().props.locale
    const pathname = window.location.pathname
    const [unreadCount, setUnreadCount] = useState(0)
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    function stopImpersonating() {
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
        return route().current(pattern)
    }

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-50 flex h-full w-[248px] flex-col border-r border-zinc-800 bg-[#111827]">
                <div className="flex flex-col gap-1 p-6">
                    <Link href={dashboard().url} className="text-xl font-bold tracking-tight text-white">
                        ZeroVoice
                    </Link>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        AI Voice Operations
                    </span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    {NAV_PRIMARY.map((item) => {
                        const active = isActive(item.active)
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center px-4 py-2.5 transition-all duration-200 ${
                                    active
                                        ? 'border-l-2 border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                        : 'border-l-2 border-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon className="mr-3 size-5 shrink-0" />
                                <span className={`text-sm ${active ? 'font-semibold' : ''}`}>
                                    {item.label}
                                    {item.label === 'Notifications' && unreadCount > 0 && (
                                        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[10px] font-bold text-white">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        )
                    })}

                    <div className="mb-2 mt-8 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                            Development
                        </span>
                    </div>

                    {NAV_DEVELOPMENT.map((item) => {
                        const active = isActive(item.active)
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center px-4 py-2.5 transition-all duration-200 ${
                                    active
                                        ? 'border-l-2 border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                        : 'border-l-2 border-transparent text-zinc-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Icon className="mr-3 size-5 shrink-0" />
                                <span className={`text-sm ${active ? 'font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                {/* User footer */}
                <div className="mt-auto border-t border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded bg-indigo-500 text-xs font-bold text-white">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-white">{user.name}</p>
                            <p className="truncate text-[10px] text-zinc-500">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Header */}
            <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white pl-[248px] pr-8">
                <div className="flex flex-1 items-center gap-4">
                    <SearchBar />
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/notifications"
                        className="relative inline-flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                    >
                        <Bell className="size-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold leading-none text-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Link>

                    <a
                        href={route().current() ? '/locale/' + (locale === 'en' ? 'es' : 'en') : '/locale/es'}
                        className="inline-flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                        title={locale === 'en' ? 'Español' : 'English'}
                    >
                        <Globe className="size-5" />
                    </a>

                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex size-9 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white hover:bg-indigo-600"
                        >
                            {initials}
                        </button>

                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                                    <div className="border-b border-zinc-100 px-4 py-2.5">
                                        <p className="text-sm font-medium text-zinc-900">{user.name}</p>
                                        <p className="text-xs text-zinc-500">{user.email}</p>
                                    </div>
                                    <Link
                                        href={profileEdit().url}
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                                    >
                                        <User className="size-4" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                                    >
                                        <LogOut className="size-4" />
                                        Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="ml-[248px] mt-16 p-8">
                <div className="mx-auto max-w-[1280px]">
                    {isImpersonating && (
                        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 border border-amber-200">
                            <div className="flex items-center gap-2">
                                <UserCheck className="size-4" />
                                <span>Impersonating <strong>{impersonatedUser}</strong></span>
                            </div>
                            <button
                                onClick={stopImpersonating}
                                className="rounded-md bg-amber-200 px-3 py-1 text-xs font-semibold hover:bg-amber-300"
                            >
                                Stop
                            </button>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    )
}
