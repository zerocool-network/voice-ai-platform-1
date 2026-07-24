const NODE_TYPES = ['say', 'ask', 'llm', 'condition', 'goto', 'transfer', 'webhook', 'knowledge', 'hangup'];

const NODE_DEFAULTS = {
  say: { type: 'say', config: { text: '' }, next: null },
  ask: { type: 'ask', config: { prompt: '', inputType: 'speech', variable: 'input', timeoutSec: 10 }, next: null },
  llm: { type: 'llm', config: { systemPrompt: '', userPromptTemplate: '', model: 'gpt-4o' }, next: null },
  condition: { type: 'condition', config: { branches: [{ label: 'Yes', expression: '', next: null }], elseNext: null } },
  goto: { type: 'goto', config: { target: '' } },
  transfer: { type: 'transfer', config: { destination: 'number', value: '' } },
  webhook: { type: 'webhook', config: { url: '', method: 'POST', headers: [], body: '' }, next: null },
  knowledge: { type: 'knowledge', config: { query: '', topK: 5, retrievalType: 'semantic', resourceType: '', systemPrompt: '' }, next: null },
  hangup: { type: 'hangup', config: {} },
};

function generateId() {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function configToReactFlow(config) {
  if (!config || !config.steps) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];
  const stepIds = Object.keys(config.steps);
  const cols = 300;
  const rows = 120;
  const perCol = Math.ceil(stepIds.length / 3);

  stepIds.forEach((id, i) => {
    const step = config.steps[id];
    const col = Math.floor(i / perCol);
    const row = i % perCol;

    nodes.push({
      id,
      type: step.type,
      position: { x: col * cols + 40, y: row * rows + 40 },
      data: { ...step.config, label: step.type.charAt(0).toUpperCase() + step.type.slice(1) },
    });

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
            edges.push(            {
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

  return { nodes, edges };
}

function reactFlowToConfig(nodes, edges, startNodeId) {
  const steps = {};

  nodes.forEach((node) => {
    const step = {
      id: node.id,
      type: node.type,
      config: { ...node.data },
      next: null,
    };

    delete step.config.label;
    steps[node.id] = step;
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

export { NODE_TYPES, NODE_DEFAULTS, generateId, configToReactFlow, reactFlowToConfig };
