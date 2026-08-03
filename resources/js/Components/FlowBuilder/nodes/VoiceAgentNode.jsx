import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function VoiceAgentNode({ data, selected }) {
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-48 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-zinc-900 ${selected ? 'ring-2 ring-cyan-500/25 border-cyan-400 dark:ring-cyan-400/30' : ''} ${invalid ? '!border-red-500' : 'border-purple-200 dark:border-purple-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-purple-50 px-3 py-2 dark:bg-purple-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-purple-500 text-[10px] font-bold text-white">VA</span>
        <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">Voice Agent</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-600 truncate dark:text-zinc-400">{data.voice || 'Default voice'}</span>
          {data.intelligence_service && (
            <span className="shrink-0 inline-flex items-center rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">CI</span>
          )}
        </div>
        {data.system_prompt && (
          <p className="text-[10px] text-zinc-400 line-clamp-1 dark:text-zinc-500">{data.system_prompt}</p>
        )}
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-3 !border-2 !border-purple-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-3 !border-2 !border-purple-400 !bg-white" />
    </div>
  );
}

export default memo(VoiceAgentNode);
