import { router } from '@inertiajs/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
    Search, Phone, GitBranch, MessageSquare, MessageSquareText,
    Loader2, ArrowRight, CornerDownLeft, Sparkles, Radio, Hash,
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { index as callsIndex } from '@/actions/App/Http/Controllers/Web/CallController'
import { index as flowsIndex } from '@/actions/App/Http/Controllers/Web/FlowController'
import { index as smsIndex } from '@/actions/App/Http/Controllers/Web/SmsController'
import { index as transcriptsIndex } from '@/routes/transcripts'
import { index as monitorIndex } from '@/actions/App/Http/Controllers/Web/MonitorController'

const SIDEBAR_WIDTH = 248

const TYPE_CONFIG = {
    call: { icon: Phone, labelKey: 'ui.quick_calls', accent: 'text-sky-300', chip: 'bg-sky-500/15 ring-sky-400/20' },
    flow: { icon: GitBranch, labelKey: 'ui.quick_flows', accent: 'text-emerald-300', chip: 'bg-emerald-500/15 ring-emerald-400/20' },
    sms: { icon: MessageSquare, labelKey: 'ui.quick_sms', accent: 'text-violet-300', chip: 'bg-violet-500/15 ring-violet-400/20' },
    transcript: { icon: MessageSquareText, labelKey: 'ui.quick_transcripts', accent: 'text-amber-300', chip: 'bg-amber-500/15 ring-amber-400/20' },
}

const QUICK_ACTIONS = [
    { labelKey: 'ui.quick_calls', hintKey: 'ui.quick_calls_hint', href: () => callsIndex().url, icon: Phone, tone: 'sky' },
    { labelKey: 'ui.quick_flows', hintKey: 'ui.quick_flows_hint', href: () => flowsIndex().url, icon: GitBranch, tone: 'emerald' },
    { labelKey: 'ui.quick_monitor', hintKey: 'ui.quick_monitor_hint', href: () => monitorIndex().url, icon: Radio, tone: 'cyan' },
    { labelKey: 'ui.quick_sms', hintKey: 'ui.quick_sms_hint', href: () => smsIndex().url, icon: MessageSquare, tone: 'violet' },
    { labelKey: 'ui.quick_transcripts', hintKey: 'ui.quick_transcripts_hint', href: () => transcriptsIndex().url, icon: MessageSquareText, tone: 'amber' },
]

const TONE = {
    sky: 'bg-sky-500/10 text-sky-300 ring-sky-400/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/20',
    cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-400/20',
    violet: 'bg-violet-500/10 text-violet-300 ring-violet-400/20',
    amber: 'bg-amber-500/10 text-amber-300 ring-amber-400/20',
}

function isMac() {
    if (typeof navigator === 'undefined') return false
    return /Mac|iPhone|iPad/.test(navigator.platform)
}

function Kbd({ children }) {
    return (
        <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]">
            {children}
        </kbd>
    )
}

