import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useStore from '../../store/useStore';

export default memo(function CustomScriptNode({ id, data, selected }) {
  const { customModules } = useStore();
  
  // Шукаємо дані нашого модуля в сторі за його ID
  const mod = customModules[data.moduleId];

  if (!mod) {
    return (
      <div className="p-2 bg-red-900 border-2 border-red-500 rounded text-white text-xs">
        Module Not Found
      </div>
    );
  }

  // Вираховуємо динамічну висоту (щоб влізли всі порти)
  const maxPorts = Math.max(mod.inputs.length, mod.outputs.length);
  const baseHeight = 40;
  const portSpacing = 20;
  const dynamicHeight = Math.max(baseHeight, maxPorts * portSpacing + 20);

  return (
    <div 
      className={`relative rounded-lg shadow-lg border-2 transition-all duration-300 backdrop-blur-md flex items-center justify-center
      ${selected ? 'ring-2 ring-blue-500 ring-offset-2 border-yellow-400' : 'border-white/20'}`}
      style={{ 
        width: 120, 
        height: dynamicHeight,
        background: 'linear-gradient(145deg, rgba(20, 30, 50, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)',
        color: '#fff'
      }}
    >
      {/* Назва модуля по центру */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <span className="text-xs font-black tracking-widest text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
          {mod.name}
        </span>
        <span className="text-[8px] uppercase opacity-50 mt-1">Custom logic</span>
      </div>

      {/* === ВХОДИ (ЗЛІВА) === */}
      {mod.inputs.map((inputName, index) => {
        const topPos = `${(100 / (mod.inputs.length + 1)) * (index + 1)}%`;
        return (
          <div key={`in-${index}`}>
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${index}`} // ВАЖЛИВО: logic.js чекає саме "input-0", "input-1"
              className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white hover:!bg-green-400 z-50"
              style={{ top: topPos, left: -6 }}
            />
            {/* Підпис порту */}
            <span className="absolute text-[8px] font-mono opacity-70" style={{ top: `calc(${topPos} - 6px)`, left: 6 }}>
              {inputName}
            </span>
          </div>
        );
      })}

      {/* === ВИХОДИ (СПРАВА) === */}
      {mod.outputs.map((outputName, index) => {
        const topPos = `${(100 / (mod.outputs.length + 1)) * (index + 1)}%`;
        // Отримуємо поточне значення з value об'єкта (якщо воно є)
        // Оскільки у нас може бути кілька виходів, ми будемо зберігати їх як об'єкт: data.value = { Res: 0, Zero: 1 }
        const outVal = (data.value && typeof data.value === 'object') ? data.value[outputName] : null;
        
        // Колір порту залежить від значення (якщо є сигнал)
        const handleColor = outVal > 0 ? '!bg-green-500 !border-green-200' : (outVal === 0 ? '!bg-red-500 !border-red-200' : '!bg-gray-400');

        return (
          <div key={`out-${index}`}>
            <Handle
              type="source"
              position={Position.Right}
              id={`output-${outputName}`} // Для виходів називаємо по імені
              className={`!w-3 !h-3 !border-2 !border-white z-50 ${handleColor}`}
              style={{ top: topPos, right: -6 }}
            />
            {/* Підпис порту */}
            <span className="absolute text-[8px] font-mono opacity-70 text-right" style={{ top: `calc(${topPos} - 6px)`, right: 6 }}>
              {outputName}
            </span>
          </div>
        );
      })}
    </div>
  );
});