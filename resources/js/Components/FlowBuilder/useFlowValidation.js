import { useMemo } from 'react';

export default function useFlowValidation(nodes, edges) {
  return useMemo(() => {
    const nodeIds = new Set(nodes.map((n) => n.id));

    const adjacency = {};
    for (const edge of edges) {
      if (!adjacency[edge.source]) adjacency[edge.source] = [];
      adjacency[edge.source].push(edge.target);
    }

    const startNode = nodes.length > 0 ? nodes[0].id : null;
    const reachable = new Set();
    if (startNode) {
      const queue = [startNode];
      while (queue.length > 0) {
        const current = queue.shift();
        if (reachable.has(current)) continue;
        reachable.add(current);
        for (const next of adjacency[current] || []) {
          if (!reachable.has(next)) queue.push(next);
        }
      }
    }

    const hasHangup = nodes.some((n) => n.type === 'hangup');
    const hasReachableHangup = nodes.some((n) => n.type === 'hangup' && reachable.has(n.id));

    const errors = {};

    for (const node of nodes) {
      const nodeErrors = [];
      const data = node.data || {};

      switch (node.type) {
        case 'say':
          if (!data.text || data.text.trim() === '') {
            nodeErrors.push({ field: 'text', message: 'Text is required' });
          }
          break;
        case 'webhook':
          if (!data.url || !data.url.trim().match(/^https?:\/\//)) {
            nodeErrors.push({ field: 'url', message: 'URL must start with http:// or https://' });
          }
          break;
        case 'llm':
          if (!data.systemPrompt || data.systemPrompt.trim() === '') {
            nodeErrors.push({ field: 'systemPrompt', message: 'System prompt is required' });
          }
          break;
        case 'goto':
          if (!data.target || !nodeIds.has(data.target)) {
            nodeErrors.push({ field: 'target', message: 'Target must reference an existing step ID' });
          }
          break;
        case 'condition': {
          const branches = data.branches || [];
          branches.forEach((b, i) => {
            const branchErrors = [];
            if (!b.label || b.label.trim() === '') {
              branchErrors.push('Label is required');
            }
            if (!b.expression || b.expression.trim() === '') {
              branchErrors.push('Expression is required');
            }
            if (branchErrors.length > 0) {
              nodeErrors.push({ field: `branches[${i}]`, message: `Branch ${i + 1}: ${branchErrors.join(', ')}` });
            }
          });
          break;
        }
        default:
          break;
      }

      if (nodeErrors.length > 0) {
        errors[node.id] = nodeErrors;
      }
    }

    const globalErrors = [];
    if (nodes.length > 0 && !hasHangup) {
      globalErrors.push('Flow must contain at least one Hangup step');
    } else if (nodes.length > 0 && !hasReachableHangup) {
      globalErrors.push('No Hangup step is reachable from start');
    }

    const totalErrors = Object.values(errors).reduce((sum, e) => sum + e.length, 0);
    const errorCount = totalErrors + globalErrors.length;

    return { errors, globalErrors, errorCount };
  }, [nodes, edges]);
}
