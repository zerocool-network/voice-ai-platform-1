import { Link } from '@inertiajs/react'
import { useTranslation } from '@/hooks/useTranslation'

export default function AuthLayout({ children, title, subtitle }) {
    const { t } = useTranslation()

    const features = [
        {
            icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42',
            textKey: 'ui.auth_feature_flows',
        },
        {
            icon: 'M20 1.5v-.525a1.125 1.125 0 00-2.25 0V1.5M17.25 3.75h-2.25M17.25 3.75h-4.5M17.25 3.75a1.125 1.125 0 010 2.25M17.25 3.75a1.125 1.125 0 000 2.25m0 0h-4.5M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
            textKey: 'ui.auth_feature_monitor',
        },
        {
            icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
            textKey: 'ui.auth_feature_webhooks',
        },
    ]

    return (
        <div className="flex min-h-screen">
            <div className="relative hidden w-2/5 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-[#0B1220] to-cyan-950 p-12 lg:flex">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.18)_0%,_transparent_60%)]" />

                <div className="absolute bottom-1/3 left-1/2 flex -translate-x-1/2 items-end gap-0.5 opacity-20">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={`wave-${i}`}
                            className="w-1 rounded-full bg-cyan-200/60"
                            style={{
                                height: `${Math.random() * 60 + 10}px`,
                                animation: `wave ${Math.random() * 2 + 1.5}s ease-in-out infinite alternate`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-sky-500/10 blur-3xl" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                        <svg className="size-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
                        {t('ui.app_name')}
                    </h1>
                    <p className="text-lg text-cyan-100/80">
                        {t('ui.auth_tagline')}
                    </p>

                    <div className="mt-10 space-y-4 text-left">
                        {features.map((item) => (
                            <div key={item.textKey} className="flex items-start gap-3">
                                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-white/10">
                                    <svg className="size-3.5 text-cyan-200" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                                    </svg>
                                </div>
                                <span className="text-sm text-cyan-50/80">{t(item.textKey)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 z-10">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <p className="text-sm italic leading-relaxed text-cyan-50/70">
                            &ldquo;{t('ui.auth_quote')}&rdquo;
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="size-6 rounded-full bg-cyan-400/30" />
                            <div>
                                <p className="text-xs font-medium text-white/80">{t('ui.auth_quote_author')}</p>
                                <p className="text-xs text-cyan-200/50">{t('ui.auth_quote_company')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
                <div className="w-full max-w-sm animate-[fadeIn_0.6s_ease-out]">
                    <div className="mb-8 sm:mb-10">
                        <Link
                            href="/"
                            className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-950 lg:hidden"
                        >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-600 text-xs font-bold text-white">
                                V
                            </div>
                            {t('ui.app_name')}
                        </Link>

                        {title && (
                            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mt-2 text-sm text-slate-500">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes wave {
                    from { transform: scaleY(0.4); }
                    to { transform: scaleY(1); }
                }
            `}</style>
        </div>
    )
}
