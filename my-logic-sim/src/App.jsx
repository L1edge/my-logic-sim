import React, { useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid';
import useStore from './store/useStore';

// === COMPONENTS ===
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import CustomModuleModal from './components/CustomModuleModal';
import WaveformPanel from './components/WaveFormPanel';

// === NODES ===
import LogicGate from './components/nodes/LogicGate';
import InputNode from './components/nodes/InputNode';
import OutputNode from './components/nodes/OutputNode';
import ConstantNode from './components/nodes/ConstantNode';
import CustomScriptNode from './components/nodes/CustomScriptNode';

const nodeTypes = {
  logicGate: LogicGate,
  inputNode: InputNode,
  outputNode: OutputNode,
  constantNode: ConstantNode,
  customScriptNode: CustomScriptNode,
};

function Flow() {
  const wrapper = useRef(null);

  const {
    getNodes,
    getEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteEdge,
    theme,
    activeProjectId,
  } = useStore();

  const nodes = getNodes();
  const edges = getEdges();

  // Theme update
  useEffect(() => {
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
      appContainer.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ✅ CLEAN & CORRECT onDrop
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('label');
      const value = event.dataTransfer.getData('value');

      if (!nodeType) return;

      const bounds = wrapper.current.getBoundingClientRect();

      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      let nodeData = { label };

      // === LOGIC GATE ===
      if (nodeType === 'logicGate') {
        nodeData = {
          label,
          type: label,     // AND / OR / XOR ...
          inputs: 2,
          value: null,
        };
      }

      // === CONSTANT ===
      else if (nodeType === 'constantNode') {
        const parsed = value ? parseInt(value) : 0;

        nodeData = {
          label,
          type: 'constantNode',
          value: parsed,
          constantValue: parsed,
        };
      }

      // === CUSTOM SCRIPT ===
      else if (nodeType === 'customScriptNode') {
        nodeData = {
          label,
          moduleId: value,
          value: {},
        };
      }

      // === INPUT / OUTPUT ===
      else {
        nodeData = {
          label,
          value: value ? parseInt(value) : 0,
        };
      }

      const newNode = {
        id: nanoid(),
        type: nodeType,
        position,
        data: nodeData,
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onEdgeDoubleClick = useCallback(
    (event, edge) => {
      event.stopPropagation();
      deleteEdge(edge.id);
    },
    [deleteEdge]
  );

  return (
    <div
      id="app-container"
      className="flex flex-col h-screen w-screen relative overflow-hidden transition-colors duration-300"
      data-theme={theme}
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      <Toolbar />
      <CustomModuleModal />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <div className="flex-grow h-full relative" ref={wrapper}>
          <ReactFlow
            key={activeProjectId}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onEdgeDoubleClick={onEdgeDoubleClick}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
            defaultEdgeOptions={{ type: 'smoothstep', animated: false }}
          >
            <Background
              color={theme === 'light' ? '#aaa' : '#555'}
              gap={20}
              size={1}
            />
            <Controls />
          </ReactFlow>

          <WaveformPanel />

          <div className="absolute bottom-4 right-4 z-50 text-[10px] sm:text-xs text-gray-400 opacity-60 hover:opacity-100 transition-opacity bg-black/20 dark:bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 flex items-center gap-3 font-mono pointer-events-none">
            <span>LogicSim</span>
          </div>
        </div>

        <PropertiesPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
