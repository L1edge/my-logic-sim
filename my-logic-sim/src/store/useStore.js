import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { evaluateCircuit } from '../utils/logic.js';

const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  theme: 'light', 
  
  setTheme: (theme) => set({ theme }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    
    // ОПТИМІЗАЦІЯ:
    // Ми НЕ запускаємо симуляцію, якщо змінилася тільки позиція (drag).
    // Перевіряємо, чи були зміни структури (видалення, скидання).
    const isStructuralChange = changes.some(c => c.type === 'remove' || c.type === 'reset');
    
    if (isStructuralChange) {
      get().runSimulation();
    }
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
    // При зміні зв'язків (видалення) завжди треба перерахувати
    if (changes.some(c => c.type === 'remove')) {
      setTimeout(() => get().runSimulation(), 10);
    }
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ 
        ...connection, 
        animated: false, 
        style: { stroke: '#555', strokeWidth: 2 } 
      }, get().edges),
    });
    get().runSimulation();
  },

  addNode: (node) => {
    set({ nodes: [...get().nodes, node] });
    // При додаванні нової ноди симуляцію запускати не обов'язково, 
    // бо вона ще нікуди не підключена, але для надійності можна залишити.
  },

  updateNodeValue: (id, value) => {
    set(state => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, data: { ...node.data, value } } : node
      )
    }));
    get().runSimulation();
  },

  updateNodeData: (id, partialData) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...partialData } };
        }
        return node;
      }),
    }));
    get().runSimulation();
  },

  deleteEdge: (edgeId) => {
    set({
      edges: get().edges.filter((edge) => edge.id !== edgeId),
    });
    get().runSimulation();
  },

  runSimulation: () => {
    const { nodes, edges } = get();
    const { updatedNodes, updatedEdges } = evaluateCircuit(nodes, edges);
    set({ nodes: updatedNodes, edges: updatedEdges });
  }
}));

export default useStore;