import React from 'react';
import useStore from '../store/useStore';

export default function PropertiesPanel() {
  const { nodes, edges, updateNodeData } = useStore();
  
  // Шукаємо виділений вузол
  const selectedNode = nodes.find((n) => n.selected);

  if (!selectedNode) {
    return (
      <aside 
        className="w-72 border-l p-6 flex flex-col items-center justify-center text-center"
        style={{ 
          backgroundColor: 'var(--sidebar-bg)', 
          borderColor: 'var(--sidebar-border)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="text-4xl opacity-20 mb-2">👆</div>
        <div className="text-sm opacity-50 font-bold uppercase tracking-wider">
          Виберіть елемент
        </div>
      </aside>
    );
  }

  // --- ЛОГІКА ДЛЯ ДЕБАГУ ---
  // Знаходимо, що приходить на входи цього елемента
  const incomingEdges = edges.filter(e => e.target === selectedNode.id);
  const inputDebug = incomingEdges.map((edge, i) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    // Намагаємось дізнатись значення джерела (джерело могло бути обчислено в logic.js)
    const val = sourceNode?.data?.value ?? 'null';
    return { pin: edge.targetHandle || `in-${i}`, val };
  });

  const outputValue = selectedNode.data.value;

  const handleChangeLabel = (e) => {
    updateNodeData(selectedNode.id, { label: e.target.value });
  };

  const handleChangeInputs = (e) => {
    updateNodeData(selectedNode.id, { inputs: parseInt(e.target.value) });
  };

  return (
    <aside 
      className="w-72 border-l p-4 flex flex-col gap-6 overflow-y-auto"
      style={{ 
        backgroundColor: 'var(--sidebar-bg)', 
        borderColor: 'var(--sidebar-border)',
        color: 'var(--text-primary)'
      }}
    >
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-4 border-b pb-2" style={{ borderColor: 'var(--sidebar-border)' }}>
          Властивості
        </h3>

        {/* Назва / Лейбл */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">Назва (Label)</label>
          <input 
            value={selectedNode.data.label || selectedNode.type} 
            onChange={handleChangeLabel}
            className="w-full p-2 text-sm rounded border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{ borderColor: 'var(--sidebar-border)' }}
          />
        </div>

        {/* Координати */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">X Pos</label>
            <div className="p-2 text-xs font-mono rounded border opacity-70" style={{ borderColor: 'var(--sidebar-border)' }}>
              {Math.round(selectedNode.position.x)}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">Y Pos</label>
            <div className="p-2 text-xs font-mono rounded border opacity-70" style={{ borderColor: 'var(--sidebar-border)' }}>
              {Math.round(selectedNode.position.y)}
            </div>
          </div>
        </div>

        {/* Кількість входів (тільки для гейтів) */}
        {selectedNode.type === 'logicGate' && selectedNode.data.type !== 'NOT' && (
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">Inputs Count</label>
            <select 
              value={selectedNode.data.inputs || 2}
              onChange={handleChangeInputs}
              className="w-full p-2 text-sm rounded border bg-transparent cursor-pointer"
              style={{ borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}
            >
              {[2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n} className="dark:bg-slate-800">{n} Inputs</option>)}
            </select>
          </div>
        )}
      </div>

      {/* --- DEBUG SECTION --- */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-4 border-b pb-2" style={{ borderColor: 'var(--sidebar-border)' }}>
          Debug Info
        </h3>
        
        <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg space-y-2">
          {/* Входи */}
          {inputDebug.length > 0 ? (
            inputDebug.map((info, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="opacity-70 font-mono">{info.pin}</span>
                <span className={`font-bold font-mono ${info.val === 1 ? 'text-green-500' : info.val === 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {info.val === null ? 'NULL' : info.val}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs opacity-40 italic">Немає вхідних з'єднань</div>
          )}

          <div className="border-t border-white/10 my-2"></div>

          {/* Вихід */}
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold">OUTPUT</span>
            <span className={`font-bold font-mono text-sm ${outputValue === 1 ? 'text-green-500' : outputValue === 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {outputValue === null ? 'NULL' : outputValue}
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}