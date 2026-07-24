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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Undo2, Redo2 } from 'lucide-react';
import { motion } from 'motion/react';

import nodeTypes from './nodes';
import ConditionEdge from './ConditionEdge';
import Toolbox from './Toolbox';
import PropertiesPanel from './PropertiesPanel';
import { configToReactFlow, reactFlowToConfig, generateId, NODE_DEFAULTS } from './flowConfig';
import useUndoRedo from './useUndoRedo';
import useFlowValidation from './useFlowValidation';

const edgeTypes = {
  'condition-edge': ConditionEdge,
};

function FlowCanvas({ config, onConfigChange, onDirty, onSave, innerRef }) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState(null);

  const { nodes: initialNodes, edges: initialEdges } = configToReactFlow(config);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const { pushState, undo, redo, canUndo, canRedo, reset: resetHistory } = useUndoRedo();

  const doSyncToConfig = useCallback(() => {
    const startNodeId = nodesRef.current.length > 0 ? nodesRef.current[0].id : '';
    const newConfig = reactFlowToConfig(nodesRef.current, edgesRef.current, startNodeId);
    onConfigChange(newConfig);
  }, [onConfigChange]);

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

  useImperativeHandle(innerRef, () => ({
    syncToConfig: doSyncToConfig,
    undo: doUndo,
    redo: doRedo,
    canUndo,
    canRedo,
  }), [doSyncToConfig, doUndo, doRedo, canUndo, canRedo]);

  const markDirty = useCallback(() => {
    onDirty?.();
  }, [onDirty]);

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
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds));
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

  const { errors: validationErrors, errorCount } = useFlowValidation(nodes, edges);

  const displayNodes = nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      _valid: !validationErrors[n.id],
      _errors: validationErrors[n.id] || [],
    },
  }));

  return (
    <div className="flex h-full">
      <Toolbox />

      <div ref={reactFlowWrapper} className="relative flex-1">
        <div className="absolute right-3 top-3 z-10 flex gap-1">
          <button
            onClick={doUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 shadow-xs transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            onClick={doRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 shadow-xs transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
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
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          className="bg-zinc-50/50 dark:bg-zinc-950/50"
        >
          <Controls className="!rounded-lg !border !border-zinc-200 !shadow-xs dark:!border-zinc-800" />
          <MiniMap
            nodeStrokeWidth={3}
            className="!rounded-lg !border !border-zinc-200 !shadow-xs dark:!border-zinc-800"
          />
          <Background gap={16} className="!bg-zinc-50/50 dark:!bg-zinc-950/50" />
        </ReactFlow>
      </div>

      <motion.div key={selectedNode?.id || 'none'} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.15 }}>
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
