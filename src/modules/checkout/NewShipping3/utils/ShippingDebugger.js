/**
 * ShippingDebugger.js
 * 
 * Utilidad para depurar problemas con las opciones de envío
 * Muestra información detallada sobre direcciones, productos y reglas
 */

// Importar la función findBestShippingOptions desde el algoritmo Greedy
import { findBestShippingOptions } from '../../../shop/features/checkout/services/shipping/ShippingRulesGreedy';

// Reimplementación de isRuleValidForAddress para diagnóstico
const greedyIsRuleValidForAddress = (rule, address) => {
  if (!rule || !address) return { valid: false, reason: 'Falta regla o dirección' };
  
  // Normalizar datos para comparación
  const postalCode = (address.postalCode || address.zip || '').toString().trim();
  const state = (address.state || address.provincia || '').toString().toLowerCase().trim();
  const country = (address.country || 'MX').toString().toLowerCase().trim();
  
  // Añadir logs detallados para diagnóstico
  console.log(`🔍 DEBUG greedyIsRuleValidForAddress: Rule ID=${rule.id}, Coverage Type=${rule.coverage_type || rule.tipo_cobertura || 'undefined'}`);
  
  // Verificar tipo de cobertura
  switch(rule.coverage_type || rule.tipo_cobertura) {
    // Cobertura nacional
    case 'nacional':
      console.log(`✅ Regla ${rule.id} - Cobertura nacional, es válida automáticamente`);
      return { valid: true, reason: 'Cobertura nacional' };
    
    // Cobertura por código postal
    case 'por_codigo_postal':
    case 'postal_code':
      if (!Array.isArray(rule.coverage_values)) {
        console.log(`❌ Regla ${rule.id} - coverage_values no es un array`);
        return { valid: false, reason: 'coverage_values no es un array' };
      }
      
      const matchingCP = rule.coverage_values.find(cp => cp.toString().trim() === postalCode);
      if (matchingCP) {
        console.log(`✅ Regla ${rule.id} - CP coincidente: ${matchingCP}`);
        return { valid: true, reason: `Código postal coincidente: ${matchingCP}` };
      }
      console.log(`❌ Regla ${rule.id} - CP ${postalCode} no está en coverage_values: [${rule.coverage_values.join(', ')}]`);
      return { valid: false, reason: `Código postal ${postalCode} no está en coverage_values` };
    
    // Cobertura por estado/provincia
    case 'por_estado':
    case 'state':
      if (!Array.isArray(rule.coverage_values)) {
        console.log(`❌ Regla ${rule.id} - coverage_values no es un array para estado`);
        return { valid: false, reason: 'coverage_values no es un array' };
      }
      
      const matchingState = rule.coverage_values.find(s => s.toString().toLowerCase().trim() === state);
      if (matchingState) {
        console.log(`✅ Regla ${rule.id} - Estado coincidente: ${matchingState}`);
        return { valid: true, reason: `Estado coincidente: ${matchingState}` };
      }
      console.log(`❌ Regla ${rule.id} - Estado ${state} no está en coverage_values: [${rule.coverage_values.join(', ')}]`);
      return { valid: false, reason: `Estado ${state} no está en coverage_values` };
             
    // Cobertura por país
    case 'por_pais':
    case 'country':
      if (rule.coverage_country?.toLowerCase().trim() === country) {
        console.log(`✅ Regla ${rule.id} - País coincidente: ${rule.coverage_country}`);
        return { valid: true, reason: `País coincidente: ${rule.coverage_country}` };
      }
      console.log(`❌ Regla ${rule.id} - País ${country} no coincide con ${rule.coverage_country}`);
      return { valid: false, reason: `País ${country} no coincide con ${rule.coverage_country}` };
      
    default:
      // Sin tipo de cobertura definido
      if (!rule.coverage_type && !rule.tipo_cobertura) {
        console.log(`❌ Regla ${rule.id} - Sin tipo de cobertura definido`);
        return { valid: false, reason: 'Regla sin tipo de cobertura definido (coverage_type o tipo_cobertura)' };
      }
      console.log(`❌ Regla ${rule.id} - Tipo de cobertura desconocido: ${rule.coverage_type || rule.tipo_cobertura}`);
      return { valid: false, reason: `Tipo de cobertura desconocido: ${rule.coverage_type || rule.tipo_cobertura}` };
  }
  
  // Verificar campos alternativos (compatibilidad con esquema actual)
  if (Array.isArray(rule.cobertura_cp)) {
    const matchingCP = rule.cobertura_cp.find(cp => cp.toString().trim() === postalCode);
    if (matchingCP) {
      console.log(`✅ Regla ${rule.id} - CP coincidente en cobertura_cp: ${matchingCP}`);
      return { valid: true, reason: `Código postal coincidente en cobertura_cp: ${matchingCP}` };
    }
  }
  
  if (Array.isArray(rule.cobertura_estados)) {
    const matchingState = rule.cobertura_estados.find(s => s.toString().toLowerCase().trim() === state);
    if (matchingState) {
      console.log(`✅ Regla ${rule.id} - Estado coincidente en cobertura_estados: ${matchingState}`);
      return { valid: true, reason: `Estado coincidente en cobertura_estados: ${matchingState}` };
    }
  }
  
  console.log(`❌ Regla ${rule.id} - No se encontraron coincidencias en ningún campo`);
  return { valid: false, reason: 'No se encontraron coincidencias en ningún campo' };
};

