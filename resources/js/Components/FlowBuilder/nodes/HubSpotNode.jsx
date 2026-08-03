import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function HubSpotNode({ data, selected }) {
  const invalid = data._valid === false;
  const action = data.action || 'sync_call';

  return (
    <div className={`relative min-w-48 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-zinc-900 ${selected ? 'ring-2 ring-orange-500/25 border-orange-400 dark:ring-orange-400/30' : ''} ${invalid ? '!border-red-500' : 'border-orange-200 dark:border-orange-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-orange-50 px-3 py-2 dark:bg-orange-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-orange-600 text-[10px] font-bold text-white">HS</span>
        <span className="text-xs font-semibold text-orange-800 dark:text-orange-300">HubSpot</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <span className="text-xs text-zinc-600 truncate dark:text-zinc-400">{action}</span>
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-3 !border-2 !border-orange-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-3 !border-2 !border-orange-400 !bg-white" />
    </div>
  );
}

export default memo(HubSpotNode);
