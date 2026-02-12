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
import WaveformPanel from './components/WaveFormPanel'; // Перевір, щоб ім'я файлу збігалося!

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
    getNodes, getEdges, 
    onNodesChange, onEdgesChange, onConnect, addNode, deleteEdge, 
    theme, activeProjectId 
  } = useStore();

  const nodes = getNodes();
  const edges = getEdges();

  // Оновлення теми через атрибут data-theme
  useEffect(() => {
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.setAttribute('data-theme', theme);
  }, [theme]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // === ЛОГІКА onDrop ===
  const onDrop = useCallback((event) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('label');
    const value = event.dataTransfer.getData('value'); 

    if (!type) return;

    const reactFlowBounds = wrapper.current.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const nodeData = { label };
    
    if (type === 'customScriptNode') {
      nodeData.moduleId = value;
      nodeData.value = {}; 
    } else {
      nodeData.type = type;
      const parsedVal = value ? parseInt(value) : 0;
      nodeData.value = parsedVal;
      
      if (type === 'constantNode') {
          nodeData.constantValue = parsedVal;
      }
      
      if (type === 'logicGate') {
          nodeData.inputs = 2;
      }
    }

    const newNode = {
      id: nanoid(),
      type,
      position,
      data: nodeData, 
    };

    addNode(newNode);
  }, [addNode]);
    
  const onEdgeDoubleClick = useCallback((event, edge) => {
    event.stopPropagation();
    deleteEdge(edge.id);
  }, [deleteEdge]);

  return (
    // 👇👇👇 ОСЬ ТУТ БУЛА ПРОБЛЕМА. ДОДАВ style={{ backgroundColor... }}
    <div 
      id="app-container" 
      className="flex flex-col h-screen w-screen relative overflow-hidden transition-colors duration-300" 
      data-theme={theme}
      style={{ backgroundColor: 'var(--bg-color)' }} 
    >
      
      {/* Верхня панель */}
      <Toolbar />
      
      {/* Модальне вікно (поверх усього) */}
      <CustomModuleModal />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Ліва панель (інструменти) */}
        <Sidebar />

        {/* ЦЕНТРАЛЬНА ЧАСТИНА (CANVAS) */}
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
            <Background color={theme === 'light' ? '#aaa' : '#555'} gap={20} size={1} />
            <Controls />
          </ReactFlow>

          <WaveformPanel />
          
          {/* Футер */}
           <div className="absolute bottom-4 right-4 z-50 text-[10px] sm:text-xs text-gray-400 opacity-60 hover:opacity-100 transition-opacity bg-black/20 dark:bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10 flex items-center gap-3 font-mono pointer-events-none">
              <span>LogicSim</span>
           </div>

        </div>

        {/* Права панель (властивості) */}
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