import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { evaluateCircuit } from '../utils/logic';
import { nanoid } from 'nanoid';

// Генеруємо ID для першого проекту при запуску
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
      // Якщо закрили активний проект, перемикаємось на інший або створюємо новий
      const newActive = id === state.activeProjectId 
        ? (Object.keys(rest)[0] || nanoid()) 
        : state.activeProjectId;
      
      // Якщо закрили останній - створюємо новий пустий
      if (Object.keys(rest).length === 0) {
        return { 
          projects: { [newActive]: { id: newActive, name: 'Untitled', nodes: [], edges: [] } }, 
          activeProjectId: newActive 
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

  // === ЗАВАНТАЖЕННЯ / ЗБЕРЕЖЕННЯ ===
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
    // При завантаженні зупиняємо симуляцію, щоб уникнути конфліктів
    get().stopSimulation();
  },

  // === ГЕТТЕРИ (Для React Flow) ===
  getNodes: () => get().projects[get().activeProjectId]?.nodes || [],
  getEdges: () => get().projects[get().activeProjectId]?.edges || [],

  // === ОБРОБНИКИ ПОДІЙ REACT FLOW ===
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

    // Якщо симуляція активна, перераховуємо схему на льоту
    if (isRunning) get().runSimulationStep();
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

  // ПІДКЛЮЧЕННЯ ДРОТІВ
  onConnect: (connection) => {
    const { activeProjectId, projects, isRunning } = get();
    const currentProject = projects[activeProjectId];

    const newEdges = addEdge({ 
      ...connection, 
      type: 'smoothstep', // Ламані лінії (90 градусів)
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

  // === ЛОГІКА СИМУЛЯЦІЇ ===
  
  startSimulation: () => {
    if (get().intervalId) return; 
    
    // Робимо перший крок одразу
    get().runSimulationStep();

    // Запускаємо цикл (10 кадрів на секунду)
    const interval = setInterval(() => {
        get().runSimulationStep();
    }, 100); 

    set({ isRunning: true, intervalId: interval });
  },

  stepSimulation: () => {
    get().runSimulationStep();
  },

  // === ВИПРАВЛЕНИЙ STOP ===
  // Скидає логіку, але зберігає введені дані користувача
  stopSimulation: () => {
    const { intervalId, activeProjectId, projects } = get();
    if (intervalId) clearInterval(intervalId);

    const currentProject = projects[activeProjectId];

    // 1. Очищуємо стани (value), але ОБЕРЕЖНО
    const resetNodes = currentProject.nodes.map(node => {
        // ВАЖЛИВО: Не чіпаємо InputNode та ConstantNode, щоб не втратити дані і не крашити App
        if (node.type === 'inputNode' || node.type === 'constantNode') {
            return node;
        }
        // Для гейтів та LED скидаємо значення в null (вимкнено)
        return {
            ...node,
            data: { 
                ...node.data, 
                value: null 
            }
        };
    });

    // 2. Скидаємо дроти (робимо сірими, без анімації)
    const resetEdges = currentProject.edges.map(edge => ({
        ...edge,
        animated: false,
        type: 'smoothstep',
        style: { ...edge.style, stroke: '#555', strokeWidth: 2 }
    }));

    set({ 
        isRunning: false, 
        intervalId: null,
        projects: {
            ...projects,
            [activeProjectId]: {
                ...currentProject,
                nodes: resetNodes,
                edges: resetEdges
            }
        }
    });
  },

  // Розрахунок одного такту
  runSimulationStep: () => {
    const { activeProjectId, projects } = get();
    const currentProject = projects[activeProjectId];

    const { updatedNodes, updatedEdges } = evaluateCircuit(currentProject.nodes, currentProject.edges);
    
    // При оновленні дротів зберігаємо тип 'smoothstep'
    const preservedEdges = updatedEdges.map(e => ({
        ...e,
        type: 'smoothstep'
    }));

    set({
      projects: {
        ...projects,
        [activeProjectId]: { 
            ...currentProject, 
            nodes: updatedNodes, 
            edges: preservedEdges 
        }
      }
    });
  }
}));

export default useStore;