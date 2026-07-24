import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function AskNode({ data }) {
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-48 rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-zinc-900 ${invalid ? '!border-red-500' : 'border-violet-200 dark:border-violet-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-violet-50 px-3 py-2 dark:bg-violet-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-violet-500 text-[10px] font-bold text-white">A</span>
        <span className="text-xs font-semibold text-violet-800 dark:text-violet-300">Ask</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <p className="text-xs text-zinc-600 line-clamp-1 dark:text-zinc-400">{data.prompt || 'Ask prompt...'}</p>
        <span className="inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {data.inputType === 'dtmf' ? 'DTMF' : 'Speech'} → ${data.variable || 'input'}
        </span>
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-violet-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-violet-400 !bg-white" />
    </div>
  );
}

export default memo(AskNode);
