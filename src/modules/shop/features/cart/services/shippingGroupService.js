/**
 * Servicio para agrupar productos del carrito por reglas de envío
 * 
 * Este módulo proporciona funciones para agrupar productos según sus reglas de envío
 * y calcular los costos de envío para cada grupo, optimizando para el menor costo
 * y el menor número de grupos posibles.
 */

import { fetchShippingRuleById } from '../../../../admin/shipping/api/shippingApi.js';

/**
 * Agrupa los productos del carrito por reglas de envío comunes
 * 
 * @param {Array} cartItems - Productos en el carrito
 * @returns {Promise<Object>} Información sobre productos y sus reglas
 */
export const analyzeCartItems = async (cartItems) => {
  console.log('🔍 Analizando productos y reglas de envío', cartItems?.length, 'items');
  
  if (!cartItems || !cartItems.length) {
    console.log('Carrito vacío, no hay productos para analizar');
    return {
      productRulesMap: new Map(),
      ruleDetailsMap: new Map(),
      products: []
    };
  }
  
  // Extraer todas las reglas de envío de los productos
  const productRulesMap = new Map(); // Mapa: productId -> ruleIds[]
  const ruleDetailsMap = new Map(); // Mapa: ruleId -> regla completa
  const products = []; // Lista de productos con sus detalles
  
  // 1. Recopilar todas las reglas por producto
  for (const item of cartItems) {
    const product = item.product || item;
    const productId = product.id;
    
    if (!productId) continue;
    
    // Obtener IDs de reglas de envío
    let ruleIds = [];
    
    if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
      ruleIds = [...product.shippingRuleIds].filter(id => id); // Filtrar valores nulos
    } else if (product.shippingRuleId) {
      ruleIds = [product.shippingRuleId];
    }
    
    if (ruleIds.length > 0) {
      productRulesMap.set(productId, ruleIds);
      products.push({
        id: productId,
        name: product.name,
        quantity: item.quantity || 1,
        weight: parseFloat(product.weight || 0),
        price: parseFloat(product.price || 0),
        image: product.mainImage || product.image,
        ruleIds: ruleIds,
        originalItem: item
      });
    }
  }
  
  // 2. Cargar detalles de todas las reglas
  const allRuleIds = new Set();
  productRulesMap.forEach(ruleIds => {
    ruleIds.forEach(id => allRuleIds.add(id));
  });
  
  // Cargar en paralelo todas las reglas
  const rulePromises = Array.from(allRuleIds).map(async (ruleId) => {
    try {
      const rule = await fetchShippingRuleById(ruleId);
      if (rule) {
        ruleDetailsMap.set(ruleId, rule);
      }
    } catch (error) {
      console.error(`Error al cargar la regla ${ruleId}:`, error);
    }
  });
  
  await Promise.all(rulePromises);
  
  return {
    productRulesMap,
    ruleDetailsMap,
    products
  };
};

/**
 * Calcula el subtotal de un grupo de productos
 * 
 * @param {Array} items - Productos en el grupo
 * @returns {number} Subtotal en moneda
 */
export const calculateGroupSubtotal = (items) => {
  return items.reduce((total, item) => {
    const price = parseFloat(item.price || 0);
    const quantity = parseInt(item.quantity || 1);
    return total + (price * quantity);
  }, 0);
};

/**
 * Calcula el peso total de un grupo de productos
 * 
 * @param {Array} items - Productos en el grupo
 * @returns {number} Peso total en kg
 */
export const calculateGroupWeight = (items) => {
  return items.reduce((total, item) => {
    const weight = parseFloat(item.weight || 0);
    const quantity = parseInt(item.quantity || 1);
    return total + (weight * quantity);
  }, 0);
};

/**
 * Calcula las opciones de envío para un grupo específico
 * 
 * @param {Object} group - Grupo de productos
 * @param {Object} ruleDetailsMap - Mapa de reglas de envío
 * @returns {Array} Opciones de envío con sus costos
 */
