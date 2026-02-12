import React, { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

export default function WaveformPanel() {
  // Додаємо theme, щоб реагувати на зміни кольорів
  const { isWaveformOpen, toggleWaveformPanel, waveformSignals, waveformData, theme } = useStore();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isWaveformOpen || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    
    // Синхронізуємо розмір Canvas
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // === 1. ВИЗНАЧАЄМО КОЛЬОРИ ЗАЛЕЖНО ВІД ТЕМИ ===
    const isLight = theme === 'light';
    
    // Колір тексту та сітки
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const textColor = isLight ? '#334155' : '#94a3b8'; // Slate-700 vs Slate-400
    const dividerColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    // === 2. ОЧИСТКА ===
    // Замість малювання чорного квадрата, ми робимо canvas прозорим!
    // Фон буде тягнутися з CSS батьківського div-а.
    ctx.clearRect(0, 0, width, height);

    if (waveformData.length < 2) return;

    // Параметри
    const stepX = width / 100; 
    const rowHeight = height / (waveformSignals.length || 1);

    // Малюємо сигнали
    waveformSignals.forEach((sig, index) => {
      const yBase = index * rowHeight + rowHeight - 10;
      const yMax = rowHeight - 20;

      ctx.beginPath();
      // Якщо колір не заданий, беремо дефолтний (темний або світлий)
      ctx.strokeStyle = sig.color || (isLight ? '#2563eb' : '#00ff00'); 
      ctx.lineWidth = 2;

      waveformData.forEach((snap, i) => {
        const val = snap[sig.id] || 0;
        const yOffset = (val > 0 ? 1 : 0) * (yMax * 0.8); 
        const x = i * stepX;
        const y = yBase - yOffset;
        
        if (i === 0) ctx.moveTo(x, y);
        else {
            const prevX = (i - 1) * stepX;
            const prevSnap = waveformData[i-1];
            const prevVal = prevSnap[sig.id] || 0;
            const prevY = yBase - ((prevVal > 0 ? 1 : 0) * (yMax * 0.8));
            
            ctx.lineTo(x, prevY); 
            ctx.lineTo(x, y);     
        }
      });
      ctx.stroke();

      // Підпис сигналу
      ctx.fillStyle = textColor; // Адаптивний колір тексту
      ctx.font = '10px monospace';
      ctx.fillText(`${sig.label}`, 10, index * rowHeight + 15);
      
      // Розділова лінія (сітка)
      ctx.strokeStyle = dividerColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, (index + 1) * rowHeight);
      ctx.lineTo(width, (index + 1) * rowHeight);
      ctx.stroke();
    });

  }, [waveformData, waveformSignals, isWaveformOpen, theme]); // Додали theme в залежності

  if (!isWaveformOpen) return null;

  return (
    // === 3. ДИНАМІЧНИЙ ФОН ЧЕРЕЗ CSS ЗМІННІ ===
    // Використовуємо ті ж змінні, що і Sidebar
    <div 
        className="absolute bottom-0 left-0 right-0 h-64 border-t shadow-2xl z-50 flex flex-col backdrop-blur-md transition-colors duration-300"
        style={{ 
            backgroundColor: 'var(--sidebar-bg)', 
            borderColor: 'var(--sidebar-border)',
            color: 'var(--text-primary)'
        }}
    >
      <div className="flex justify-between items-center px-4 py-1 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Logic Analyzer</span>
        <div className="flex gap-4">
            <button onClick={() => useStore.setState({ waveformData: [] })} className="text-[10px] text-red-500 hover:text-red-400 font-bold transition-colors">CLEAR DATA</button>
            <button onClick={toggleWaveformPanel} className="text-[10px] font-bold opacity-60 hover:opacity-100 transition-opacity">CLOSE ▼</button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}