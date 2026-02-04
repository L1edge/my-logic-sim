import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { evaluateCircuit } from '../utils/logic';
import { nanoid } from 'nanoid';

// Початковий проект
const defaultProjectId = nanoid();

const useStore = create((set, get) => ({
  // === СТАН ПРОЕКТІВ (ВКЛАДКИ) ===
  projects: {
    [defaultProjectId]: {
      id: defaultProjectId,
      name: 'Untitled Circuit',
      nodes: [],
      edges: []
    }
  },
  activeProjectId: defaultProjectId,

  // === СТАН СИМУЛЯЦІЇ ===
  isRunning: false,
  intervalId: null,

  // === ТЕМА ===
  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  // === УПРАВЛІННЯ ПРОЕКТАМИ ===
  createNewProject: () => {
    const newId = nanoid();
    set(state => ({
      projects: {
        ...state.projects,
        [newId]: { id: newId, name: `Circuit ${Object.keys(state.projects).length + 1}`, nodes: [], edges: [] }
      },
      activeProjectId: newId
    }));
  },

  closeProject: (id) => {
    set(state => {
      const { [id]: _, ...rest } = state.projects;
      // Якщо закрили активний, перемикаємось на перший доступний
      const newActive = id === state.activeProjectId ? Object.keys(rest)[0] : state.activeProjectId;
      // Якщо закрили останній, створюємо новий пустий
      if (Object.keys(rest).length === 0) {
        const newId = nanoid();
        return {
          projects: { [newId]: { id: newId, name: 'Untitled', nodes: [], edges: [] } },
          activeProjectId: newId
        };
      }
      return { projects: rest, activeProjectId: newActive };
    });
  },

  setActiveProject: (id) => set({ activeProjectId: id }),

  renameProject: (id, name) => {
    set(state => ({
      projects: {
        ...state.projects,
        [id]: { ...state.projects[id], name }
      }
    }));
  },

  // === ЗАВАНТАЖЕННЯ ===
  loadGraph: (flow) => {
    const { activeProjectId } = get();
    set(state => ({
      projects: {
        ...state.projects,
        [activeProjectId]: {
          ...state.projects[activeProjectId],
          nodes: flow.nodes || [],
          edges: flow.edges || []
        }
      }
    }));
    // Примусовий перерахунок 1 раз
    get().stepSimulation(); 
  },

  // === REACT FLOW ACTIONS (працюють з активним проектом) ===
  getNodes: () => get().projects[get().activeProjectId]?.nodes || [],
  getEdges: () => get().projects[get().activeProjectId]?.edges || [],

  onNodesChange: (changes) => {
    const { activeProjectId, projects, isRunning } = get();
    const currentProject = projects[activeProjectId];
    
    const newNodes = applyNodeChanges(changes, currentProject.nodes);
    
    set({
      projects: {
        ...projects,
        [activeProjectId]: { ...currentProject, nodes: newNodes }
      }
    });

    // Якщо симуляція запущена - рахуємо, якщо ні - чекаємо кнопки
    if (isRunning) {
        get().runSimulationStep();
    }
  },

  onEdgesChange: (changes) => {
    const { activeProjectId, projects, isRunning } = get();
    const currentProject = projects[activeProjectId];
    
    const newEdges = applyEdgeChanges(changes, currentProject.edges);
    
    set({
      projects: {
        ...projects,
        [activeProjectId]: { ...currentProject, edges: newEdges }
      }
    });
    
    if (isRunning) get().runSimulationStep();
  },

  onConnect: (connection) => {
    const { activeProjectId, projects, isRunning } = get();
    const currentProject = projects[activeProjectId];

    const newEdges = addEdge({ 
      ...connection, 
      animated: false, 
      style: { stroke: '#555', strokeWidth: 2 } 
    }, currentProject.edges);

    set({
      projects: {
        ...projects,
        [activeProjectId]: { ...currentProject, edges: newEdges }
      }
    });

    if (isRunning) get().runSimulationStep();
  },

  addNode: (node) => {
    const { activeProjectId, projects } = get();
    const currentProject = projects[activeProjectId];
    set({
      projects: {
        ...projects,
        [activeProjectId]: { ...currentProject, nodes: [...currentProject.nodes, node] }
      }
    });
  },

  updateNodeData: (id, partialData) => {
    const { activeProjectId, projects, isRunning } = get();
    const currentProject = projects[activeProjectId];

    const newNodes = currentProject.nodes.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...partialData } };
      }
      return node;
    });

    set({
      projects: {
        ...projects,
        [activeProjectId]: { ...currentProject, nodes: newNodes }
      }
    });
    
    // Якщо змінили вхідні дані (світч), то варто оновити схему навіть на паузі, 
    // або можна заборонити це. Зазвичай в CAD дозволяють зміну, але розрахунок йде тільки в Run/Step.
    // Але для зручності:
    if (isRunning) get().runSimulationStep();
  },

  deleteEdge: (edgeId) => {
    const { activeProjectId, projects, isRunning } = get();
    const currentProject = projects[activeProjectId];
    
    set({
        projects: {
            ...projects,
            [activeProjectId]: { 
                ...currentProject, 
                edges: currentProject.edges.filter(e => e.id !== edgeId) 
            }
        }
    });
    if (isRunning) get().runSimulationStep();
  },

  // === СИМУЛЯЦІЯ (Control) ===
  startSimulation: () => {
    if (get().intervalId) return; // Вже запущено
    
    const interval = setInterval(() => {
        get().runSimulationStep();
    }, 100); // 100ms - частота оновлення (10 FPS)

    set({ isRunning: true, intervalId: interval });
  },

  stopSimulation: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, intervalId: null });
  },

  stepSimulation: () => {
    get().runSimulationStep();
  },

  // Внутрішня функція розрахунку одного кадру
  runSimulationStep: () => {
    const { activeProjectId, projects } = get();
    const currentProject = projects[activeProjectId];

    const { updatedNodes, updatedEdges } = evaluateCircuit(currentProject.nodes, currentProject.edges);
    
    set({
      projects: {
        ...projects,
        [activeProjectId]: { 
            ...currentProject, 
            nodes: updatedNodes, 
            edges: updatedEdges 
        }
      }
    });
  }
}));

export default useStore;