export const calculateShippingOptionsForGroup = (group, ruleDetailsMap) => {
  if (!group || !group.ruleId || !group.products || !group.products.length) return [];
  
  const rule = ruleDetailsMap.get(group.ruleId);
  if (!rule) {
    console.warn(`⚠️ No se encontró la regla ${group.ruleId} para el grupo ${group.id}`);
    return [];
  }
  
  console.log(`🔎 Calculando opciones para grupo usando regla: ${rule.zona || group.ruleId}`);
  
  const subtotal = calculateGroupSubtotal(group.products);
  const weight = calculateGroupWeight(group.products);
  
  // Verificar si aplica envío gratis
  const isFreeShipping = rule.envio_gratis || 
    (rule.envio_gratis_monto_minimo && subtotal >= parseFloat(rule.envio_gratis_monto_minimo || 0));
  
  // Obtener opciones de mensajería de la regla
  const options = [];
  
  // Si no hay opciones de mensajería o no aplica envío variable, crear opción predeterminada
  if (!rule.envio_variable || !rule.envio_variable.aplica || 
      !rule.envio_variable.opciones_mensajeria || 
      !Array.isArray(rule.envio_variable.opciones_mensajeria) ||
      rule.envio_variable.opciones_mensajeria.length === 0) {
    
    console.warn(`⚠️ La regla ${group.ruleId} no tiene opciones de mensajería válidas. Creando opción predeterminada.`);
    
    // Crear opción predeterminada
    return [{
      id: `${group.id}-option-default`,
      groupId: group.id,
      ruleId: group.ruleId,
      label: 'Estándar',
      carrier: rule.zona || 'Servicio de envío',
      price: isFreeShipping ? 0 : 200, // Precio predeterminado
      deliveryTime: '3-7 días',
      maxPackageWeight: 20,
      maxProductsPerPackage: 10,
      extraWeightCost: 0,
      weight: weight,
      isFreeShipping: isFreeShipping,
      extraCost: 0,
      totalCost: isFreeShipping ? 0 : 200 // Costo predeterminado
    }];
  }
  
  // Procesar cada opción de mensajería
  rule.envio_variable.opciones_mensajeria.forEach((option, index) => {
    // Verificar si la opción tiene la estructura correcta
    if (!option || typeof option !== 'object') {
      console.warn('Opción de mensajería no válida en regla', rule.id);
      return; // Continuar con la siguiente opción
    }
    
    // Crear estructura para la opción de envío
    const shippingOption = {
      id: `${group.id}-option-${index}`,
      groupId: group.id,
      ruleId: group.ruleId,
      label: option.label || option.nombre || `Opción ${index + 1}`,
      carrier: option.nombre || 'Servicio de envío',
      price: isFreeShipping ? 0 : parseFloat(option.precio || 0),
      deliveryTime: option.tiempo_entrega || `${option.minDays || '1'}-${option.maxDays || '7'} días`,
      maxPackageWeight: option.configuracion_paquetes?.peso_maximo_paquete || 20,
      maxProductsPerPackage: option.configuracion_paquetes?.maximo_productos_por_paquete || 10,
      extraWeightCost: option.configuracion_paquetes?.costo_por_kg_extra || 0,
      weight: weight,
      isFreeShipping: isFreeShipping
    };
    
    // Calcular paquetes y costo adicional por peso
    const extraPackages = Math.max(0, Math.ceil(weight / shippingOption.maxPackageWeight) - 1);
    const extraWeightCost = extraPackages * shippingOption.extraWeightCost;
    
    // Calcular costo total
    shippingOption.extraCost = isFreeShipping ? 0 : extraWeightCost;
    shippingOption.totalCost = isFreeShipping ? 0 : shippingOption.price + extraWeightCost;
    
    options.push(shippingOption);
  });
  
  // Si después de procesar todas las opciones no tenemos ninguna, crear opción predeterminada
  if (options.length === 0) {
    console.warn(`⚠️ No se crearon opciones para regla ${group.ruleId}. Creando opción predeterminada.`);
    options.push({
      id: `${group.id}-option-default`,
      groupId: group.id,
      ruleId: group.ruleId,
      label: 'Estándar',
      carrier: rule.zona || 'Servicio de envío',
      price: isFreeShipping ? 0 : 200, // Precio predeterminado
      deliveryTime: '3-7 días',
      maxPackageWeight: 20,
      maxProductsPerPackage: 10,
      extraWeightCost: 0,
      weight: weight,
      isFreeShipping: isFreeShipping,
      extraCost: 0,
      totalCost: isFreeShipping ? 0 : 200 // Costo predeterminado
    });
  }
  
  console.log(`✅ Generadas ${options.length} opciones para grupo ${group.id}`);
  
  // Ordenar opciones por costo (menor a mayor)
  return options.sort((a, b) => a.totalCost - b.totalCost);
};

