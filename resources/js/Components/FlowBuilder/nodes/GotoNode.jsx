import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function GotoNode({ data, selected }) {
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-40 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-zinc-900 ${selected ? 'ring-2 ring-cyan-500/25 border-cyan-400 dark:ring-cyan-400/30' : ''} ${invalid ? '!border-red-500' : 'border-orange-200 dark:border-orange-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-orange-50 px-3 py-2 dark:bg-orange-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-orange-500 text-[10px] font-bold text-white">↪</span>
        <span className="text-xs font-semibold text-orange-800 dark:text-orange-300">Goto</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          → {data.target || 'Select target...'}
        </p>
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-3 !border-2 !border-orange-400 !bg-white" />
    </div>
  );
}

export default memo(GotoNode);
