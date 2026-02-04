import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../store/useStore';

const gateSVG = {
  AND: (isActive, color) => (
    <path d="M 0 0 L 0 50 L 35 50 C 65 50 80 25 80 25 C 80 25 65 0 35 0 Z" fill={isActive ? color.fill : '#374151'} stroke={color.border} strokeWidth="2" />
  ),
  NAND: (isActive, color) => (
    <>
      <path d="M 0 0 L 0 50 L 35 50 C 65 50 80 25 80 25 C 80 25 65 0 35 0 Z" fill={isActive ? color.fill : '#374151'} stroke={color.border} strokeWidth="2" />
      <circle cx="86" cy="25" r="6" fill={isActive ? color.fill : '#374151'} stroke={color.border} strokeWidth="2" />
    </>
  ),
  OR: (isActive, color) => (
    <path d="M 0 0 C 15 5 15 45 0 50 C 40 50 80 25 80 25 C 80 25 40 0 0 0 Z" fill={isActive ? color.fill : '#374151'} stroke={color.border} strokeWidth="2" />
  ),
  XOR: (isActive, color) => (
    <>
      <path d="M -5 0 C 10 5 10 45 -5 50" fill="none" stroke={color.border} strokeWidth="2" />
      <path d="M 3 0 C 18 5 18 45 3 50 C 43 50 83 25 83 25 C 83 25 43 0 3 0 Z" fill={isActive ? color.fill : '#374151'} stroke={color.border} strokeWidth="2" />
    </>
  ),
  NOT: (isActive, color) => (
    <>
      <path d="M 0 0 L 0 50 L 58 25 Z" fill={isActive ? color.fill : '#374151'} stroke={color.border} strokeWidth="2" />
      <circle cx="65" cy="25" r="6" fill={isActive ? color.fill : '#374151'} stroke={color.border} strokeWidth="2" />
    </>
  ),
};

const gateColors = {
  AND: { fill: '#3b82f6', border: '#1e40af' },
  NAND: { fill: '#3b82f6', border: '#1e40af' },
  OR:  { fill: '#a855f7', border: '#6b21a8' },
  XOR: { fill: '#14b8a6', border: '#0f766e' },
  NOT: { fill: '#ef4444', border: '#b91c1c' },
};

export default memo(function LogicGate({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  
  const hasSignal = data.value !== null && data.value !== undefined;
  const isHigh = data.value > 0;
  const isLow = data.value === 0;

  // Очистка типу
  let type = data.type || 'AND';
  if (type.includes('NOT')) type = 'NOT';

  const colors = gateColors[type] || gateColors.AND;
  const renderSvg = gateSVG[type] || gateSVG.AND;
  
  // Кількість входів
  const inputsCount = type === 'NOT' ? 1 : (data.inputs || 2);
  
  // === ЗМІНА 1: ЗБІЛЬШИЛИ МНОЖНИК ВИСОТИ ===
  // Було * 20, стало * 30. Це дасть більше простору між портами.
  const dynamicHeight = type === 'NOT' ? 50 : Math.max(60, inputsCount * 30);

  const handleInputChange = (e) => {
    updateNodeData(id, { inputs: parseInt(e.target.value) });
  };

  const inputLeftOffset = (type === 'OR' || type === 'XOR') ? 8 : -2; 
  const outputRightOffset = (type === 'NOT') ? -5 : (type === 'NAND' ? -10 : -4);
  
  let outputHandleColor = '!bg-gray-400';
  if (isHigh) outputHandleColor = '!bg-green-500 !border-green-200';
  if (isLow) outputHandleColor = '!bg-red-500 !border-red-200';

  const labelText = data.label || ''; 

  return (
    <div 
      className={`relative transition-transform group
      ${isHigh ? 'drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]' : ''} 
      ${isLow ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''} 
      ${selected ? 'ring-2 ring-blue-500 ring-offset-4' : ''}
      `}
      style={{ width: type === 'NOT' ? 70 : 90, height: dynamicHeight }} 
    >
      <svg 
        width="100%" height="100%" 
        viewBox={type === 'XOR' ? "-5 0 95 50" : (type === 'NOT' ? "0 0 70 50" : "0 0 90 50")} 
        preserveAspectRatio="none"
        className="absolute top-0 left-0 overflow-visible"
      >
        {renderSvg(isHigh || isLow, colors)} 
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-[10px] font-bold text-white/80 drop-shadow-md tracking-wider ${type === 'NOT' ? '-ml-2' : ''}`}>
            {type}
          </span>
      </div>

      {/* Список тільки якщо НЕ NOT */}
      {type !== 'NOT' && (
        <select 
          className="absolute -top-6 left-0 text-[10px] border rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none shadow-sm z-50 h-5"
          value={inputsCount}
          onChange={handleInputChange}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--text-primary)', borderColor: 'var(--sidebar-border)' }}
        >
          {[2, 3, 4, 5, 6, 7, 8].map(num => (<option key={num} value={num}>{num} in</option>))}
        </select>
      )}

      {/* ВХОДИ */}
      {type === 'NOT' ? (
        <Handle
          type="target" position={Position.Left} id="input-0"
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-green-400 transition-colors"
          style={{ top: '50%', left: -2, zIndex: 50 }} 
        />
      ) : (
        // === ЗМІНА 2: ПОКРАЩЕНА ПОЗИЦІЯ І Z-INDEX ===
        Array.from({ length: inputsCount }).map((_, i) => (
          <Handle
            key={i} 
            type="target" 
            position={Position.Left} 
            id={`input-${i}`} 
            className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-green-400 transition-colors"
            style={{ 
              // Використовуємо 15% та 85% як межі, щоб не лізли на самі краї
              top: `${15 + (i * (70 / (inputsCount - 1 || 1)))}%`, 
              left: inputLeftOffset,
              zIndex: 50 // <--- ВАЖЛИВО! Це робить порт клікабельним поверх всього іншого
            }}
          />
        ))
      )}

      {/* ВИХІД */}
      <Handle
        type="source" position={Position.Right}
        className={`!w-4 !h-4 !border-2 !border-white transition-colors ${outputHandleColor}`}
        style={{ right: outputRightOffset, top: '50%', zIndex: 50 }} 
      />

      {labelText && (
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
            <span className="text-[10px] font-medium font-mono px-1.5 py-0.5 rounded border border-white/10"
                style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--text-primary)' }}>
                {labelText}
            </span>
          </div>
      )}
    </div>
  );
});