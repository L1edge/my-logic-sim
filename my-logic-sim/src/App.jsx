import React, { useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid'; 
import useStore from './store/useStore';

// ... (імпорти компонентів Toolbar, Sidebar, Nodes залишаються ті самі) ...
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import LogicGate from './components/nodes/LogicGate';
import InputNode from './components/nodes/InputNode';
import OutputNode from './components/nodes/OutputNode';
import ConstantNode from './components/nodes/ConstantNode';

const nodeTypes = {
  logicGate: LogicGate,
  inputNode: InputNode,
  outputNode: OutputNode,
  constantNode: ConstantNode,
};

function Flow() {
  const wrapper = useRef(null);
  
  // ДІСТАЄМО ДАНІ НОВИМ СПОСОБОМ
  const { 
    getNodes, getEdges, // Функції-геттери
    onNodesChange, onEdgesChange, onConnect, addNode, deleteEdge, 
    theme, activeProjectId 
  } = useStore();

  // Оскільки React Flow хоче масиви, викликаємо геттери
  const nodes = getNodes();
  const edges = getEdges();

  useEffect(() => {
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.setAttribute('data-theme', theme);
  }, [theme]);

  // ... (onDragOver, onDrop, onEdgeDoubleClick - ЗАЛИШАЮТЬСЯ БЕЗ ЗМІН) ...
  // Скопіюй їх зі старого файлу або я можу повторити, якщо треба. 
  // Головне - в onDrop при створенні newNode переконайся, що структура data правильна.

    const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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

    const newNode = {
      id: nanoid(),
      type,
      position,
      data: { 
          label, type: label, 
          value: value ? parseInt(value) : 0, 
          constantValue: value ? parseInt(value) : undefined,
          inputs: 2 
      }, 
    };
    addNode(newNode);
  }, [addNode]);

  const onEdgeDoubleClick = useCallback((event, edge) => {
    event.stopPropagation();
    deleteEdge(edge.id);
  }, [deleteEdge]);


  return (
    <div id="app-container" className="flex flex-col h-screen w-screen relative overflow-hidden transition-colors duration-300" data-theme={theme}>
      <div className="app-background"></div>

      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-grow h-full relative" ref={wrapper}>
          <ReactFlow
            key={activeProjectId} // ВАЖЛИВО: при зміні вкладки ReactFlow перемонтується
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
          >
            <Background color={theme === 'light' ? '#aaa' : '#555'} gap={20} size={1} />
            <Controls />
          </ReactFlow>
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