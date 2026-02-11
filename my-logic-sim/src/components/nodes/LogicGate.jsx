import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../store/useStore';

const gateSVG = {
  AND: (isActive, color) => (
    <path d="M 0 0 L 0 50 L 35 50 C 65 50 80 25 80 25 C 80 25 65 0 35 0 Z" 
      fill={isActive ? color.fill : 'var(--gate-fill)'} 
      stroke={color.border} 
      strokeWidth="3" vectorEffect="non-scaling-stroke"
    />
  ),
  NAND: (isActive, color) => (
    <>
      <path d="M 0 0 L 0 50 L 35 50 C 65 50 80 25 80 25 C 80 25 65 0 35 0 Z" 
        fill={isActive ? color.fill : 'var(--gate-fill)'} 
        stroke={color.border} 
        strokeWidth="3" vectorEffect="non-scaling-stroke"
      />
      {/* Кружечок фіксуємо праворуч */}
      <circle cx="84" cy="25" r="5" 
        fill={isActive ? color.fill : 'var(--gate-fill)'} 
        stroke={color.border} 
        strokeWidth="3" vectorEffect="non-scaling-stroke"
      />
    </>
  ),
  OR: (isActive, color) => (
    <path d="M 0 0 C 15 5 15 45 0 50 C 40 50 80 25 80 25 C 80 25 40 0 0 0 Z" 
      fill={isActive ? color.fill : 'var(--gate-fill)'} 
      stroke={color.border} 
      strokeWidth="3" vectorEffect="non-scaling-stroke"
    />
  ),
  XOR: (isActive, color) => (
    <>
      <path d="M -5 0 C 10 5 10 45 -5 50" fill="none" 
        stroke={color.border} 
        strokeWidth="3" vectorEffect="non-scaling-stroke"
      />
      <path d="M 3 0 C 18 5 18 45 3 50 C 43 50 83 25 83 25 C 83 25 43 0 3 0 Z" 
        fill={isActive ? color.fill : 'var(--gate-fill)'} 
        stroke={color.border} 
        strokeWidth="3" vectorEffect="non-scaling-stroke"
      />
    </>
  ),
  NOT: (isActive, color) => (
    <>
      <path d="M 0 0 L 0 50 L 58 25 Z" 
        fill={isActive ? color.fill : 'var(--gate-fill)'} 
        stroke={color.border} 
        strokeWidth="3" vectorEffect="non-scaling-stroke"
      />
      <circle cx="62" cy="25" r="5" 
        fill={isActive ? color.fill : 'var(--gate-fill)'} 
        stroke={color.border} 
        strokeWidth="3" vectorEffect="non-scaling-stroke"
      />
    </>
  ),
};

const gateColors = {
  AND: { fill: '#3b82f6', border: '#60a5fa' },
  NAND: { fill: '#3b82f6', border: '#60a5fa' },
  OR:  { fill: '#a855f7', border: '#c084fc' },
  XOR: { fill: '#14b8a6', border: '#2dd4bf' },
  NOT: { fill: '#ef4444', border: '#f87171' },
};

export default memo(function LogicGate({ id, data, selected }) {
  const updateNodeData = useStore((state) => state.updateNodeData);
  
  const hasSignal = data.value !== null && data.value !== undefined;
  const isHigh = data.value > 0;
  const isLow = data.value === 0;

  let type = data.type || 'AND';
  if (type.includes('NOT')) type = 'NOT';

  const colors = gateColors[type] || gateColors.AND;
  const renderSvg = gateSVG[type] || gateSVG.AND;
  
  const inputsCount = type === 'NOT' ? 1 : (data.inputs || 2);
  
  // === РОЗМІРИ ===
  // Зменшив ширину. Висота тепер залежить від кількості інпутів більш щільно.
  const baseRowHeight = 24; // Крок висоти на кожен інпут
  const minHeight = 50;
  const dynamicHeight = type === 'NOT' ? 50 : Math.max(minHeight, inputsCount * baseRowHeight + 10);
  
  const width = type === 'NOT' ? 70 : 85; // Компактніша ширина

  const handleInputChange = (e) => {
    updateNodeData(id, { inputs: parseInt(e.target.value) });
  };

  // Відступи для портів
  const inputLeftOffset = (type === 'OR' || type === 'XOR') ? 5 : -3; 
  const outputRightOffset = (type === 'NOT') ? -3 : (type === 'NAND' ? -5 : -3);
  
  let outputHandleColor = '!bg-gray-400';
  if (isHigh) outputHandleColor = '!bg-green-500 !border-green-200';
  if (isLow) outputHandleColor = '!bg-red-500 !border-red-200';

  const labelText = data.label || ''; 

  return (
    <div 
      className={`relative transition-transform group flex items-center justify-center
      ${selected ? 'ring-2 ring-blue-500 ring-offset-4' : ''}
      `}
      style={{ width, height: dynamicHeight }} 
    >
      {/* SVG Container: preserveAspectRatio="none" змушує фігуру тягнутися разом з блоком */}
      <svg 
        width="100%" height="100%" 
        viewBox={type === 'XOR' ? "-5 0 95 50" : (type === 'NOT' ? "0 0 70 50" : "0 0 90 50")} 
        preserveAspectRatio="none" 
        className="overflow-visible absolute inset-0"
      >
        {renderSvg(isHigh || isLow, colors)} 
      </svg>
      
      {/* Текст поверх SVG */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span 
            className={`text-[10px] font-bold tracking-wider ${type === 'NOT' ? '-ml-2' : ''} gate-text-glow`}
            style={{ color: 'var(--gate-text)' }}
          >
            {type}
          </span>
      </div>

      {type !== 'NOT' && (
        <select 
          className="absolute -top-4 left-0 text-[9px] border rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer focus:outline-none shadow-sm z-50 h-4 px-0"
          value={inputsCount}
          onChange={handleInputChange}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {[2, 3, 4, 5, 6, 7, 8].map(num => (<option key={num} value={num}>{num} in</option>))}
        </select>
      )}

      {/* ВХОДИ */}
      {type === 'NOT' ? (
        <Handle
          type="target" position={Position.Left} id="input-0"
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-green-400 transition-colors"
          style={{ left: -2, zIndex: 50 }} 
        />
      ) : (
        Array.from({ length: inputsCount }).map((_, i) => (
          <Handle
            key={i} 
            type="target" position={Position.Left} id={`input-${i}`} 
            className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-green-400 transition-colors"
            style={{ 
              // Рівномірний розподіл портів по висоті розтягнутого елемента
              top: `${(100 / (inputsCount + 1)) * (i + 1)}%`, 
              left: inputLeftOffset,
              zIndex: 50
            }}
          />
        ))
      )}

      {/* ВИХІД */}
      <Handle
        type="source" position={Position.Right}
        className={`!w-4 !h-4 !border-2 !border-white transition-colors ${outputHandleColor}`}
        style={{ right: outputRightOffset, zIndex: 50 }} 
      />

      {labelText && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
            <span className="text-[10px] font-medium font-mono px-1.5 py-0.5 rounded border border-white/10"
                style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', border: '1px solid var(--sidebar-border)' }}>
                {labelText}
            </span>
          </div>
      )}
    </div>
  );
});