/**
 * Encuentra los grupos óptimos de productos basados en reglas de envío compartidas
 * Optimiza para usar el mínimo número de grupos y el menor costo total de envío
 * 
 * @param {Array} products - Lista de productos analizados
 * @param {Map} ruleDetailsMap - Mapa con detalles de todas las reglas
 * @returns {Array} Agrupación óptima de productos
 */
export const findOptimalShippingGroups = (products, ruleDetailsMap) => {
  if (!products || !products.length) return [];
  
  console.log(`🧮 Buscando agrupación óptima para ${products.length} productos`);
  
  // Construir matriz de compatibilidad (qué productos pueden ir juntos)
  const compatibilityMatrix = buildCompatibilityMatrix(products);
  
  // Crear un índice de qué reglas aplican a qué productos
  const ruleToProductsMap = new Map(); // ruleId -> [productIds]
  
  products.forEach(product => {
    product.ruleIds.forEach(ruleId => {
      if (!ruleToProductsMap.has(ruleId)) {
        ruleToProductsMap.set(ruleId, []);
      }
      ruleToProductsMap.get(ruleId).push(product.id);
    });
  });
  
  // Información sobre reglas
  const ruleInfo = new Map(); // ruleId -> info sobre la regla
  
  ruleDetailsMap.forEach((rule, ruleId) => {
    // Determinar si la regla es nacional o local
    const isNational = rule.zipcode === 'nacional' || 
                       (rule.zipcodes && rule.zipcodes.includes('nacional'));
    
    ruleInfo.set(ruleId, {
      id: ruleId,
      name: rule.zona || 'Sin nombre',
      isNational,
      // Obtener el costo de la opción más económica (aproximado)
      baseCost: rule.envio_variable && 
                rule.envio_variable.opciones_mensajeria && 
                rule.envio_variable.opciones_mensajeria.length > 0 
                ? parseFloat(rule.envio_variable.opciones_mensajeria[0].precio || 0)
                : 0,
      // Cuántos productos usan esta regla
      productCount: ruleToProductsMap.get(ruleId)?.length || 0
    });
  });
  
  // Encontrar todas las agrupaciones válidas usando algoritmo optimizado
  const validGroupings = findValidGroupings(products, compatibilityMatrix, ruleInfo, ruleToProductsMap);
  
  console.log(`✨ Encontradas ${validGroupings.length} agrupaciones válidas`);
  
  if (validGroupings.length === 0) {
    // Si no hay agrupaciones válidas, cada producto va en su propio grupo
    console.log('⚠️ No se encontraron agrupaciones válidas, cada producto irá en su propio grupo');
    
    return products.map(product => {
      // Usar la primera regla disponible para este producto
      const ruleId = product.ruleIds[0];
      
      return {
        id: `single-group-${product.id}`,
        ruleId,
        ruleName: ruleInfo.get(ruleId)?.name || 'Grupo individual',
        products: [product],
        isNational: ruleInfo.get(ruleId)?.isNational || false
      };
    });
  }
  
  // Seleccionar la mejor agrupación basada en nuestros criterios:
  // 1. Menor número de grupos
  // 2. Menor costo total estimado
  // 3. Mayor número de productos agrupados
  
  validGroupings.sort((a, b) => {
    // Primero por número de grupos (menos es mejor)
    if (a.groups.length !== b.groups.length) {
      return a.groups.length - b.groups.length;
    }
    
    // Luego por costo total estimado (menos es mejor)
    if (a.totalEstimatedCost !== b.totalEstimatedCost) {
      return a.totalEstimatedCost - b.totalEstimatedCost;
    }
    
    // Finalmente por concentración de productos (preferir grupos más grandes)
    // Calculamos un coeficiente de cuán concentrados están los productos
    const aConcentration = calculateGroupingConcentration(a.groups);
    const bConcentration = calculateGroupingConcentration(b.groups);
    
    return bConcentration - aConcentration; // Mayor concentración es mejor
  });
  
  // La mejor agrupación es la primera después de ordenar
  const bestGrouping = validGroupings[0];
  
  console.log(`✅ Mejor agrupación: ${bestGrouping.groups.length} grupos, costo estimado: $${bestGrouping.totalEstimatedCost}`);
  
  // Convertir la agrupación a nuestro formato final
  return bestGrouping.groups.map((group, index) => ({
    id: `group-${index}`,
    ruleId: group.ruleId,
    ruleName: ruleInfo.get(group.ruleId)?.name || 'Grupo de envío',
    products: group.productIds.map(id => products.find(p => p.id === id)),
    isNational: ruleInfo.get(group.ruleId)?.isNational || false
  }));
};

