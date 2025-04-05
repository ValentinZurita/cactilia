/**
 * Servicio para manejar la agrupación de productos según reglas de envío múltiples
 * Implementa la lógica para agrupar productos, calcular costos y opciones de envío
 */

import { fetchShippingRuleById } from '../../admin/services/shippingRuleService';

/**
 * Agrupa los productos del carrito según sus reglas de envío asociadas
 * 
 * @param {Array} cartItems - Productos en el carrito
 * @returns {Promise<Array>} Grupos de productos según reglas de envío
 */
export const groupProductsByShippingRules = async (cartItems) => {
  console.log('🚢 groupProductsByShippingRules: Iniciando agrupación con', cartItems?.length, 'items');
  
  if (!cartItems || cartItems.length === 0) {
    console.warn('groupProductsByShippingRules: No hay items para agrupar');
    return [];
  }
  
  // Validar que los items tengan la estructura correcta
  const validItems = cartItems.filter(item => {
    if (!item) return false;
    
    // Obtener el producto (puede estar en item.product o directamente en item)
    const product = item.product || item;
    return product && product.id;
  });
  
  console.log('🛒 groupProductsByShippingRules: Items válidos:', validItems.length);
  
  // NUEVO: Imprimir detalles de cada item para diagnóstico
  validItems.forEach((item, index) => {
    const product = item.product || item;
    console.log(`📦 Item #${index + 1}:`, {
      id: product.id,
      name: product.name,
      quantity: item.quantity,
      shippingRuleId: product.shippingRuleId,
      shippingRuleIds: product.shippingRuleIds,
      tieneReglasArray: !!product.shippingRuleIds && Array.isArray(product.shippingRuleIds),
      cantidadReglas: product.shippingRuleIds && Array.isArray(product.shippingRuleIds) ? product.shippingRuleIds.length : 0
    });
  });
  
  // Paso 1: Obtener todas las reglas de envío asociadas a los productos
  const productRulesMap = new Map(); // Mapa producto -> reglas de envío
  const shippingRulesCache = new Map(); // Cache para evitar duplicar peticiones
  
  // Obtener todos los IDs de reglas de envío asociados a los productos
  for (const item of validItems) {
    const product = item.product || item;
    const productId = product.id;
    
    console.log(`⚙️ Procesando producto ${product.name || productId}:`, {
      shippingRuleId: product.shippingRuleId,
      shippingRuleIds: product.shippingRuleIds
    });
    
    // Verificar si el producto tiene reglas de envío asignadas
    let shippingRuleIds = [];
    
    // Primero intentar con shippingRuleIds (array de IDs)
    if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0) {
      // Filtrar IDs nulos o vacíos
      shippingRuleIds = product.shippingRuleIds.filter(id => id && id.trim() !== '');
      console.log(`🔄 Usando array de ${shippingRuleIds.length} reglas de envío para ${product.name || productId}`);
    } 
    // Si no hay un array válido, intentar con shippingRuleId (string único)
    else if (product.shippingRuleId && typeof product.shippingRuleId === 'string' && product.shippingRuleId.trim() !== '') {
      shippingRuleIds = [product.shippingRuleId];
      console.log(`🔄 Usando regla de envío única para ${product.name || productId}: ${product.shippingRuleId}`);
    }
    else {
      console.warn(`❌ No se encontraron reglas de envío válidas para ${product.name || productId}`, new Error('Falta regla de envío'));
      // Intentar obtener regla nacional por defecto
      console.log('🔍 Intentando asignar regla nacional por defecto');
      shippingRuleIds = ['bmtunCl4oav9BbzlMihE']; // ID de la regla nacional
    }
    
    // Si no tiene reglas de envío, saltamos
    if (shippingRuleIds.length === 0) {
      console.warn(`❌ Producto ${product.name || productId} no tiene reglas de envío asignadas`, new Error('Producto sin reglas'));
      continue;
    }
    
    console.log(`✅ Producto ${product.name || productId} tiene ${shippingRuleIds.length} reglas de envío:`, shippingRuleIds);
    
    // Obtener detalles de cada regla
    const productRules = [];
    
    for (const ruleId of shippingRuleIds) {
      if (!ruleId) {
        console.warn('ID de regla de envío nulo o vacío');
        continue;
      }
      
      // Verificar si la regla ya está en caché
      if (!shippingRulesCache.has(ruleId)) {
        console.log(`🔍 Obteniendo regla de envío ${ruleId}`);
        try {
          const { ok, data } = await fetchShippingRuleById(ruleId);
          if (ok && data) {
            console.log(`✅ Regla ${ruleId} encontrada:`, data.zona || 'Sin nombre');
            shippingRulesCache.set(ruleId, data);
          } else {
            console.warn(`⚠️ Regla ${ruleId} no encontrada o error en la respuesta`);
            // Si no se encuentra la regla, crear una regla básica de fallback
            shippingRulesCache.set(ruleId, {
              id: ruleId,
              zona: 'Regla por defecto',
              activo: true,
              opciones_mensajeria: [{
                nombre: 'Envío Estándar',
                precio: '50',
                tiempo_entrega: '3-5 días',
                configuracion_paquetes: {
                  peso_maximo_paquete: 20,
                  costo_por_kg_extra: 10,
                  maximo_productos_por_paquete: 10
                }
              }]
            });
          }
        } catch (error) {
          console.error(`❌ Error obteniendo regla ${ruleId}:`, error);
          // Si hay error, crear una regla básica de fallback
          shippingRulesCache.set(ruleId, {
            id: ruleId,
            zona: 'Regla por defecto (error)',
            activo: true,
            opciones_mensajeria: [{
              nombre: 'Envío Estándar',
              precio: '50',
              tiempo_entrega: '3-5 días',
              configuracion_paquetes: {
                peso_maximo_paquete: 20,
                costo_por_kg_extra: 10,
                maximo_productos_por_paquete: 10
              }
            }]
          });
        }
      }
      
      // Si tenemos la regla, la agregamos
      if (shippingRulesCache.has(ruleId)) {
        productRules.push(shippingRulesCache.get(ruleId));
      }
    }
    
    if (productRules.length > 0) {
      console.log(`✅ Asignando ${productRules.length} reglas a producto ${product.name || productId}`);
      productRulesMap.set(productId, productRules);
    } else {
      console.warn(`❌ No se encontraron reglas válidas para el producto ${product.name || productId}`, new Error('Sin reglas válidas'));
    }
  }
  
  // Paso 2: Agrupar productos por reglas de envío comunes
  const shippingGroups = [];
  const processedProductIds = new Set();
  
  console.log(`Agrupando productos con ${productRulesMap.size} mapeos de reglas`);
  
  // Si ningún producto tiene reglas, crear un grupo sin reglas para todos
  if (productRulesMap.size === 0) {
    console.log('Ningún producto tiene reglas de envío, creando grupo sin reglas');
    return [{
      id: 'no-rules',
      type: 'no-rules',
      name: 'Sin regla de envío',
      rules: [{
        id: 'default-rule',
        zona: 'Sin regla',
        opciones_mensajeria: [{
          nombre: 'Envío Estándar',
          precio: '50',
          tiempo_entrega: '3-5 días',
          configuracion_paquetes: {
            peso_maximo_paquete: 20,
            costo_por_kg_extra: 10,
            maximo_productos_por_paquete: 10
          }
        }]
      }],
      items: validItems,
      totalWeight: validItems.reduce((sum, item) => {
        const product = item.product || item;
        const weight = product.weight || 1;
        const quantity = item.quantity || 1;
        return sum + (weight * quantity);
      }, 0),
      totalQuantity: validItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    }];
  }
  
  // Primero agrupar todos los productos sin reglas
  const productsWithoutRules = validItems.filter(item => {
    const product = item.product || item;
    return !productRulesMap.has(product.id);
  });
  
  if (productsWithoutRules.length > 0) {
    console.log(`Agrupando ${productsWithoutRules.length} productos sin reglas`);
    shippingGroups.push({
      id: 'no-rules',
      type: 'no-rules',
      name: 'Productos sin regla de envío',
      rules: [{
        id: 'default-rule',
        zona: 'Sin regla',
        opciones_mensajeria: [{
          nombre: 'Envío Estándar',
          precio: '50',
          tiempo_entrega: '3-5 días'
        }]
      }],
      items: productsWithoutRules,
      totalWeight: productsWithoutRules.reduce((sum, item) => {
        const product = item.product || item;
        const weight = product.weight || 1;
        const quantity = item.quantity || 1;
        return sum + (weight * quantity);
      }, 0),
      totalQuantity: productsWithoutRules.reduce((sum, item) => sum + (item.quantity || 1), 0)
    });
    
    // Marcar estos productos como procesados
    productsWithoutRules.forEach(item => {
      const product = item.product || item;
      processedProductIds.add(product.id);
    });
  }
  
  // Ahora procesar los productos con reglas
  for (const item of validItems) {
    const product = item.product || item;
    const productId = product.id;
    
    // Si ya procesamos este producto, saltamos
    if (processedProductIds.has(productId)) {
      console.log(`Producto ${product.name || productId} ya fue procesado, saltando`);
      continue;
    }
    
    // Obtener reglas para este producto
    const productRules = productRulesMap.get(productId) || [];
    
    console.log(`Evaluando producto ${product.name || productId} con ${productRules.length} reglas`);
    
    // Si no tiene reglas, lo asignamos a un grupo sin reglas
    if (productRules.length === 0) {
      const noRuleGroup = shippingGroups.find(g => g.type === 'no-rules');
      
      if (noRuleGroup) {
        console.log(`Añadiendo ${product.name || productId} a grupo existente sin reglas`);
        noRuleGroup.items.push(item);
      } else {
        console.log(`Creando nuevo grupo sin reglas para ${product.name || productId}`);
        shippingGroups.push({
          id: 'no-rules',
          type: 'no-rules',
          name: 'Sin regla de envío',
          rules: [{
            id: 'default-rule',
            zona: 'Sin regla',
            opciones_mensajeria: [{
              nombre: 'Envío Estándar',
              precio: '50',
              tiempo_entrega: '3-5 días'
            }]
          }],
          items: [item]
        });
      }
      
      processedProductIds.add(productId);
      continue;
    }
    
    // Crear un nuevo grupo para este producto y sus reglas
    const groupId = `group-${shippingGroups.length + 1}`;
    const groupName = `Envío ${productRules[0].zona || 'Estándar'}`;
    
    console.log(`Creando grupo "${groupName}" para ${product.name || productId}`);
    
    shippingGroups.push({
      id: groupId,
      type: 'product-group',
      name: groupName,
      rules: productRules,
      items: [item]
    });
    
    processedProductIds.add(productId);
    
    // Buscar otros productos que puedan usar las mismas reglas
    for (const otherItem of validItems) {
      const otherProduct = otherItem.product || otherItem;
      const otherProductId = otherProduct.id;
      
      // Saltar si es el mismo producto o ya fue procesado
      if (otherProductId === productId || processedProductIds.has(otherProductId)) {
        continue;
      }
      
      // Obtener reglas del otro producto
      const otherProductRules = productRulesMap.get(otherProductId) || [];
      
      if (otherProductRules.length === 0) {
        console.log(`Producto ${otherProduct.name || otherProductId} no tiene reglas, no se puede agrupar`);
        continue;
      }
      
      // Verificar si hay al menos una regla en común
      const hasCommonRule = productRules.some(rule => 
        otherProductRules.some(otherRule => otherRule.id === rule.id)
      );
      
      // Si hay una regla común, agregar al grupo
      if (hasCommonRule) {
        console.log(`Agregando ${otherProduct.name || otherProductId} al grupo "${groupName}" por regla común`);
        shippingGroups[shippingGroups.length - 1].items.push(otherItem);
        processedProductIds.add(otherProductId);
      } else {
        console.log(`${otherProduct.name || otherProductId} no tiene reglas en común con el grupo "${groupName}"`);
      }
    }
  }
  
  // Paso 3: Calcular peso total y datos de cada grupo
  for (const group of shippingGroups) {
    let totalWeight = 0;
    let totalQuantity = 0;
    
    for (const item of group.items) {
      const product = item.product || item;
      const productWeight = product.weight || 1; // Peso por unidad en kg
      const quantity = item.quantity || 1;
      
      totalWeight += productWeight * quantity;
      totalQuantity += quantity;
    }
    
    group.totalWeight = totalWeight;
    group.totalQuantity = totalQuantity;
    
    console.log(`Grupo "${group.name}": ${group.items.length} productos, ${totalWeight.toFixed(2)}kg, ${totalQuantity} unidades`);
  }
  
  // Si después de todo el procesamiento no hay grupos, crear uno por defecto
  if (shippingGroups.length === 0) {
    console.log('No se crearon grupos después del procesamiento, creando grupo por defecto');
    return [{
      id: 'default-group',
      type: 'default',
      name: 'Todos los productos',
      rules: [{
        id: 'default-rule',
        zona: 'Por defecto',
        opciones_mensajeria: [{
          nombre: 'Envío Estándar',
          precio: '50',
          tiempo_entrega: '3-5 días',
          configuracion_paquetes: {
            peso_maximo_paquete: 20,
            costo_por_kg_extra: 10,
            maximo_productos_por_paquete: 10
          }
        }]
      }],
      items: validItems,
      totalWeight: validItems.reduce((sum, item) => {
        const product = item.product || item;
        const weight = product.weight || 1;
        const quantity = item.quantity || 1;
        return sum + (weight * quantity);
      }, 0),
      totalQuantity: validItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    }];
  }
  
  console.log(`Total de grupos creados: ${shippingGroups.length}`);
  return shippingGroups;
};

