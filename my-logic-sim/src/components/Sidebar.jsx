import React from 'react';
import useStore from '../store/useStore';

// === НАБІР ІКОНОК (SVG PATHS) ===
const ICONS = {
  // Константи
  GND: (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M12 4V14M4 14H20M7 18H17M10 22H14" />
    </g>
  ),
  VCC: (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7V17M7 12H17" />
    </g>
  ),
  // Ввід/Вивід
  INPUT: (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 12H16" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </g>
  ),
  OUTPUT: (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 12L12 5M12 19L12 12M5 12L19 12" transform="rotate(45 12 12)" />
      <path d="M8 22H16" strokeWidth="2" />
    </g>
  ),
  // Логічні елементи (ANSI стандарти)
  AND: (
    <path 
      d="M5 5V19H12C16 19 19 16 19 12C19 8 16 5 12 5H5Z" 
      stroke="currentColor" strokeWidth="2" fill="none"
    />
  ),
  NAND: (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M3 5V19H10C14 19 17 16 17 12C17 8 14 5 10 5H3Z" />
      <circle cx="20" cy="12" r="2" />
    </g>
  ),
  OR: (
    <path 
      d="M4 5C4 5 9 12 4 19C10 19 15 19 19 12C15 5 10 5 4 5Z" 
      stroke="currentColor" strokeWidth="2" fill="none"
    />
  ),
  XOR: (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M7 5C7 5 12 12 7 19C13 19 18 19 22 12C18 5 13 5 7 5Z" />
      <path d="M3 5C3 5 8 12 3 19" />
    </g>
  ),
  NOT: (
    <g stroke="currentColor" strokeWidth="2" fill="none">
      <path d="M4 5V19L16 12L4 5Z" />
      <circle cx="19" cy="12" r="2" />
    </g>
  ),
};

// Компонент однієї кнопки інструменту
const ToolItem = ({ type, label, icon, colorClass, onDragStart, value }) => (
  <div 
    className={`
      flex flex-col items-center justify-center p-3 rounded-lg cursor-grab transition-all duration-200
      border border-transparent hover:border-white/20 hover:shadow-lg hover:scale-105 active:scale-95
      bg-white/5 dark:bg-slate-800/50
      group
    `}
    draggable
    onDragStart={(event) => onDragStart(event, type, label, value)}
  >
    <div className={`w-8 h-8 mb-2 transition-colors ${colorClass}`}>
      <svg viewBox="0 0 24 24" className="w-full h-full">
        {icon}
      </svg>
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity text-center">
      {label}
    </span>
  </div>
);

export default function Sidebar() {
  const { theme, setTheme } = useStore();

  const onDragStart = (event, nodeType, label, value) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('label', label);
    if (value !== undefined) {
      event.dataTransfer.setData('value', value);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside 
      className="w-72 p-4 border-r h-screen flex flex-col gap-6 shadow-xl z-10 overflow-y-auto transition-colors duration-300 sidebar-backdrop"
      style={{ 
        backgroundColor: 'var(--sidebar-bg)', 
        borderColor: 'var(--sidebar-border)',
        color: 'var(--text-primary)'
      }}
    >
      {/* HEADER & THEME SELECTOR */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">L</div>
          <h2 className="font-bold text-xl tracking-tight">LogicSim</h2>
        </div>
        
        <div className="relative">
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full p-2 pl-3 rounded-md border text-sm font-medium appearance-none cursor-pointer outline-none transition-all hover:bg-black/5 dark:hover:bg-white/5 focus:ring-2 focus:ring-blue-500/50"
            style={{ 
              backgroundColor: theme === 'glass' ? 'rgba(0,0,0,0.2)' : 'var(--bg-color)', 
              color: 'var(--text-primary)',
              borderColor: 'var(--sidebar-border)' 
            }}
          >
            <option value="light">☀️ Light Theme</option>
            <option value="dark">🌑 Dark Theme</option>
            <option value="glass">💧 Liquid Glass</option>
          </select>
          {/* Стрілочка для селекту */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            ▼
          </div>
        </div>
      </div>
      
      {/* === SIGNALS SECTION === */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">Сигнали</div>
        <div className="grid grid-cols-2 gap-2">
          <ToolItem 
            type="constantNode" label="GND (0)" value={0} 
            icon={ICONS.GND} onDragStart={onDragStart} 
            colorClass="text-gray-500 dark:text-gray-400"
          />
          <ToolItem 
            type="constantNode" label="VCC (1)" value={1} 
            icon={ICONS.VCC} onDragStart={onDragStart} 
            colorClass="text-red-500 group-hover:text-red-400"
          />
        </div>
      </div>

      {/* === I/O SECTION === */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">Ввід / Вивід</div>
        <div className="grid grid-cols-2 gap-2">
          <ToolItem 
            type="inputNode" label="Switch" 
            icon={ICONS.INPUT} onDragStart={onDragStart} 
            colorClass="text-green-500 group-hover:text-green-400"
          />
          <ToolItem 
            type="outputNode" label="LED" 
            icon={ICONS.OUTPUT} onDragStart={onDragStart} 
            colorClass="text-orange-500 group-hover:text-orange-400"
          />
        </div>
      </div>
      
      <div className="border-t opacity-10" style={{ borderColor: 'var(--text-primary)' }}></div>

      {/* === LOGIC GATES SECTION === */}
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 px-1">Логічні Елементи</div>
        <div className="grid grid-cols-2 gap-2">
          <ToolItem 
            type="logicGate" label="AND" 
            icon={ICONS.AND} onDragStart={onDragStart} 
            colorClass="text-blue-500 group-hover:text-blue-400"
          />
          <ToolItem 
            type="logicGate" label="NAND" 
            icon={ICONS.NAND} onDragStart={onDragStart} 
            colorClass="text-blue-700 dark:text-blue-300 group-hover:text-blue-500"
          />
          <ToolItem 
            type="logicGate" label="OR" 
            icon={ICONS.OR} onDragStart={onDragStart} 
            colorClass="text-purple-500 group-hover:text-purple-400"
          />
          <ToolItem 
            type="logicGate" label="XOR" 
            icon={ICONS.XOR} onDragStart={onDragStart} 
            colorClass="text-teal-500 group-hover:text-teal-400"
          />
          {/* NOT зазвичай займає менше місця або можна зробити його на всю ширину, якщо він один в рядку */}
          <div className="col-span-2"> 
             <ToolItem 
              type="logicGate" label="NOT" 
              icon={ICONS.NOT} onDragStart={onDragStart} 
              colorClass="text-red-500 group-hover:text-red-400"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}