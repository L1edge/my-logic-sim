import { nanoid } from 'nanoid';

export const parseVerilogToGraph = (verilogCode) => {
  const nodes = [];
  const edges = [];
  const signalMap = new Map(); 
  const aliases = []; // Зберігаємо прямі з'єднання (assign A = B)

  const cleanCode = verilogCode
    .replace(/\/\/.*$/gm, '') 
    .replace(/\/\*[\s\S]*?\*\//g, '') 
    .replace(/\s+/g, ' '); 

  // 1. INPUTS
  const inputRegex = /input\s+(?:wire\s+)?(?:\[.*?\]\s+)?([a-zA-Z0-9_]+)/g;
  let match;
  let inputIndex = 0;
  while ((match = inputRegex.exec(cleanCode)) !== null) {
    const name = match[1];
    const id = nanoid();
    nodes.push({
      id,
      type: 'inputNode',
      position: { x: 50, y: 100 + (inputIndex * 120) },
      data: { label: name, value: 0 }
    });
    signalMap.set(name, id);
    inputIndex++;
  }

  // 2. OUTPUTS (Просто збираємо імена)
  const outputRegex = /output\s+(?:wire\s+)?(?:\[.*?\]\s+)?([a-zA-Z0-9_]+)/g;
  const outputSignals = [];
  while ((match = outputRegex.exec(cleanCode)) !== null) {
    outputSignals.push(match[1]);
  }

  // 3. LOGIC & ALIASES
  const assignRegex = /assign\s+([a-zA-Z0-9_]+)\s*=\s*(.*?);/g;
  let gateIndex = 0;

  while ((match = assignRegex.exec(cleanCode)) !== null) {
    const outSignal = match[1];
    let expression = match[2].trim().replace(/[()]/g, '');

    // === ФІКС: Якщо це просте з'єднання без операторів (assign F = wire_1) ===
    if (!expression.match(/[&|^~]/)) {
        aliases.push({ target: outSignal, source: expression.trim() });
        continue; // Пропускаємо створення гейта
    }

    let type = 'AND';
    let inputs = [];

    if (expression.includes('&')) {
      type = expression.startsWith('~') ? 'NAND' : 'AND';
      inputs = expression.split('&').map(s => s.trim());
    } else if (expression.includes('|')) {
      type = expression.startsWith('~') ? 'NOR' : 'OR'; // Можна додати NOR
      inputs = expression.split('|').map(s => s.trim());
    } else if (expression.includes('^')) {
      type = 'XOR';
      inputs = expression.split('^').map(s => s.trim());
    } else if (expression.startsWith('~')) {
      type = 'NOT';
      inputs = [expression.replace('~', '').trim()];
    }

    const gateId = nanoid();
    nodes.push({
      id: gateId,
      type: 'logicGate',
      position: { x: 400 + (gateIndex % 3) * 250, y: 100 + (Math.floor(gateIndex / 3) * 150) },
      data: { type, inputs: inputs.length, label: type }
    });

    signalMap.set(outSignal, gateId);

    inputs.forEach((inputName, idx) => {
        const cleanInput = inputName.replace('~', '').trim();
        edges.push({
            sourceName: cleanInput,
            target: gateId,
            targetHandle: `input-${idx}`,
            id: nanoid()
        });
    });
    gateIndex++;
  }

  // 4. ОБРОБКА АЛІАСІВ (Тепер ми знаємо всі ID гейтів, можемо підключити виходи)
  // Наприклад: assign F = wire_5; -> F тепер посилається на той самий ID, що і wire_5
  aliases.forEach(alias => {
      const sourceId = signalMap.get(alias.source);
      if (sourceId) {
          signalMap.set(alias.target, sourceId);
      }
  });

  // 5. СТВОРЕННЯ OUTPUT NODES
  outputSignals.forEach((outName, idx) => {
      const outId = nanoid();
      nodes.push({
          id: outId,
          type: 'outputNode',
          position: { x: 1200, y: 100 + (idx * 120) },
          data: { label: outName, value: 0 }
      });

      // Підключаємо Output до сигналу (чи це гейт, чи вхід, чи аліас)
      edges.push({
          sourceName: outName,
          target: outId,
          targetHandle: null,
          id: nanoid()
      });
  });

  // 6. ФІНАЛІЗАЦІЯ EDGES
  const finalEdges = [];
  edges.forEach(edge => {
      // Тут магія: якщо sourceName був аліасом, signalMap поверне ID реального джерела
      const sourceId = signalMap.get(edge.sourceName);
      if (sourceId) {
          finalEdges.push({
              id: edge.id,
              source: sourceId,
              target: edge.target,
              targetHandle: edge.targetHandle,
              type: 'smoothstep',
              style: { stroke: '#555', strokeWidth: 2 }
          });
      }
  });

  return { nodes, edges: finalEdges };
};