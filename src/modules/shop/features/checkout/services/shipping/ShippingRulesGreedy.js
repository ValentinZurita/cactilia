/**
 * Algoritmo Greedy para cálculo de opciones de envío
 * 
 * Esta implementación simplificada:
 * 1. Filtra reglas compatibles con la dirección del usuario
 * 2. Asigna la mejor regla para cada producto
 * 3. Agrupa productos por regla para minimizar envíos
 * 4. Calcula costos precisos basados en los datos de Firebase
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Determina si una regla de envío es válida para la dirección proporcionada
 * @param {Object} rule - Regla de envío desde Firebase
 * @param {Object} address - Dirección del usuario
 * @returns {boolean} - true si la regla es válida
 */
const isRuleValidForAddress = (rule, address) => {
  if (!rule || !address) return false;
  
  // Normalizar datos para comparación
  const postalCode = (address.postalCode || address.zip || '').toString().trim();
  const state = (address.state || address.provincia || '').toString().toLowerCase().trim();
  const country = (address.country || 'MX').toString().toLowerCase().trim();
  
  // Verificar tipo de cobertura
  switch(rule.coverage_type || rule.tipo_cobertura) {
    // Cobertura nacional
    case 'nacional':
      return true;
    
    // Cobertura por código postal
    case 'por_codigo_postal':
    case 'postal_code':
      return Array.isArray(rule.coverage_values) && 
             rule.coverage_values.some(cp => cp.toString().trim() === postalCode);
    
    // Cobertura por estado/provincia
    case 'por_estado':
    case 'state':
      return Array.isArray(rule.coverage_values) && 
             rule.coverage_values.some(s => s.toString().toLowerCase().trim() === state);
             
    // Cobertura por país
    case 'por_pais':
    case 'country':
      return rule.coverage_country?.toLowerCase().trim() === country;
  }
  
  // Verificar campos alternativos (compatibilidad con esquema actual)
  if (Array.isArray(rule.cobertura_cp) && rule.cobertura_cp.some(cp => cp.toString().trim() === postalCode)) {
    return true;
  }
  
  if (Array.isArray(rule.cobertura_estados) && rule.cobertura_estados.some(s => s.toString().toLowerCase().trim() === state)) {
    return true;
  }
  
  return false;
};

/**
 * Calcula el costo de envío basado en datos reales
 * @param {Object} rule - Regla de envío
 * @param {Array} products - Productos a enviar
 * @returns {Object} - Información de costo y tiempo de entrega
 */
const calculateShippingDetails = (rule, products) => {
  if (!rule || !products || products.length === 0) {
    return { cost: 0, minDays: 0, maxDays: 0, isFree: false };
  }
  
  // Calcular subtotal para validar envío gratis por monto mínimo
  const subtotal = products.reduce((sum, item) => {
    const product = item.product || item;
    const price = parseFloat(product.price || 0);
    const quantity = parseInt(item.quantity || 1, 10);
    return sum + (price * quantity);
  }, 0);
  
  // Por defecto, tomar datos de la regla
  let cost = parseFloat(rule.precio_base || rule.base_price || 0);
  let isFree = rule.envio_gratis === true || rule.free_shipping === true;
  let minDays = rule.tiempo_minimo || rule.min_days || 3;
  let maxDays = rule.tiempo_maximo || rule.max_days || 7;
  
  // Si tiene opciones de mensajería, usar datos de la opción preferida
  if (Array.isArray(rule.opciones_mensajeria) && rule.opciones_mensajeria.length > 0) {
    // Ordenar por precio para obtener la más económica
    const sortedOptions = [...rule.opciones_mensajeria].sort((a, b) => 
      parseFloat(a.precio || 0) - parseFloat(b.precio || 0)
    );
    
    const bestOption = sortedOptions[0];
    cost = parseFloat(bestOption.precio || 0);
    minDays = bestOption.tiempo_minimo || bestOption.min_days || minDays;
    maxDays = bestOption.tiempo_maximo || bestOption.max_days || maxDays;
  }
  
  // Verificar si aplica envío gratis por monto mínimo
  if (!isFree && rule.envio_gratis_monto_minimo && subtotal >= parseFloat(rule.envio_gratis_monto_minimo)) {
    isFree = true;
  }
  
  // Si es gratis, costo cero
  if (isFree) {
    cost = 0;
  }
  
  return {
    cost,
    minDays,
    maxDays,
    isFree
  };
};

/**
 * Algoritmo principal para encontrar opciones de envío óptimas
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} address - Dirección del usuario
 * @param {Array} shippingRules - Reglas de envío desde Firebase
 * @returns {Object} Resultado con opciones de envío
 */
