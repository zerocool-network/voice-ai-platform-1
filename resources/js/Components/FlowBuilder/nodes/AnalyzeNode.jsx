import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function AnalyzeNode({ data }) {
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-48 rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-zinc-900 ${invalid ? '!border-red-500' : 'border-indigo-200 dark:border-indigo-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-indigo-50 px-3 py-2 dark:bg-indigo-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-indigo-500 text-[10px] font-bold text-white">CI</span>
        <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">Analyze</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        {data.language_operator ? (
          <p className="text-xs text-zinc-600 line-clamp-1 dark:text-zinc-400">Operator: {data.language_operator}</p>
        ) : (
          <p className="text-xs text-zinc-400 line-clamp-1 dark:text-zinc-500">Conversation Intelligence</p>
        )}
        {data.conversation_profile && (
          <p className="text-[10px] text-zinc-400 line-clamp-1 dark:text-zinc-500">{data.conversation_profile}</p>
        )}
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-indigo-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-indigo-400 !bg-white" />
    </div>
  );
}

export default memo(AnalyzeNode);
