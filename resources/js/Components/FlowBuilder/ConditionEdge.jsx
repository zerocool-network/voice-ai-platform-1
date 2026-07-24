import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

export default function ConditionEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, label, data }) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const displayLabel = data?.branchLabel === 'else' ? 'No' : data?.branchLabel || label || '';

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="rounded border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-600 shadow-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
