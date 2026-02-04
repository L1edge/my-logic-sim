// МАСКА (8 біт)
const BIT_MASK = 0xFF; 

export const evaluateCircuit = (nodes, edges) => {
  const values = {};
  
  // 1. Ініціалізація: ВСІ вузли спочатку NULL (плаваючий стан/обрив)
  nodes.forEach(node => {
    values[node.id] = null;
  });

  // 2. Заповнюємо джерела (Input та Constant)
  nodes.forEach(node => {
    if (node.type === 'inputNode' || node.type === 'constantNode') {
      // Якщо value визначено, записуємо його. Якщо ні - null.
      // Важливо: 0 - це валідне значення!
      if (node.data.value !== undefined && node.data.value !== null) {
        values[node.id] = Number(node.data.value) & BIT_MASK;
      }
    }
  });

  const maxIterations = nodes.length + 1; 
  
  for (let i = 0; i < maxIterations; i++) {
    let changed = false;

    nodes.forEach(node => {
      if (node.type === 'logicGate') {
        const inputEdges = edges.filter(e => e.target === node.id);
        const inputCount = node.data.inputs || 2;
        
        // Збираємо значення. Якщо хоч один вхід NULL (обрив), результат може бути ненадійним.
        // Для симулятора: якщо дріт не підключений, вважаємо його 0, АЛЕ...
        // Щоб було гарно, ми перевіряємо, чи підключені дроти.
        
        const inputValues = [];
        let isConnected = true; // Чи всі потрібні порти підключені?

        for (let j = 0; j < inputCount; j++) {
          const edge = inputEdges.find(e => e.targetHandle === `input-${j}`);
          if (edge && values[edge.source] !== null) {
            inputValues.push(values[edge.source]);
          } else {
            // Якщо пін висить у повітрі, в реальності це "антена", тут вважаємо 0, 
            // але результат операції буде "валідним" 0.
            inputValues.push(0); 
            // isConnected = false; // Можна розкоментувати, якщо хочеш щоб гейт "гас" при обриві
          }
        }

        let result = 0;
        const type = node.data.type;
        const firstVal = inputValues[0];

        // Логіка
        if (type === 'NOT') {
          let bits = firstVal.toString(2).length || 1;
          let mask = (1 << bits) - 1;
          result = (~firstVal) & mask;
        } else {
          let acc = firstVal;
          for (let k = 1; k < inputValues.length; k++) {
            const val = inputValues[k];
            switch (type) {
              case 'AND': case 'NAND': acc = acc & val; break;
              case 'OR':  acc = acc | val; break;
              case 'XOR': acc = acc ^ val; break;
              default: break;
            }
          }
          result = acc;

          if (type === 'NAND') {
             let bits = result.toString(2).length || 1;
             let mask = (1 << bits) - 1;
             result = (~result) & mask;
          }
        }

        // Записуємо результат. Тепер це точно число (навіть 0), а не null.
        if (values[node.id] !== result) {
          values[node.id] = result;
          changed = true;
        }
      } 
      
      else if (node.type === 'outputNode') {
        const inputEdge = edges.find(e => e.target === node.id);
        if (inputEdge && values[inputEdge.source] !== null) {
          const sourceVal = values[inputEdge.source];
          if (values[node.id] !== sourceVal) {
            values[node.id] = sourceVal;
            changed = true;
          }
        } else {
          // Якщо обрив - ставимо null (або 0, але null дозволить погасити дисплей)
          if (values[node.id] !== 0) {
            values[node.id] = 0;
            changed = true;
          }
        }
      }
    });

    if (!changed) break; 
  }

  // Оновлення нодів
  const updatedNodes = nodes.map(node => ({
    ...node,
    data: { ...node.data, value: values[node.id] }
  }));

  // === ОНОВЛЕННЯ ДРОТІВ (НОВА ЛОГІКА КОЛЬОРІВ) ===
  const updatedEdges = edges.map(edge => {
    const sourceVal = values[edge.source];
    
    // Перевіряємо стани
    const isFloating = sourceVal === null;
    const isHigh = sourceVal > 0;
    const isLow = sourceVal === 0; // Це тепер АКТИВНИЙ стан!

    let strokeColor = '#555'; // За замовчуванням (Floating/Null) - сірий
    let strokeWidth = 2;

    if (isHigh) {
      strokeColor = '#22c55e'; // Зелений (1)
      strokeWidth = 3;
    } else if (isLow) {
      strokeColor = '#ef4444'; // Червоний (0) - АКТИВНИЙ НУЛЬ
      strokeWidth = 3;         // Такий же товстий, як і High
    }

    return {
      ...edge,
      animated: isHigh, // Анімація біжить тільки для 1 (струм тече)
      style: { 
        stroke: strokeColor, 
        strokeWidth: strokeWidth
      },
    };
  });

  return { updatedNodes, updatedEdges };
};