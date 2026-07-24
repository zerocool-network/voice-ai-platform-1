import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function GotoNode({ data }) {
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-40 rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-zinc-900 ${invalid ? '!border-red-500' : 'border-orange-200 dark:border-orange-800'}`}>
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
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-orange-400 !bg-white" />
    </div>
  );
}

export default memo(GotoNode);
