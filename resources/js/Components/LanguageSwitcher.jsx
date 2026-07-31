import { useEffect, useRef, useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function LanguageSwitcher() {
    const { locale, availableLocales = {} } = usePage().props
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const rootRef = useRef(null)

    const locales = Object.entries(availableLocales)
    const currentLabel = availableLocales[locale] ?? locale?.toUpperCase()

    useEffect(() => {
        function onPointerDown(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        function onKeyDown(e) {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('mousedown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [])

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={t('navigation.language')}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
                <Globe className="size-[17px]" />
                <span className="hidden text-[12px] font-semibold uppercase tracking-wide sm:inline">
                    {locale}
                </span>
                <ChevronDown className={`size-3.5 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label={t('navigation.language')}
                    className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1 shadow-elevated"
                >
                    <div className="border-b border-slate-100 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {t('navigation.language')}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{currentLabel}</p>
                    </div>
                    {locales.map(([code, label]) => {
                        const active = code === locale
                        return (
                            <a
                                key={code}
                                href={`/locale/${code}`}
                                role="option"
                                aria-selected={active}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm transition ${
                                    active
                                        ? 'bg-cyan-50 font-semibold text-cyan-800'
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <span className="w-7 font-mono text-[11px] uppercase text-slate-400">{code}</span>
                                <span className="flex-1">{label}</span>
                                {active && <Check className="size-3.5 text-cyan-600" />}
                            </a>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
