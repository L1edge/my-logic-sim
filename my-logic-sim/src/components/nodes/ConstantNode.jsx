import React from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../store/useStore';

export default function ConstantNode({ data, id, selected }) {
  // Якщо data.constantValue задано при створенні - використовуємо його, інакше 0
  const constValue = data.constantValue !== undefined ? data.constantValue : 0;
  const isHigh = constValue === 1;
  
  // Дістаємо лейбл
  const labelText = data.label || '';

  return (
    <div className={`
      relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-md transition-transform
      ${isHigh ? 'bg-red-600 border-red-800' : 'bg-black border-gray-600'}
      ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
    `}>
      <span className="text-white font-bold font-mono text-lg pointer-events-none">
        {constValue}
      </span>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className={`!w-3 !h-3 !border-2 !border-white transition-colors
          ${isHigh ? '!bg-red-400' : '!bg-gray-500'}
        `}
        style={{ right: -6 }}
      />

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