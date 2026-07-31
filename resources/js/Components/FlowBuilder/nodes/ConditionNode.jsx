import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

function ConditionNode({ data, selected }) {
  const branches = data.branches || [];
  const hasElse = data.elseNext;
  const invalid = data._valid === false;

  return (
    <div className={`relative min-w-48 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-zinc-900 ${selected ? 'ring-2 ring-cyan-500/25 border-cyan-400 dark:ring-cyan-400/30' : ''} ${invalid ? '!border-red-500' : 'border-amber-200 dark:border-amber-800'}`}>
      <div className="flex items-center gap-2 rounded-t-xl bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-amber-500 text-[10px] font-bold text-white">?</span>
        <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Condition</span>
      </div>
      <div className="space-y-1 px-3 py-2.5">
        {branches.length === 0 && (
          <p className="text-xs text-zinc-400 italic">No branches</p>
        )}
        {branches.map((b, i) => (
          <div key={`${b.label || 'branch'}-${i}`} className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">{b.label || `Branch ${i + 1}`}</span>
            {b.expression && (
              <code className="truncate rounded bg-zinc-100 px-1 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">{b.expression}</code>
            )}
          </div>
        ))}
        {hasElse && (
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <span className="font-medium text-zinc-500">else</span>
            <span>→ {data.elseNext || '?'}</span>
          </div>
        )}
      </div>
      {invalid && <AlertTriangle className="absolute -right-1 -top-1 size-4 text-red-500" />}
      <Handle type="target" position={Position.Top} className="!size-3 !border-2 !border-amber-400 !bg-white" />
      {branches.map((b, i) => (
        <Handle
          key={b.label || i}
          type="source"
          position={Position.Bottom}
          id={`branch-${i}`}
          className="!size-3 !border-2 !border-amber-400 !bg-white"
          style={{ left: `${((i + 1) / (branches.length + (hasElse ? 1 : 0) + 1)) * 100}%` }}
        />
      ))}
      {hasElse && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="else"
          className="!size-3 !border-2 !border-zinc-400 !bg-white"
          style={{ left: `${((branches.length + 1) / (branches.length + 2)) * 100}%` }}
        />
      )}
    </div>
  );
}

export default memo(ConditionNode);
