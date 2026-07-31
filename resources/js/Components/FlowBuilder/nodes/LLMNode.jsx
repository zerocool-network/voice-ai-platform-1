import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle, Sparkles } from 'lucide-react';

function LLMNode({ data, selected }) {
  const invalid = data._valid === false;
  const model = data.model || 'gpt-4o';

  return (
    <div className={`relative min-w-48 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-zinc-900 ${selected ? 'ring-2 ring-cyan-500/25 border-cyan-400 dark:ring-cyan-400/30' : ''} ${invalid ? '!border-red-500' : 'border-blue-200 dark:border-blue-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
        <Sparkles className="size-3.5 text-blue-500" />
        <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">LLM</span>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            {model}
          </span>
        </div>
        {data.userPromptTemplate && (
          <p className="text-[10px] text-zinc-400 line-clamp-1 dark:text-zinc-500">{data.userPromptTemplate}</p>
        )}
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-3 !border-2 !border-blue-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-3 !border-2 !border-blue-400 !bg-white" />
    </div>
  );
}

export default memo(LLMNode);
