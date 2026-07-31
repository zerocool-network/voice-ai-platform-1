export default function PageHeader({ eyebrow, title, subtitle, actions, className = '' }) {
    return (
        <div className={`flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between ${className}`}>
            <div>
                {eyebrow && (
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200/70 bg-cyan-50/80 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                        {eyebrow}
                    </div>
                )}
                <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">{title}</h1>
                {subtitle && (
                    typeof subtitle === 'string'
                        ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                        : <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2">{actions}</div>
            )}
        </div>
    )
}