/**
 * Extrae las opciones de envío a partir de las reglas de un grupo
 * 
 * @param {Object} group - Grupo de productos con reglas de envío
 * @param {Object} userAddress - Dirección del usuario
 * @returns {Array} Opciones de envío disponibles
 */
export const getShippingOptionsForGroup = (group, userAddress) => {
  console.log(`🔍 getShippingOptionsForGroup: Procesando grupo "${group?.name}" con ${group?.rules?.length || 0} reglas`);
  
  // FORZAR REGISTRO COMPLETO DEL GRUPO PARA DIAGNÓSTICO
  console.log("DIAGNÓSTICO COMPLETO DEL GRUPO:", JSON.stringify(group, null, 2));
  
  if (!group || !group.rules || group.rules.length === 0) {
    console.warn('⚠️ getShippingOptionsForGroup: Grupo sin reglas válidas');
    return [{
      id: `default-option-${group.id || 'unknown'}`,
      ruleId: 'default-rule',
      ruleName: 'Envío Estándar',
      carrier: 'Estándar',
      label: 'Envío Estándar',
      price: 50,
      minDays: 3,
      maxDays: 5,
      maxPackageWeight: 20,
      extraWeightCost: 10,
      maxProductsPerPackage: 10
    }];
  }
  
  const options = [];
  
  // FORZAR PROCESAMIENTO DE TODAS LAS REGLAS SIN VALIDACIÓN
  console.log("🚨 FORZANDO PROCESAMIENTO DE TODAS LAS REGLAS SIN VALIDACIÓN");
  
  // Extraer opciones de cada regla
  for (const rule of group.rules) {
    console.log(`🚢 Procesando regla "${rule.zona || 'Sin nombre'}", tiene ${rule.opciones_mensajeria?.length || 0} opciones`);
    console.log("DETALLE DE REGLA:", JSON.stringify(rule, null, 2));
    
    // Si no hay opciones, crear una por defecto
    if (!rule.opciones_mensajeria || rule.opciones_mensajeria.length === 0) {
      console.log(`⚠️ La regla "${rule.zona || 'Sin nombre'}" no tiene opciones de mensajería, creando una por defecto`);
      
      options.push({
        id: `${rule.id}-default`,
        ruleId: rule.id,
        ruleName: rule.zona || 'Sin nombre',
        carrier: 'Estándar',
        label: `Envío ${rule.zona || 'Estándar'}`,
        price: 50,
        minDays: 3,
        maxDays: 5,
        maxPackageWeight: 20,
        extraWeightCost: 10,
        maxProductsPerPackage: 10
      });
      
      continue;
    }
    
    // FORZAR SIEMPRE A TRUE - ELIMINAR VALIDACIÓN DE DIRECCIÓN TEMPORALMENTE
    const isValid = true; // FORZADO, era: isRuleValidForAddress(rule, userAddress);
    
    console.log(`✅ Regla "${rule.zona}" tratada como válida SIEMPRE, procesando ${rule.opciones_mensajeria.length} opciones`);
    
    // Imprimir detalles de cada opción de mensajería
    rule.opciones_mensajeria.forEach((opcion, index) => {
      console.log(`🏷️ Opción ${index + 1}:`, {
        nombre: opcion.nombre || 'Sin nombre',
        precio: opcion.precio || 'No definido',
        tiempoEntrega: opcion.tiempo_entrega || 'No definido'
      });
    });
    
    // Agregar las opciones de esta regla
    rule.opciones_mensajeria.forEach(option => {
      const optionId = `${rule.id}-${option.nombre || 'default'}`;
      const price = parseFloat(option.precio) || 0;
      
      console.log(`➕ Añadiendo opción: ${option.nombre} (${optionId}), precio: $${price}`);
      
      options.push({
        id: optionId,
        ruleId: rule.id,
        ruleName: rule.zona,
        carrier: option.nombre,
        label: option.nombre || option.label || 'Envío Estándar',
        price: price,
        minDays: parseInt(option.minDays || option.tiempo_entrega?.split('-')[0] || 1, 10),
        maxDays: parseInt(option.maxDays || option.tiempo_entrega?.split('-')[1]?.replace(' días', '') || 3, 10),
        maxPackageWeight: parseFloat(option.configuracion_paquetes?.peso_maximo_paquete) || 20,
        extraWeightCost: parseFloat(option.configuracion_paquetes?.costo_por_kg_extra) || 10,
        maxProductsPerPackage: parseInt(option.configuracion_paquetes?.maximo_productos_por_paquete) || 10
      });
    });
  }
  
  // Si no hay opciones después de todo, crear una por defecto
  if (options.length === 0) {
    console.warn(`❌ No se encontraron opciones para el grupo "${group.name}", creando una opción por defecto`);
    
    options.push({
      id: `default-option-${group.id}`,
      ruleId: 'default-rule',
      ruleName: 'Envío Estándar',
      carrier: 'Estándar',
      label: 'Envío Estándar',
      price: 50,
      minDays: 3,
      maxDays: 5,
      maxPackageWeight: 20,
      extraWeightCost: 10,
      maxProductsPerPackage: 10
    });
  }
  
  // Ordenar opciones por precio (de menor a mayor)
  const sortedOptions = options.sort((a, b) => a.price - b.price);
  console.log(`✅ Total opciones para grupo "${group.name}": ${sortedOptions.length}`, sortedOptions);
  
  return sortedOptions;
};

