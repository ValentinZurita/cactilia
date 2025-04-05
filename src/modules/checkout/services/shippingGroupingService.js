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
    return []; // Retornar array vacío en vez de crear una opción por defecto
  }
  
  const options = [];
  
  // FORZAR PROCESAMIENTO DE TODAS LAS REGLAS SIN VALIDACIÓN
  console.log("🚨 FORZANDO PROCESAMIENTO DE TODAS LAS REGLAS SIN VALIDACIÓN");
  
  // Extraer opciones de cada regla
  for (const rule of group.rules) {
    console.log(`🚢 Procesando regla "${rule.zona || 'Sin nombre'}", tiene ${rule.opciones_mensajeria?.length || 0} opciones`);
    console.log("DETALLE DE REGLA:", JSON.stringify(rule, null, 2));
    
    // Si no hay opciones de mensajería, saltamos esta regla en lugar de crear una por defecto
    if (!rule.opciones_mensajeria || rule.opciones_mensajeria.length === 0) {
      console.log(`⚠️ La regla "${rule.zona || 'Sin nombre'}" no tiene opciones de mensajería, saltando`);
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
        tiempoEntrega: opcion.tiempo_entrega || 'No definido',
        configuracion_paquetes: opcion.configuracion_paquetes || 'No definida'
      });
    });
    
    // Agregar las opciones de esta regla
    rule.opciones_mensajeria.forEach(option => {
      // Validar que tenga nombre y precio
      if (!option.nombre || !option.precio) {
        console.warn(`⚠️ Opción sin nombre o precio, saltando`);
        return;
      }
      
      const optionId = `${rule.id}-${option.nombre || 'default'}`;
      const price = parseFloat(option.precio) || 0;
      
      if (price <= 0) {
        console.warn(`⚠️ Precio inválido (${price}), saltando opción`);
        return;
      }
      
      // Extraer configuración de paquetes o usar valores por defecto
      const configPaquetes = option.configuracion_paquetes || {};
      const maxPackageWeight = parseFloat(configPaquetes.peso_maximo_paquete);
      const extraWeightCost = parseFloat(configPaquetes.costo_por_kg_extra);
      const maxProductsPerPackage = parseInt(configPaquetes.maximo_productos_por_paquete);
      
      // Validar que tenga configuración de paquetes válida
      if (!maxPackageWeight || !extraWeightCost || !maxProductsPerPackage) {
        console.warn(`⚠️ Opción sin configuración de paquetes válida, saltando`, configPaquetes);
        return;
      }
      
      console.log(`➕ Añadiendo opción: ${option.nombre} (${optionId}), precio: $${price}, configuración:`, {
        maxPackageWeight,
        extraWeightCost,
        maxProductsPerPackage,
        raw: configPaquetes
      });
      
      options.push({
        id: optionId,
        ruleId: rule.id,
        ruleName: rule.zona,
        carrier: option.nombre,
        label: option.nombre || option.label || 'Envío Estándar',
        price: price,
        minDays: parseInt(option.minDays || option.tiempo_entrega?.split('-')[0] || 1, 10),
        maxDays: parseInt(option.maxDays || option.tiempo_entrega?.split('-')[1]?.replace(' días', '') || 3, 10),
        maxPackageWeight: maxPackageWeight,
        extraWeightCost: extraWeightCost,
        maxProductsPerPackage: maxProductsPerPackage,
        configuracion_paquetes: {
          peso_maximo_paquete: maxPackageWeight,
          costo_por_kg_extra: extraWeightCost,
          maximo_productos_por_paquete: maxProductsPerPackage
        }
      });
    });
  }
  
  // Si no hay opciones después de todo el procesamiento, retornar array vacío
  if (options.length === 0) {
    console.warn(`❌ No se encontraron opciones válidas para el grupo "${group.name}"`);
    return [];
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
 * Extrae opciones de envío directamente de reglas
 * @param {Array} rules - Reglas de envío
 * @returns {Array} Opciones de envío extraídas
 */
export const extractShippingOptionsFromRules = (rules) => {
  console.log('Extrayendo opciones de envío de', rules?.length || 0, 'reglas');
  const options = [];
  
  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    console.warn('No hay reglas para extraer opciones');
    return [];
  }
  
  // Procesar cada regla
  rules.forEach(rule => {
    if (!rule.opciones_mensajeria || !Array.isArray(rule.opciones_mensajeria)) {
      console.warn('Regla sin opciones de mensajería válidas:', rule.id || 'unknown');
      return;
    }
    
    // Extraer opciones válidas
    rule.opciones_mensajeria.forEach((opcion, index) => {
      // Verificar datos requeridos
      if (!opcion.nombre || !opcion.precio) return;
      
      const price = parseFloat(opcion.precio);
      if (isNaN(price) || price <= 0) return;
      
      // Datos de configuración (con valores por defecto si no existen)
      const configPaquetes = opcion.configuracion_paquetes || {};
      const pesoMaximo = parseFloat(configPaquetes.peso_maximo_paquete) || 20;
      const costoPorKgExtra = parseFloat(configPaquetes.costo_por_kg_extra) || 10;
      const maxProductosPorPaquete = parseInt(configPaquetes.maximo_productos_por_paquete) || 10;
      
      options.push({
        id: `${rule.id}-${index}`,
        ruleId: rule.id,
        ruleName: rule.zona || 'Envío',
        carrier: opcion.nombre,
        label: opcion.nombre,
        price: price,
        tiempo_entrega: opcion.tiempo_entrega || '3-5 días',
        maxPackageWeight: pesoMaximo,
        extraWeightCost: costoPorKgExtra,
        maxProductsPerPackage: maxProductosPorPaquete,
        configuracion_paquetes: configPaquetes
      });
    });
  });
  
  return options;
};

