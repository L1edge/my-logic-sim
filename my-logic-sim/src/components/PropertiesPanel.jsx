import React from 'react';
import useStore from '../store/useStore';

export default function PropertiesPanel() {
  const { projects, activeProjectId, updateNodeData, renameProject, getNodes, getEdges } = useStore();
  
  const nodes = getNodes();
  const edges = getEdges();
  const activeProject = projects[activeProjectId];
  
  const selectedNode = nodes.find((n) => n.selected);
  const selectedEdge = edges.find((e) => e.selected);

  const handleProjectNameChange = (e) => { renameProject(activeProjectId, e.target.value); }

  // ==========================================
  // 1. РЕЖИМ ІНСПЕКТОРА ДРОТУ (WIRE INSPECTOR)
  // ==========================================
  if (selectedEdge && !selectedNode) {
    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
    const targetNode = nodes.find(n => n.id === selectedEdge.target);

    let val = sourceNode?.data?.value ?? 'null';
    if (typeof val === 'object' && val !== null && selectedEdge.sourceHandle) {
        const outPinName = selectedEdge.sourceHandle.replace('output-', '');
        val = val[outPinName] ?? 'null';
    } else if (typeof val === 'object') {
        val = 'OBJ';
    }

    const sourceLabel = sourceNode?.data?.label || sourceNode?.data?.type || sourceNode?.type || 'Unknown';
    const targetLabel = targetNode?.data?.label || targetNode?.data?.type || targetNode?.type || 'Unknown';
    const sourcePin = selectedEdge.sourceHandle ? selectedEdge.sourceHandle.replace('output-', '') : 'OUT';
    const targetPin = selectedEdge.targetHandle ? selectedEdge.targetHandle.replace('input-', '') : 'IN';

    return (
      <aside className="w-72 border-l p-4 flex flex-col gap-6 overflow-y-auto" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-50 border-b pb-2 text-blue-400" style={{ borderColor: 'var(--sidebar-border)' }}>
          🔍 Wire Inspector
        </h3>

        <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl space-y-5 border border-white/10 shadow-lg">
          
          {/* ПОТОЧНЕ ЗНАЧЕННЯ */}
          <div className="flex flex-col items-center justify-center p-4 bg-black/20 dark:bg-black/40 rounded-lg shadow-inner border border-white/5">
            <span className="text-[10px] font-bold uppercase opacity-50 mb-1">Signal Value</span>
            <span className={`text-3xl font-mono font-black tracking-tight ${val > 0 ? 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' : val === 0 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-gray-500'}`}>
              {val === null ? 'NULL' : val}
            </span>
            
            {/* === НОВІ ПЛАШКИ HEX ТА BIN === */}
              {val !== null && typeof val === 'number' && (
              <div className="flex flex-col items-center gap-1.5 mt-4 w-full px-1">
                {/* Плашка HEX */}
                <div className="text-[10px] font-mono text-blue-300 bg-blue-900/30 px-2 py-1.5 rounded border border-blue-500/30 w-full flex justify-between items-start gap-2">
                  <span className="opacity-50 shrink-0">HEX:</span>
                  <span className="text-right break-all">0x{val.toString(16).toUpperCase()}</span>
                </div>
                {/* Плашка BIN */}
                <div className="text-[10px] font-mono text-green-300 bg-green-900/30 px-2 py-1.5 rounded border border-green-500/30 w-full flex justify-between items-start gap-2">
                  <span className="opacity-50 shrink-0">BIN:</span>
                  <span className="text-right break-all">0b{val.toString(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* МАРШРУТ (ЗВІДКИ -> КУДИ) */}
          <div className="space-y-3 relative">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-orange-400 uppercase ml-1 mb-1">From (Source)</span>
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-2.5 rounded-lg">
                <span className="text-xs font-bold truncate max-w-[120px]">{sourceLabel}</span>
                <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded">{sourcePin}</span>
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10 text-white/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-green-400 uppercase ml-1 mb-1">To (Target)</span>
              <div className="flex justify-between items-center bg-white/5 border border-white/10 p-2.5 rounded-lg">
                <span className="text-xs font-bold truncate max-w-[120px]">{targetLabel}</span>
                <span className="text-[10px] font-mono bg-green-500/20 text-green-300 border border-green-500/30 px-1.5 py-0.5 rounded">{targetPin}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }
  // ==========================================
  // 2. РЕЖИМ ІНСПЕКТОРА МОДУЛЯ (NODE INSPECTOR)
  // ==========================================
  if (selectedNode) {
    const incomingEdges = edges.filter(e => e.target === selectedNode.id);
    const inputDebug = incomingEdges.map((edge, i) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      let val = sourceNode?.data?.value ?? 'null';
      
      if (typeof val === 'object' && val !== null && edge.sourceHandle) {
          const outPinName = edge.sourceHandle.replace('output-', '');
          val = val[outPinName] ?? 'null';
      } else if (typeof val === 'object') {
          val = 'OBJ';
      }
      return { pin: edge.targetHandle ? edge.targetHandle.replace('input-', '') : `in-${i}`, val };
    });

    const outputValue = selectedNode.data.value;
    let displayOutput = 'NULL';
    
    if (outputValue !== null && outputValue !== undefined) {
      if (typeof outputValue === 'object') {
          displayOutput = Object.entries(outputValue).map(([k, v]) => `${k}:${v}`).join(', ');
          if (displayOutput === '') displayOutput = '{}';
      } else {
          displayOutput = String(outputValue);
      }
    }

    let rawType = selectedNode.type === 'logicGate' ? selectedNode.data.type : selectedNode.type;
    let displayType = rawType.replace('(Inverter)', '').trim();
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

          <div className="mt-4">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-4 border-b pb-2" style={{ borderColor: 'var(--sidebar-border)' }}>Debug Info</h3>
              <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg space-y-2">
                {inputDebug.length > 0 ? (
                  inputDebug.map((info, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="opacity-70 font-mono text-[10px] bg-white/10 px-1 rounded">{info.pin}</span>
                      <span className={`font-bold font-mono ${info.val > 0 ? 'text-green-500' : info.val === 0 ? 'text-red-500' : 'text-gray-400'}`}>{info.val === null ? 'NULL' : info.val}</span>
                    </div>
                  ))
                ) : (<div className="text-xs opacity-40 italic">No connections</div>)}
                <div className="border-t border-white/10 my-2"></div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">OUTPUT</span>
                  <span className={`font-bold font-mono text-[10px] ${displayOutput !== 'NULL' ? 'text-blue-400' : 'text-gray-400'}`}>{displayOutput}</span>
                </div>
              </div>
          </div>
      </aside>
    );
  }

  // ==========================================
  // 3. НІЧОГО НЕ ВИДІЛЕНО (EMPTY STATE)
  // ==========================================
  return (
    <aside className="w-72 border-l p-4 flex flex-col gap-4" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}>
      <div className="text-xs font-black uppercase tracking-widest opacity-50">Project Settings</div>
      <div>
          <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">Project Name</label>
          <input value={activeProject.name} onChange={handleProjectNameChange} className="w-full p-2 text-sm rounded border bg-transparent focus:outline-none focus:border-blue-500 font-bold" style={{ borderColor: 'var(--sidebar-border)' }} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 gap-3">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        <span className="text-xs font-bold w-4/5">Select a module or wire to edit properties</span>
      </div>
    </aside>
  );
}