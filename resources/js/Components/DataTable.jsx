import { Link } from '@inertiajs/react'
import { ArrowUpRight, Inbox } from 'lucide-react'

/**
 * Mission Control DataTable — column-driven list UI with i18n-ready headers.
 *
 * Column shape:
 *   { id, header, cell: (row) => ReactNode, className?, headerClassName?, meta?: { mono?: boolean, align?: 'left'|'right' } }
 */
export default function DataTable({
    columns = [],
    data = [],
    getRowId = (row) => row.id,
    emptyTitle,
    emptyDescription,
    emptyAction,
    emptyIcon: EmptyIcon = Inbox,
    loading = false,
    skeletonRows = 5,
    onRowClick,
    renderExpandedRow,
    expandedId,
    toolbar,
    footer,
    density = 'comfortable',
    className = '',
}) {
    const cellY = density === 'dense' ? 'py-3' : 'py-4'
    const hasExpand = typeof renderExpandedRow === 'function'
    const colSpan = columns.length
    const lastIdx = columns.length - 1

    return (
        <div className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card ${className}`}>
            {toolbar && (
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/40 px-5 py-4 sm:px-6">
                    {toolbar}
                </div>
            )}

            {loading ? (
                <LoadingSkeleton columns={columns.length} rows={skeletonRows} cellY={cellY} />
            ) : data.length === 0 ? (
                <EmptyState
                    Icon={EmptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] table-fixed text-left text-[13px] text-slate-900 sm:table-auto">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/90">
                                {columns.map((col, i) => {
                                    const align = col.meta?.align === 'right' ? 'text-right' : 'text-left'
                                    const edge =
                                        i === 0 ? 'pl-5 sm:pl-6' : i === lastIdx ? 'pr-5 sm:pr-6' : ''
                                    return (
                                        <th
                                            key={col.id}
                                            scope="col"
                                            className={`whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 ${align} ${edge} ${col.headerClassName ?? ''}`}
                                        >
                                            {col.header}
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((row) => {
                                const id = getRowId(row)
                                const expanded = hasExpand && expandedId != null && String(expandedId) === String(id)

                                return (
                                    <RowGroup key={id}>
                                        <tr
                                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                                            className={`transition ${
                                                onRowClick ? 'cursor-pointer' : ''
                                            } ${expanded ? 'bg-cyan-50/50' : 'bg-white hover:bg-slate-50/90'}`}
                                        >
                                            {columns.map((col, i) => {
                                                const align = col.meta?.align === 'right' ? 'text-right' : 'text-left'
                                                const mono = col.meta?.mono ? 'font-mono text-[12px] tabular-nums' : ''
                                                const edge =
                                                    i === 0 ? 'pl-5 sm:pl-6' : i === lastIdx ? 'pr-5 sm:pr-6' : ''
                                                return (
                                                    <td
                                                        key={col.id}
                                                        className={`px-4 ${cellY} align-middle ${align} ${mono} ${edge} ${col.className ?? ''}`}
                                                    >
                                                        {col.cell(row)}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                        {expanded && (
                                            <tr className="bg-slate-50/80">
                                                <td colSpan={colSpan} className="p-0">
                                                    {renderExpandedRow(row)}
                                                </td>
                                            </tr>
                                        )}
                                    </RowGroup>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {footer && data.length > 0 && !loading && (
                <div className="border-t border-slate-100 bg-slate-50/30 px-5 py-4 sm:px-6">
                    {footer}
                </div>
            )}
        </div>
    )
}

function RowGroup({ children }) {
    return <>{children}</>
}

function LoadingSkeleton({ columns, rows, cellY }) {
    const lastIdx = columns - 1
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/90">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th
                                key={i}
                                className={`px-4 py-3.5 ${i === 0 ? 'pl-5 sm:pl-6' : ''} ${i === lastIdx ? 'pr-5 sm:pr-6' : ''}`}
                            >
                                <div className="h-2.5 w-16 animate-pulse rounded bg-slate-200" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {Array.from({ length: rows }).map((_, r) => (
                        <tr key={r}>
                            {Array.from({ length: columns }).map((_, c) => (
                                <td
                                    key={c}
                                    className={`px-4 ${cellY} ${c === 0 ? 'pl-5 sm:pl-6' : ''} ${c === lastIdx ? 'pr-5 sm:pr-6' : ''}`}
                                >
                                    <div
                                        className="h-3.5 animate-pulse rounded bg-slate-100"
                                        style={{ width: `${48 + ((r + c) % 4) * 18}%` }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function EmptyState({ Icon, title, description, action }) {
    return (
        <div className="relative flex min-h-[260px] flex-col items-center justify-center overflow-hidden px-8 py-14 text-center">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.3]"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.4) 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                }}
            />
            <div className="relative mb-5 flex size-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200/80">
                <Icon className="size-6 text-slate-400" />
            </div>
            {title && <p className="relative text-[15px] font-semibold text-slate-900">{title}</p>}
            {description && (
                <p className="relative mx-auto mt-2 max-w-[360px] text-[13px] leading-relaxed text-slate-500">
                    {description}
                </p>
            )}
            {action?.href && (
                <Link
                    href={action.href}
                    className="relative mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                    {action.label}
                    <ArrowUpRight className="size-3.5 opacity-70" />
                </Link>
            )}
            {action?.onClick && !action.href && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="relative mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                    {action.label}
                    <ArrowUpRight className="size-3.5 opacity-70" />
                </button>
            )}
        </div>
    )
}
