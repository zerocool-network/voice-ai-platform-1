export default function PageSection({ children, className = '', padding = true }) {
    return (
        <div
            className={`overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card ${
                padding ? 'p-6 sm:p-8' : ''
            } ${className}`}
        >
            {children}
        </div>
    )
}
