import React, { useState } from 'react';
import useStore from '../store/useStore';
import { nanoid } from 'nanoid';

export default function CustomModuleModal() {
  const { isCustomModalOpen, setCustomModalOpen, saveCustomModule } = useStore();

  const [name, setName] = useState('MyALU');
  const [inputs, setInputs] = useState('A, B, Op');
  const [outputs, setOutputs] = useState('Res, Zero');
  const [code, setCode] = useState('// Напиши свою логіку тут\n// Доступні об\'єкти: inputs та outputs\n\nlet a = inputs.A || 0;\nlet b = inputs.B || 0;\n\nif (inputs.Op === 0) outputs.Res = a + b;\nelse outputs.Res = a - b;\n\noutputs.Zero = outputs.Res === 0 ? 1 : 0;');

  if (!isCustomModalOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return alert("Введи назву модуля!");
    
    // Парсимо входи і виходи (розділені комою) в масиви
    const parsedInputs = inputs.split(',').map(s => s.trim()).filter(Boolean);
    const parsedOutputs = outputs.split(',').map(s => s.trim()).filter(Boolean);

    if (parsedInputs.length === 0 || parsedOutputs.length === 0) {
        return alert("Модуль повинен мати хоча б 1 вхід і 1 вихід!");
    }

    const newModule = {
      id: `custom_${nanoid()}`,
      name: name.trim(),
      inputs: parsedInputs,
      outputs: parsedOutputs,
      code: code
    };

    saveCustomModule(newModule);
    setCustomModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[600px] rounded-xl shadow-2xl border flex flex-col overflow-hidden" 
           style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', color: 'var(--text-primary)' }}>
        
        {/* Хедер */}
        <div className="px-4 py-3 border-b flex justify-between items-center bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--sidebar-border)' }}>
          <h2 className="font-bold text-lg tracking-tight">Створити Кастомний Модуль</h2>
          <button onClick={() => setCustomModalOpen(false)} className="text-gray-400 hover:text-red-500 text-xl font-bold">×</button>
        </div>

        {/* Тіло */}
        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Назва модуля (наприклад: ALU)</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 text-sm rounded border bg-transparent focus:outline-none focus:border-blue-500 font-mono" style={{ borderColor: 'var(--sidebar-border)' }} />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase opacity-70 mb-1 block text-green-500">Входи (через кому)</label>
              <input value={inputs} onChange={e => setInputs(e.target.value)} placeholder="A, B, Cin" className="w-full p-2 text-sm rounded border bg-transparent focus:outline-none focus:border-green-500 font-mono" style={{ borderColor: 'var(--sidebar-border)' }} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold uppercase opacity-70 mb-1 block text-orange-500">Виходи (через кому)</label>
              <input value={outputs} onChange={e => setOutputs(e.target.value)} placeholder="Sum, Cout" className="w-full p-2 text-sm rounded border bg-transparent focus:outline-none focus:border-orange-500 font-mono" style={{ borderColor: 'var(--sidebar-border)' }} />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="text-xs font-bold uppercase opacity-70 mb-1 block text-blue-400">JavaScript Логіка</label>
            <textarea 
              value={code} 
              onChange={e => setCode(e.target.value)} 
              className="w-full h-48 p-3 text-sm rounded border bg-black/5 dark:bg-black/30 focus:outline-none focus:border-blue-500 font-mono resize-none leading-relaxed" 
              style={{ borderColor: 'var(--sidebar-border)', color: '#38bdf8' }}
              spellCheck="false"
            />
          </div>
        </div>

        {/* Футер */}
        <div className="px-4 py-3 border-t flex justify-end gap-2 bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button onClick={() => setCustomModalOpen(false)} className="px-4 py-2 text-xs font-bold rounded border hover:bg-white/5 transition" style={{ borderColor: 'var(--sidebar-border)' }}>Скасувати</button>
          <button onClick={handleSave} className="px-4 py-2 text-xs font-bold rounded bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-500/30">💾 Зберегти Модуль</button>
        </div>

      </div>
    </div>
  );
}