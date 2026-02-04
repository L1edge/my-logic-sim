import React, { useRef } from 'react';
import useStore from '../store/useStore';
import { generateVerilog } from '../utils/verilog';

export default function Toolbar() {
  const { 
    projects, activeProjectId, createNewProject, setActiveProject, closeProject, renameProject,
    loadGraph, startSimulation, stopSimulation, stepSimulation, isRunning 
  } = useStore();
  
  const fileInputRef = useRef(null);
  const activeProject = projects[activeProjectId];

  const handleSave = () => {
    const flow = { 
        nodes: activeProject.nodes, 
        edges: activeProject.edges,
        name: activeProject.name 
    };
    const json = JSON.stringify(flow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${activeProject.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenClick = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flow = JSON.parse(e.target.result);
        if (!Array.isArray(flow.nodes) || !Array.isArray(flow.edges)) {
            throw new Error("Invalid file structure");
        }
        loadGraph(flow); 
        if(flow.name) renameProject(activeProjectId, flow.name);
      } catch (err) {
        alert("Помилка файлу: Невірний формат JSON.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExportVerilog = () => {
    if (activeProject.nodes.length === 0) return alert("Схема пуста!");
    const code = generateVerilog(activeProject.nodes, activeProject.edges);
    const blob = new Blob([code], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeProject.name}.v`;
    link.click();
  };

  return (
    <div className="flex flex-col border-b" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
      
      <div className="h-12 flex items-center px-4 justify-between shadow-sm z-20">
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />

        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg tracking-tight text-blue-500">LogicSim <span className="text-[10px] text-gray-500">PRO</span></h1>
          
          <div className="flex gap-1">
            {/* ДОДАНО style={{ color: 'var(--text-primary)' }} ЩОБ ТЕКСТ БУВ ЧИТАБЕЛЬНИМ */}
            <button 
                onClick={handleSave} 
                className="px-3 py-1 text-xs font-bold border rounded hover:bg-white/10 transition flex items-center gap-2"
                style={{ borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}
            >
                💾 SAVE
            </button>
            <button 
                onClick={handleOpenClick} 
                className="px-3 py-1 text-xs font-bold border rounded hover:bg-white/10 transition flex items-center gap-2"
                style={{ borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}
            >
                📂 OPEN
            </button>
          </div>
        </div>

        <div className="flex gap-2 bg-black/10 dark:bg-white/5 p-1 rounded">
          {!isRunning ? (
             <button onClick={startSimulation} className="px-4 py-1 text-xs font-bold text-white bg-green-600 hover:bg-green-500 rounded transition">
                ▶ START
             </button>
          ) : (
             <button onClick={stopSimulation} className="px-4 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded transition animate-pulse">
                ⏹ STOP
             </button>
          )}
          
          <button onClick={stepSimulation} disabled={isRunning} className="px-3 py-1 text-xs font-bold text-blue-400 border border-blue-400/30 rounded hover:bg-blue-400/10 disabled:opacity-30 disabled:cursor-not-allowed">
             ⏯ STEP
          </button>
        </div>

        <button onClick={handleExportVerilog} className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-500">
          Export Verilog
        </button>
      </div>

      <div className="flex items-end px-2 gap-1 overflow-x-auto h-8 bg-black/5 dark:bg-black/20">
        {Object.values(projects).map(p => (
            <div 
                key={p.id}
                onClick={() => setActiveProject(p.id)}
                className={`
                    group flex items-center gap-2 px-3 py-1.5 text-xs font-bold cursor-pointer rounded-t-lg select-none min-w-[100px] border-t border-x
                    ${p.id === activeProjectId 
                        ? 'bg-[var(--bg-color)] border-[var(--sidebar-border)] text-[var(--text-primary)] relative top-[1px]' 
                        : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}
                `}
            >
                <span className="truncate max-w-[120px]">{p.name}</span>
                <span 
                    onClick={(e) => { e.stopPropagation(); closeProject(p.id); }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 font-mono ml-auto"
                >×</span>
            </div>
        ))}
        <button 
            onClick={createNewProject} 
            className="px-2 py-1 text-lg font-bold text-gray-400 hover:text-green-500" 
            title="New Project"
        >
            +
        </button>
      </div>
    </div>
  );
}