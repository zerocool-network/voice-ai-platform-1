import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain } from 'lucide-react';

function MemoryNode({ data }) {
  return (
    <div className="relative min-w-48 rounded-xl border border-cyan-200 bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:border-cyan-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 rounded-t-xl bg-cyan-50 px-3 py-2 dark:bg-cyan-950/30">
        <Brain className="size-3.5 text-cyan-500" />
        <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Memory</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Load customer profile</p>
        {data.from_number && (
          <p className="text-[10px] text-zinc-400 line-clamp-1 dark:text-zinc-500">{data.from_number}</p>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-cyan-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-cyan-400 !bg-white" />
    </div>
  );
}

export default memo(MemoryNode);
