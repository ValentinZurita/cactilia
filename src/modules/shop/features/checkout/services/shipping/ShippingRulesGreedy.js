/**
 * Implementación Greedy del algoritmo de cálculo de envío
 * 
 * Este algoritmo usa un enfoque "codicioso" (greedy) para asignar productos 
 * a reglas de envío, priorizando por especificidad y costo, sin generar
 * todas las combinaciones posibles.
 */

import { coverageMatches } from './ShippingRulesEngine';

/**
 * Evalúa la especificidad de una regla de envío
 * @param {Object} rule - La regla de envío
 * @returns {number} - Puntuación de especificidad (mayor = más específica)
 */
const evaluateSpecificity = (rule) => {
  // Las reglas más específicas tienen mayor puntuación
  if (rule.coverage_type === 'por_codigo_postal') return 100;
  if (rule.coverage_type === 'por_estado') return 50;
  if (rule.coverage_type === 'nacional') return 10;
  
  // También evaluar tipos alternativos de cobertura
  if (rule.cobertura_cp && Array.isArray(rule.cobertura_cp)) return 90;
  if (rule.cobertura_estados && Array.isArray(rule.cobertura_estados)) return 40;
  
  // Si no podemos determinar bien, asumimos baja especificidad
  return 5;
};

/**
 * Estima el costo base de una regla
 * @param {Object} rule - La regla de envío
 * @returns {number} - Costo estimado
 */
const estimateBaseCost = (rule) => {
  // Si tiene envío gratuito incondicional, costo es cero
  if (rule.envio_gratis === true) return 0;
  
  // Tratar de obtener el precio base de la primera opción de mensajería
  if (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0) {
    const firstOption = rule.opciones_mensajeria[0];
    return parseFloat(firstOption.precio || 0);
  }
  
  // Si tiene precio base directo
  if (typeof rule.precio_base === 'number') return rule.precio_base;
  
  // Valor por defecto para comparar
  return 1000; // Alto para que se prefieran otras opciones
};

/**
 * Verifica si un producto puede ser añadido a un grupo existente
 * @param {Object} group - Grupo de productos existente
 * @param {Object} item - Item a añadir
 * @returns {boolean} - True si el item puede ser añadido
 */
const canAddToGroup = (group, item) => {
  const rule = group.rule;
  
  // Verificar límite de productos por paquete
  const maxProducts = rule.maximo_productos_por_paquete || Number.MAX_SAFE_INTEGER;
  if (group.products.length >= maxProducts) {
    console.log(`No se puede añadir: excede límite de productos (${group.products.length} >= ${maxProducts})`);
    return false;
  }
  
  // Verificar límite de peso por paquete
  const maxWeight = rule.peso_maximo_paquete || Number.MAX_SAFE_INTEGER;
  if (maxWeight < Number.MAX_SAFE_INTEGER) {
    // Calcular peso actual del grupo
    const currentWeight = group.products.reduce((sum, prod) => {
      const product = prod.product || prod;
      const weight = parseFloat(product.weight || product.peso || 0);
      const quantity = parseInt(prod.quantity || 1);
      return sum + (weight * quantity);
    }, 0);
    
    // Calcular peso del nuevo item
    const product = item.product || item;
    const itemWeight = parseFloat(product.weight || product.peso || 0) * parseInt(item.quantity || 1);
    
    console.log(`Evaluando producto: ${product.name || product.id} con peso: ${itemWeight}kg para grupo con peso actual: ${currentWeight}kg (max: ${maxWeight}kg)`);
    
    // Verificar si excede el límite
    if (currentWeight + itemWeight > maxWeight) {
      console.log(`No se puede añadir: excede límite de peso (${currentWeight + itemWeight} > ${maxWeight})`);
      return false;
    }
    
    // Si el producto es ligero (menos de 1kg) y hay espacio, priorizamos agruparlo
    if (itemWeight < 1.0 && (currentWeight + itemWeight <= maxWeight * 0.9)) {
      console.log(`✅ Producto ligero (${itemWeight}kg) agrupado para optimizar envío`);
      return true;
    }
  }
  
  // Verificar si los productos son compatibles (misma categoría, mismo vendedor, etc.)
  // Esto se podría extender con más lógica de compatibilidad
  
  // Si todos los checks pasan, se puede añadir
  return true;
};

