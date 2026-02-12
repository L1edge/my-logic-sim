import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { evaluateCircuit } from '../utils/logic';
import { nanoid } from 'nanoid';

const defaultProjectId = nanoid();
const getRandomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16);

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

      // === UI STATE (ВИДИМІСТЬ ПАНЕЛЕЙ) ===
      isSidebarOpen: true,
      isPropertiesOpen: true,

      toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),
      toggleProperties: () => set(s => ({ isPropertiesOpen: !s.isPropertiesOpen })),

      // === КАСТОМНІ МОДУЛІ ===
      customModules: {},
      isCustomModalOpen: false,
      editingModuleId: null,
      
      setEditingModuleId: (id) => set({ editingModuleId: id }),
      setCustomModalOpen: (isOpen) => set({ isCustomModalOpen: isOpen }),
      
      saveCustomModule: (moduleData) => set(state => ({
          customModules: { ...state.customModules, [moduleData.id]: moduleData }
      })),
      deleteCustomModule: (id) => set(state => {
          const newMods = { ...state.customModules };
          delete newMods[id];
          return { customModules: newMods };
      }),

      // === WAVEFORM (ЧАСОВІ ДІАГРАМИ) ===
      isWaveformOpen: false,
      waveformSignals: [], 
      waveformData: [],
      
      toggleWaveformPanel: () => set(s => ({ isWaveformOpen: !s.isWaveformOpen })),
      
      addSignalToWaveform: (edgeId, label) => set(s => {
          if (s.waveformSignals.find(sig => sig.id === edgeId)) return {}; 
          return { waveformSignals: [...s.waveformSignals, { id: edgeId, label, color: getRandomColor() }] };
      }),
      
      removeSignalFromWaveform: (edgeId) => set(s => ({
          waveformSignals: s.waveformSignals.filter(sig => sig.id !== edgeId)
      })),

      // Функція запису історії
      recordWaveformStep: (currentNodes, currentEdges) => {
        const { waveformSignals, waveformData } = get();
        if (waveformSignals.length === 0) return;

        const time = waveformData.length;
        const snapshot = { time };
        
        waveformSignals.forEach(sig => {
             const edge = currentEdges.find(e => e.id === sig.id);
             if (edge) {
                 const sourceNode = currentNodes.find(n => n.id === edge.source);
                 let val = sourceNode?.data?.value ?? 0;
                 
                 if (typeof val === 'object' && val !== null && edge.sourceHandle) {
                    const pinName = edge.sourceHandle.replace('output-', '');
                    val = val[pinName] ?? 0;
                 }
                 
                 snapshot[sig.id] = typeof val === 'number' ? val : 0;
             }
        });

        const newHistory = [...waveformData, snapshot].slice(-150);
        set({ waveformData: newHistory });
      },

      // === PROJECT MANAGEMENT ===
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
            ...edge, animated: false, className: '', type: 'smoothstep', style: { ...edge.style, stroke: '#555', strokeWidth: 2 }
        }));

        set({ 
            isRunning: false, 
            intervalId: null,
            testBenchCounter: 0,
            waveformData: [], 
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
            const { activeProjectId, projects, customModules } = get(); 
            const currentProject = projects[activeProjectId];
            
            const { updatedNodes, updatedEdges } = evaluateCircuit(currentProject.nodes, currentProject.edges, customModules); 
            
            const nodeValueMap = {};
            updatedNodes.forEach(n => { nodeValueMap[n.id] = n.data.value; });

            const processedEdges = updatedEdges.map(newEdge => {
                const oldEdge = currentProject.edges.find(e => e.id === newEdge.id);
                
                let currentVal = nodeValueMap[newEdge.source];
                if (typeof currentVal === 'object' && currentVal !== null && newEdge.sourceHandle) {
                    currentVal = currentVal[newEdge.sourceHandle.replace('output-', '')];
                }

                const oldVal = oldEdge?.data?.lastValue;
                const hasChanged = currentVal !== undefined && oldVal !== undefined && currentVal !== oldVal;

                let newClass = (newEdge.className || '').replace('neon-flow', '');
                if (hasChanged) newClass += ' neon-flow';

                return {
                    ...newEdge,
                    type: 'smoothstep',
                    className: newClass.trim(),
                    data: { ...newEdge.data, lastValue: currentVal } 
                };
            });
            
            set({ projects: { ...projects, [activeProjectId]: { ...currentProject, nodes: updatedNodes, edges: processedEdges } } });
            
            get().recordWaveformStep(updatedNodes, processedEdges);

            setTimeout(() => {
                const { activeProjectId, projects } = get();
                const proj = projects[activeProjectId];
                if (!proj) return;

                const cleanEdges = proj.edges.map(e => ({
                    ...e,
                    className: (e.className || '').replace('neon-flow', '')
                }));
                set({ projects: { ...projects, [activeProjectId]: { ...proj, edges: cleanEdges } } });
            }, 400);
      }
    }),
    {
      name: 'logicsim-storage',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        theme: state.theme,
        testBenchCounter: state.testBenchCounter,
        customModules: state.customModules,
        // Зберігаємо стан панелей
        isSidebarOpen: state.isSidebarOpen,
        isPropertiesOpen: state.isPropertiesOpen
      }),
    }
  )
);

export default useStore;