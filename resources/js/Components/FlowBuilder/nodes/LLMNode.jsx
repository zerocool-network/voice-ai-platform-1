import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function LLMNode({ data }) {
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-48 rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-zinc-900 ${invalid ? '!border-red-500' : 'border-blue-200 dark:border-blue-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-blue-500 text-[10px] font-bold text-white">LLM</span>
        <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">LLM</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <p className="text-xs text-zinc-600 line-clamp-1 dark:text-zinc-400">{data.model || 'gpt-4o'}</p>
        {data.userPromptTemplate && (
          <p className="text-[10px] text-zinc-400 line-clamp-1 dark:text-zinc-500">{data.userPromptTemplate}</p>
        )}
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-blue-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-blue-400 !bg-white" />
    </div>
  );
}

export default memo(LLMNode);