export const findBestShippingOptionsGreedy = (cartItems, address, shippingRules) => {
  // Validar entradas
  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "No hay productos en el carrito" };
  }
  
  if (!address) {
    return { success: false, error: "No se proporcionó dirección de envío" };
  }
  
  if (!shippingRules || !Array.isArray(shippingRules) || shippingRules.length === 0) {
    return { success: false, error: "No hay reglas de envío disponibles" };
  }
  
  console.log(`🔍 Procesando ${cartItems.length} productos con ${shippingRules.length} reglas de envío`);
  
  // Paso 1: Encontrar reglas válidas para cada producto
  const validRulesByProduct = {};
  const productsWithoutRules = [];
  
  cartItems.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    
    // Obtener reglas asignadas al producto
    const assignedRuleIds = product.shippingRuleIds || [];
    
    if (!assignedRuleIds.length) {
      productsWithoutRules.push(product);
      return;
    }
    
    // Filtrar reglas válidas que cubran la dirección
    const validRules = shippingRules
      .filter(rule => assignedRuleIds.includes(rule.id) && isRuleValidForAddress(rule, address));
    
    if (validRules.length > 0) {
      validRulesByProduct[productId] = validRules;
    } else {
      productsWithoutRules.push(product);
    }
  });
  
  // Si hay productos sin reglas válidas, no podemos completar el envío
  if (productsWithoutRules.length > 0) {
    const productNames = productsWithoutRules.map(p => p.name || `ID: ${p.id}`).join(', ');
    return { 
      success: false, 
      error: `No hay opciones de envío disponibles para: ${productNames}`,
      products_without_shipping: productsWithoutRules.map(p => p.id)
    };
  }
  
  // Paso 2: Agrupar productos por regla para minimizar envíos
  const shippingGroups = [];
  const productAssignments = {};
  
  // Primera pasada: intentar agrupar productos por reglas similares
  cartItems.forEach(item => {
    const product = item.product || item;
    const productId = product.id;
    const validRules = validRulesByProduct[productId] || [];
    
    if (validRules.length === 0) return;
    
    // Ordenar reglas por costo (menor primero)
    const sortedRules = [...validRules].sort((a, b) => {
      const costA = parseFloat(a.precio_base || a.base_price || 100);
      const costB = parseFloat(b.precio_base || b.base_price || 100);
      return costA - costB;
    });
    
    // Intentar añadir a un grupo existente
    let addedToGroup = false;
    
    for (const group of shippingGroups) {
      // Verificar si alguna regla del producto es la misma que la del grupo
      if (sortedRules.some(rule => rule.id === group.rule.id)) {
        group.products.push(product);
        productAssignments[productId] = group.rule.id;
        addedToGroup = true;
        break;
      }
    }
    
    // Si no se pudo añadir a ningún grupo, crear uno nuevo
    if (!addedToGroup) {
      const bestRule = sortedRules[0];
      const newGroup = {
        id: uuidv4(),
        rule: bestRule,
        products: [product]
      };
      
      shippingGroups.push(newGroup);
      productAssignments[productId] = bestRule.id;
    }
  });
  
  // Paso 3: Calcular costos y detalles de envío para cada grupo
  const shippingOptions = shippingGroups.map(group => {
    const { cost, minDays, maxDays, isFree } = calculateShippingDetails(group.rule, group.products);
    
    const option = {
      id: `ship_${uuidv4()}`,
      name: group.rule.nombre || group.rule.name || 'Envío Estándar',
      carrier: group.rule.carrier || group.rule.proveedor || '',
      description: group.rule.descripcion || group.rule.description || '',
      price: cost,
      products: group.products.map(p => p.id),
      isFree,
      rule_id: group.rule.id,
      minDays,
      maxDays,
      isNational: (group.rule.coverage_type === 'nacional' || group.rule.tipo === 'nacional'),
      zoneType: group.rule.coverage_type || group.rule.tipo || 'standard',
      deliveryTime: minDays === maxDays 
        ? `${minDays} días hábiles` 
        : `${minDays}-${maxDays} días hábiles`
    };
    
    // Generar descripción detallada
    option.description = generateDetailedDescription(option, group.products);
    
    return option;
  });
  
  return {
    success: true,
    options: shippingOptions,
    productAssignments
  };
};

/**
 * Genera una descripción detallada para una opción de envío
 * @param {Object} option - Opción de envío
 * @param {Array} products - Productos asociados
 * @returns {string} - Descripción detallada
 */
export const generateDetailedDescription = (option, products = []) => {
  if (!option) return '';

  const isFree = option.isFree || option.price === 0;
  let description = '';

  // Tipo de envío
  if (option.isNational) {
    description += 'Envío nacional';
  } else if (option.zoneType === 'local') {
    description += 'Envío local';
  } else if (option.zoneType === 'express') {
    description += 'Envío express';
  } else {
    description += 'Envío estándar';
  }

  // Tiempo de entrega
  if (option.deliveryTime) {
    description += ` - ${option.deliveryTime}`;
  } else if (option.minDays && option.maxDays) {
    if (option.minDays === option.maxDays) {
      description += ` - ${option.minDays} días hábiles`;
    } else {
      description += ` - ${option.minDays}-${option.maxDays} días hábiles`;
    }
  }

  // Precio
  if (isFree) {
    description += ' - GRATIS';
  } else {
    const formattedPrice = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(option.price);
    description += ` - ${formattedPrice}`;
  }

  // Información de producto si es relevante
  if (products && products.length > 0) {
    if (products.length === 1) {
      const product = products[0];
      description += `\nProducto: ${product.name || 'Producto único'}`;
    } else {
      description += `\nIncluye envío para ${products.length} productos`;
    }
  }

  // Información de carrier si está disponible
  if (option.carrier) {
    description += `\nTransportista: ${option.carrier}`;
  }

  return description;
};

/**
 * Función principal que encuentra las mejores opciones de envío
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} address - Dirección del usuario
 * @param {Array} shippingRules - Reglas de envío disponibles
 * @returns {Object} - Resultado con opciones de envío
 */
export const findBestShippingOptions = (cartItems, address, shippingRules) => {
  return findBestShippingOptionsGreedy(cartItems, address, shippingRules);
}; 