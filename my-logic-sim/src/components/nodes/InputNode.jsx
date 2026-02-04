import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../store/useStore';

export default function InputNode({ data, id, selected }) {
  const updateNodeValue = useStore((state) => state.updateNodeValue);
  const [radix, setRadix] = useState(10);
  const [inputValue, setInputValue] = useState(data.value.toString());
  
  // Дістаємо лейбл
  const labelText = data.label || '';

  const handleRadixChange = (e) => {
    const newRadix = parseInt(e.target.value);
    setRadix(newRadix);
    setInputValue(data.value.toString(newRadix).toUpperCase());
  };

  const handleChange = (e) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);
    const parsedValue = parseInt(rawValue, radix);
    if (!isNaN(parsedValue)) {
      updateNodeValue(id, parsedValue);
    }
  };

  return (
    <div 
      className={`rounded shadow-md min-w-[120px] overflow-visible relative border-2 transition-colors duration-300
      ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} 
      `}
      style={{
        backgroundColor: 'var(--node-input-bg)',
        borderColor: 'var(--node-input-border)'
      }}
    >
      {/* Шапка */}
      <div 
        className="px-2 py-1 flex justify-between items-center border-b"
        style={{
          backgroundColor: 'var(--node-input-header)',
          borderColor: 'var(--node-input-border)',
          color: 'var(--node-input-text)'
        }}
      >
        <span className="text-xs font-bold">INPUT</span>
        <select 
          className="text-[10px] rounded focus:outline-none cursor-pointer border ml-2"
          value={radix}
          onChange={handleRadixChange}
          style={{
             backgroundColor: 'var(--node-input-bg)',
             color: 'var(--node-input-val-color)',
             borderColor: 'var(--node-input-border)'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <option value={2}>BIN</option>
          <option value={10}>DEC</option>
          <option value={16}>HEX</option>
        </select>
      </div>

      {/* Поле вводу */}
      <div className="p-2">
        <input 
          type="text" 
          value={inputValue}
          onChange={handleChange}
          className="w-full text-center font-mono text-lg border-b focus:outline-none focus:border-green-500 bg-transparent"
          style={{
            color: 'var(--node-input-val-color)',
            borderColor: 'var(--sidebar-border)' 
          }}
        />
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-4 !h-4 !bg-green-500 !border-2 !border-white hover:!bg-green-400 hover:scale-110 transition-transform" 
        style={{ right: -8 }} 
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