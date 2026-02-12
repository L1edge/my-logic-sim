import React, { useState } from 'react';
import useStore from '../store/useStore';

const ICONS = {
  GND: (<g stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 4V14M4 14H20M7 18H17M10 22H14" /></g>),
  VCC: (<g stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="9" /><path d="M12 7V17M7 12H17" /></g>),
  INPUT: (<g stroke="currentColor" strokeWidth="2" fill="none"><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M8 12H16" /><circle cx="12" cy="12" r="2" fill="currentColor" /></g>),
  OUTPUT: (<g stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="7" /><path d="M12 12L12 5M12 19L12 12M5 12L19 12" transform="rotate(45 12 12)" /><path d="M8 22H16" strokeWidth="2" /></g>),
  AND: (<path d="M5 5V19H12C16 19 19 16 19 12C19 8 16 5 12 5H5Z" stroke="currentColor" strokeWidth="2" fill="none"/>),
  NAND: (<g stroke="currentColor" strokeWidth="2" fill="none"><path d="M3 5V19H10C14 19 17 16 17 12C17 8 14 5 10 5H3Z" /><circle cx="20" cy="12" r="2" /></g>),
  OR: (<path d="M4 5C4 5 9 12 4 19C10 19 15 19 19 12C15 5 10 5 4 5Z" stroke="currentColor" strokeWidth="2" fill="none"/>),
  XOR: (<g stroke="currentColor" strokeWidth="2" fill="none"><path d="M7 5C7 5 12 12 7 19C13 19 18 19 22 12C18 5 13 5 7 5Z" /><path d="M3 5C3 5 8 12 3 19" /></g>),
  NOT: (<g stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 5V19L16 12L4 5Z" /><circle cx="19" cy="12" r="2" /></g>),
  CUSTOM: (<g stroke="currentColor" strokeWidth="2" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M8 10L12 14L16 10" /></g>)
};

const Category = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-2 border-b border-white/5 last:border-0 pb-2">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between py-2 px-1 text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all select-none group">
        {title} <span className={`transform transition-transform duration-200 opacity-50 group-hover:opacity-100 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>▼</span>
      </button>
      <div className={`grid grid-cols-2 gap-2 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[5000px] opacity-100 pt-1' : 'max-h-0 opacity-0'}`}>{children}</div>
    </div>
  );
};

const ToolItem = ({ type, label, icon, colorClass, onDragStart, value, onDoubleClick, onDelete }) => (
  <div 
    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-grab transition-all duration-200 border border-transparent hover:border-white/10 hover:shadow-lg hover:bg-white/5 active:scale-95 bg-white/5 dark:bg-slate-800/40 backdrop-blur-sm group relative overflow-hidden`}
    draggable
    onDragStart={(event) => onDragStart(event, type, label, value)}
    onDoubleClick={onDoubleClick} 
  >
    {onDelete && (
      <div 
        onClick={(e) => { e.stopPropagation(); onDelete(value); }}
        className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-500/20 rounded cursor-pointer transition-all z-20"
        title="Видалити модуль"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </div>
    )}

    <div className={`w-8 h-8 mb-2 transition-colors duration-300 ${colorClass}`}><svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-md">{icon}</svg></div>
    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity text-center truncate w-full">{label}</span>
  </div>
);

export default function Sidebar() {
  const { 
      theme, setTheme, customModules = {}, deleteCustomModule, setEditingModuleId, setCustomModalOpen,
      isSidebarOpen, toggleSidebar // <--- НОВІ ЗМІННІ
  } = useStore(); 
  
  const onDragStart = (event, nodeType, label, value) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('label', label);
    if (value !== undefined) event.dataTransfer.setData('value', value);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    // relative для позиціонування кнопки
    <div className="relative h-full flex z-40"> 
        <aside 
            className={`h-full border-r shadow-xl z-10 overflow-y-auto transition-all duration-300 ease-in-out whitespace-nowrap sidebar-backdrop
                ${isSidebarOpen ? 'w-72 p-4 opacity-100' : 'w-0 p-0 opacity-0 border-none overflow-hidden'}
            `}
            style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}
        >
        <div>
            <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/30">L</div>
            <div><h2 className="font-bold text-lg leading-none tracking-tight">LogicSim</h2></div>
            </div>
            <div className="relative group">
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full p-2 pl-3 rounded-lg border text-xs font-bold appearance-none cursor-pointer outline-none transition-all hover:bg-black/5 dark:hover:bg-white/5 focus:ring-2 focus:ring-blue-500/30" style={{ backgroundColor: theme === 'glass' ? 'rgba(0,0,0,0.1)' : 'var(--bg-color)', color: 'var(--text-primary)', borderColor: 'var(--sidebar-border)' }}>
                <option value="light">☀️ Light Theme</option>
                <option value="dark">🌑 Dark Theme</option>
                <option value="glass">💧 Liquid Glass</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity text-[10px]">▼</div>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-6 custom-scrollbar">
            <Category title="Сигнали" defaultOpen={true}>
            <ToolItem type="constantNode" label="GND (0)" value={0} icon={ICONS.GND} onDragStart={onDragStart} colorClass="text-gray-500 dark:text-gray-400" />
            <ToolItem type="constantNode" label="VCC (1)" value={1} icon={ICONS.VCC} onDragStart={onDragStart} colorClass="text-red-500 group-hover:text-red-400 shadow-red-500/20" />
            </Category>

            <Category title="Ввід / Вивід" defaultOpen={true}>
            <ToolItem type="inputNode" label="Switch" icon={ICONS.INPUT} onDragStart={onDragStart} colorClass="text-green-500 group-hover:text-green-400" />
            <ToolItem type="outputNode" label="LED" icon={ICONS.OUTPUT} onDragStart={onDragStart} colorClass="text-orange-500 group-hover:text-orange-400" />
            </Category>
            
            <Category title="Логічні Елементи" defaultOpen={true}>
            <ToolItem type="logicGate" label="AND" icon={ICONS.AND} onDragStart={onDragStart} colorClass="text-blue-500 group-hover:text-blue-400" />
            <ToolItem type="logicGate" label="NAND" icon={ICONS.NAND} onDragStart={onDragStart} colorClass="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500" />
            <ToolItem type="logicGate" label="OR" icon={ICONS.OR} onDragStart={onDragStart} colorClass="text-purple-500 group-hover:text-purple-400" />
            <ToolItem type="logicGate" label="XOR" icon={ICONS.XOR} onDragStart={onDragStart} colorClass="text-teal-500 group-hover:text-teal-400" />
            <div className="col-span-2"> 
                <ToolItem type="logicGate" label="NOT" icon={ICONS.NOT} onDragStart={onDragStart} colorClass="text-rose-500 group-hover:text-rose-400" />
            </div>
            </Category>

            {Object.keys(customModules).length > 0 && (
            <Category title="Мої Модулі" defaultOpen={true}>
                {Object.values(customModules).map(mod => (
                <ToolItem 
                    key={mod.id}
                    type="customScriptNode" 
                    label={mod.name} 
                    value={mod.id} 
                    icon={ICONS.CUSTOM} 
                    colorClass="text-yellow-400 group-hover:text-yellow-300 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" 
                    onDragStart={onDragStart}
                    
                    onDoubleClick={() => {
                        setEditingModuleId(mod.id);
                        setCustomModalOpen(true);
                    }}
                    onDelete={() => {
                        if(window.confirm(`Ви дійсно хочете видалити модуль "${mod.name}"?`)) {
                            deleteCustomModule(mod.id);
                        }
                    }}
                />
                ))}
            </Category>
            )}
            
        </div>
        </aside>

        {/* === КНОПКА-ЯЗИЧОК === */}
        <button
            onClick={toggleSidebar}
            className="absolute top-1/2 -right-3 w-3 h-12 bg-gray-600 hover:bg-blue-500 rounded-r border-y border-r border-white/20 flex items-center justify-center transition-colors shadow-md z-50 translate-y-[-50%]"
            title="Toggle Sidebar"
        >
        <span className="text-[8px] text-white leading-none">
            {isSidebarOpen ? '◀' : '▶'}
        </span>
        </button>
    </div>
  );
}