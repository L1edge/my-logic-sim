import React, { useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid'; 
import useStore from './store/useStore';
import Sidebar from './components/Sidebar';
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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, deleteEdge, theme } = useStore();

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

  const onDrop = useCallback(
    (event) => {
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
            label, 
            type: label, 
            value: value ? parseInt(value) : 0, 
            constantValue: value ? parseInt(value) : undefined,
            inputs: 2 
        }, 
      };

      addNode(newNode);
    },
    [addNode]
  );

  const onEdgeDoubleClick = useCallback((event, edge) => {
    event.stopPropagation();
    deleteEdge(edge.id);
  }, [deleteEdge]);

  return (
    <div id="app-container" className="flex h-screen w-screen relative overflow-hidden transition-colors duration-300" data-theme={theme}>
      {/* Фоновий шар для Glass ефекту */}
      <div className="app-background"></div>

      <Sidebar />
      <div className="flex-grow h-full" ref={wrapper}>
        <ReactFlow
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
          // === ОПТИМІЗАЦІЯ ===
          onlyRenderVisibleElements={true} 
          minZoom={0.2}
        >
          <Background color={theme === 'light' ? '#aaa' : '#555'} gap={20} size={1} />
          <Controls />
        </ReactFlow>
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