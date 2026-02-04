import React from 'react';
import useStore from '../store/useStore';

export default function PropertiesPanel() {
  const { projects, activeProjectId, updateNodeData, renameProject, getNodes, getEdges } = useStore();
  
  const nodes = getNodes();
  const edges = getEdges();
  const activeProject = projects[activeProjectId];
  const selectedNode = nodes.find((n) => n.selected);

  const handleProjectNameChange = (e) => { renameProject(activeProjectId, e.target.value); }

  if (!selectedNode) {
    return (
      <aside className="w-72 border-l p-4 flex flex-col gap-4" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}>
        <div className="text-xs font-black uppercase tracking-widest opacity-50">Project Settings</div>
        <div>
            <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">Project Name</label>
            <input value={activeProject.name} onChange={handleProjectNameChange} className="w-full p-2 text-sm rounded border bg-transparent focus:outline-none focus:border-blue-500" style={{ borderColor: 'var(--sidebar-border)' }} />
        </div>
        <div className="flex-1 flex items-center justify-center text-center opacity-30 text-xs">Select an element to edit properties</div>
      </aside>
    );
  }

  const incomingEdges = edges.filter(e => e.target === selectedNode.id);
  const inputDebug = incomingEdges.map((edge, i) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const val = sourceNode?.data?.value ?? 'null';
    return { pin: edge.targetHandle || `in-${i}`, val };
  });
  const outputValue = selectedNode.data.value;

  // === ВИЗНАЧЕННЯ ТИПУ ===
  // Очищаємо назву від сміття типу (Inverter)
  let rawType = selectedNode.type === 'logicGate' ? selectedNode.data.type : selectedNode.type;
  
  // Якщо десь залишився старий "Inverter", прибираємо його для відображення
  let displayType = rawType.replace('(Inverter)', '').trim();
  
  // Для логічної перевірки: якщо це NOT, ми його запам'ятовуємо
  const isNotGate = displayType === 'NOT' || rawType.includes('NOT');

  return (
    <aside className="w-72 border-l p-4 flex flex-col gap-6 overflow-y-auto" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-50 border-b pb-2" style={{ borderColor: 'var(--sidebar-border)' }}>
          {displayType} Properties
        </h3>

        <div>
          <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">Label (Назва)</label>
          <input 
            value={selectedNode.data.label || ''} 
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            placeholder={displayType}
            className="w-full p-2 text-sm rounded border bg-transparent focus:outline-none focus:border-blue-500"
            style={{ borderColor: 'var(--sidebar-border)' }}
          />
        </div>

        {/* --- КООРДИНАТИ --- */}
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 dark:bg-black/20 rounded-xl p-3 border border-white/10 shadow-sm flex flex-col items-center">
                <span className="text-[9px] font-black uppercase opacity-40 mb-1">X Position</span>
                <span className="font-mono text-sm font-bold">{Math.round(selectedNode.position.x)}</span>
            </div>
            <div className="bg-white/5 dark:bg-black/20 rounded-xl p-3 border border-white/10 shadow-sm flex flex-col items-center">
                <span className="text-[9px] font-black uppercase opacity-40 mb-1">Y Position</span>
                <span className="font-mono text-sm font-bold">{Math.round(selectedNode.position.y)}</span>
            </div>
        </div>

        {/* --- ВИБІР ВХОДІВ (ПРИХОВАНО ДЛЯ NOT) --- */}
        {selectedNode.type === 'logicGate' && !isNotGate && (
          <div>
            <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">Inputs</label>
            <select 
              value={selectedNode.data.inputs || 2}
              onChange={(e) => updateNodeData(selectedNode.id, { inputs: parseInt(e.target.value) })}
              className="w-full p-2 text-sm rounded border bg-transparent cursor-pointer dark:bg-slate-900"
              style={{ borderColor: 'var(--sidebar-border)' }}
            >
              {[2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}

        {/* Debug Table */}
        <div className="mt-4">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-4 border-b pb-2" style={{ borderColor: 'var(--sidebar-border)' }}>Debug Info</h3>
            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg space-y-2">
              {inputDebug.length > 0 ? (
                inputDebug.map((info, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="opacity-70 font-mono">{info.pin}</span>
                    <span className={`font-bold font-mono ${info.val === 1 ? 'text-green-500' : info.val === 0 ? 'text-red-500' : 'text-gray-400'}`}>{info.val === null ? 'NULL' : info.val}</span>
                  </div>
                ))
              ) : (<div className="text-xs opacity-40 italic">No connections</div>)}
              <div className="border-t border-white/10 my-2"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold">OUTPUT</span>
                <span className={`font-bold font-mono text-sm ${outputValue === 1 ? 'text-green-500' : outputValue === 0 ? 'text-red-500' : 'text-gray-400'}`}>{outputValue === null ? 'NULL' : outputValue}</span>
              </div>
            </div>
        </div>
    </aside>
  );
}