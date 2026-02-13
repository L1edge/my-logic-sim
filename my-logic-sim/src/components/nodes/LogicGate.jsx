import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../store/useStore';

// === 1. SVG ШЛЯХИ (Використовуємо CSS змінну для фону) ===
const gateSVG = {
  AND: (isActive, color) => (
    <path d="M 0 0 L 0 50 L 35 50 C 65 50 80 25 80 25 C 80 25 65 0 35 0 Z" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
  ),
  NAND: (isActive, color) => (
    <>
      <path d="M 0 0 L 0 50 L 35 50 C 65 50 80 25 80 25 C 80 25 65 0 35 0 Z" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
      <circle cx="86" cy="25" r="6" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
    </>
  ),
  OR: (isActive, color) => (
    <path d="M 0 0 C 15 5 15 45 0 50 C 40 50 80 25 80 25 C 80 25 40 0 0 0 Z" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
  ),
  NOR: (isActive, color) => (
    <>
      <path d="M 0 0 C 15 5 15 45 0 50 C 40 50 80 25 80 25 C 80 25 40 0 0 0 Z" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
      <circle cx="86" cy="25" r="6" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
    </>
  ),
  XOR: (isActive, color) => (
    <>
      <path d="M -5 0 C 10 5 10 45 -5 50" fill="none" stroke={color.border} strokeWidth="2" />
      <path d="M 3 0 C 18 5 18 45 3 50 C 43 50 83 25 83 25 C 83 25 43 0 3 0 Z" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
    </>
  ),
  XNOR: (isActive, color) => (
    <>
      <path d="M -5 0 C 10 5 10 45 -5 50" fill="none" stroke={color.border} strokeWidth="2" />
      <path d="M 3 0 C 18 5 18 45 3 50 C 43 50 83 25 83 25 C 83 25 43 0 3 0 Z" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
      <circle cx="89" cy="25" r="6" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
    </>
  ),
  NOT: (isActive, color) => (
    <>
      <path d="M 0 0 L 0 50 L 58 25 Z" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
      <circle cx="65" cy="25" r="6" fill={isActive ? color.fill : 'var(--gate-fill)'} stroke={color.border} strokeWidth="2" />
    </>
  ),
};

const gateColors = {
  AND:  { fill: '#3b82f6', border: '#60a5fa' },
  NAND: { fill: '#6366f1', border: '#818cf8' },
  OR:   { fill: '#a855f7', border: '#c084fc' },
  NOR:  { fill: '#d946ef', border: '#e879f9' },
  XOR:  { fill: '#14b8a6', border: '#2dd4bf' },
  XNOR: { fill: '#06b6d4', border: '#22d3ee' },
  NOT:  { fill: '#ef4444', border: '#f87171' },
};

export default memo(function LogicGate({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  const isHigh = data.value > 0;

  // Визначаємо тип
  let type = (data.type || 'AND').toUpperCase();
  const isNot = type === 'NOT' || (type.includes('NOT') && !['NAND', 'NOR', 'XNOR'].includes(type));
  if (isNot) type = 'NOT';

  const colors = gateColors[type] || gateColors.AND;
  const renderSvg = gateSVG[type] || gateSVG.AND;
  const inputsCount = isNot ? 1 : (data.inputs || 2);
  const dynamicHeight = isNot ? 50 : Math.max(60, inputsCount * 20);

  // Світіння
  const isDirectLogic = ['AND', 'OR', 'XOR'].includes(type);
  let glowStyle = {};
  if (isHigh) {
    const glowColor = isDirectLogic ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)';
    glowStyle = { filter: `drop-shadow(0 0 15px ${glowColor})` };
  }

  return (
    <div 
      className={`relative transition-all duration-300 group ${selected ? 'ring-2 ring-blue-500 ring-offset-4' : ''}`}
      style={{ width: isNot ? 70 : 90, height: dynamicHeight, ...glowStyle }} 
    >
      {/* SVG ТІЛЬКИ ДЛЯ ФОРМИ */}
      <svg 
        width="100%" height="100%" 
        viewBox={['XOR', 'XNOR'].includes(type) ? "-5 0 95 50" : (isNot ? "0 0 70 50" : "0 0 90 50")} 
        preserveAspectRatio="none"
        className="absolute top-0 left-0 overflow-visible"
      >
        {renderSvg(isHigh, colors)} 
      </svg>
      
      {/* ТЕКСТ ОКРЕМИМ DIV-ОМ (ЩОБ НЕ РОЗТЯГУВАВСЯ) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span 
            className={`font-black tracking-wider select-none ${isNot ? '-ml-2' : ''}`}
            style={{ 
                fontSize: '10px',
                color: 'var(--text-primary)', // Адаптивний колір (чорний у світлій темі)
                transform: 'scale(1)', // Гарантуємо відсутність деформації
                textAlign: 'center'
            }}
          >
            {type}
          </span>
      </div>

      {/* Меню вибору входів */}
      {!isNot && (
        <select 
          className="absolute -top-6 left-0 text-[10px] border rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-50 h-5"
          value={inputsCount}
          onChange={(e) => updateNodeData(id, { inputs: parseInt(e.target.value) })}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--text-primary)', borderColor: 'var(--sidebar-border)' }}
        >
          {[2, 3, 4, 5, 6, 7, 8].map(num => (<option key={num} value={num}>{num} in</option>))}
        </select>
      )}

      {/* Handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id={isNot ? "input-0" : undefined}
        style={isNot ? { top: '50%', left: -2 } : { display: 'none' }}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white z-50"
      />

      {!isNot && Array.from({ length: inputsCount }).map((_, i) => (
          <Handle key={i} type="target" position={Position.Left} id={`input-${i}`} className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white z-50" 
            style={{ 
                top: `${10 + (i * (80 / (inputsCount - 1 || 1)))}%`, 
                left: ['OR', 'XOR', 'NOR', 'XNOR'].includes(type) ? 8 : -2 
            }}
          />
      ))}

      <Handle 
        type="source" position={Position.Right} 
        className={`!w-4 !h-4 !border-2 !border-white z-50 ${isHigh ? '!bg-green-500' : '!bg-red-500'}`}
        style={{ right: isNot ? -5 : (['NAND', 'NOR', 'XNOR'].includes(type) ? -10 : -4), top: '50%' }} 
      />

      {/* Підпис знизу */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
        <span className="text-[10px] font-medium font-mono px-1.5 py-0.5 rounded border border-white/10"
            style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--text-primary)' }}>
            {data.label || type}
        </span>
      </div>
    </div>
  );
});