/**
 * Construye una matriz de compatibilidad entre productos
 * Dos productos son compatibles si comparten al menos una regla de envío
 * 
 * @param {Array} products - Lista de productos
 * @returns {Array} Matriz de compatibilidad
 */
const buildCompatibilityMatrix = (products) => {
  const matrix = [];
  
  for (let i = 0; i < products.length; i++) {
    matrix[i] = [];
    
    for (let j = 0; j < products.length; j++) {
      if (i === j) {
        // Un producto siempre es compatible consigo mismo
        matrix[i][j] = true;
        continue;
      }
      
      // Dos productos son compatibles si comparten al menos una regla de envío
      const commonRules = products[i].ruleIds.filter(ruleId => 
        products[j].ruleIds.includes(ruleId)
      );
      
      matrix[i][j] = commonRules.length > 0;
    }
  }
  
  return matrix;
};

/**
 * Encuentra todas las agrupaciones válidas de productos
 * Una agrupación es válida si todos los productos en cada grupo comparten al menos una regla
 * 
 * @param {Array} products - Lista de productos
 * @param {Array} compatibilityMatrix - Matriz que indica qué productos son compatibles
 * @param {Map} ruleInfo - Información sobre cada regla
 * @param {Map} ruleToProductsMap - Mapeo de reglas a productos que las usan
 * @returns {Array} Lista de agrupaciones válidas
 */
const findValidGroupings = (products, compatibilityMatrix, ruleInfo, ruleToProductsMap) => {
  // Para un problema de este tipo, el espacio de búsqueda puede ser enorme
  // Vamos a usar un enfoque heurístico para encontrar soluciones óptimas
  
  const validGroupings = [];
  
  // Enfoque 1: Agrupar por reglas compartidas, priorizando las que agrupan más productos
  
  // Ordenar reglas por número de productos (de mayor a menor)
  const sortedRules = Array.from(ruleInfo.entries())
    .sort((a, b) => b[1].productCount - a[1].productCount)
    .map(entry => entry[0]);
  
  // Intentar formar grupos basándonos en cada regla
  const greedyGrouping = findGreedyGrouping(products, sortedRules, ruleToProductsMap, ruleInfo);
  validGroupings.push(greedyGrouping);
  
  // Enfoque 2: Intentar agrupar primero productos locales juntos, luego nacionales
  const localFirstGrouping = findLocalFirstGrouping(products, sortedRules, ruleToProductsMap, ruleInfo);
  validGroupings.push(localFirstGrouping);
  
  // Enfoque 3: Intentar maximizar el agrupamiento de productos
  const maxGroupingSize = findMaxGroupSizeGrouping(products, compatibilityMatrix, ruleInfo);
  validGroupings.push(maxGroupingSize);
  
  return validGroupings;
};