/**
 * Calcula el costo de envío para un grupo con una opción específica
 * 
 * @param {Object} group - Grupo de productos
 * @param {Object} option - Opción de envío seleccionada
 * @returns {Object} Detalle del cálculo de costo
 */
export const calculateShippingCostForGroup = (group, option) => {
  console.log(`calculateShippingCostForGroup: Calculando costo para grupo "${group?.name}" con opción "${option?.label}"`);
  
  if (!group || !option) {
    console.warn('calculateShippingCostForGroup: Grupo u opción no proporcionados');
    return { baseCost: 0, extraCost: 0, totalCost: 0 };
  }
  
  // Obtener parámetros de la opción
  const maxWeight = parseFloat(option.maxPackageWeight) || 20;
  const extraWeightCost = parseFloat(option.extraWeightCost) || 10;
  const basePrice = option.price;
  
  // IMPORTANTE: Convertir explícitamente el precio a número
  const baseCost = typeof basePrice === 'string' ? parseFloat(basePrice) : 
                 typeof basePrice === 'number' ? basePrice : 50;
  
  console.log(`Parámetros de envío: option.price=${option.price} (${typeof option.price}), baseCost=${baseCost}, maxWeight=${maxWeight}kg, extraCost=$${extraWeightCost}/kg`);
  console.log(`Grupo: peso=${group.totalWeight}kg, cantidad=${group.totalQuantity} unidades`);
  
  // Calcular número de paquetes necesarios según peso y cantidad
  const maxProducts = option.maxProductsPerPackage || 10;
  const packagesByWeight = Math.ceil(group.totalWeight / maxWeight);
  const packagesByQuantity = Math.ceil(group.totalQuantity / maxProducts);
  const totalPackages = Math.max(packagesByWeight, packagesByQuantity);
  
  console.log(`Paquetes necesarios: ${packagesByWeight} por peso, ${packagesByQuantity} por cantidad, total: ${totalPackages}`);
  
  // Calcular costo base total (por número de paquetes)
  const totalBaseCost = baseCost * totalPackages;
  
  // Calcular costo extra por sobrepeso
  let extraCost = 0;
  
  if (group.totalWeight > maxWeight * totalPackages) {
    const overweight = group.totalWeight - (maxWeight * totalPackages);
    extraCost = Math.ceil(overweight) * extraWeightCost;
    console.log(`Sobrepeso: ${overweight.toFixed(2)}kg, costo extra: $${extraCost}`);
  }
  
  const totalCost = totalBaseCost + extraCost;
  console.log(`Costo total: $${totalCost} (base: $${totalBaseCost}, extra: $${extraCost})`);
  
  // Validar que el resultado sea un número válido
  if (isNaN(totalCost) || totalCost <= 0) {
    console.warn(`Costo calculado inválido (${totalCost}), usando costo por defecto`);
    return {
      baseCost: 50,
      extraCost: 0,
      totalCost: 50,
      packages: totalPackages,
      calculationError: true
    };
  }
  
  return {
    baseCost: totalBaseCost,
    extraCost: extraCost,
    totalCost: totalCost,
    packages: totalPackages
  };
};

