import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain } from 'lucide-react';

function MemoryNode({ data, selected }) {
  return (
    <div className={`relative min-w-48 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-zinc-900 ${selected ? 'ring-2 ring-cyan-500/25 border-cyan-400 dark:ring-cyan-400/30' : 'border-cyan-200 dark:border-cyan-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-cyan-50 px-3 py-2 dark:bg-cyan-950/30">
        <Brain className="size-3.5 text-cyan-500" />
        <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Memory</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Load customer profile</p>
        {data.from_number && (
          <span className="inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{data.from_number}</span>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!size-3 !border-2 !border-cyan-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-3 !border-2 !border-cyan-400 !bg-white" />
    </div>
  );
}

export default memo(MemoryNode);