/**
 * Agrupación codicioso: intenta agrupar productos por regla, una regla a la vez
 * 
 * @param {Array} products - Lista de productos
 * @param {Array} sortedRules - Reglas ordenadas por prioridad
 * @param {Map} ruleToProductsMap - Mapeo de reglas a productos
 * @param {Map} ruleInfo - Información de cada regla
 * @returns {Object} Agrupación encontrada
 */
const findGreedyGrouping = (products, sortedRules, ruleToProductsMap, ruleInfo) => {
  const groups = [];
  const coveredProducts = new Set();
  
  // Intentar cada regla en orden
  for (const ruleId of sortedRules) {
    // Productos que usan esta regla y no están ya cubiertos
    const availableProducts = ruleToProductsMap.get(ruleId)?.filter(
      productId => !coveredProducts.has(productId)
    ) || [];
    
    if (availableProducts.length > 0) {
      groups.push({
        ruleId,
        productIds: availableProducts
      });
      
      // Marcar estos productos como cubiertos
      availableProducts.forEach(id => coveredProducts.add(id));
    }
    
    // Si ya cubrimos todos los productos, terminamos
    if (coveredProducts.size === products.length) break;
  }
  
  // Calcular costo total estimado
  const totalEstimatedCost = calculateEstimatedCost(groups, ruleInfo);
  
  return {
    groups,
    totalEstimatedCost
  };
};

/**
 * Agrupación priorizando local: intenta agrupar primero productos locales juntos
 * 
 * @param {Array} products - Lista de productos
 * @param {Array} sortedRules - Reglas ordenadas por prioridad
 * @param {Map} ruleToProductsMap - Mapeo de reglas a productos
 * @param {Map} ruleInfo - Información de cada regla
 * @returns {Object} Agrupación encontrada
 */
const findLocalFirstGrouping = (products, sortedRules, ruleToProductsMap, ruleInfo) => {
  const groups = [];
  const coveredProducts = new Set();
  
  // Primero, agrupemos por reglas locales
  const localRules = sortedRules.filter(ruleId => !ruleInfo.get(ruleId).isNational);
  const nationalRules = sortedRules.filter(ruleId => ruleInfo.get(ruleId).isNational);
  
  // Intentar reglas locales primero
  for (const ruleId of localRules) {
    const availableProducts = ruleToProductsMap.get(ruleId)?.filter(
      productId => !coveredProducts.has(productId)
    ) || [];
    
    if (availableProducts.length > 0) {
      groups.push({
        ruleId,
        productIds: availableProducts
      });
      
      availableProducts.forEach(id => coveredProducts.add(id));
    }
  }
  
  // Luego intentar reglas nacionales para los productos restantes
  for (const ruleId of nationalRules) {
    const availableProducts = ruleToProductsMap.get(ruleId)?.filter(
      productId => !coveredProducts.has(productId)
    ) || [];
    
    if (availableProducts.length > 0) {
      groups.push({
        ruleId,
        productIds: availableProducts
      });
      
      availableProducts.forEach(id => coveredProducts.add(id));
    }
    
    if (coveredProducts.size === products.length) break;
  }
  
  const totalEstimatedCost = calculateEstimatedCost(groups, ruleInfo);
  
  return {
    groups,
    totalEstimatedCost
  };
};