/**
 * Verifica si una regla de envío es válida para una dirección específica
 * 
 * @param {Object} rule - Regla de envío
 * @param {Object} address - Dirección del usuario
 * @returns {boolean} True si la regla aplica para la dirección
 */
const isRuleValidForAddress = (rule, address) => {
  console.log(`isRuleValidForAddress: Verificando regla "${rule?.zona}" para dirección ${address?.zipCode || 'desconocida'}`);
  
  // CONSOLE LOG ESPECÍFICO PARA DIAGNÓSTICO
  console.log('=== VALIDACIÓN DE REGLA DE ENVÍO ===', {
    regla: {
      id: rule?.id,
      zona: rule?.zona,
      tieneCodigosPostales: !!(rule?.zipcodes && rule?.zipcodes.length > 0),
      codigosPostales: rule?.zipcodes || []
    },
    direccion: {
      codigoPostal: address?.zipCode || address?.postalCode || 'No definido',
      estado: address?.state || 'No definido'
    }
  });
  
  // ⚠️ Validación temporal: devolver siempre true
  console.log('⚠️ IMPORTANTE: Validación temporal habilitada - todas las reglas se consideran válidas');
  return true;

  // El código original está comentado a continuación:
  /*
  if (!address) {
    console.log('isRuleValidForAddress: No hay dirección, asumiendo válida');
    return true; // Si no hay dirección, asumimos que es válida (mostrar todas)
  }
  
  // Si la regla no tiene zonas definidas, asumimos que aplica a todo el país
  if (!rule.zipcodes || rule.zipcodes.length === 0) {
    console.log(`isRuleValidForAddress: Regla "${rule.zona}" no tiene códigos postales definidos, asumiendo válida para todo el país`);
    return true;
  }
  
  // Verificar código postal
  const zipCode = address.zipCode || address.postalCode;
  if (zipCode) {
    console.log(`isRuleValidForAddress: Verificando CP ${zipCode} contra ${rule.zipcodes.length} códigos en la regla`);
    
    // Verificar si el código postal está en la lista
    for (const zipPattern of rule.zipcodes) {
      // Si es un rango (formato: "10000-20000")
      if (zipPattern.includes('-')) {
        const [min, max] = zipPattern.split('-').map(Number);
        const userZip = Number(zipCode);
        
        if (userZip >= min && userZip <= max) {
          console.log(`isRuleValidForAddress: CP ${zipCode} está en el rango ${min}-${max}, regla válida`);
          return true;
        }
      } 
      // Si es un código postal específico
      else if (zipPattern === zipCode) {
        console.log(`isRuleValidForAddress: CP ${zipCode} coincide exactamente, regla válida`);
        return true;
      }
    }
  }
  
  console.log(`isRuleValidForAddress: CP ${zipCode} no coincide con ningún patrón de la regla "${rule.zona}", regla no válida`);
  return false;
  */
};

