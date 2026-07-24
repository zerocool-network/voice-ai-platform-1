import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function TransferNode({ data }) {
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-44 rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-zinc-900 ${invalid ? '!border-red-500' : 'border-rose-200 dark:border-rose-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-rose-50 px-3 py-2 dark:bg-rose-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-rose-500 text-[10px] font-bold text-white">↗</span>
        <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Transfer</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {data.value || 'No destination set'}
        </p>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{data.destination || 'number'}</span>
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-rose-400 !bg-white" />
    </div>
  );
}

export default memo(TransferNode);