export default function CommandPalette() {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [error, setError] = useState(null)
    const inputRef = useRef(null)
    const listRef = useRef(null)
    const debounceRef = useRef(null)
    const modKey = isMac() ? '⌘' : 'Ctrl'

    const close = useCallback(() => {
        setOpen(false)
        setQuery('')
        setResults([])
        setError(null)
        setSelectedIndex(0)
        setLoading(false)
    }, [])

    useEffect(() => {
        function onKeyDown(e) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setOpen((prev) => {
                    if (prev) {
                        setQuery('')
                        setResults([])
                        setError(null)
                        return false
                    }
                    return true
                })
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    useEffect(() => {
        if (!open) return
        const t = requestAnimationFrame(() => inputRef.current?.focus())
        document.body.style.overflow = 'hidden'
        return () => {
            cancelAnimationFrame(t)
            document.body.style.overflow = ''
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        if (debounceRef.current) clearTimeout(debounceRef.current)
        setError(null)

        const trimmed = query.trim()
        if (trimmed.length < 2) {
            setResults([])
            setLoading(false)
            setSelectedIndex(0)
            return
        }

        setLoading(true)
        debounceRef.current = setTimeout(async () => {
            try {
                const resp = await fetch(`/search?q=${encodeURIComponent(trimmed)}`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                })
                if (!resp.ok) {
                    setError(`Error ${resp.status}`)
                    setResults([])
                    return
                }
                const data = await resp.json()
                setResults(data.data ?? [])
                setSelectedIndex(0)
            } catch {
                setError('Connection error')
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 280)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query, open])

    const idleMode = query.trim().length < 2
    const flatItems = idleMode
        ? QUICK_ACTIONS.map((a, i) => ({ kind: 'action', ...a, _idx: i }))
        : results.map((r, i) => ({ kind: 'result', ...r, _idx: i }))

    function go(item) {
        close()
        if (item.kind === 'action') {
            router.visit(item.href())
            return
        }
        router.visit(item.url)
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            e.preventDefault()
            close()
            return
        }
        if (flatItems.length === 0) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex((prev) => (prev + 1) % flatItems.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (flatItems[selectedIndex]) go(flatItems[selectedIndex])
        }
    }

    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-idx="${selectedIndex}"]`)
        el?.scrollIntoView({ block: 'nearest' })
    }, [selectedIndex])

    const grouped = results.reduce((acc, item, idx) => {
        if (!acc[item.type]) acc[item.type] = []
        acc[item.type].push({ ...item, _idx: idx })
        return acc
    }, {})

    const overlay = (
        <AnimatePresence>
            {open && (
                <div
                    key="command-palette"
                    className="fixed inset-y-0 right-0 z-[100]"
                    style={{ left: SIDEBAR_WIDTH }}
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-[#020617]/70 backdrop-blur-md"
                        onClick={close}
                    />

                    <div className="pointer-events-none absolute inset-0 flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]">
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Command palette"
                            initial={{ opacity: 0, y: 12, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="pointer-events-auto relative z-10 w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] shadow-[0_0_0_1px_rgba(6,182,212,0.12),0_24px_80px_rgba(0,0,0,0.55)]"
                        >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[70%] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />

                            <div className="relative flex items-center gap-3 border-b border-white/8 px-4">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-400/20">
                                    {loading ? (
                                        <Loader2 className="size-4 animate-spin text-cyan-300" />
                                    ) : (
                                        <Search className="size-4 text-cyan-300" />
                                    )}
                                </div>
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t('ui.search_placeholder')}
                                    className="h-14 flex-1 bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-slate-500"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                <Kbd>esc</Kbd>
                            </div>

                            <div ref={listRef} className="relative max-h-[min(440px,55vh)] overflow-y-auto overscroll-contain p-2">
                                {idleMode && !loading && (
                                    <div className="px-1 pb-1 pt-1">
                                        <div className="mb-2 flex items-center gap-2 px-2">
                                            <Sparkles className="size-3 text-cyan-400/80" />
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                                {t('ui.jump_to')}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            {QUICK_ACTIONS.map((action, i) => {
                                                const Icon = action.icon
                                                const active = selectedIndex === i
                                                return (
                                                    <button
                                                        key={action.labelKey}
                                                        type="button"
                                                        data-idx={i}
                                                        onClick={() => go({ kind: 'action', ...action })}
                                                        onMouseEnter={() => setSelectedIndex(i)}
                                                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                                            active
                                                                ? 'bg-white/8 ring-1 ring-white/10'
                                                                : 'hover:bg-white/4'
                                                        }`}
                                                    >
                                                        <span className={`flex size-9 items-center justify-center rounded-xl ring-1 ${TONE[action.tone]}`}>
                                                            <Icon className="size-4" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block text-[13px] font-semibold text-slate-100">{t(action.labelKey)}</span>
                                                            <span className="block text-[11px] text-slate-500">{t(action.hintKey)}</span>
                                                        </span>
                                                        {active && <ArrowRight className="size-3.5 text-cyan-400" />}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-3">
                                            <p className="text-[12px] text-slate-400">
                                                {t('ui.search_hint')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="px-4 py-10 text-center">
                                        <p className="text-sm font-medium text-rose-300">{t('ui.search_failed', { error })}</p>
                                        <p className="mt-1 text-xs text-slate-500">{t('ui.check_connection')}</p>
                                    </div>
                                )}

                                {!idleMode && !loading && !error && results.length === 0 && (
                                    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                                        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                                            <Hash className="size-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">
                                                {t('ui.no_matches_for')} <span className="text-cyan-300">“{query}”</span>
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">{t('ui.try_another_search')}</p>
                                        </div>
                                    </div>
                                )}

                                {!idleMode && results.length > 0 && Object.entries(grouped).map(([type, items]) => {
                                    const config = TYPE_CONFIG[type] ?? {
                                        icon: Search, labelKey: null, accent: 'text-slate-300', chip: 'bg-white/5 ring-white/10',
                                    }
                                    const Icon = config.icon
                                    return (
                                        <div key={type} className="mb-1">
                                            <div className="flex items-center gap-2 px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                                <Icon className={`size-3 ${config.accent}`} />
                                                {config.labelKey ? t(config.labelKey) : type}
                                                <span className="ml-auto font-mono font-normal normal-case tracking-normal text-slate-600">
                                                    {items.length}
                                                </span>
                                            </div>
                                            {items.map((item) => {
                                                const active = selectedIndex === item._idx
                                                return (
                                                    <button
                                                        key={`${type}-${item.id}`}
                                                        type="button"
                                                        data-idx={item._idx}
                                                        onClick={() => go({ kind: 'result', ...item })}
                                                        onMouseEnter={() => setSelectedIndex(item._idx)}
                                                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                                            active
                                                                ? 'bg-cyan-500/15 ring-1 ring-cyan-400/25'
                                                                : 'hover:bg-white/4'
                                                        }`}
                                                    >
                                                        <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ${config.chip}`}>
                                                            <Icon className={`size-3.5 ${config.accent}`} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-[13px] font-semibold text-slate-100">{item.title}</p>
                                                            <p className="truncate text-[11px] text-slate-500">{item.subtitle}</p>
                                                        </div>
                                                        {item.status && (
                                                            <span className="mt-0.5 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
                                                                {item.status}
                                                            </span>
                                                        )}
                                                        {active && <ArrowRight className="mt-1 size-3.5 shrink-0 text-cyan-400" />}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="relative flex items-center gap-4 border-t border-white/8 bg-black/20 px-4 py-2.5 text-[11px] text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <Kbd>↑</Kbd><Kbd>↓</Kbd>
                                    <span>{t('ui.navigate')}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Kbd><CornerDownLeft className="size-2.5" /></Kbd>
                                    <span>{t('ui.open')}</span>
                                </span>
                                <span className="ml-auto inline-flex items-center gap-1.5">
                                    <Kbd>esc</Kbd>
                                    <span>{t('ui.close_key')}</span>
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group flex w-full max-w-[300px] items-center gap-2.5 rounded-full border border-slate-200/90 bg-white px-3.5 py-2 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-cyan-300/70 hover:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
            >
                <Search className="size-3.5 shrink-0 text-slate-400 transition group-hover:text-cyan-600" />
                <span className="flex-1 truncate text-[13px] text-slate-400">{t('ui.search_workspace')}</span>
                <kbd className="hidden items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-400 sm:inline-flex">
                    {modKey}K
                </kbd>
            </button>

            {typeof document !== 'undefined' ? createPortal(overlay, document.body) : null}
        </>
    )
}
