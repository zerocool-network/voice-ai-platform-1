import { computeAutoLayout } from './layoutFlow'

const NODE_TYPES = ['say', 'ask', 'llm', 'condition', 'goto', 'transfer', 'webhook', 'mcp_tool', 'knowledge', 'hangup', 'voice_agent', 'analyze', 'memory'];

const NODE_DEFAULTS = {
  say: { type: 'say', config: { text: '' }, next: null },
  ask: { type: 'ask', config: { prompt: '', inputType: 'speech', variable: 'input', timeoutSec: 10 }, next: null },
  llm: { type: 'llm', config: { systemPrompt: '', userPromptTemplate: '', model: 'gpt-4o' }, next: null },
  condition: { type: 'condition', config: { branches: [{ label: 'Yes', expression: '', next: null }], elseNext: null } },
  goto: { type: 'goto', config: { target: '' } },
  transfer: { type: 'transfer', config: { destination: 'number', value: '' } },
  webhook: { type: 'webhook', config: { url: '', method: 'POST', headers: [], body: '' }, next: null },
  mcp_tool: { type: 'mcp_tool', config: { server: '', tool: '', parameters: '', variable: 'tool_result' }, next: null },
  knowledge: { type: 'knowledge', config: { query: '', topK: 5, retrievalType: 'semantic', resourceType: '', systemPrompt: '' }, next: null },
  hangup: { type: 'hangup', config: {} },
  voice_agent: { type: 'voice_agent', config: { welcome_greeting: 'Hello! How can I help you today?', system_prompt: 'You are a helpful voice assistant.', voice: '21m00Tcm4TlvDq8ikWAM', tts_provider: 'ElevenLabs', intelligence_service: '' }, next: null },
  analyze: { type: 'analyze', config: { language_operator: '', redaction_rules: 'none', conversation_profile: '' }, next: null },
  memory: { type: 'memory', config: { from_number: '' }, next: null },
};

const META_KEYS = ['_valid', '_errors', 'label'];

function generateId() {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function stripMeta(data = {}) {
  const config = { ...data };
  META_KEYS.forEach((k) => delete config[k]);
  return config;
}

function hasValidPosition(pos) {
  return pos
    && typeof pos.x === 'number'
    && typeof pos.y === 'number'
    && Number.isFinite(pos.x)
    && Number.isFinite(pos.y);
}

function buildEdges(steps) {
  const edges = [];
  Object.keys(steps).forEach((id) => {
    const step = steps[id];

    if (step.next) {
      edges.push({
        id: `${id}->${step.next}`,
        source: id,
        target: step.next,
        type: 'smoothstep',
      });
    }

    if (step.type === 'condition') {
      const cond = step.config;
      if (cond.branches) {
        cond.branches.forEach((b) => {
          if (b.next) {
            edges.push({
              id: `${id}->${b.next}--${b.label}`,
              source: id,
              target: b.next,
              type: 'condition-edge',
              label: b.label,
              data: { branchLabel: b.label },
            });
          }
        });
      }
      if (cond.elseNext) {
        edges.push({
          id: `${id}->else--${cond.elseNext}`,
          source: id,
          target: cond.elseNext,
          type: 'condition-edge',
          label: 'No',
          data: { branchLabel: 'else' },
        });
      }
    }
  });
  return edges;
}

function configToReactFlow(config) {
  if (!config || !config.steps) return { nodes: [], edges: [] };

  const steps = config.steps;
  const stepIds = Object.keys(steps);
  const allHavePosition = stepIds.every((id) => hasValidPosition(steps[id].position));
  const layout = allHavePosition
    ? null
    : computeAutoLayout(steps, config.start_step);

  const nodes = stepIds.map((id) => {
    const step = steps[id];
    const position = hasValidPosition(step.position)
      ? { x: step.position.x, y: step.position.y }
      : (layout.get(id) || { x: 40, y: 40 });

    return {
      id,
      type: step.type,
      position,
      data: {
        ...step.config,
        label: step.type.charAt(0).toUpperCase() + step.type.slice(1),
      },
    };
  });

  return { nodes, edges: buildEdges(steps) };
}

function reactFlowToConfig(nodes, edges, startNodeId) {
  const steps = {};

  nodes.forEach((node) => {
    steps[node.id] = {
      id: node.id,
      type: node.type,
      config: stripMeta(node.data),
      next: null,
      position: {
        x: Math.round(node.position?.x ?? 0),
        y: Math.round(node.position?.y ?? 0),
      },
    };
  });

  edges.forEach((edge) => {
    const sourceStep = steps[edge.source];
    if (!sourceStep) return;

    if (sourceStep.type === 'condition') {
      const condConfig = sourceStep.config;
      const branchLabel = edge.data?.branchLabel;

      if (branchLabel === 'else') {
        condConfig.elseNext = edge.target;
      } else if (branchLabel) {
        const branch = condConfig.branches?.find((b) => b.label === branchLabel);
        if (branch) branch.next = edge.target;
      }
    } else {
      sourceStep.next = edge.target;
    }
  });

  return {
    start_step: startNodeId || (nodes.length > 0 ? nodes[0].id : ''),
    steps,
  };
}

/**
 * Recompute positions for current React Flow nodes from their graph edges.
 */
function layoutReactFlowNodes(nodes, edges, startNodeId) {
  const steps = {};
  nodes.forEach((n) => {
    steps[n.id] = {
      type: n.type,
      config: stripMeta(n.data),
      next: null,
    };
  });

  edges.forEach((edge) => {
    const source = steps[edge.source];
    if (!source) return;
    if (source.type === 'condition') {
      const branchLabel = edge.data?.branchLabel;
      if (!source.config.branches) source.config.branches = [];
      if (branchLabel === 'else') {
        source.config.elseNext = edge.target;
      } else if (branchLabel) {
        let branch = source.config.branches.find((b) => b.label === branchLabel);
        if (!branch) {
          branch = { label: branchLabel, expression: '', next: null };
          source.config.branches.push(branch);
        }
        branch.next = edge.target;
      }
    } else {
      source.next = edge.target;
    }
  });

  const positions = computeAutoLayout(steps, startNodeId || nodes[0]?.id);
  return nodes.map((n) => {
    const pos = positions.get(n.id);
    return pos ? { ...n, position: { ...pos } } : n;
  });
}

export {
  NODE_TYPES,
  NODE_DEFAULTS,
  generateId,
  configToReactFlow,
  reactFlowToConfig,
  layoutReactFlowNodes,
};
