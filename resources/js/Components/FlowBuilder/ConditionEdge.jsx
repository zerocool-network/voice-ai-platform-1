import { useState } from 'react';
import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import { X } from 'lucide-react';

export default function ConditionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  label,
  data,
  selected,
}) {
  const [hover, setHover] = useState(false);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 16,
  });

  const displayLabel = data?.branchLabel === 'else' ? 'No' : data?.branchLabel || label || '';
  const isElse = displayLabel === 'No';

  const badgeColor = isElse
    ? 'border-slate-200 bg-white text-slate-500'
    : 'border-amber-200/80 bg-amber-50 text-amber-800';

  const strokeClass = isElse
    ? '!stroke-slate-300'
    : '!stroke-amber-400';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={`transition-all duration-200 ${hover || selected ? '!stroke-[2.5]' : '!stroke-[1.75]'} ${strokeClass}`}
        style={{ strokeDasharray: isElse ? '5 4' : undefined }}
      />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="group relative nodrag nopan"
          >
            <div
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm transition-all ${badgeColor} ${
                hover || selected ? 'scale-105 shadow-md' : ''
              }`}
            >
              {displayLabel}
              <button
                type="button"
                className="ml-0.5 hidden text-current opacity-60 hover:opacity-100 group-hover:inline-flex"
                title="Delete edge"
                onClick={(e) => {
                  e.stopPropagation();
                  const deleteKey = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true });
                  document.dispatchEvent(deleteKey);
                }}
              >
                <X className="size-2.5" />
              </button>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