// Función para convertir reglas al formato esperado por Greedy
const convertRuleToGreedyFormat = (rule, address) => {
  if (!rule) return null;
  
  const newRule = { ...rule };
  const postalCode = (address.postalCode || address.zip || '').toString().trim();
  const state = (address.state || address.provincia || '').toString().toLowerCase().trim();
  
  // Verificar si necesitamos asignar tipo de cobertura
  if (!newRule.coverage_type && !newRule.tipo_cobertura) {
    // Si tiene código postal específico
    if (rule.zipcode) {
      // Caso especial para prefijo estado_
      if (rule.zipcode.startsWith('estado_')) {
        newRule.coverage_type = 'por_estado';
        newRule.coverage_values = [state];
        newRule.cobertura_estados = [state];
      } else {
        newRule.coverage_type = 'por_codigo_postal';
        newRule.coverage_values = [rule.zipcode];
        newRule.cobertura_cp = [rule.zipcode];
      }
    }
    // Si tiene array de códigos postales
    else if (rule.zipcodes && Array.isArray(rule.zipcodes)) {
      newRule.coverage_type = 'por_codigo_postal';
      newRule.coverage_values = [...rule.zipcodes];
      newRule.cobertura_cp = [...rule.zipcodes];
    }
    // Si tiene zona
    else if (rule.zona) {
      // Para zona nacional o Local
      if (rule.zona === 'Nacional' || rule.zona === 'Local') {
        newRule.coverage_type = 'nacional';
      } else {
        // Asumir que zona es un estado
        newRule.coverage_type = 'por_estado';
        newRule.coverage_values = [rule.zona.toLowerCase()];
        newRule.cobertura_estados = [rule.zona.toLowerCase()];
      }
    }
  }
  
  return newRule;
};

/**
 * Función que imprime información detallada sobre el estado actual del checkout
 * @param {Object} address - Dirección seleccionada
 * @param {Array} cartItems - Productos en el carrito
 * @param {Array} shippingRules - Reglas de envío (opcional)
 */
