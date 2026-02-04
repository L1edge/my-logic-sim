import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

export default function OutputNode({ data, selected }) {
  const [radix, setRadix] = useState(10);
  const displayValue = (data.value || 0).toString(radix).toUpperCase();
  
  // Дістаємо лейбл
  const labelText = data.label || '';

  return (
    <div 
      className={`rounded shadow-md min-w-[120px] overflow-visible relative border-2 transition-colors duration-300
      ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} 
      `}
      style={{
        backgroundColor: 'var(--node-output-bg)',
        borderColor: 'var(--node-output-border)'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-4 !h-4 !bg-orange-500 !border-2 !border-white hover:!bg-orange-400 hover:scale-110 transition-transform" 
        style={{ left: -8 }} 
      />

      <div 
        className="px-2 py-1 flex justify-between items-center border-b"
        style={{
          backgroundColor: 'var(--node-output-header)',
          borderColor: 'var(--node-output-border)',
          color: 'var(--node-output-text)'
        }}
      >
        <span className="text-xs font-bold">OUTPUT</span>
        <select 
          className="text-[10px] rounded focus:outline-none cursor-pointer border ml-2"
          value={radix}
          onChange={(e) => setRadix(parseInt(e.target.value))}
          style={{
             backgroundColor: 'var(--node-output-bg)',
             color: 'var(--node-output-val-color)',
             borderColor: 'var(--node-output-border)'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <option value={2}>BIN</option>
          <option value={10}>DEC</option>
          <option value={16}>HEX</option>
        </select>
      </div>

      <div className="p-2 text-center">
        <span 
          className="font-mono text-xl font-bold"
          style={{ color: 'var(--node-output-val-color)' }}
        >
          {displayValue}
        </span>
      </div>

      {/* === ПІДПИС (LABEL) === */}
      {labelText && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
          <span 
              className="text-[10px] font-medium font-mono px-1.5 py-0.5 rounded border border-white/10"
              style={{ 
                backgroundColor: 'var(--sidebar-bg)', 
                color: 'var(--text-primary)' 
              }}
          >
              {labelText}
          </span>
        </div>
      )}
    </div>
  );
}