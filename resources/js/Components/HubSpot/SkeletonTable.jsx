export default function SkeletonTable({ rows = 6, cols = 4 }) {
    return (
        <div className="animate-pulse space-y-3 p-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-3">
                    {Array.from({ length: cols }).map((__, j) => (
                        <div key={j} className="h-4 flex-1 rounded bg-slate-100" />
                    ))}
                </div>
            ))}
        </div>
    );
}
