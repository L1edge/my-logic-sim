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
      <path d="M 0 0 L 0 50 L 65 25 Z" fill={isActive ? color.fill : '#374151'} stroke={color.border} strokeWidth="2" />
      <circle cx="72" cy="25" r="6" fill={isActive ? color.fill : '#374151'} stroke={color.border} strokeWidth="2" />
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
  
  const isActive = data.value > 0;
  const type = data.type || 'AND';
  const colors = gateColors[type] || gateColors.AND;
  const renderSvg = gateSVG[type] || gateSVG.AND;
  
  const inputsCount = type === 'NOT' ? 1 : (data.inputs || 2);

  // === ГОЛОВНИЙ ФІКС: ДИНАМІЧНА ВИСОТА ===
  // Якщо входів > 3, додаємо по 20 пікселів на кожен
  // Це розтягне гейт вертикально
  const dynamicHeight = Math.max(60, inputsCount * 20);

  const handleInputChange = (e) => {
    updateNodeData(id, { inputs: parseInt(e.target.value) });
  };

  const inputLeftOffset = (type === 'OR' || type === 'XOR') ? 8 : -2; 
  const outputRightOffset = (type === 'NOT' || type === 'NAND') ? -10 : -4;
  const handleStyle = "!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-green-400 transition-colors";

  const inputsArray = Array.from({ length: inputsCount });

  return (
    <div 
      className={`relative transition-transform group
      ${isActive ? 'scale-105 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}
      ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
      style={{ width: 90, height: dynamicHeight }} // <--- Висота тепер змінюється
    >
      <svg 
        width="100" 
        height={dynamicHeight} // <--- SVG теж росте
        viewBox={type === 'XOR' ? "-5 0 95 50" : "0 0 90 50"} 
        preserveAspectRatio="none" // <--- ЦЕ РОЗТЯГУЄ МАЛЮНОК, ЩОБ ВІН ЗАПОВНИВ ВИСОТУ
        className="absolute top-0 left-0 overflow-visible"
      >
        {renderSvg(isActive, colors)}
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-white/60">{type}</span>
      </div>

      {type !== 'NOT' && (
        <select 
          className="absolute -top-6 left-0 text-[10px] border rounded bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none shadow-sm z-50"
          value={inputsCount}
          onChange={handleInputChange}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {[2, 3, 4, 5, 6, 7, 8].map(num => (
            <option key={num} value={num}>{num} in</option>
          ))}
        </select>
      )}

      {/* Входи тепер будуть мати нормальні відступи */}
      {inputsArray.map((_, i) => (
        <Handle
          key={i}
          type="target" 
          position={Position.Left} 
          id={`input-${i}`} 
          className={handleStyle}
          style={{ 
            // Розподіляємо їх від 10% до 90% висоти
            top: `${10 + (i * (80 / (inputsCount - 1 || 1)))}%`, 
            left: inputLeftOffset 
          }}
        />
      ))}

      <Handle
        type="source" position={Position.Right}
        className={`!w-4 !h-4 !border-2 !border-white transition-colors ${isActive ? '!bg-green-400' : '!bg-gray-200 hover:!bg-green-300'}`}
        style={{ right: outputRightOffset, top: '50%' }} 
      />
    </div>
  );
});