/**
 * Calcula el costo de envío para un grupo usando una regla
 * @param {Object} rule - Regla de envío
 * @param {Array} products - Productos en el grupo
 * @returns {Object} - Información del costo y opciones adicionales
 */
const calculateGroupCost = (rule, products) => {
  let baseCost = estimateBaseCost(rule);
  let isFree = rule.envio_gratis === true;
  let freeShippingReason = '';
  
  // Calcular subtotal para verificar envío gratuito por monto mínimo
  const subtotal = products.reduce((sum, item) => {
    const product = item.product || item;
    const price = parseFloat(product.price || product.precio || 0);
    const quantity = parseInt(item.quantity || 1);
    return sum + (price * quantity);
  }, 0);
  
  // Verificar envío gratis por monto mínimo
  const freeShippingMinAmount = parseFloat(rule.envio_gratis_monto_minimo || 0);
  if (!isFree && freeShippingMinAmount > 0 && subtotal >= freeShippingMinAmount) {
    isFree = true;
    freeShippingReason = `Envío gratuito para compras mayores a $${freeShippingMinAmount}`;
  }
  
  // Si es gratuito, el costo es cero
  if (isFree) {
    baseCost = 0;
  } else {
    // Calcular costo por productos extra si aplica
    const extraProductCost = rule.costo_por_producto_extra || 0;
    if (extraProductCost > 0 && products.length > 1) {
      const extraProducts = products.length - 1; // El primero ya está en el costo base
      baseCost += extraProducts * extraProductCost;
    }
    
    // Verificar si hay costos adicionales por peso
    if (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0) {
      const option = rule.opciones_mensajeria[0];
      if (option.configuracion_paquetes?.costo_por_kg_extra && option.peso_base) {
        const totalWeight = products.reduce((sum, item) => {
          const product = item.product || item;
          const weight = parseFloat(product.weight || product.peso || 0);
          const quantity = parseInt(item.quantity || 1);
          return sum + (weight * quantity);
        }, 0);
        
        console.log(`Calculando costo por peso: Peso total ${totalWeight}kg, Peso base ${option.peso_base}kg, Costo por kg extra $${option.configuracion_paquetes.costo_por_kg_extra}`);
        
        const extraWeight = Math.max(0, totalWeight - parseFloat(option.peso_base));
        if (extraWeight > 0) {
          const extraWeightCost = extraWeight * parseFloat(option.configuracion_paquetes.costo_por_kg_extra);
          baseCost += extraWeightCost;
          console.log(`💰 Costo adicional por ${extraWeight.toFixed(2)}kg extra: $${extraWeightCost.toFixed(2)}`);
        }
      }
    }
  }
  
  // Encontrar información de entrega
  let minDays = 3, maxDays = 7;
  if (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0) {
    const option = rule.opciones_mensajeria[0];
    minDays = option.minDays || 3;
    maxDays = option.maxDays || 7;
  }
  
  // Información de pesos y productos para incluir en los detalles
  const productsInfo = products.map(item => {
    const product = item.product || item;
    return {
      id: product.id,
      name: product.name || product.title || `Producto #${product.id}`,
      weight: parseFloat(product.weight || product.peso || 0),
      quantity: parseInt(item.quantity || 1)
    };
  });
  
  const totalWeight = productsInfo.reduce((sum, p) => sum + (p.weight * p.quantity), 0);
  
  return {
    cost: baseCost,
    isFree,
    freeReason: freeShippingReason,
    option: rule.opciones_mensajeria?.[0] || {},
    minDays,
    maxDays,
    products: productsInfo,
    totalWeight,
    totalProducts: products.length
  };
};

