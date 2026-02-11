import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { evaluateCircuit } from '../utils/logic';
import { nanoid } from 'nanoid';

const defaultProjectId = nanoid();

const useStore = create(
  persist(
    (set, get) => ({
      projects: {
        [defaultProjectId]: { id: defaultProjectId, name: 'Untitled Circuit', nodes: [], edges: [] }
      },
      activeProjectId: defaultProjectId,

      isRunning: false,
      intervalId: null,
      testBenchCounter: 0,

      theme: 'dark',
      setTheme: (theme) => set({ theme }),

    // === КАСТОМНІ МОДУЛІ ===
          customModules: {},
          isCustomModalOpen: false,
          editingModuleId: null, // <--- ДОДАЛИ: ID модуля, який ми зараз редагуємо
          
          setEditingModuleId: (id) => set({ editingModuleId: id }), // <--- ДОДАЛИ
          setCustomModalOpen: (isOpen) => set({ isCustomModalOpen: isOpen }),
          
          saveCustomModule: (moduleData) => set(state => ({
              customModules: { ...state.customModules, [moduleData.id]: moduleData }
          })),
          deleteCustomModule: (id) => set(state => {
              const newMods = { ...state.customModules };
              delete newMods[id];
              return { customModules: newMods };
          }),
      // ================================================================

      createNewProject: () => {
        const newId = nanoid();
        set(state => ({
          projects: { ...state.projects, [newId]: { id: newId, name: `Circuit ${Object.keys(state.projects).length + 1}`, nodes: [], edges: [] } },
          activeProjectId: newId
        }));
      },
      closeProject: (id) => {
          set(state => {
            const { [id]: _, ...rest } = state.projects;
            const newActive = id === state.activeProjectId ? (Object.keys(rest)[0] || nanoid()) : state.activeProjectId;
            if (Object.keys(rest).length === 0) return { projects: { [newActive]: { id: newActive, name: 'Untitled', nodes: [], edges: [] } }, activeProjectId: newActive };
            return { projects: rest, activeProjectId: newActive };
          });
      },
      setActiveProject: (id) => set({ activeProjectId: id }),
      renameProject: (id, name) => {
        set(state => ({ projects: { ...state.projects, [id]: { ...state.projects[id], name } } }));
      },
      loadGraph: (flow) => {
        const { activeProjectId } = get();
        set(state => ({
          projects: { ...state.projects, [activeProjectId]: { ...state.projects[activeProjectId], nodes: flow.nodes || [], edges: flow.edges || [] } }
        }));
        get().stopSimulation();
      },

      getNodes: () => get().projects[get().activeProjectId]?.nodes || [],
      getEdges: () => get().projects[get().activeProjectId]?.edges || [],

      onNodesChange: (changes) => {
        const { activeProjectId, projects, isRunning } = get();
        const currentProject = projects[activeProjectId];
        const newNodes = applyNodeChanges(changes, currentProject.nodes);
        set({ projects: { ...projects, [activeProjectId]: { ...currentProject, nodes: newNodes } } });
        if (isRunning) get().runSimulationStep();
      },
      onEdgesChange: (changes) => {
        const { activeProjectId, projects, isRunning } = get();
        const currentProject = projects[activeProjectId];
        const newEdges = applyEdgeChanges(changes, currentProject.edges);
        set({ projects: { ...projects, [activeProjectId]: { ...currentProject, edges: newEdges } } });
        if (isRunning) get().runSimulationStep();
      },
      onConnect: (connection) => {
        const { activeProjectId, projects, isRunning } = get();
        const currentProject = projects[activeProjectId];
        const newEdges = addEdge({ ...connection, type: 'smoothstep', animated: false, style: { stroke: '#555', strokeWidth: 2 } }, currentProject.edges);
        set({ projects: { ...projects, [activeProjectId]: { ...currentProject, edges: newEdges } } });
        if (isRunning) get().runSimulationStep();
      },
      addNode: (node) => {
        const { activeProjectId, projects } = get();
        const currentProject = projects[activeProjectId];
        set({ projects: { ...projects, [activeProjectId]: { ...currentProject, nodes: [...currentProject.nodes, node] } } });
      },
      updateNodeData: (id, partialData) => {
        const { activeProjectId, projects, isRunning } = get();
        const currentProject = projects[activeProjectId];
        const newNodes = currentProject.nodes.map((node) => {
          if (node.id === id) return { ...node, data: { ...node.data, ...partialData } };
          return node;
        });
        set({ projects: { ...projects, [activeProjectId]: { ...currentProject, nodes: newNodes } } });
        if (isRunning) get().runSimulationStep();
      },
      deleteEdge: (edgeId) => {
        const { activeProjectId, projects, isRunning } = get();
        const currentProject = projects[activeProjectId];
        set({ projects: { ...projects, [activeProjectId]: { ...currentProject, edges: currentProject.edges.filter(e => e.id !== edgeId) } } });
        if (isRunning) get().runSimulationStep();
      },

      startSimulation: () => {
        if (get().intervalId) return; 
        get().runSimulationStep();
        const interval = setInterval(() => { get().runSimulationStep(); }, 100); 
        set({ isRunning: true, intervalId: interval });
      },

      stopSimulation: () => {
        const { intervalId, activeProjectId, projects } = get();
        if (intervalId) clearInterval(intervalId);

        const currentProject = projects[activeProjectId];
        const resetNodes = currentProject.nodes.map(node => {
            if (node.type === 'inputNode' || node.type === 'constantNode') return node;
            return { ...node, data: { ...node.data, value: null } };
        });
        const resetEdges = currentProject.edges.map(edge => ({
            ...edge, animated: false, type: 'smoothstep', style: { ...edge.style, stroke: '#555', strokeWidth: 2 }
        }));

        set({ 
            isRunning: false, 
            intervalId: null,
            testBenchCounter: 0,
            projects: { ...projects, [activeProjectId]: { ...currentProject, nodes: resetNodes, edges: resetEdges } }
        });
      },

      stepSimulation: () => {
        const { activeProjectId, projects, testBenchCounter } = get();
        const currentProject = projects[activeProjectId];
        
        const inputNodes = currentProject.nodes
            .filter(n => n.type === 'inputNode')
            .sort((a, b) => a.position.y - b.position.y);

        if (inputNodes.length > 0) {
            const newNodes = currentProject.nodes.map(node => {
                if (node.type === 'inputNode') {
                    const index = inputNodes.findIndex(n => n.id === node.id);
                    const bitValue = (testBenchCounter >> (inputNodes.length - 1 - index)) & 1;
                    return { ...node, data: { ...node.data, value: bitValue } };
                }
                return node;
            });
            
            set({
                 projects: { ...projects, [activeProjectId]: { ...currentProject, nodes: newNodes } },
                 testBenchCounter: testBenchCounter + 1
            });
        }
        get().runSimulationStep();
      },

        runSimulationStep: () => {
              // ДІСТАЄМО customModules
              const { activeProjectId, projects, customModules } = get(); 
              const currentProject = projects[activeProjectId];
              
              // ПЕРЕДАЄМО customModules ТРЕТІМ АРГУМЕНТОМ
              const { updatedNodes, updatedEdges } = evaluateCircuit(currentProject.nodes, currentProject.edges, customModules); 
              
              const preservedEdges = updatedEdges.map(e => ({ ...e, type: 'smoothstep' }));
              set({ projects: { ...projects, [activeProjectId]: { ...currentProject, nodes: updatedNodes, edges: preservedEdges } } });
            }
    }),
    {
      name: 'logicsim-storage',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        theme: state.theme,
        testBenchCounter: state.testBenchCounter,
        customModules: state.customModules // <--- Зберігаємо наші написані модулі
      }),
    }
  )
);

export default useStore;