/**
 * Calcula el costo de envío basado en peso y límites
 * @param {number} totalWeight - Peso total de productos
 * @param {number} totalQuantity - Cantidad total de productos
 * @param {Object} option - Opción de envío seleccionada
 * @returns {Object} Detalles del costo calculado
 */
export const calculateShippingCost = (totalWeight, totalQuantity, option) => {
  if (!option) return { totalCost: 0 };
  
  // Extraer parámetros
  const basePrice = parseFloat(option.price) || 0;
  const maxWeight = parseFloat(option.maxPackageWeight) || 20;
  const extraWeightCost = parseFloat(option.extraWeightCost) || 10;
  const maxProducts = parseInt(option.maxProductsPerPackage) || 10;
  
  // Calcular paquetes necesarios
  const packagesByWeight = Math.ceil(totalWeight / maxWeight);
  const packagesByQuantity = Math.ceil(totalQuantity / maxProducts);
  const totalPackages = Math.max(packagesByWeight, packagesByQuantity, 1);
  
  // Calcular costo base
  const totalBaseCost = basePrice * totalPackages;
  
  // Calcular sobrepeso
  let extraCost = 0;
  if (totalWeight > maxWeight * totalPackages) {
    const overweight = totalWeight - (maxWeight * totalPackages);
    extraCost = Math.ceil(overweight) * extraWeightCost;
  }
  
  // Calcular costo total
  const totalCost = totalBaseCost + extraCost;
  
  return {
    baseCost: totalBaseCost,
    extraCost: extraCost,
    totalCost: totalCost,
    packages: totalPackages,
    details: {
      maxPackageWeight: maxWeight,
      extraWeightCost: extraWeightCost,
      maxProductsPerPackage: maxProducts
    }
  };
};

/**
 * Obtiene opciones de envío para mostrar en checkout
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} userAddress - Dirección del usuario
 * @returns {Promise<Object>} Opciones de envío disponibles
 */
