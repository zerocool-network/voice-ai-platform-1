import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

const methodColors = {
  POST: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30',
  GET: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
  PUT: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30',
  DELETE: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30',
};

function WebhookNode({ data, selected }) {
  const invalid = data._valid === false;
  const method = data.method || 'POST';

  return (
    <div className={`relative min-w-48 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-zinc-900 ${selected ? 'ring-2 ring-cyan-500/25 border-cyan-400 dark:ring-cyan-400/30' : ''} ${invalid ? '!border-red-500' : 'border-cyan-200 dark:border-cyan-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-cyan-50 px-3 py-2 dark:bg-cyan-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-cyan-500 text-[10px] font-bold text-white">W</span>
        <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-300">Webhook</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${methodColors[method] || methodColors.POST}`}>
            {method}
          </span>
          <span className="text-xs text-zinc-600 truncate dark:text-zinc-400">{data.url || 'No URL set'}</span>
        </div>
        {data.variable && (
          <span className="inline-flex items-center rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            Save → ${data.variable}
          </span>
        )}
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-3 !border-2 !border-cyan-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-3 !border-2 !border-cyan-400 !bg-white" />
    </div>
  );
}

export default memo(WebhookNode);
