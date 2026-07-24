import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function WebhookNode({ data }) {
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-48 rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-zinc-900 ${invalid ? '!border-red-500' : 'border-cyan-200 dark:border-cyan-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-cyan-50 px-3 py-2 dark:bg-cyan-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-cyan-500 text-[10px] font-bold text-white">W</span>
        <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Webhook</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-zinc-600 truncate dark:text-zinc-400">
          {data.method || 'POST'} {data.url || 'No URL set'}
        </p>
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-cyan-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-cyan-400 !bg-white" />
    </div>
  );
}

export default memo(WebhookNode);