export const prepareShippingOptionsForCheckout = async (cartItems, userAddress) => {
  console.log('Preparando opciones de envío para', cartItems?.length || 0, 'productos');
  
  if (!cartItems || cartItems.length === 0) {
    console.warn('No hay productos para calcular envío');
    return { options: [] };
  }
  
  try {
    // TRUCO: Forzar uso de regla nacional para diagnóstico
    console.log('💡 FORZANDO USO DE REGLA NACIONAL PARA DIAGNÓSTICO');
    
    // Obtener la regla nacional directamente
    let nacionalRule = null;
    try {
      const { ok, data } = await fetchShippingRuleById('bmtunCl4oav9BbzlMihE');
      if (ok && data) {
        nacionalRule = data;
        console.log('✅ Regla nacional obtenida exitosamente:', {
          id: data.id,
          zona: data.zona,
          opciones: data.opciones_mensajeria?.length || 0
        });
      }
    } catch (error) {
      console.error('Error al obtener regla nacional:', error);
    }
    
    if (!nacionalRule) {
      console.warn('⚠️ No se pudo obtener la regla nacional, creando una por defecto');
      nacionalRule = {
        id: 'bmtunCl4oav9BbzlMihE',
        zona: 'Nacional',
        opciones_mensajeria: [
          {
            nombre: "Correos de México",
            precio: "300",
            tiempo_entrega: "1-10 días",
            configuracion_paquetes: {
              peso_maximo_paquete: "20",
              costo_por_kg_extra: "10",
              maximo_productos_por_paquete: "10"
            }
          },
          {
            nombre: "Correos de México",
            precio: "200",
            tiempo_entrega: "5-15 días",
            configuracion_paquetes: {
              peso_maximo_paquete: "20",
              costo_por_kg_extra: "10",
              maximo_productos_por_paquete: "10"
            }
          }
        ]
      };
    }
    
    // Usar sólo la regla nacional
    const rules = [nacionalRule];
    console.log('👉 Usando regla nacional para generar opciones de envío');
    
    // 3. Extraer opciones de las reglas
    const shippingOptions = extractShippingOptionsFromRules(rules);
    console.log(`📦 Se extrajeron ${shippingOptions.length} opciones de envío`);
    
    // 4. Calcular peso y cantidad total
    const totalWeight = cartItems.reduce((sum, item) => {
      const product = item.product || item;
      const weight = parseFloat(product.weight) || 1;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (weight * quantity);
    }, 0);
    
    const totalQuantity = cartItems.reduce((sum, item) => {
      return sum + (parseInt(item.quantity) || 1);
    }, 0);
    
    console.log('Totales calculados:', { peso: totalWeight, cantidad: totalQuantity });
    
    // 5. Calcular costo para cada opción
    const optionsWithCost = shippingOptions.map(option => {
      const costDetails = calculateShippingCost(totalWeight, totalQuantity, option);
      
      return {
        ...option,
        calculatedCost: costDetails.totalCost,
        totalCost: costDetails.totalCost,
        packages: costDetails.packages,
        costDetails: {
          baseCost: costDetails.baseCost,
          extraCost: costDetails.extraCost,
          totalCost: costDetails.totalCost
        },
        minDays: parseInt(option.tiempo_entrega?.split('-')[0] || 1, 10),
        maxDays: parseInt(option.tiempo_entrega?.split('-')[1]?.replace(' días', '') || 5, 10),
        details: `${costDetails.packages > 1 ? `${costDetails.packages} paquetes, ` : ''}${option.tiempo_entrega}`
      };
    });
    
    console.log(`📦 Se calcularon costos para ${optionsWithCost.length} opciones`);
    console.log('Opciones con costos calculados:', optionsWithCost);
    
    // 6. Ordenar por precio
    optionsWithCost.sort((a, b) => a.totalCost - b.totalCost);
    
    return { 
      options: optionsWithCost,
      totalWeight,
      totalQuantity
    };
  } catch (error) {
    console.error('Error al preparar opciones de envío:', error);
    return { options: [] };
  }
} 