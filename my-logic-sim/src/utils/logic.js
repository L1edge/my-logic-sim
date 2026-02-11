// Допоміжна функція: дістає значення з правильного піну
const getWireValue = (edge, values) => {
  if (!edge) return null;
  let val = values[edge.source];
  if (val === null || val === undefined) return null;
  
  // Якщо джерело - це наш кастомний модуль, його value це об'єкт { S: 25, Cout: 1 }
  if (typeof val === 'object' && edge.sourceHandle) {
    const pinName = edge.sourceHandle.replace('output-', '');
    val = val[pinName];
  }
  return val === undefined ? null : val;
};

export const evaluateCircuit = (nodes, edges, customModules = {}) => { // <--- ДОДАЛИ ТРЕТІЙ АРГУМЕНТ
  const values = {};

  nodes.forEach(node => { values[node.id] = null; });

  nodes.forEach(node => {
    if (node.type === 'inputNode' || node.type === 'constantNode') {
      if (node.data.value !== undefined && node.data.value !== null) {
        values[node.id] = Number(node.data.value) >>> 0; 
      }
    }
  });

  const maxIterations = nodes.length + 1; 

  for (let i = 0; i < maxIterations; i++) {
    let changed = false;

    nodes.forEach(node => {
      
      // === 1. ЗВИЧАЙНІ ГЕЙТИ ===
      if (node.type === 'logicGate') {
        const inputEdges = edges.filter(e => e.target === node.id);
        const inputCount = node.data.inputs || 2;
        const inputValues = [];
        
        for (let j = 0; j < inputCount; j++) {
          const edge = inputEdges.find(e => e.targetHandle === `input-${j}`);
          const val = getWireValue(edge, values);
          inputValues.push(val !== null ? val : 0);
        }

        let result = 0;
        const type = node.data.type;
        const firstVal = inputValues[0];
        const bitLen = firstVal === 0 ? 1 : firstVal.toString(2).length;
        const mask = (Math.pow(2, bitLen) - 1) >>> 0;

        if (type === 'NOT') {
          result = (~firstVal & mask) >>> 0;
        } else {
          let acc = firstVal;
          for (let k = 1; k < inputValues.length; k++) {
            const val = inputValues[k];
            switch (type) {
              case 'AND': case 'NAND': acc = acc & val; break;
              case 'OR':  case 'NOR':  acc = acc | val; break;
              case 'XOR': acc = acc ^ val; break;
              default: break;
            }
          }
          result = acc >>> 0;

          if (type === 'NAND' || type === 'NOR') {
             const resLen = result === 0 ? 1 : result.toString(2).length;
             const finalLen = Math.max(bitLen, resLen); 
             const finalMask = (Math.pow(2, finalLen) - 1) >>> 0;
             result = (~result & finalMask) >>> 0;
          }
        }

        if (values[node.id] !== result) {
          values[node.id] = result;
          changed = true;
        }
      } 
      
      // === 2. НАШІ КАСТОМНІ СКРИПТОВІ МОДУЛІ (МАГІЯ ТУТ) ===
      else if (node.type === 'customScriptNode') {
         const mod = customModules[node.data.moduleId];
         if (!mod) return; // Якщо модуль видалили з пам'яті
         
         // 1. Збираємо значення на входах
         const inputValues = {};
         mod.inputs.forEach((inName, idx) => {
             const edge = edges.find(e => e.target === node.id && e.targetHandle === `input-${idx}`);
             const val = getWireValue(edge, values);
             inputValues[inName] = val !== null ? val : 0;
         });
         
         const outputValues = {};
         
         // 2. ВАЖЛИВО: ВИКОНУЄМО КОД
         try {
             const func = new Function('inputs', 'outputs', mod.code);
             func(inputValues, outputValues);
         } catch (err) {
             console.error(`Error in Custom Module "${mod.name}":`, err);
         }
         
         // 3. Записуємо результат в об'єкт
         const prevValue = values[node.id] || {};
         const newValue = {};
         let changedThisNode = false;
         
         mod.outputs.forEach(outName => {
             let res = outputValues[outName];
             if (res === undefined || res === null || isNaN(res)) res = 0; // Захист від битого коду
             newValue[outName] = res >>> 0;
             if (newValue[outName] !== prevValue[outName]) changedThisNode = true;
         });
         
         if (changedThisNode) {
             values[node.id] = newValue;
             changed = true;
         }
      }

      // === 3. ДИСПЛЕЇ (OUTPUT NODE) ===
      else if (node.type === 'outputNode') {
        const edge = edges.find(e => e.target === node.id);
        const val = getWireValue(edge, values);
        
        if (val !== null) {
          const sourceVal = val >>> 0;
          if (values[node.id] !== sourceVal) {
            values[node.id] = sourceVal;
            changed = true;
          }
        } else {
          if (values[node.id] !== 0) {
            values[node.id] = 0;
            changed = true;
          }
        }
      }
    });

    if (!changed) break; 
  }

  const updatedNodes = nodes.map(node => ({ ...node, data: { ...node.data, value: values[node.id] } }));

  const updatedEdges = edges.map(edge => {
    const sourceVal = getWireValue(edge, values);
    const isHigh = sourceVal > 0;
    const isLow = sourceVal === 0;

    let strokeColor = '#555'; 
    let strokeWidth = 2;

    if (isHigh) { strokeColor = '#22c55e'; strokeWidth = 3; } 
    else if (isLow) { strokeColor = '#ef4444'; strokeWidth = 3; }

    return { ...edge, animated: isHigh, style: { stroke: strokeColor, strokeWidth: strokeWidth } };
  });

  return { updatedNodes, updatedEdges };
};