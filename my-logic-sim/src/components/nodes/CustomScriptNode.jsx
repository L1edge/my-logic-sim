import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../store/useStore';

export default memo(function CustomScriptNode({ id, data, selected }) {
  const { customModules } = useStore();
  
  const mod = customModules[data.moduleId];

  if (!mod) {
    return (
      <div className="p-2 bg-red-900 border-2 border-red-500 rounded text-white text-xs">
        Module Not Found
      </div>
    );
  }

  // === 1. ВИТЯГУЄМО ДИНАМІЧНУ ВИСОТУ (трохи збільшили відстані) ===
  const maxPorts = Math.max(mod.inputs.length, mod.outputs.length);
  const baseHeight = 60; 
  const portSpacing = 24; 
  const dynamicHeight = Math.max(baseHeight, maxPorts * portSpacing + 20);

  // === 2. ЩЕДРА МАТЕМАТИКА ДЛЯ ШИРИНИ ===
  const maxInLen = mod.inputs.reduce((max, str) => Math.max(max, str.length), 0);
  const maxOutLen = mod.outputs.reduce((max, str) => Math.max(max, str.length), 0);
  const titleLen = mod.name.length;

  // Виділяємо по 8px на кожну літеру порту + залізно 120px порожнечі по центру!
  const requiredWidthForPorts = (maxInLen * 8) + (maxOutLen * 8) + 120; 
  
  // Виділяємо по 11px на кожну велику літеру заголовка + 60px країв
  const requiredWidthForTitle = (titleLen * 11) + 60; 

  // Беремо найбільше, але ставимо мінімум 160px
  const dynamicWidth = Math.max(160, requiredWidthForPorts, requiredWidthForTitle);

  return (
    <div 
      className={`relative rounded-xl shadow-xl border-2 transition-all duration-300 backdrop-blur-md flex flex-col items-center justify-center
      ${selected ? 'ring-2 ring-blue-500 ring-offset-2 border-yellow-400' : 'border-white/20'}`}
      style={{ 
        width: dynamicWidth, 
        height: dynamicHeight,
        background: 'linear-gradient(145deg, rgba(20, 30, 50, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)',
        color: '#fff'
      }}
    >
      {/* Назва модуля по центру */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <span className="text-xs font-black tracking-widest text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] whitespace-nowrap px-4">
          {mod.name}
        </span>
        <span className="text-[8px] uppercase opacity-40 mt-1 whitespace-nowrap">Custom logic</span>
      </div>

      {/* === ВХОДИ (ЗЛІВА) === */}
      {mod.inputs.map((inputName, index) => {
        const topPos = `${(100 / (mod.inputs.length + 1)) * (index + 1)}%`;
        return (
          <div key={`in-${index}`}>
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${index}`}
              className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-green-400 z-50"
              style={{ top: topPos, left: -6 }}
            />
            {/* Підпис порту відсунуто на 12px від краю */}
            <span className="absolute text-[9px] font-mono opacity-80 whitespace-nowrap" style={{ top: `calc(${topPos} - 6px)`, left: 12 }}>
              {inputName}
            </span>
          </div>
        );
      })}

      {/* === ВИХОДИ (СПРАВА) === */}
      {mod.outputs.map((outputName, index) => {
        const topPos = `${(100 / (mod.outputs.length + 1)) * (index + 1)}%`;
        const outVal = (data.value && typeof data.value === 'object') ? data.value[outputName] : null;
        
        const handleColor = outVal > 0 ? '!bg-green-500 !border-green-200' : (outVal === 0 ? '!bg-red-500 !border-red-200' : '!bg-gray-400');

        return (
          <div key={`out-${index}`}>
            <Handle
              type="source"
              position={Position.Right}
              id={`output-${outputName}`}
              className={`!w-3 !h-3 !border-2 !border-white z-50 ${handleColor}`}
              style={{ top: topPos, right: -6 }}
            />
            {/* Підпис порту відсунуто на 12px від краю */}
            <span className="absolute text-[9px] font-mono opacity-80 whitespace-nowrap text-right" style={{ top: `calc(${topPos} - 6px)`, right: 12 }}>
              {outputName}
            </span>
          </div>
        );
      })}
    </div>
  );
});