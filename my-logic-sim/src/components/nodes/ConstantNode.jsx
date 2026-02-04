import React from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../store/useStore';

export default function ConstantNode({ data, id, selected }) {
  // Якщо data.constantValue задано при створенні - використовуємо його, інакше 0
  const constValue = data.constantValue !== undefined ? data.constantValue : 0;
  
  const isHigh = constValue === 1;

  return (
    <div className={`
      flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-md
      ${isHigh ? 'bg-red-500 border-red-700' : 'bg-black border-gray-600'}
      ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
    `}>
      <span className="text-white font-bold font-mono text-lg">
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
    </div>
  );
}