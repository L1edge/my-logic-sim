import { nanoid } from 'nanoid';

// === ПАРСЕР VERILOG (Без змін, код скорочено для зручності) ===
export const parseVerilogToGraph = (verilogCode) => {
    // ... (Тут лишається старий код parseVerilogToGraph) ...
    // Скопіюй його з минулого повідомлення, якщо треба, або залиш як є.
    // Нижче я наводжу ТІЛЬКИ НОВУ функцію для VHDL і експорт обох.
    
    // Щоб не дублювати 100 рядків, я напишу тільки нову логіку VHDL.
    // Ти маєш додати цей код у кінець файлу.
    
    const nodes = [];
    const edges = [];
    const signalMap = new Map(); 
    const aliases = []; 

    const cleanCode = verilogCode
      .replace(/\/\/.*$/gm, '') 
      .replace(/\/\*[\s\S]*?\*\//g, '') 
      .replace(/\s+/g, ' '); 

    const inputRegex = /input\s+(?:wire\s+)?(?:\[.*?\]\s+)?([a-zA-Z0-9_]+)/g;
    let match;
    let inputIndex = 0;
    while ((match = inputRegex.exec(cleanCode)) !== null) {
      const name = match[1];
      const id = nanoid();
      nodes.push({ id, type: 'inputNode', position: { x: 50, y: 100 + (inputIndex * 120) }, data: { label: name, value: 0 } });
      signalMap.set(name, id);
      inputIndex++;
    }

    const outputRegex = /output\s+(?:wire\s+)?(?:\[.*?\]\s+)?([a-zA-Z0-9_]+)/g;
    const outputSignals = [];
    while ((match = outputRegex.exec(cleanCode)) !== null) {
      outputSignals.push(match[1]);
    }

    const assignRegex = /assign\s+([a-zA-Z0-9_]+)\s*=\s*(.*?);/g;
    let gateIndex = 0;
    while ((match = assignRegex.exec(cleanCode)) !== null) {
      const outSignal = match[1];
      let expression = match[2].trim().replace(/[()]/g, '');

      if (!expression.match(/[&|^~]/)) {
          aliases.push({ target: outSignal, source: expression.trim() });
          continue; 
      }

      let type = 'AND';
      let inputs = [];

      if (expression.includes('&')) {
        type = expression.startsWith('~') ? 'NAND' : 'AND';
        inputs = expression.split('&').map(s => s.trim());
      } else if (expression.includes('|')) {
        type = expression.startsWith('~') ? 'NOR' : 'OR'; 
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
        id: gateId, type: 'logicGate', position: { x: 400 + (gateIndex % 3) * 250, y: 100 + (Math.floor(gateIndex / 3) * 150) },
        data: { type, inputs: inputs.length, label: type }
      });
      signalMap.set(outSignal, gateId);

      inputs.forEach((inputName, idx) => {
          const cleanInput = inputName.replace('~', '').trim();
          edges.push({ sourceName: cleanInput, target: gateId, targetHandle: `input-${idx}`, id: nanoid() });
      });
      gateIndex++;
    }

    aliases.forEach(alias => {
        const sourceId = signalMap.get(alias.source);
        if (sourceId) signalMap.set(alias.target, sourceId);
    });

    outputSignals.forEach((outName, idx) => {
        const outId = nanoid();
        nodes.push({ id: outId, type: 'outputNode', position: { x: 1200, y: 100 + (idx * 120) }, data: { label: outName, value: 0 } });
        edges.push({ sourceName: outName, target: outId, targetHandle: null, id: nanoid() });
    });

    const finalEdges = [];
    edges.forEach(edge => {
        const sourceId = signalMap.get(edge.sourceName);
        if (sourceId) {
            finalEdges.push({ id: edge.id, source: sourceId, target: edge.target, targetHandle: edge.targetHandle, type: 'smoothstep', style: { stroke: '#555', strokeWidth: 2 } });
        }
    });

    return { nodes, edges: finalEdges };
};