/**
 * Agrupación maximizando tamaño: intenta formar los grupos más grandes posibles
 * 
 * @param {Array} products - Lista de productos
 * @param {Array} compatibilityMatrix - Matriz de compatibilidad entre productos
 * @param {Map} ruleInfo - Información de cada regla
 * @returns {Object} Agrupación encontrada
 */
const findMaxGroupSizeGrouping = (products, compatibilityMatrix, ruleInfo) => {
  const groups = [];
  const remainingProducts = new Set(products.map(p => p.id));
  
  // Mientras queden productos sin asignar
  while (remainingProducts.size > 0) {
    // Tomar un producto como semilla
    const seedId = Array.from(remainingProducts)[0];
    const seedProduct = products.find(p => p.id === seedId);
    
    // Encontrar todos los productos compatibles con este
    const seedIndex = products.findIndex(p => p.id === seedId);
    const compatibleProducts = products.filter((p, index) => 
      remainingProducts.has(p.id) && compatibilityMatrix[seedIndex][index]
    );
    
    // Encontrar la regla compartida por más productos en este grupo
    const bestRule = findBestRuleForGroup(compatibleProducts, ruleInfo);
    
    if (bestRule) {
      // Formar un grupo con todos los productos que comparten esta regla
      const groupProducts = compatibleProducts.filter(p => 
        p.ruleIds.includes(bestRule)
      );
      
      groups.push({
        ruleId: bestRule,
        productIds: groupProducts.map(p => p.id)
      });
      
      // Eliminar estos productos de los restantes
      groupProducts.forEach(p => remainingProducts.delete(p.id));
    } else {
      // Si no encontramos una regla común, poner este producto solo
      groups.push({
        ruleId: seedProduct.ruleIds[0], // Usar primera regla disponible
        productIds: [seedId]
      });
      
      remainingProducts.delete(seedId);
    }
  }
  
  const totalEstimatedCost = calculateEstimatedCost(groups, ruleInfo);
  
  return {
    groups,
    totalEstimatedCost
  };
};

/**
 * Encuentra la mejor regla para un grupo de productos
 * La mejor regla es la que comparten más productos y tiene menor costo
 * 
 * @param {Array} products - Productos a agrupar
 * @param {Map} ruleInfo - Información de cada regla
 * @returns {string} ID de la mejor regla
 */
const findBestRuleForGroup = (products, ruleInfo) => {
  if (!products || products.length === 0) return null;
  
  // Contar cuántos productos usan cada regla
  const ruleCounts = new Map();
  
  products.forEach(product => {
    product.ruleIds.forEach(ruleId => {
      ruleCounts.set(ruleId, (ruleCounts.get(ruleId) || 0) + 1);
    });
  });
  
  // Filtrar sólo reglas que todos los productos tengan en común
  const commonRules = Array.from(ruleCounts.entries())
    .filter(([ruleId, count]) => count === products.length)
    .map(([ruleId]) => ruleId);
  
  if (commonRules.length === 0) {
    // No hay una regla que todos compartan
    if (products.length === 1) {
      // Si es un solo producto, usar su primera regla
      return products[0].ruleIds[0];
    }
    return null;
  }
  
  // Ordenar reglas por costo (menor primero)
  commonRules.sort((a, b) => {
    const costA = ruleInfo.get(a)?.baseCost || Infinity;
    const costB = ruleInfo.get(b)?.baseCost || Infinity;
    
    // Si los costos son iguales, priorizar local sobre nacional
    if (costA === costB) {
      const aIsNational = ruleInfo.get(a)?.isNational || false;
      const bIsNational = ruleInfo.get(b)?.isNational || false;
      
      if (aIsNational !== bIsNational) {
        return aIsNational ? 1 : -1; // Preferir local (no nacional)
      }
    }
    
    return costA - costB;
  });
  
  return commonRules[0]; // Regla con menor costo
};

