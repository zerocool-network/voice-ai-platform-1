import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { BookOpen, AlertTriangle } from 'lucide-react';

function KnowledgeNode({ data }) {
    const query = data.query || '';
    const topK = data.topK || 5;
    const retrievalType = data.retrievalType || 'semantic';
    const invalid = data._valid === false;

    return (
        <div className={`relative min-w-48 rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-zinc-900 ${invalid ? '!border-red-500' : 'border-cyan-200 dark:border-cyan-800'}`}>
            <div className="flex items-center gap-2 rounded-t-xl bg-cyan-50 px-3 py-2 dark:bg-cyan-950/30">
                <BookOpen className="size-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Knowledge</span>
            </div>
            <div className="space-y-1 px-3 py-2.5">
                <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {query ? `"${query}"` : 'No query set'}
                </p>
                <div className="flex gap-2 text-[10px] text-zinc-400">
                    <span>Top {topK}</span>
                    <span>&middot;</span>
                    <span className="capitalize">{retrievalType}</span>
                </div>
            </div>
            {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
            <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-cyan-400 !bg-white" />
            <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-cyan-400 !bg-white" />
        </div>
    );
}

export default memo(KnowledgeNode);
