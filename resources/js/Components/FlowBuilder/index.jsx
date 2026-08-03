import { useCallback, useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Undo2, Redo2, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '@/hooks/useTranslation';

import nodeTypes from './nodes';
import ConditionEdge from './ConditionEdge';
import Toolbox from './Toolbox';
import PropertiesPanel from './PropertiesPanel';
import { configToReactFlow, reactFlowToConfig, generateId, NODE_DEFAULTS, layoutReactFlowNodes } from './flowConfig';
import useUndoRedo from './useUndoRedo';
import useFlowValidation from './useFlowValidation';

const edgeTypes = {
  'condition-edge': ConditionEdge,
};

const NODE_COLORS = {
  say: '#10b981',
  ask: '#8b5cf6',
  llm: '#3b82f6',
  condition: '#f59e0b',
  goto: '#f97316',
  transfer: '#f43f5e',
  webhook: '#06b6d4',
  mcp_tool: '#a855f7',
  knowledge: '#14b8a6',
  hangup: '#ef4444',
  voice_agent: '#a855f7',
  analyze: '#6366f1',
  memory: '#06b6d4',
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: { stroke: '#94a3b8', strokeWidth: 1.75 },
  pathOptions: { borderRadius: 16 },
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#94a3b8' },
};

function FlowCanvas({ config, onConfigChange, onDirty, onSave, innerRef }) {
  const { t } = useTranslation();
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState(null);

  const { nodes: initialNodes, edges: initialEdges } = configToReactFlow(config);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const { pushState, undo, redo, canUndo, canRedo, reset: resetHistory } = useUndoRedo();

  const markDirty = useCallback(() => {
    onDirty?.();
  }, [onDirty]);

  const doSyncToConfig = useCallback(() => {
    const startNodeId = config?.start_step || (nodesRef.current.length > 0 ? nodesRef.current[0].id : '');
    const newConfig = reactFlowToConfig(nodesRef.current, edgesRef.current, startNodeId);
    onConfigChange(newConfig);
    return newConfig;
  }, [onConfigChange, config?.start_step]);

  const doUndo = useCallback(() => {
    const restored = undo(nodesRef.current, edgesRef.current);
    if (restored) {
      setNodes(restored.nodes);
      setEdges(restored.edges);
    }
  }, [undo, setNodes, setEdges]);

  const doRedo = useCallback(() => {
    const restored = redo(nodesRef.current, edgesRef.current);
    if (restored) {
      setNodes(restored.nodes);
      setEdges(restored.edges);
    }
  }, [redo, setNodes, setEdges]);

  const doAutoLayout = useCallback(() => {
    pushState(nodesRef.current, edgesRef.current);
    const startId = config?.start_step || nodesRef.current[0]?.id;
    const laidOut = layoutReactFlowNodes(nodesRef.current, edgesRef.current, startId);
    setNodes(laidOut);
    markDirty();
    requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 300 });
    });
  }, [pushState, setNodes, config?.start_step, fitView, markDirty]);

  useImperativeHandle(innerRef, () => ({
    syncToConfig: doSyncToConfig,
    undo: doUndo,
    redo: doRedo,
    canUndo,
    canRedo,
    autoLayout: doAutoLayout,
  }), [doSyncToConfig, doUndo, doRedo, canUndo, canRedo, doAutoLayout]);


  useEffect(() => {
    const { nodes: n, edges: e } = configToReactFlow(config);
    setNodes(n);
    setEdges(e);
  }, [config]);

  useEffect(() => {
    pushState(initialNodes, initialEdges);
    resetHistory();
  }, [config]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        doUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        doRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        doSyncToConfig();
        onSave?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [doUndo, doRedo, doSyncToConfig, onSave]);

  const trackedNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      const hasStructural = changes.some((c) => c.type === 'add' || c.type === 'remove');
      if (hasStructural) {
        markDirty();
        setTimeout(() => pushState(nodesRef.current, edgesRef.current), 0);
      }
    },
    [onNodesChange, pushState, markDirty],
  );

  const trackedEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      const hasStructural = changes.some((c) => c.type === 'add' || c.type === 'remove');
      if (hasStructural) {
        markDirty();
        setTimeout(() => pushState(nodesRef.current, edgesRef.current), 0);
      }
    },
    [onEdgesChange, pushState, markDirty],
  );

  const handleNodeDragStop = useCallback(
    (_event, _node, updatedNodes) => {
      pushState(updatedNodes, edgesRef.current);
      markDirty();
    },
    [pushState, markDirty],
  );

  const onConnect = useCallback(
    (params) => {
      pushState(nodesRef.current, edgesRef.current);
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds));
      markDirty();
    },
    [setEdges, pushState, markDirty],
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      pushState(nodesRef.current, edgesRef.current);

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const id = generateId();
      const defaults = NODE_DEFAULTS[type];
      const label = type.charAt(0).toUpperCase() + type.slice(1);

      const newNode = {
        id,
        type,
        position,
        data: { ...defaults.config, label },
      };

      setNodes((nds) => nds.concat(newNode));
      markDirty();
    },
    [screenToFlowPosition, setNodes, pushState, markDirty],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeUpdate = useCallback(
    (id, data) => {
      pushState(nodesRef.current, edgesRef.current);
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
      );
      setSelectedNode((prev) => (prev?.id === id ? { ...prev, data: { ...prev.data, ...data } } : prev));
      markDirty();
    },
    [setNodes, pushState, markDirty],
  );

  const { errors: validationErrors } = useFlowValidation(nodes, edges);

  const displayNodes = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      _valid: !validationErrors[n.id],
      _errors: validationErrors[n.id] || [],
    },
  }));

  return (
    <div className="flex h-full min-h-0">
      <Toolbox />

      <div ref={reactFlowWrapper} className="relative min-w-0 flex-1">
        <div className="absolute right-4 top-4 z-10 flex gap-1.5">
          <button
            type="button"
            onClick={doAutoLayout}
            title={t('ui.auto_layout')}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <LayoutGrid className="size-3.5" />
            {t('ui.auto_layout')}
          </button>
          <button
            type="button"
            onClick={doUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={doRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Redo2 className="size-3.5" />
          </button>
        </div>

        <ReactFlow
          nodes={displayNodes}
          edges={edges}
          onNodesChange={trackedNodesChange}
          onEdgesChange={trackedEdgesChange}
          onNodeDragStop={handleNodeDragStop}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          snapToGrid
          snapGrid={[16, 16]}
          deleteKeyCode={['Backspace', 'Delete']}
          className="bg-slate-50"
          proOptions={{ hideAttribution: true }}
        >
          <Controls
            showInteractive={false}
            className="!bottom-4 !left-4 !m-0 !rounded-xl !border !border-slate-200 !bg-white !shadow-card [&_button]:!border-slate-100 [&_button]:!bg-white [&_button]:!text-slate-500 [&_button]:hover:!bg-slate-50 [&_svg]:!size-3.5"
          />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(node) => NODE_COLORS[node.type] || '#06b6d4'}
            maskColor="rgba(15,23,42,0.06)"
            className="!bottom-4 !right-4 !m-0 !rounded-xl !border !border-slate-200 !bg-white !shadow-card"
          />
          <Background
            variant="dots"
            gap={18}
            size={1.2}
            color="rgba(148,163,184,0.45)"
            className="!bg-slate-50"
          />
        </ReactFlow>
      </div>

      <motion.div key={selectedNode?.id || 'none'} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.15 }} className="shrink-0">
        <PropertiesPanel
          node={selectedNode}
          onUpdate={onNodeUpdate}
          nodes={nodes}
          validationErrors={validationErrors}
        />
      </motion.div>
    </div>
  );
}

const FlowBuilder = forwardRef(function FlowBuilder({ config, onConfigChange, onDirty, onSave }, ref) {
  return (
    <ReactFlowProvider>
      <FlowCanvas
        config={config}
        onConfigChange={onConfigChange}
        onDirty={onDirty}
        onSave={onSave}
        innerRef={ref}
      />
    </ReactFlowProvider>
  );
});

export default FlowBuilder;
