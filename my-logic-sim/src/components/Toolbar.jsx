import React, { useRef, useState } from 'react';
import useStore from '../store/useStore';

// Імпорти генераторів та парсера
import { generateVerilog, generateVHDL, generateTestbench } from '../utils/hdl-generator';
import { parseVerilogToGraph } from '../utils/hdl-parser'; 

export default function Toolbar() {
  const store = useStore();
  
  // Захист від білого екрану
  if (!store || !store.projects) {
      return <div className="h-12 border-b flex items-center px-4 bg-red-900 text-white">Store Error</div>;
  }

  const { 
    projects, activeProjectId, createNewProject, setActiveProject, closeProject, renameProject,
    loadGraph, startSimulation, stopSimulation, stepSimulation, isRunning 
  } = store;
  
  const fileInputRef = useRef(null);
  
  const activeProject = projects[activeProjectId] || { nodes: [], edges: [], name: 'Untitled' };
  const [showExportMenu, setShowExportMenu] = useState(false);

  // === SAVE (Тільки JSON) ===
  const handleSave = () => {
    if (!activeProject) return;
    try {
        const flow = { 
            nodes: activeProject.nodes, 
            edges: activeProject.edges, 
            name: activeProject.name 
        };
        const json = JSON.stringify(flow, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeProject.name}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Save failed:", e);
        alert("Помилка збереження.");
    }
  };

  // === OPEN (УНІВЕРСАЛЬНИЙ: JSON + VERILOG) ===
  const handleOpenClick = () => fileInputRef.current && fileInputRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;

        // --- ЛОГІКА ВИБОРУ ФОРМАТУ ---
        
        // 1. Якщо це JSON (Рідний формат)
        if (fileName.endsWith('.json')) {
            const flow = JSON.parse(content);
            if (!Array.isArray(flow.nodes) || !Array.isArray(flow.edges)) throw new Error("Invalid JSON structure");
            
            loadGraph(flow); 
            if(flow.name) renameProject(activeProjectId, flow.name);
            console.log("JSON loaded");
        } 
        
        // 2. Якщо це Verilog (.v або .sv)
        else if (fileName.endsWith('.v') || fileName.endsWith('.sv')) {
            const graph = parseVerilogToGraph(content);
            
            if(graph.nodes.length === 0) {
                alert("Не вдалося розпізнати модулі у Verilog файлі.");
                return;
            }

            loadGraph(graph);
            // Використовуємо ім'я файлу як назву проекту
            renameProject(activeProjectId, file.name.replace(/\.[^/.]+$/, "")); 
            alert("Verilog успішно імпортовано!");
        } 
        
        else {
            alert("Невідомий формат файлу. Виберіть .json або .v");
        }

      } catch (err) {
        console.error(err);
        alert("Помилка читання файлу: " + err.message);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Скидаємо, щоб можна було відкрити той самий файл
  };

  // === EXPORT (HDL) ===
  const handleExport = (type) => {
    if (activeProject.nodes.length === 0) return alert("Схема пуста!");
    
    let code = '';
    let ext = 'v';
    let suffix = '';

    try {
        if (type === 'verilog') {
            code = generateVerilog(activeProject.nodes, activeProject.edges);
        } else if (type === 'vhdl') {
            code = generateVHDL(activeProject.nodes, activeProject.edges);
            ext = 'vhd';
        } else if (type === 'testbench') {
            code = generateTestbench(activeProject.nodes);
            suffix = '_tb';
        }

        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeProject.name}${suffix}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    } catch (e) {
        console.error("Export error:", e);
        alert("Помилка експорту: " + e.message);
    }
  };

  return (
    <div className="flex flex-col border-b" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
      
      {/* ЄДИНИЙ INPUT ДЛЯ ВСІХ ФАЙЛІВ */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json,.v,.sv"  // <--- ПРИЙМАЄ ВСЕ
        onChange={handleFileChange} 
      />

      {/* ВЕРХНЯ ПАНЕЛЬ */}
      <div className="h-12 flex items-center px-4 justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg tracking-tight text-blue-500">LogicSim <span className="text-[10px] text-gray-500">PRO</span></h1>
          <div className="flex gap-1">
             <button onClick={handleSave} className="px-3 py-1 text-xs font-bold border rounded hover:bg-white/10 transition flex items-center gap-2" style={{ borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}>💾 SAVE</button>
             <button onClick={handleOpenClick} className="px-3 py-1 text-xs font-bold border rounded hover:bg-white/10 transition flex items-center gap-2" style={{ borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}>📂 OPEN</button>
          </div>
        </div>

        <div className="flex gap-2 bg-black/10 dark:bg-white/5 p-1 rounded">
          {!isRunning ? (
             <button onClick={startSimulation} className="px-4 py-1 text-xs font-bold text-white bg-green-600 hover:bg-green-500 rounded transition">▶ START</button>
          ) : (
             <button onClick={stopSimulation} className="px-4 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded transition animate-pulse">⏹ STOP</button>
          )}
          <button onClick={stepSimulation} disabled={isRunning} className="px-3 py-1 text-xs font-bold text-blue-400 border border-blue-400/30 rounded hover:bg-blue-400/10 disabled:opacity-30 disabled:cursor-not-allowed">⏯ STEP</button>
        </div>

        {/* МЕНЮ ЛИШЕ ДЛЯ ЕКСПОРТУ */}
        <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-500 flex items-center gap-2">
              Export HDL ▼
            </button>
            
            {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded shadow-xl overflow-hidden z-50">
                    <button onClick={() => handleExport('verilog')} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-200">Verilog (.v)</button>
                    <button onClick={() => handleExport('vhdl')} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-200">VHDL (.vhd)</button>
                    <div className="border-t dark:border-white/10 my-1"></div>
                    <button onClick={() => handleExport('testbench')} className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-white/10 text-green-600 font-bold">Generate Testbench</button>
                </div>
            )}
        </div>
      </div>
      
      {/* Вкладки */}
      <div className="flex items-end px-2 gap-1 overflow-x-auto h-8 bg-black/5 dark:bg-black/20">
         {projects && Object.values(projects).map(p => (
            <div key={p.id} onClick={() => setActiveProject(p.id)} className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-bold cursor-pointer rounded-t-lg select-none min-w-[100px] border-t border-x ${p.id === activeProjectId ? 'bg-[var(--bg-color)] border-[var(--sidebar-border)] text-[var(--text-primary)] relative top-[1px]' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5'}`}>
                <span className="truncate max-w-[120px]">{p.name}</span>
                <span onClick={(e) => { e.stopPropagation(); closeProject(p.id); }} className="opacity-0 group-hover:opacity-100 hover:text-red-500 font-mono ml-auto">×</span>
            </div>
        ))}
        <button onClick={createNewProject} className="px-2 py-1 text-lg font-bold text-gray-400 hover:text-green-500" title="New Project">+</button>
      </div>
    </div>
  );
}