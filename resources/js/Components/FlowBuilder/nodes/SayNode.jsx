import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function SayNode({ data, selected }) {
  const invalid = data._valid === false;
  const text = data.text || '';
  const charCount = text.length;

  return (
    <div className={`relative min-w-48 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-zinc-900 ${selected ? 'ring-2 ring-cyan-500/25 border-cyan-400 dark:ring-cyan-400/30' : ''} ${invalid ? '!border-red-500' : 'border-emerald-200 dark:border-emerald-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-white">S</span>
        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Say</span>
      </div>
      <div className="px-3 py-2.5">
        {text ? (
          <p className="text-xs text-zinc-600 line-clamp-2 dark:text-zinc-400">{text}</p>
        ) : (
          <p className="text-xs text-zinc-400 italic dark:text-zinc-500">Empty response</p>
        )}
        {text && <span className="mt-1 block text-[10px] text-zinc-400">{charCount} chars</span>}
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-3 !border-2 !border-emerald-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-3 !border-2 !border-emerald-400 !bg-white" />
    </div>
  );
}

export default memo(SayNode);