/**
 * Implementación del algoritmo Greedy para cálculo de envío
 * @param {Array} cartItems - Items en el carrito
 * @param {Object} address - Dirección del usuario
 * @param {Object} allRules - Mapa de reglas de envío (id -> regla)
 * @returns {Object} - Resultado con opciones de envío
 */
export const findBestShippingOptionsGreedy = (cartItems, address, allRules) => {
  if (!cartItems || !address || !allRules) {
    return { success: false, error: 'Datos insuficientes' };
  }
  
  // Convertir reglas a map para acceso rápido si es un array
  const rulesMap = {};
  if (Array.isArray(allRules)) {
    allRules.forEach(rule => {
      rulesMap[rule.id] = rule;
    });
  } else {
    Object.assign(rulesMap, allRules);
  }
  
  // 1. Filtrar reglas válidas para cada producto
  const productRules = {};
  
  cartItems.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    
    // Obtener IDs de reglas asignadas al producto
    const assignedRuleIds = product.shippingRuleIds || [];
    if (!assignedRuleIds.length) {
      console.warn(`Producto ${productId} sin reglas de envío`);
      return;
    }
    
    // Filtrar solo las reglas que aplican a esta dirección
    const validRules = [];
    
    assignedRuleIds.forEach(ruleId => {
      const rule = rulesMap[ruleId];
      if (!rule) {
        console.warn(`Regla ${ruleId} no encontrada`);
        return;
      }
      
      // Verificar si la regla cubre esta dirección
      if (coverageMatches(rule, address)) {
        // Calcular especificidad y costo base para ordenamiento
        const specificity = evaluateSpecificity(rule);
        const baseCost = estimateBaseCost(rule);
        
        validRules.push({
          id: ruleId,
          rule,
          specificity,
          baseCost,
          // Puntaje combinado: alta especificidad y bajo costo es mejor
          score: specificity - (baseCost * 0.01)
        });
      }
    });
    
    // Guardar reglas válidas ordenadas por score (mayor primero)
    productRules[productId] = validRules.sort((a, b) => b.score - a.score);
  });
  
  // Verificar si algún producto no tiene reglas válidas
  const productsWithoutRules = Object.keys(productRules).filter(
    productId => !productRules[productId] || productRules[productId].length === 0
  );
  
  if (productsWithoutRules.length > 0) {
    return {
      success: false,
      error: 'Algunos productos no pueden enviarse a esta dirección',
      affectedProducts: productsWithoutRules
    };
  }
  
  // Calcular el peso total de todos los productos para análisis
  const totalCartWeight = cartItems.reduce((sum, item) => {
    const product = item.product || item;
    const weight = parseFloat(product.weight || product.peso || 0);
    const quantity = parseInt(item.quantity || 1);
    return sum + (weight * quantity);
  }, 0);
  
  console.log(`📦 Peso total del carrito: ${totalCartWeight.toFixed(2)}kg`);
  
  // Procesar cada producto uno a uno, empezando por los más pesados
  // para optimizar el empaquetado (bin packing greedy approach)
  const sortedItems = [...cartItems].sort((a, b) => {
    const productA = a.product || a;
    const productB = b.product || b;
    const weightA = parseFloat(productA.weight || productA.peso || 0);
    const weightB = parseFloat(productB.weight || productB.peso || 0);
    return weightB - weightA; // Ordenar de mayor a menor peso
  });
  
  console.log('Productos ordenados por peso (mayor a menor):');
  sortedItems.forEach(item => {
    const product = item.product || item;
    console.log(`- ${product.name || product.id}: ${parseFloat(product.weight || product.peso || 0).toFixed(2)}kg`);
  });
  
  // Pre-procesamiento: Agrupar productos ligeros del mismo tipo juntos
  const lightProducts = sortedItems.filter(item => {
    const product = item.product || item;
    return parseFloat(product.weight || product.peso || 0) < 0.5;
  });
  
  // 2. Asignar productos a grupos (enfoque greedy)
  const groups = [];
  const processedIds = new Set();
  
  // Primero procesar productos pesados (≥ 0.5kg)
  sortedItems.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    
    // Saltar si ya fue procesado
    if (processedIds.has(productId)) return;
    
    const productWeight = parseFloat(product.weight || product.peso || 0);
    
    // Saltar productos ligeros en esta primera fase
    if (productWeight < 0.5) return;
    
    console.log(`Procesando producto pesado: ${product.name || productId} (${productWeight.toFixed(2)}kg)`);
    
    // Obtener reglas ordenadas para este producto
    const validRules = productRules[productId] || [];
    if (validRules.length === 0) return;
    
    let assigned = false;
    
    // Intentar primero asignar a grupos existentes con la misma regla
    for (const ruleInfo of validRules) {
      // Primero intentar con grupos existentes 
      const matchingGroups = groups.filter(group => group.rule.id === ruleInfo.rule.id);
      
      // Verificar si algún grupo tiene espacio para este producto
      for (const group of matchingGroups) {
        if (canAddToGroup(group, item)) {
          group.products.push(item);
          processedIds.add(productId);
          console.log(`✅ Producto pesado añadido al grupo existente con regla ${group.rule.id}`);
          assigned = true;
          break;
        }
      }
      
      // Si se asignó, no seguir buscando
      if (assigned) break;
      
      // Si no se pudo asignar a un grupo existente, crear uno nuevo
      if (!assigned) {
        // Si hay límite de peso y el producto no excede
        const rule = ruleInfo.rule;
        const maxWeight = rule.peso_maximo_paquete || Number.MAX_SAFE_INTEGER;
        
        if (productWeight <= maxWeight) {
          groups.push({
            rule: ruleInfo.rule,
            products: [item]
          });
          processedIds.add(productId);
          console.log(`🆕 Creado nuevo grupo con regla ${ruleInfo.rule.id} para producto pesado`);
          assigned = true;
          break;
        } else {
          console.log(`⚠️ El producto excede el peso máximo permitido: ${productWeight.toFixed(2)}kg > ${maxWeight}kg`);
        }
      }
    }
    
    // Si aún no se ha asignado (lo que no debería ocurrir), usar la primera regla disponible
    if (!assigned && validRules.length > 0) {
      groups.push({
        rule: validRules[0].rule,
        products: [item]
      });
      processedIds.add(productId);
      console.log(`⚠️ Asignación forzada a regla ${validRules[0].rule.id}`);
    }
  });
  
  // Ahora procesar productos ligeros, intentando empaquetar juntos
  sortedItems.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    
    // Saltar si ya fue procesado
    if (processedIds.has(productId)) return;
    
    const productWeight = parseFloat(product.weight || product.peso || 0);
    
    // Solo procesar productos ligeros en esta fase
    if (productWeight >= 0.5) return;
    
    console.log(`Procesando producto ligero: ${product.name || productId} (${productWeight.toFixed(2)}kg)`);
    
    // Obtener reglas ordenadas para este producto
    const validRules = productRules[productId] || [];
    if (validRules.length === 0) return;
    
    let assigned = false;
    
    // Intentar primero asignar a grupos existentes con la misma regla
    // Priorizando grupos con productos ligeros
    for (const ruleInfo of validRules) {
      // Primero intentar con grupos existentes con productos ligeros
      const matchingGroups = groups.filter(group => 
        group.rule.id === ruleInfo.rule.id &&
        group.products.some(p => {
          const prod = p.product || p;
          return parseFloat(prod.weight || prod.peso || 0) < 0.5;
        })
      );
      
      // Ordenar grupos por espacio disponible (más espacio primero)
      const sortedGroups = [...matchingGroups].sort((a, b) => {
        const ruleA = a.rule;
        const ruleB = b.rule;
        
        const maxWeightA = ruleA.peso_maximo_paquete || Number.MAX_SAFE_INTEGER;
        const maxWeightB = ruleB.peso_maximo_paquete || Number.MAX_SAFE_INTEGER;
        
        const currentWeightA = a.products.reduce((sum, p) => {
          const prod = p.product || p;
          return sum + parseFloat(prod.weight || prod.peso || 0);
        }, 0);
        
        const currentWeightB = b.products.reduce((sum, p) => {
          const prod = p.product || p;
          return sum + parseFloat(prod.weight || prod.peso || 0);
        }, 0);
        
        const availableA = maxWeightA - currentWeightA;
        const availableB = maxWeightB - currentWeightB;
        
        return availableB - availableA; // Más espacio primero
      });
      
      // Verificar si algún grupo tiene espacio para este producto
      for (const group of sortedGroups) {
        if (canAddToGroup(group, item)) {
          group.products.push(item);
          processedIds.add(productId);
          console.log(`✅ Producto ligero añadido al grupo existente con regla ${group.rule.id}`);
          assigned = true;
          break;
        }
      }
      
      // Si no se asignó, probar con cualquier grupo de la misma regla
      if (!assigned) {
        const allMatchingGroups = groups.filter(group => group.rule.id === ruleInfo.rule.id);
        
        for (const group of allMatchingGroups) {
          if (canAddToGroup(group, item)) {
            group.products.push(item);
            processedIds.add(productId);
            console.log(`✅ Producto ligero añadido a grupo general con regla ${group.rule.id}`);
            assigned = true;
            break;
          }
        }
      }
      
      // Si se asignó, no seguir buscando
      if (assigned) break;
      
      // Si no se pudo asignar a un grupo existente, crear uno nuevo
      if (!assigned) {
        // Si hay límite de peso y el producto no excede
        const rule = ruleInfo.rule;
        
        groups.push({
          rule: ruleInfo.rule,
          products: [item]
        });
        processedIds.add(productId);
        console.log(`🆕 Creado nuevo grupo con regla ${ruleInfo.rule.id} para producto ligero`);
        assigned = true;
        break;
      }
    }
    
    // Si aún no se ha asignado, usar la primera regla disponible
    if (!assigned && validRules.length > 0) {
      groups.push({
        rule: validRules[0].rule,
        products: [item]
      });
      processedIds.add(productId);
      console.log(`⚠️ Asignación forzada a regla ${validRules[0].rule.id} para producto ligero`);
    }
  });
  
  // Mostrar resumen de agrupación
  console.log(`\n📊 Resumen de agrupación: ${groups.length} grupos creados`);
  groups.forEach((group, i) => {
    const totalWeight = group.products.reduce((sum, item) => {
      const product = item.product || item;
      const weight = parseFloat(product.weight || product.peso || 0);
      return sum + weight * (item.quantity || 1);
    }, 0);
    
    const productNames = group.products.map(item => {
      const product = item.product || item;
      return `${product.name || product.id} (${parseFloat(product.weight || product.peso || 0).toFixed(2)}kg)`;
    }).join(', ');
    
    console.log(`Grupo ${i+1} (${group.rule.id}): ${group.products.length} productos, ${totalWeight.toFixed(2)}kg total`);
    console.log(`   Productos: ${productNames}`);
  });
  
  // 3. Calcular costos y detalles de cada grupo
  const groupDetails = groups.map(group => {
    const costInfo = calculateGroupCost(group.rule, group.products);
    return {
      rule: group.rule,
      products: group.products,
      cost: costInfo.cost,
      isFree: costInfo.isFree,
      freeReason: costInfo.freeReason,
      option: costInfo.option,
      minDays: costInfo.minDays,
      maxDays: costInfo.maxDays,
      totalWeight: costInfo.totalWeight
    };
  });
  
  // 4. Crear la opción de envío combinada
  const totalCost = groupDetails.reduce((sum, group) => sum + group.cost, 0);
  
  // Calcular rango de entrega (del más lento)
  let minDays = Math.min(...groupDetails.map(g => g.minDays || 3));
  let maxDays = Math.max(...groupDetails.map(g => g.maxDays || 7));
  
  // Crear detalle de costos desglosados
  const costBreakdown = groupDetails.map(group => {
    const ruleName = group.rule.zona || 'Envío';
    const productsInfo = group.products.map(item => {
      const product = item.product || item;
      return {
        id: product.id,
        name: product.name || product.title || `Producto #${product.id}`,
        weight: parseFloat(product.weight || product.peso || 0),
        quantity: parseInt(item.quantity || 1)
      };
    });
    
    // Agrupar por peso para mostrar mejor información
    const lightProducts = productsInfo.filter(p => p.weight < 0.5);
    const mediumProducts = productsInfo.filter(p => p.weight >= 0.5 && p.weight < 1);
    const heavyProducts = productsInfo.filter(p => p.weight >= 1);
    
    const weightSummary = {
      light: {
        count: lightProducts.length,
        totalWeight: lightProducts.reduce((sum, p) => sum + p.weight, 0)
      },
      medium: {
        count: mediumProducts.length,
        totalWeight: mediumProducts.reduce((sum, p) => sum + p.weight, 0)
      },
      heavy: {
        count: heavyProducts.length,
        totalWeight: heavyProducts.reduce((sum, p) => sum + p.weight, 0)
      }
    };
    
    return {
      name: ruleName,
      cost: group.cost,
      isFree: group.isFree,
      minDays: group.minDays,
      maxDays: group.maxDays,
      products: productsInfo,
      totalWeight: group.totalWeight,
      weightSummary
    };
  });

  // Generar packages para mostrar en la interfaz
  const packages = [];
  
  // Crear un paquete por cada grupo de productos
  groupDetails.forEach((groupDetail, index) => {
    // Garantizar que todos los productos estén incluidos en el grupo
    if (!groupDetail.products || groupDetail.products.length === 0) {
      console.warn(`⚠️ Grupo ${index} sin productos asignados. Asignando productos del carrito.`);
      groupDetail.products = cartItems;
    }
    
    // Calcular el peso real del paquete si no está definido o es cero
    let packageWeight = groupDetail.totalWeight;
    if (!packageWeight || packageWeight === 0) {
      packageWeight = groupDetail.products.reduce((sum, item) => {
        const product = item.product || item;
        const weight = parseFloat(product.weight || product.peso || 0);
        const quantity = parseInt(item.quantity || 1);
        return sum + (weight * quantity);
      }, 0);
      
      // Si aún es cero, asignar un peso mínimo predeterminado
      if (packageWeight === 0) {
        packageWeight = 0.5; // 500g por defecto
      }
    }
    
    packages.push({
      id: `pkg-${index}-${Date.now()}`,
      name: `Paquete ${index + 1}`,
      price: groupDetail.cost,
      isFree: groupDetail.isFree,
      minDays: groupDetail.minDays,
      maxDays: groupDetail.maxDays,
      products: groupDetail.products,
      items: groupDetail.products,
      packageWeight: packageWeight,
      totalWeight: packageWeight,
      productCount: groupDetail.products.length,
      totalQuantity: groupDetail.products.length
    });
  });
  
  // Verificar si hay paquetes válidos
  if (packages.length === 0) {
    console.warn('⚠️ No se pudieron crear paquetes. Creando paquete de fallback.');
    
    // Crear un paquete único con todos los productos
    const totalWeight = cartItems.reduce((sum, item) => {
      const product = item.product || item;
      const weight = parseFloat(product.weight || product.peso || 0);
      const quantity = parseInt(item.quantity || 1);
      return sum + (weight * quantity);
    }, 0);
    
    packages.push({
      id: `pkg-fallback-${Date.now()}`,
      name: 'Paquete único',
      price: totalCost || 150, // Precio del paquete
      isFree: false,
      minDays: minDays || 3,
      maxDays: maxDays || 7,
      products: cartItems,
      packageWeight: totalWeight || 0.5,
      productCount: cartItems.length
    });
  }

  return {
    success: true,
    options: [{
      id: `shipping-greedy-${Date.now()}`,
      name: groups.length > 1 ? 'Envío Combinado Optimizado' : (groupDetails[0]?.rule?.zona || 'Envío Estándar'),
      price: totalCost,
      isFree: totalCost === 0,
      minDays,
      maxDays,
      description: `Entrega en ${minDays}-${maxDays} días${groups.length > 1 ? ` (${groups.length} paquetes)` : ''}`,
      detailedDescription: `Optimizado para minimizar costos de envío. ${totalCartWeight.toFixed(2)}kg en total.`,
      costBreakdown,
      packages,
      groupDetails,
      packageCount: packages.length,
      totalWeight: totalCartWeight,
      // Agregar todos los productos del carrito para referencia
      products: cartItems
    }]
  };
};