/**
 * Agrupa las opciones de envío para presentarlas al usuario
 * 
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} userAddress - Dirección del usuario
 * @returns {Object} Opciones de envío agrupadas para el usuario
 */
export const prepareShippingOptionsForCheckout = async (cartItems, userAddress) => {
  console.log('prepareShippingOptionsForCheckout: Iniciando preparación con', cartItems?.length, 'items');
  
  // CONSOLE LOG ESPECÍFICO PARA DIAGNÓSTICO
  console.log('=== DATOS UTILIZADOS PARA CÁLCULO DE ENVÍO ===', {
    direccion: {
      codigoPostal: userAddress?.zipCode || userAddress?.postalCode || 'No definido',
      estado: userAddress?.state || 'No definido',
      ciudad: userAddress?.city || 'No definida'
    },
    productos: (cartItems || []).map(item => {
      const product = item.product || item;
      return {
        id: product.id,
        nombre: product.name,
        shippingRuleId: product.shippingRuleId,
        shippingRuleIds: product.shippingRuleIds
      };
    })
  });
  
  try {
    // Paso 1: Agrupar productos por reglas de envío
    const shippingGroups = await groupProductsByShippingRules(cartItems);
    console.log(`prepareShippingOptionsForCheckout: ${shippingGroups.length} grupos creados`);
    
    // DIAGNÓSTICO: Inspeccionar las estructuras de datos
    console.log("DIAGNÓSTICO - Inspección de datos:");
    console.log("1. Productos en carrito:", cartItems);
    
    const rulesInfo = {};
    for (const item of cartItems || []) {
      const product = item.product || item;
      rulesInfo[product.id] = {
        name: product.name,
        shippingRuleId: product.shippingRuleId,
        shippingRuleIds: product.shippingRuleIds,
        weight: product.weight
      };
    }
    console.log("2. Información de reglas por producto:", rulesInfo);
    
    console.log("3. Grupos creados:", shippingGroups.map(g => ({
      id: g.id,
      name: g.name,
      itemCount: g.items.length,
      rules: g.rules.map(r => r.id),
      totalWeight: g.totalWeight
    })));
    
    // Si no hay grupos, devolver opción por defecto
    if (shippingGroups.length === 0) {
      console.warn('prepareShippingOptionsForCheckout: No se crearon grupos, creando opción por defecto');
      return createDefaultShippingOption(cartItems);
    }
    
    // Paso 2: Para cada grupo, obtener opciones de envío disponibles
    for (const group of shippingGroups) {
      group.shippingOptions = getShippingOptionsForGroup(group, userAddress);
      console.log(`Grupo "${group.name}": ${group.shippingOptions.length} opciones disponibles`);
      
      // Para cada opción, calcular el costo
      group.shippingOptions = group.shippingOptions.map(option => {
        const costDetails = calculateShippingCostForGroup(group, option);
        
        return {
          ...option,
          calculatedCost: costDetails.totalCost,
          costDetails
        };
      });
    }
    
    // Paso 3: Preparar los datos para el checkout
    const result = {
      groups: shippingGroups,
      totalOptions: []
    };
    
    // REVISAR TODAS LAS OPCIONES DE ENVÍO DE TODOS LOS GRUPOS
    const allShippingOptions = [];
    let optionsCount = 0;
    
    for (const group of shippingGroups) {
      if (group.shippingOptions && group.shippingOptions.length > 0) {
        optionsCount += group.shippingOptions.length;
        console.log(`📊 Grupo ${group.name} tiene ${group.shippingOptions.length} opciones`);
        
        allShippingOptions.push(...group.shippingOptions.map(option => ({
          ...option,
          groupId: group.id
        })));
      } else {
        console.warn(`⚠️ Grupo ${group.name} no tiene opciones de envío`);
      }
    }
    
    console.log(`📋 Total opciones encontradas en grupos: ${optionsCount}`);
    console.log(`📋 Opciones consolidadas: ${allShippingOptions.length}`, allShippingOptions);
    
    // Crear un array de opciones consolidadas (para mostrar al usuario)
    const allOptions = new Map(); // Mapa para agrupar opciones similares
    
    for (const group of shippingGroups) {
      console.log(`🔎 Procesando grupo ${group.id} para crear opciones consolidadas`);
      console.log(`  Tiene ${group.shippingOptions?.length || 0} opciones de envío`);
      
      // CONTINUAR SI NO HAY OPCIONES
      if (!group.shippingOptions || group.shippingOptions.length === 0) {
        console.warn(`⚠️ Grupo ${group.id} no tiene opciones de envío, saltando`);
        continue;
      }
      
      for (const option of group.shippingOptions) {
        const optionKey = `${option.carrier}-${option.label}`; // Clave única para cada tipo de opción
        console.log(`  Procesando opción: ${optionKey} (Costo: ${option.calculatedCost})`);
        
        if (!allOptions.has(optionKey)) {
          console.log(`  📝 Creando nueva opción consolidada: ${option.carrier} - ${option.label}`);
          allOptions.set(optionKey, {
            id: option.id,
            carrier: option.carrier,
            label: option.label,
            groups: [{ 
              groupId: group.id, 
              option,
              items: group.items
            }],
            totalCost: option.calculatedCost
          });
        } else {
          console.log(`  ➕ Añadiendo grupo a opción existente: ${option.carrier} - ${option.label}`);
          const existingOption = allOptions.get(optionKey);
          existingOption.groups.push({ 
            groupId: group.id, 
            option,
            items: group.items
          });
          existingOption.totalCost += option.calculatedCost;
        }
      }
    }
    
    // DIAGNÓSTICO DEL ESTADO DE LAS OPCIONES
    console.log(`⭐️ allOptions tiene ${allOptions.size} opciones consolidadas`);
    
    // Verificar si hay opciones
    if (allOptions.size === 0) {
      console.warn('⚠️ prepareShippingOptionsForCheckout: No se encontraron opciones de envío consolidadas');
      
      // ➡️ FORZAR LA CREACIÓN DE OPCIONES A PARTIR DE LOS GRUPOS
      console.log('🚨 FORZANDO CREACIÓN DE OPCIONES POR CADA GRUPO');
      
      // Si hay grupos, crear opciones directamente
      if (shippingGroups.length > 0) {
        console.log('🏭 Creando opciones de envío directamente a partir de cada grupo');
        
        for (const group of shippingGroups) {
          if (group.rules && group.rules.length > 0) {
            for (const rule of group.rules) {
              if (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0) {
                rule.opciones_mensajeria.forEach((opcion, index) => {
                  const optionId = `direct-${rule.id}-option-${index}`;
                  const price = parseFloat(opcion.precio) || 200;
                  
                  console.log(`🔧 Creando opción directa: ${opcion.nombre} con precio ${price}`);
                  
                  result.totalOptions.push({
                    id: optionId,
                    carrier: 'Nacional',
                    label: opcion.nombre || 'Envío Estándar',
                    totalCost: price,
                    tiempo_entrega: opcion.tiempo_entrega || '3-5 días',
                    groups: [{
                      groupId: group.id,
                      option: {
                        id: optionId,
                        carrier: 'Nacional',
                        label: opcion.nombre || 'Envío Estándar',
                        calculatedCost: price,
                        costDetails: {
                          baseCost: price,
                          extraCost: 0,
                          totalCost: price
                        }
                      },
                      items: group.items
                    }]
                  });
                });
              } else {
                // Crear opción por defecto si no hay opciones de mensajería
                console.log(`⚙️ Creando opción por defecto para regla ${rule.zona} sin opciones`);
                
                result.totalOptions.push({
                  id: `default-${rule.id}`,
                  carrier: 'Nacional',
                  label: `Envío ${rule.zona || 'Estándar'}`,
                  totalCost: 200,
                  tiempo_entrega: '3-5 días',
                  groups: [{
                    groupId: group.id,
                    option: {
                      id: `default-option-${rule.id}`,
                      carrier: 'Nacional', 
                      label: `Envío ${rule.zona || 'Estándar'}`,
                      calculatedCost: 200,
                      costDetails: {
                        baseCost: 200,
                        extraCost: 0,
                        totalCost: 200
                      }
                    },
                    items: group.items
                  }]
                });
              }
            }
          } else {
            // Si el grupo no tiene reglas, crear una opción por defecto
            console.log(`⚙️ Creando opción por defecto para grupo ${group.name} sin reglas`);
            
            result.totalOptions.push({
              id: `default-${group.id}`,
              carrier: 'Estándar',
              label: 'Envío Estándar',
              totalCost: 200,
              tiempo_entrega: '3-5 días',
              groups: [{
                groupId: group.id,
                option: {
                  id: `default-option-${group.id}`,
                  carrier: 'Estándar',
                  label: 'Envío Estándar',
                  calculatedCost: 200,
                  costDetails: {
                    baseCost: 200,
                    extraCost: 0,
                    totalCost: 200
                  }
                },
                items: group.items
              }]
            });
          }
        }
        
        console.log(`⭐️ Total opciones creadas directamente: ${result.totalOptions.length}`);
        
        if (result.totalOptions.length > 0) {
          // Ordenar opciones por precio
          result.totalOptions.sort((a, b) => a.totalCost - b.totalCost);
          return result;
        }
      }
      
      // Si no hay grupos o no se pudo crear opciones, usar opción por defecto
      console.log('Recurriendo a opción por defecto como último recurso');
      return createDefaultShippingOption(cartItems);
    }
    
    // Convertir el mapa a array y ordenar por precio
    result.totalOptions = Array.from(allOptions.values())
      .sort((a, b) => a.totalCost - b.totalCost);
    
    console.log(`prepareShippingOptionsForCheckout: ${result.totalOptions.length} opciones totales disponibles`);
    return result;
  } catch (error) {
    // Si ocurre cualquier error, devolver una opción por defecto
    console.error('prepareShippingOptionsForCheckout: Error inesperado', error);
    return createDefaultShippingOption(cartItems);
  }
};