export const debugShipping = (address, cartItems, shippingRules = null) => {
  console.group('🔍 DEPURACIÓN DE ENVÍO');
  
  // Información sobre la dirección
  console.group('📍 DIRECCIÓN SELECCIONADA');
  if (!address) {
    console.warn('⚠️ No hay dirección seleccionada');
  } else {
    console.log('ID:', address.id);
    console.log('Ciudad:', address.city);
    console.log('Estado/Provincia:', address.state || address.provincia);
    console.log('Código Postal:', address.postalCode || address.zip || address.zipcode);
    console.log('País:', address.country || 'México');
    console.log('Dirección completa:', address);
  }
  console.groupEnd();
  
  // Información sobre los productos
  console.group('🛒 PRODUCTOS EN CARRITO');
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    console.warn('⚠️ No hay productos en el carrito');
  } else {
    console.log(`Total de productos: ${cartItems.length}`);
    cartItems.forEach((item, index) => {
      const product = item.product || item;
      console.group(`Producto #${index + 1}: ${product.name || product.title || 'Sin nombre'}`);
      console.log('ID:', product.id);
      console.log('Peso:', product.weight || product.peso || 'No especificado');
      console.log('Cantidad:', item.quantity || 1);
      
      // Mostrar las reglas asignadas al producto
      if (product.shippingRuleId) {
        console.log('Regla de envío asignada:', product.shippingRuleId);
      }
      if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
        console.log('Reglas de envío asignadas:', product.shippingRuleIds);
      }
      
      console.log('Producto completo:', product);
      console.groupEnd();
    });
  }
  console.groupEnd();
  
  // Información sobre las reglas de envío (si están disponibles)
  console.group('📏 REGLAS DE ENVÍO');
  if (!shippingRules) {
    console.log('⚠️ Reglas no proporcionadas en la depuración');
  } else if (!Array.isArray(shippingRules) || shippingRules.length === 0) {
    console.warn('⚠️ No hay reglas de envío disponibles');
  } else {
    console.log(`Total de reglas: ${shippingRules.length}`);
    shippingRules.forEach((rule, index) => {
      console.group(`Regla #${index + 1}: ${rule.nombre || rule.name || 'Sin nombre'}`);
      console.log(`ID: ${rule.id}`);
      console.log(`Activa: ${rule.activo || rule.active ? 'Sí' : 'No'}`);
      console.log(`Zonas: ${rule.zones?.length || 0}`);
      
      // Mostrar el campo zona claramente
      console.log(`Nombre de zona: ${rule.zona || 'No definido'}`);
      
      // Añadir información sobre tiempos de entrega
      console.log(`Tiempo mínimo: ${rule.tiempo_minimo || rule.min_days || 'No definido'}`);
      console.log(`Tiempo máximo: ${rule.tiempo_maximo || rule.max_days || 'No definido'}`);
      
      if (rule.zipcode) {
        console.log(`Código postal específico: ${rule.zipcode}`);
      }
      
      if (rule.zipcodes && Array.isArray(rule.zipcodes)) {
        console.log('Códigos postales:', rule.zipcodes);
      }
      
      if (rule.zones?.length) {
        console.log('Primera zona:', rule.zones[0]);
      }
      console.log('Regla completa:', rule);
      console.groupEnd();
    });
  }
  console.groupEnd();
  
  // Verificación de compatibilidad de envío
  console.group('🧪 VERIFICACIÓN DE COMPATIBILIDAD');
  
  if (!address) {
    console.warn('⚠️ No se puede verificar sin dirección');
  } else if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    console.warn('⚠️ No se puede verificar sin productos');
  } else if (!shippingRules || !Array.isArray(shippingRules) || shippingRules.length === 0) {
    console.warn('⚠️ No se puede verificar sin reglas de envío');
  } else {
    // Verificar código postal
    const postalCode = address.postalCode || address.zip || address.zipcode || '';
    if (!postalCode) {
      console.warn('⚠️ La dirección no tiene código postal');
    } else {
      console.log('✅ Código postal presente:', postalCode);
      
      // Verificar si alguna regla aplica para este código postal
      let matchFound = false;
      
      shippingRules.forEach(rule => {
        // Primera verificación: código postal directo
        if (rule.zipcode === postalCode) {
          matchFound = true;
          console.log(`✅ Regla ${rule.id} aplica por código postal exacto:`, postalCode);
        }
        
        // Segunda verificación: prefijo estado_
        if (rule.zipcode === `estado_${address.state?.substring(0, 3).toUpperCase()}`) {
          matchFound = true;
          console.log(`✅ Regla ${rule.id} aplica por prefijo estado:`, rule.zipcode);
        }
        
        // Tercera verificación: array de zipcodes
        if (rule.zipcodes && Array.isArray(rule.zipcodes) && rule.zipcodes.includes(postalCode)) {
          matchFound = true;
          console.log(`✅ Regla ${rule.id} aplica por array de códigos postales`);
        }
        
        // Cuarta verificación: zona = estado
        if (rule.zona && rule.zona.toLowerCase() === address.state?.toLowerCase()) {
          matchFound = true;
          console.log(`✅ Regla ${rule.id} aplica por zona (${rule.zona}) = estado (${address.state})`);
        }
        
        // Quinta verificación: zona "Local"
        if (rule.zona === 'Local') {
          matchFound = true;
          console.log(`✅ Regla ${rule.id} aplica por zona Local`);
        }
        
        const matchingZone = rule.zones?.find(zone => {
          // Verificar si el código postal está en el rango
          if (zone.zipCodes) {
            return zone.zipCodes.some(zipRange => {
              if (typeof zipRange === 'string' && zipRange.includes('-')) {
                const [start, end] = zipRange.split('-').map(z => parseInt(z.trim(), 10));
                const zip = parseInt(postalCode, 10);
                return zip >= start && zip <= end;
              }
              return zipRange === postalCode;
            });
          }
          
          // Verificar por estado/provincia
          if (zone.states && address.state) {
            return zone.states.some(state => 
              state.toLowerCase() === address.state.toLowerCase());
          }
          
          return false;
        });
        
        if (matchingZone) {
          matchFound = true;
          console.log('✅ Zona de envío encontrada:', matchingZone);
        }
      });
      
      if (!matchFound) {
        console.warn('⚠️ No se encontró ninguna zona de envío para este código postal/estado');
      }
    }
    
    // Verificar peso de productos
    const hasWeightInfo = cartItems.every(item => {
      const product = item.product || item;
      return product.weight || product.peso;
    });
    
    if (!hasWeightInfo) {
      console.warn('⚠️ Algunos productos no tienen información de peso');
    } else {
      console.log('✅ Todos los productos tienen información de peso');
    }
  }
  console.groupEnd();
  
  // DIAGNÓSTICO AVANZADO: Verificación profunda del algoritmo Greedy
  console.group('🔬 DIAGNÓSTICO AVANZADO (ALGORITMO GREEDY)');
  
  if (!address || !cartItems || !shippingRules) {
    console.warn('⚠️ No se puede realizar diagnóstico avanzado sin dirección, productos y reglas');
  } else {
    // Comprobar validación de reglas según el algoritmo Greedy
    console.group('1. Validación de reglas según formato Greedy:');
    
    const validRules = [];
    const invalidRules = [];
    
    shippingRules.forEach(rule => {
      const result = greedyIsRuleValidForAddress(rule, address);
      
      if (result.valid) {
        validRules.push(rule);
        console.log(`✅ Regla ${rule.id || 'sin ID'} (${rule.name || 'sin nombre'}): VÁLIDA - ${result.reason}`);
      } else {
        invalidRules.push({ rule, reason: result.reason });
        console.log(`❌ Regla ${rule.id || 'sin ID'} (${rule.name || 'sin nombre'}): INVÁLIDA - ${result.reason}`);
      }
    });
    
    console.log(`Resumen: ${validRules.length} reglas válidas, ${invalidRules.length} reglas inválidas`);
    
    if (invalidRules.length > 0) {
      console.group('Problemas encontrados en reglas:');
      
      const commonProblems = {
        noCoverageType: 0,
        noValues: 0,
        wrongFormat: 0
      };
      
      invalidRules.forEach(({ rule, reason }) => {
        if (reason.includes('tipo de cobertura')) {
          commonProblems.noCoverageType++;
        } else if (reason.includes('no es un array') || reason.includes('coverage_values')) {
          commonProblems.noValues++;
        } else if (reason.includes('No se encontraron coincidencias')) {
          commonProblems.wrongFormat++;
        }
      });
      
      console.log('Problemas frecuentes:');
      console.log(`- Reglas sin tipo de cobertura: ${commonProblems.noCoverageType}`);
      console.log(`- Reglas sin valores de cobertura: ${commonProblems.noValues}`);
      console.log(`- Reglas con formato incorrecto: ${commonProblems.wrongFormat}`);
      
      console.groupEnd();
    }
    
    console.groupEnd();
    
    // Verificar si alguna regla válida está asignada a productos
    console.group('2. Verificación de asignación de reglas a productos:');
    
    if (validRules.length === 0) {
      console.error('❌ No hay reglas válidas para esta dirección - NO se podrá calcular envío');
    } else {
      // Obtener los IDs de las reglas válidas
      const validRuleIds = validRules.map(rule => rule.id);
      
      // Verificar si cada producto tiene al menos una regla válida
      const productsWithValidRules = [];
      const productsWithoutValidRules = [];
      
      cartItems.forEach(item => {
        const product = item.product || item;
        const productRuleIds = [];
        
        if (product.shippingRuleId) {
          productRuleIds.push(product.shippingRuleId);
        }
        
        if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
          productRuleIds.push(...product.shippingRuleIds);
        }
        
        // Verificar si alguna de las reglas del producto es válida
        const hasValidRule = productRuleIds.some(ruleId => validRuleIds.includes(ruleId));
        
        if (hasValidRule) {
          productsWithValidRules.push(product);
        } else {
          productsWithoutValidRules.push(product);
        }
      });
      
      console.log(`✅ Productos con reglas válidas: ${productsWithValidRules.length}`);
      console.log(`❌ Productos sin reglas válidas: ${productsWithoutValidRules.length}`);
      
      if (productsWithoutValidRules.length > 0) {
        console.error('❌ Hay productos sin reglas válidas - NO se podrá calcular envío para todo el carrito');
        console.group('Productos sin reglas válidas:');
        
        productsWithoutValidRules.forEach(product => {
          console.log(`- ${product.name || product.title || product.id}`);
          console.log('  Reglas asignadas:', product.shippingRuleIds || product.shippingRuleId || 'ninguna');
        });
        
        console.groupEnd();
      }
    }
    
    console.groupEnd();
    
    // Solución propuesta: Convertir reglas al formato esperado por Greedy
    console.group('3. Solución propuesta: Convertir reglas al formato Greedy');
    
    // Ejemplos de reglas problemáticas y su solución
    const problemRules = invalidRules.slice(0, 3); // Tomar hasta 3 reglas problemáticas como ejemplo
    
    if (problemRules.length > 0) {
      problemRules.forEach(({ rule }) => {
        console.group(`Regla problemática: ${rule.id || 'sin ID'}`);
        
        console.log('Formato original:');
        console.log(JSON.stringify({
          id: rule.id,
          coverage_type: rule.coverage_type,
          tipo_cobertura: rule.tipo_cobertura,
          coverage_values: rule.coverage_values,
          zipcode: rule.zipcode,
          zona: rule.zona,
          zipcodes: rule.zipcodes
        }, null, 2));
        
        const fixedRule = convertRuleToGreedyFormat(rule, address);
        
        console.log('Formato corregido:');
        console.log(JSON.stringify({
          id: fixedRule.id,
          coverage_type: fixedRule.coverage_type,
          coverage_values: fixedRule.coverage_values,
          cobertura_cp: fixedRule.cobertura_cp,
          cobertura_estados: fixedRule.cobertura_estados
        }, null, 2));
        
        const validationResult = greedyIsRuleValidForAddress(fixedRule, address);
        console.log(`Resultado de validación: ${validationResult.valid ? '✅ VÁLIDA' : '❌ INVÁLIDA'} - ${validationResult.reason}`);
        
        console.groupEnd();
      });
      
      console.log('📝 Conclusión: Es necesario convertir las reglas al formato esperado por el algoritmo Greedy');
      console.log('Esto implica transformar campos como zipcode y zona a coverage_type y coverage_values');
    } else {
      console.log('No hay ejemplos de reglas problemáticas para mostrar');
    }
    
    console.groupEnd();
  }
  
  console.groupEnd();
  console.groupEnd();
};

/**
 * Función para ser usada en componentes React
 * Se integra con useEffect para mostrar la información cuando cambia la dirección
 * @param {Object} params - Parámetros del hook
 * @param {Object} params.address - Dirección seleccionada
 * @param {Array} params.cartItems - Productos en el carrito
 * @param {Array} params.shippingRules - Reglas de envío (opcional)
 */
export const useShippingDebugger = ({ address, cartItems, shippingRules }) => {
  if (process.env.NODE_ENV !== 'production') {
    debugShipping(address, cartItems, shippingRules);
  }
};

export default debugShipping; 