/**
 * Calcula el costo total estimado de una agrupación
 * 
 * @param {Array} groups - Grupos de la agrupación
 * @param {Map} ruleInfo - Información de cada regla
 * @returns {number} Costo total estimado
 */
const calculateEstimatedCost = (groups, ruleInfo) => {
  return groups.reduce((total, group) => {
    const ruleCost = ruleInfo.get(group.ruleId)?.baseCost || 0;
    return total + ruleCost;
  }, 0);
};

/**
 * Calcula un índice de concentración para una agrupación
 * Valores más altos indican grupos con más productos (preferible)
 * 
 * @param {Array} groups - Grupos de la agrupación
 * @returns {number} Índice de concentración
 */
const calculateGroupingConcentration = (groups) => {
  if (!groups || groups.length === 0) return 0;
  
  // Sumar los cuadrados de los tamaños de grupos
  // Esto premia grupos más grandes vs muchos pequeños
  return groups.reduce((sum, group) => {
    return sum + Math.pow(group.productIds.length, 2);
  }, 0);
};

/**
 * Procesa los productos del carrito y devuelve grupos optimizados y opciones de envío
 * 
 * @param {Array} cartItems - Productos en el carrito
 * @returns {Promise<Object>} Grupos y opciones de envío optimizados
 */
export const processCartForShipping = async (cartItems) => {
  console.log(`🛒 Procesando ${cartItems?.length || 0} items del carrito para envío`);
  
  // Analizar productos y obtener reglas
  const { products, ruleDetailsMap } = await analyzeCartItems(cartItems);
  
  if (products.length === 0) {
    console.warn('⚠️ No hay productos para procesar después del análisis');
    return {
      groups: [],
      combinations: []
    };
  }
  
  console.log(`✅ Productos analizados: ${products.length}, reglas: ${ruleDetailsMap.size}`);
  
  // Encontrar la agrupación óptima
  const optimalGroups = findOptimalShippingGroups(products, ruleDetailsMap);
  
  if (optimalGroups.length === 0) {
    console.warn('⚠️ No se encontraron grupos óptimos');
    // Crear un grupo predeterminado
    const defaultGroup = {
      id: 'default-group',
      ruleId: Array.from(ruleDetailsMap.keys())[0] || 'default-rule',
      ruleName: 'Envío Estándar',
      products: products,
      isNational: true
    };
    
    // Calcular opciones para el grupo predeterminado
    const defaultOptions = [{
      id: 'default-option',
      groupId: 'default-group',
      ruleId: defaultGroup.ruleId,
      label: 'Estándar',
      carrier: 'Servicio de envío',
      price: 200,
      deliveryTime: '3-7 días',
      maxPackageWeight: 20,
      maxProductsPerPackage: 10,
      extraWeightCost: 0,
      weight: calculateGroupWeight(products),
      isFreeShipping: false,
      extraCost: 0,
      totalCost: 200
    }];
    
    const defaultGroupWithOptions = {
      ...defaultGroup,
      shippingOptions: defaultOptions
    };
    
    // Crear una combinación predeterminada
    const defaultCombination = {
      id: 'default-combination',
      name: 'Envío Estándar',
      groups: [{
        group: defaultGroupWithOptions,
        option: defaultOptions[0],
        products: products
      }],
      totalCost: 200
    };
    
    console.log('⚠️ Utilizando grupo y combinación predeterminados');
    
    return {
      groups: [defaultGroupWithOptions],
      combinations: [defaultCombination]
    };
  }
  
  console.log(`🚚 Calculando opciones para ${optimalGroups.length} grupos`);
  
  // Calcular opciones de envío para cada grupo
  const groupsWithOptions = optimalGroups.map(group => {
    const shippingOptions = calculateShippingOptionsForGroup(group, ruleDetailsMap);
    return {
      ...group,
      shippingOptions
    };
  });
  
  // Verificar que todos los grupos tengan opciones
  const allGroupsHaveOptions = groupsWithOptions.every(
    group => group.shippingOptions && group.shippingOptions.length > 0
  );
  
  if (!allGroupsHaveOptions) {
    console.warn('⚠️ Hay grupos sin opciones de envío');
  }
  
  // Generar combinaciones para mostrar al usuario
  // (Cada combinación es una forma de enviar todos los productos)
  const combinations = generateShippingCombinations(groupsWithOptions);
  
  console.log(`🚚 Proceso completado: ${groupsWithOptions.length} grupos, ${combinations.length} combinaciones`);
  
  return {
    groups: groupsWithOptions,
    combinations
  };
};