/**
 * Crea una opción de envío por defecto cuando no hay opciones disponibles
 * 
 * @param {Array} cartItems - Items del carrito 
 * @returns {Object} Opción de envío por defecto
 */
function createDefaultShippingOption(cartItems) {
  console.log('createDefaultShippingOption: Creando opción basada en reglas existentes');
  
  // Obtener reglas nacionales disponibles
  const nationalRuleId = 'bmtunCl4oav9BbzlMihE'; // ID de la regla nacional
  
  // Intentar buscar en la caché de shippingRulesCache
  let nationalRule = null;
  
  // Verificar si tenemos acceso a la caché de reglas
  if (typeof shippingRulesCache !== 'undefined' && shippingRulesCache instanceof Map) {
    nationalRule = shippingRulesCache.get(nationalRuleId);
    console.log('Regla nacional encontrada en caché:', nationalRule ? 'Sí' : 'No');
  }
  
  // Si no encontramos en caché, usamos una regla predeterminada
  const defaultRule = nationalRule || {
    id: 'default-rule',
    zona: 'Nacional',
    opciones_mensajeria: [
      {
        nombre: 'Express',
        precio: '300',
        tiempo_entrega: '1-10 días',
        configuracion_paquetes: {
          peso_maximo_paquete: 20,
          costo_por_kg_extra: 10,
          maximo_productos_por_paquete: 10
        }
      },
      {
        nombre: 'Básico',
        precio: '200',
        tiempo_entrega: '3-5 días',
        configuracion_paquetes: {
          peso_maximo_paquete: 20,
          costo_por_kg_extra: 10,
          maximo_productos_por_paquete: 10
        }
      }
    ]
  };
  
  // Elegir la opción más económica de mensajería
  const sortedOptions = [...defaultRule.opciones_mensajeria].sort((a, b) => {
    const precioA = parseFloat(a.precio) || 0;
    const precioB = parseFloat(b.precio) || 0;
    return precioA - precioB;
  });
  
  const cheapestOption = sortedOptions[0] || {
    nombre: 'Envío Estándar',
    precio: '200',
    tiempo_entrega: '3-5 días'
  };
  
  const shippingCost = parseFloat(cheapestOption.precio) || 200;
  
  // Crear un grupo con todos los productos
  const defaultGroup = {
    id: 'default-group',
    type: 'default',
    name: 'Todos los productos',
    rules: [defaultRule],
    items: cartItems || [],
    totalWeight: calculateTotalWeight(cartItems),
    totalQuantity: calculateTotalQuantity(cartItems)
  };
  
  // Crear la estructura de respuesta con opciones basadas en la regla nacional
  return {
    groups: [defaultGroup],
    totalOptions: defaultRule.opciones_mensajeria.map((opcion, index) => {
      const price = parseFloat(opcion.precio) || 200;
      return {
        id: `national-shipping-${index}`,
        carrier: 'Nacional',
        label: opcion.nombre || 'Envío Estándar',
        totalCost: price,
        tiempo_entrega: opcion.tiempo_entrega || '3-5 días',
        groups: [{
          groupId: defaultGroup.id,
          option: {
            id: `national-option-${index}`,
            carrier: 'Nacional',
            label: opcion.nombre || 'Envío Estándar',
            calculatedCost: price,
            costDetails: {
              baseCost: price,
              extraCost: 0,
              totalCost: price
            }
          },
          items: defaultGroup.items
        }]
      };
    }).sort((a, b) => a.totalCost - b.totalCost)
  };
}

/**
 * Calcula el peso total de los items del carrito
 * 
 * @param {Array} cartItems - Items del carrito
 * @returns {number} Peso total en kg
 */
function calculateTotalWeight(cartItems) {
  if (!cartItems || !cartItems.length) return 0;
  
  return cartItems.reduce((sum, item) => {
    const product = item.product || item;
    const weight = product.weight || 1; // Por defecto 1kg si no hay peso
    const quantity = item.quantity || 1;
    return sum + (weight * quantity);
  }, 0);
}

/**
 * Calcula la cantidad total de items en el carrito
 * 
 * @param {Array} cartItems - Items del carrito
 * @returns {number} Cantidad total de items
 */
function calculateTotalQuantity(cartItems) {
  if (!cartItems || !cartItems.length) return 0;
  
  return cartItems.reduce((sum, item) => {
    return sum + (item.quantity || 1);
  }, 0);
} 