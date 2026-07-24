import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function HangupNode({ data }) {
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-36 rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-zinc-900 ${invalid ? '!border-red-500' : 'border-red-200 dark:border-red-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-red-50 px-3 py-2 dark:bg-red-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-red-500 text-[10px] font-bold text-white">■</span>
        <span className="text-xs font-semibold text-red-800 dark:text-red-300">Hangup</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-zinc-400 italic">End call</p>
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-red-400 !bg-white" />
    </div>
  );
}

export default memo(HangupNode);