/**
 * Genera combinaciones de opciones de envío para los grupos
 * 
 * @param {Array} groups - Grupos con opciones de envío
 * @returns {Array} Combinaciones de opciones para presentar al usuario
 */
export const generateShippingCombinations = (groups) => {
  if (!groups || groups.length === 0) return [];
  
  console.log(`⚙️ Generando combinaciones para ${groups.length} grupos`);
  
  // Filtrar grupos que tienen opciones disponibles
  const validGroups = groups.filter(group => 
    group.shippingOptions && group.shippingOptions.length > 0
  );
  
  console.log(`⚙️ Grupos válidos con opciones: ${validGroups.length} de ${groups.length}`);
  
  if (validGroups.length === 0) {
    // Si no hay grupos con opciones, intentar crear una opción predeterminada
    console.warn('⚠️ No hay grupos con opciones de envío. Creando opción predeterminada.');
    
    // Crear al menos una combinación predeterminada para no bloquear el flujo
    return [{
      id: 'default-combination',
      name: 'Envío estándar',
      groups: groups.map(group => ({
        group,
        option: {
          id: `default-option-${group.id}`,
          label: 'Estándar',
          carrier: 'Servicio de envío',
          deliveryTime: '3-7 días',
          isFreeShipping: false,
          totalCost: 200 // Costo predeterminado
        },
        products: group.products
      })),
      totalCost: 200 // Costo predeterminado
    }];
  }
  
  // Para el caso simple (un solo grupo), cada opción es una combinación
  if (validGroups.length === 1) {
    const group = validGroups[0];
    
    console.log(`🔄 Generando ${group.shippingOptions.length} combinaciones para grupo único`);
    
    return group.shippingOptions.map(option => ({
      id: option.id,
      name: `Envío ${option.label} - ${group.ruleName}`,
      groups: [{ 
        group,
        option,
        products: group.products
      }],
      totalCost: option.totalCost
    }));
  }
  
  // Generar todas las combinaciones posibles
  // (producto cartesiano de opciones de cada grupo)
  let combinations = [];
  
  // Función recursiva para generar combinaciones
  const generateRecursive = (currentGroupIndex, currentCombination, totalCost) => {
    if (currentGroupIndex === validGroups.length) {
      // Combinación completa
      combinations.push({
        id: `combination-${combinations.length}`,
        name: currentCombination.map(item => item.group.ruleName).join(' + '),
        groups: [...currentCombination],
        totalCost
      });
      return;
    }
    
    const currentGroup = validGroups[currentGroupIndex];
    
    // Probar cada opción para este grupo
    currentGroup.shippingOptions.forEach(option => {
      const newComb = [...currentCombination, {
        group: currentGroup,
        option,
        products: currentGroup.products
      }];
      
      generateRecursive(
        currentGroupIndex + 1, 
        newComb, 
        totalCost + option.totalCost
      );
    });
  };
  
  // Iniciar la generación de combinaciones
  generateRecursive(0, [], 0);
  
  console.log(`🔄 Generadas ${combinations.length} combinaciones`);
  
  // Ordenar por costo total
  return combinations.sort((a, b) => a.totalCost - b.totalCost);
}; 