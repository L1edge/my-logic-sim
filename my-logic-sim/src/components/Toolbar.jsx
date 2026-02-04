import React, { useRef } from 'react';
import useStore from '../store/useStore';
import { generateVerilog } from '../utils/verilog'; // Переконайся, що створив цей файл (код нижче)

export default function Toolbar() {
  const { nodes, edges, loadGraph } = useStore();
  const fileInputRef = useRef(null);

  // --- ЗБЕРЕЖЕННЯ (JSON) ---
  const handleSave = () => {
    const flow = { nodes, edges };
    const json = JSON.stringify(flow, null, 2); // null, 2 для гарного форматування
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'logic-sim-scheme.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ЗАВАНТАЖЕННЯ (JSON) ---
  const handleOpenClick = () => {
    fileInputRef.current.click(); // Емулюємо клік по прихованому інпуту
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const flow = JSON.parse(e.target.result);
        loadGraph(flow); // Викликаємо функцію зі стору
      } catch (err) {
        alert("Помилка читання файлу! Це точно JSON?");
        console.error(err);
      }
    };
    reader.readAsText(file);
    
    // Скидаємо значення, щоб можна було відкрити той самий файл ще раз
    event.target.value = '';
  };

  // --- ЕКСПОРТ (Verilog) ---
  const handleExportVerilog = () => {
    if (nodes.length === 0) {
      alert("Схема пуста!");
      return;
    }
    const verilogCode = generateVerilog(nodes, edges);
    
    const blob = new Blob([verilogCode], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'circuit.v'; // Розширення .v для Verilog
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="h-14 border-b flex items-center px-4 justify-between shadow-sm z-20"
      style={{ 
        backgroundColor: 'var(--sidebar-bg)', 
        borderColor: 'var(--sidebar-border)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Прихований інпут для файлів */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-6">
        <h1 className="font-bold text-xl tracking-tight">LogicSim <span className="text-xs opacity-50 font-mono">PRO</span></h1>
        
        {/* Група: Файл */}
        <div className="flex gap-2">
          <button 
            onClick={handleSave} 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide border rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors" 
            style={{ borderColor: 'var(--sidebar-border)' }}
          >
            💾 Save
          </button>
          <button 
            onClick={handleOpenClick} 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide border rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors" 
            style={{ borderColor: 'var(--sidebar-border)' }}
          >
            📂 Open
          </button>
        </div>
      </div>

      {/* Група: Симуляція (заглушки для візуалу) */}
      <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
        <button className="px-4 py-1 text-xs font-bold text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors">
           ▶ RUN
        </button>
        <button className="px-4 py-1 text-xs font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors">
           ⏹ STOP
        </button>
        <button className="px-4 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors">
           ⏯ STEP
        </button>
      </div>

      {/* Група: Експорт */}
      <div>
        <button 
          onClick={handleExportVerilog}
          className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded shadow-md hover:shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all transform hover:scale-105"
        >
          Export to Verilog (.v)
        </button>
      </div>
    </div>
  );
}