// === ПАРСЕР VHDL (НОВЕ) ===
export const parseVHDLToGraph = (vhdlCode) => {
  const nodes = [];
  const edges = [];
  const signalMap = new Map();
  const aliases = [];

  // Чистка коду (видаляємо коментарі --)
  const cleanCode = vhdlCode
    .replace(/--.*$/gm, '') 
    .replace(/\s+/g, ' '); // В один рядок

  // 1. ПАРСИНГ ПОРТІВ (Inputs / Outputs)
  // Шукаємо блок Port ( ... );
  const portBlockMatch = cleanCode.match(/Port\s*\((.*?)\);/i);
  let inputs = [];
  let outputs = [];

  if (portBlockMatch) {
      const content = portBlockMatch[1];
      const parts = content.split(';');
      
      parts.forEach(part => {
          if (!part.trim()) return;
          // part виглядає як: X1 : in STD_LOGIC
          const [names, typeDef] = part.split(':');
          const direction = typeDef.trim().split(' ')[0].toLowerCase(); // in або out
          const cleanNames = names.split(',').map(n => n.trim());
          
          cleanNames.forEach(name => {
              if (direction === 'in') inputs.push(name);
              if (direction === 'out') outputs.push(name);
          });
      });
  }

  // Створюємо ноди входів
  inputs.forEach((name, idx) => {
      const id = nanoid();
      nodes.push({ id, type: 'inputNode', position: { x: 50, y: 100 + (idx * 120) }, data: { label: name, value: 0 } });
      signalMap.set(name, id);
  });

  // 2. ПАРСИНГ ЛОГІКИ (Architecture)
  // Шукаємо присвоєння: Signal <= Expr;
  const assignRegex = /([a-zA-Z0-9_]+)\s*<=\s*(.*?);/g;
  let match;
  let gateIndex = 0;

  // Пропускаємо все до слова "begin"
  const bodyCode = cleanCode.split(/begin/i)[1] || cleanCode;

  while ((match = assignRegex.exec(bodyCode)) !== null) {
      const targetName = match[1];
      let expr = match[2].trim().replace(/[()]/g, ''); // Прибираємо дужки
      
      // Ігноруємо присвоєння типу "Output <= wire_5" для подальшої обробки
      // Але спочатку спробуємо розпарсити логіку
      
      let type = null;
      let ops = [];

      // Визначаємо оператор (VHDL case-insensitive)
      const exprLower = expr.toLowerCase();
      
      if (exprLower.includes(' and ')) {
         type = exprLower.startsWith('not ') ? 'NAND' : 'AND';
         ops = exprLower.split(' and ').map(s => s.trim());
      } else if (exprLower.includes(' or ')) {
         type = exprLower.startsWith('not ') ? 'NOR' : 'OR';
         ops = exprLower.split(' or ').map(s => s.trim());
      } else if (exprLower.includes(' xor ')) {
         type = 'XOR';
         ops = exprLower.split(' xor ').map(s => s.trim());
      } else if (exprLower.startsWith('not ')) {
         type = 'NOT';
         ops = [exprLower.replace('not ', '').trim()];
      } 
      
      // Якщо не знайшли логіку, це пряме з'єднання (Аліас) або Константа
      if (!type) {
         if (expr.includes("'1'")) {
             // Константа VCC
             // (Можна реалізувати, але поки пропустимо або зробимо аліас, якщо є джерело)
         } else if (expr.includes("'0'")) {
             // GND
         } else {
             // Alias: F <= wire_1;
             aliases.push({ target: targetName, source: expr });
         }
         continue;
      }

      // Чистимо імена входів (прибираємо not, якщо було "not A and not B")
      // У спрощеному парсері припускаємо просту структуру
      const cleanInputs = ops.map(op => op.replace(/not\s+/i, '').trim());

      const gateId = nanoid();
      nodes.push({
        id: gateId, type: 'logicGate', position: { x: 400 + (gateIndex % 3) * 250, y: 100 + (Math.floor(gateIndex / 3) * 150) },
        data: { type, inputs: cleanInputs.length, label: type }
      });
      signalMap.set(targetName, gateId);

      cleanInputs.forEach((inputName, idx) => {
          // VHDL case-insensitive, але імена змінних у нас чутливі. 
          // Спробуємо знайти оригінальне ім'я зі списку входів/сигналів
          // Тут ми просто беремо як є, сподіваючись на збіг.
          edges.push({ sourceName: inputName, target: gateId, targetHandle: `input-${idx}`, id: nanoid() });
      });
      gateIndex++;
  }

  // Обробка Аліасів
  aliases.forEach(alias => {
      // Шукаємо ID джерела (з врахуванням регістру, якщо треба, але поки прямо)
      // VHDL нечутливий до регістру, тому проходимось по ключах
      let sourceId = null;
      for (let [key, val] of signalMap.entries()) {
          if (key.toLowerCase() === alias.source.toLowerCase()) {
              sourceId = val;
              break;
          }
      }
      if (sourceId) signalMap.set(alias.target, sourceId);
  });

  // 3. OUTPUT NODES
  outputs.forEach((outName, idx) => {
      const outId = nanoid();
      nodes.push({ id: outId, type: 'outputNode', position: { x: 1200, y: 100 + (idx * 120) }, data: { label: outName, value: 0 } });
      edges.push({ sourceName: outName, target: outId, targetHandle: null, id: nanoid() });
  });

  // 4. EDGES
  const finalEdges = [];
  edges.forEach(edge => {
      let sourceId = null;
      // VHDL lookup
      for (let [key, val] of signalMap.entries()) {
          if (key.toLowerCase() === edge.sourceName.toLowerCase()) {
              sourceId = val;
              break;
          }
      }

      if (sourceId) {
          finalEdges.push({ id: edge.id, source: sourceId, target: edge.target, targetHandle: edge.targetHandle, type: 'smoothstep', style: { stroke: '#555', strokeWidth: 2 } });
      }
  });

  return { nodes, edges: finalEdges };
};