/**
 * Genera una descripción detallada de los costos de envío
 * @param {Array} costBreakdown - Desglose de costos por grupo
 * @returns {string} - Descripción detallada
 */
const generateDetailedDescription = (costBreakdown) => {
  if (!costBreakdown || costBreakdown.length === 0) {
    return '';
  }
  
  // Si solo hay un grupo, es más simple
  if (costBreakdown.length === 1) {
    const group = costBreakdown[0];
    let desc = '';
    
    if (group.isFree) {
      desc = `Envío gratuito para ${group.productCount} productos con ${group.carrierName}. ${group.freeReason || ''}`;
    } else {
      desc = `$${group.cost.toFixed(2)} para enviar ${group.productCount} productos con ${group.carrierName}.`;
    }
    
    // Añadir información de peso si está disponible
    if (group.weightInfo && group.weightInfo.totalWeight) {
      desc += `\nPeso total del envío: ${group.weightInfo.totalWeight.toFixed(2)}kg`;
      
      // Si hay un peso máximo definido
      if (group.weightInfo.maxWeight) {
        desc += ` (máximo permitido: ${group.weightInfo.maxWeight}kg)`;
      }
      
      // Mostrar peso por producto
      if (group.weightInfo.products && group.weightInfo.products.length > 0) {
        desc += '\n\nPeso por producto:';
        group.weightInfo.products.forEach(p => {
          desc += `\n- ${p.name}: ${p.weight.toFixed(2)}kg${p.quantity > 1 ? ` x ${p.quantity}` : ''}`;
        });
      }
    }
    
    return desc;
  }
  
  // Para múltiples grupos, crear una descripción más detallada
  let description = 'Desglose de costos:\n';
  
  costBreakdown.forEach((group, index) => {
    description += `- Paquete ${index + 1}: ${group.ruleName} con ${group.carrierName}`;
    
    if (group.isFree) {
      description += ` (Gratis${group.freeReason ? `: ${group.freeReason}` : ''})`;
    } else {
      description += ` ($${group.cost.toFixed(2)})`;
    }
    
    description += ` - ${group.productCount} productos`;
    
    // Añadir información de peso si está disponible
    if (group.weightInfo && group.weightInfo.totalWeight) {
      description += ` - Peso: ${group.weightInfo.totalWeight.toFixed(2)}kg`;
    }
    
    description += '\n';
    
    // Añadir detalle de productos en este paquete
    if (group.weightInfo && group.weightInfo.products && group.weightInfo.products.length > 0) {
      description += '  Productos:\n';
      group.weightInfo.products.forEach(p => {
        description += `  • ${p.name}: ${p.weight.toFixed(2)}kg${p.quantity > 1 ? ` x ${p.quantity}` : ''}\n`;
      });
    }
  });
  
  // Añadir total
  const totalCost = costBreakdown.reduce((sum, group) => sum + group.cost, 0);
  const totalWeight = costBreakdown.reduce((sum, group) => sum + (group.weightInfo?.totalWeight || 0), 0);
  
  description += `\nCosto total de envío: $${totalCost.toFixed(2)}`;
  description += `\nPeso total: ${totalWeight.toFixed(2)}kg`;
  
  return description;
};

/**
 * Función principal que encuentra las mejores opciones de envío usando el algoritmo Greedy
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} address - Dirección del usuario
 * @param {Array|Object} shippingRules - Reglas de envío disponibles
 * @returns {Object} - Resultado con opciones de envío
 */
export const findBestShippingOptions = async (cartItems, address, shippingRules) => {
  return findBestShippingOptionsGreedy(cartItems, address, shippingRules);
}; 