/**
 * Servicio simplificado para manejar la agrupación de productos según reglas de envío
 * Implementa la lógica básica para agrupar productos, calcular costos y opciones de envío
 */

import { fetchShippingRuleById } from '../../admin/services/shippingRuleService';
import { groupProductsIntoPackages, calculateTotalShippingCost } from '../utils/shippingCalculator';

/**
 * Agrupa los productos del carrito según sus reglas de envío asociadas
 * 
 * @param {Array} cartItems - Productos en el carrito
 * @returns {Promise<Array>} Grupos de productos según reglas de envío
 */
export const groupProductsByShippingRules = async (cartItems) => {
  console.log('🚢 groupProductsByShippingRules: Iniciando agrupación con', cartItems?.length, 'items');
  
  if (!cartItems || cartItems.length === 0) {
    console.warn('No hay items para agrupar');
    return [];
  }
  
  // Validar que los items tengan la estructura correcta
  const validItems = cartItems.filter(item => {
    if (!item) return false;
    
    // Obtener el producto (puede estar en item.product o directamente en item)
    const product = item.product || item;
    return product && product.id;
  });
  
  console.log('🛒 Items válidos:', validItems.length);
  
  // Paso 1: Mapear productos a sus reglas de envío
  const productRulesMap = new Map(); // Mapa producto -> reglas de envío
  const shippingRulesCache = new Map(); // Cache para evitar duplicar peticiones
  
  // Obtener todos los IDs de reglas de envío asociados a los productos
  for (const item of validItems) {
    const product = item.product || item;
    const productId = product.id;
    
    // Verificar si el producto tiene reglas de envío asignadas
    let shippingRuleIds = [];
    
    // Primero intentar con shippingRuleIds (array de IDs)
    if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0) {
      shippingRuleIds = product.shippingRuleIds.filter(id => id && id.trim() !== '');
    } 
    // Si no hay un array válido, intentar con shippingRuleId (string único)
    else if (product.shippingRuleId && typeof product.shippingRuleId === 'string' && product.shippingRuleId.trim() !== '') {
      shippingRuleIds = [product.shippingRuleId];
    }
    
    // Si no tiene reglas de envío, saltamos
    if (shippingRuleIds.length === 0) {
      console.warn(`Producto ${product.name || productId} no tiene reglas de envío asignadas`);
      continue;
    }
    
    // Obtener detalles de cada regla
    const productRules = [];
    
    for (const ruleId of shippingRuleIds) {
      if (!ruleId) continue;
      
      // Verificar si la regla ya está en caché
      if (!shippingRulesCache.has(ruleId)) {
        try {
          const { ok, data } = await fetchShippingRuleById(ruleId);
          if (ok && data) {
            shippingRulesCache.set(ruleId, data);
          } else {
            // Si no se encuentra la regla, crear una regla básica de fallback
            shippingRulesCache.set(ruleId, createDefaultRule(ruleId));
          }
        } catch (error) {
          console.error(`Error obteniendo regla ${ruleId}:`, error);
          // Si hay error, crear una regla básica de fallback
          shippingRulesCache.set(ruleId, createDefaultRule(ruleId));
        }
      }
      
      // Si tenemos la regla, la agregamos
      if (shippingRulesCache.has(ruleId)) {
        productRules.push(shippingRulesCache.get(ruleId));
      }
    }
    
    if (productRules.length > 0) {
      productRulesMap.set(productId, productRules);
    }
  }
  
  // Paso 2: Agrupar productos por reglas de envío comunes
  const shippingGroups = [];
  const processedProductIds = new Set();
  
  // Si ningún producto tiene reglas, crear un grupo sin reglas para todos
  if (productRulesMap.size === 0) {
    return createSingleShippingGroup(validItems);
  }
  
  // Primero agrupar todos los productos sin reglas
  const productsWithoutRules = validItems.filter(item => {
    const product = item.product || item;
    return !productRulesMap.has(product.id);
  });
  
  if (productsWithoutRules.length > 0) {
    shippingGroups.push(createShippingGroup('no-rules', 'Productos sin regla de envío', 
                                         productsWithoutRules, [createDefaultRule()]));
    
    // Marcar estos productos como procesados
    productsWithoutRules.forEach(item => {
      const product = item.product || item;
      processedProductIds.add(product.id);
    });
  }
  
  // Paso 3: Procesar por ruleId (simplificado: solo usamos la primera regla por producto)
  const ruleGroups = new Map(); // Mapa ruleId -> items asociados
  
  // Agrupar productos por primera regla disponible
  for (const item of validItems) {
    const product = item.product || item;
    const productId = product.id;
    
    // Si ya procesamos este producto, saltamos
    if (processedProductIds.has(productId)) continue;
    
    const productRules = productRulesMap.get(productId) || [];
    
    if (productRules.length === 0) continue;
    
    // Simplificación: usamos solo la primera regla
    const firstRule = productRules[0];
    const firstRuleId = firstRule.id;
    
    // Agregar al grupo por regla
    if (!ruleGroups.has(firstRuleId)) {
      ruleGroups.set(firstRuleId, {
        rule: firstRule,
        items: []
      });
    }
    
    ruleGroups.get(firstRuleId).items.push(item);
    processedProductIds.add(productId);
  }
  
  // Convertir grupos a formato final
  ruleGroups.forEach((group, ruleId) => {
    shippingGroups.push(createShippingGroup(
      ruleId,
      `Grupo: ${group.rule.zona || 'Sin nombre'}`,
      group.items,
      [group.rule]
    ));
  });
  
  return shippingGroups;
};

/**
 * Prepara las opciones de envío para el checkout
 * Agrupa productos, calcula costos y formatea opciones
 * 
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} userAddress - Dirección del usuario
 * @returns {Promise<Object>} Datos de envío: grupos y opciones totales
 */
export const prepareShippingOptionsForCheckout = async (cartItems, userAddress) => {
  // Obtener grupos de productos
  const groups = await groupProductsByShippingRules(cartItems);
  
  if (!groups || groups.length === 0) {
    return {
      groups: [],
      totalOptions: []
    };
  }
  
  // Calcular opciones de envío por grupo
  groups.forEach(group => {
    // Obtener opciones de la regla
    const shippingOptions = [];
    
    group.rules.forEach(rule => {
      if (rule.opciones_mensajeria && Array.isArray(rule.opciones_mensajeria)) {
        rule.opciones_mensajeria.forEach(option => {
          // Convertir opción a formato estándar
          const shippingOption = formatShippingOption(option, rule);
          
          // Calcular paquetes necesarios
          const packages = groupProductsIntoPackages(group.items, shippingOption);
          
          // Calcular costo total
          const totalCost = calculateTotalShippingCost(packages, shippingOption);
          
          // Verificar envío gratuito
          const isFreeShipping = 
            rule.envio_gratis || 
            (rule.envio_gratis_monto_minimo && calculateGroupSubtotal(group.items) >= parseFloat(rule.envio_gratis_monto_minimo));
          
          shippingOptions.push({
            ...shippingOption,
            packages,
            totalCost: isFreeShipping ? 0 : totalCost,
            isFreeShipping
          });
        });
      }
    });
    
    // Ordenar por costo (más barato primero)
    group.shippingOptions = shippingOptions.sort((a, b) => a.totalCost - b.totalCost);
  });
  
  // Calcular opciones totales combinadas
  const totalOptions = calculateTotalShippingOptions(groups);
  
  return {
    groups,
    totalOptions
  };
};

/**
 * Calcula el subtotal de un grupo de productos
 * @param {Array} items - Productos en el grupo
 * @returns {Number} - Subtotal del grupo
 */
const calculateGroupSubtotal = (items) => {
  return items.reduce((total, item) => {
    const price = parseFloat(item.price || (item.product && item.product.price) || 0);
    const quantity = parseInt(item.quantity || 1);
    return total + (price * quantity);
  }, 0);
};

/**
 * Calcula opciones totales de envío combinando todos los grupos
 * @param {Array} groups - Grupos de envío
 * @returns {Array} - Opciones de envío totales
 */
const calculateTotalShippingOptions = (groups) => {
  if (!groups || groups.length === 0) return [];
  
  // Si solo hay un grupo, usamos sus opciones directamente
  if (groups.length === 1) {
    return groups[0].shippingOptions || [];
  }
  
  // Para múltiples grupos, generamos combinaciones de opciones
  // Simplificado: usamos la opción más barata de cada grupo
  const combinedOptions = [];
  const cheapestOptions = groups.map(group => {
    const options = group.shippingOptions || [];
    return options.length > 0 ? options[0] : null;
  }).filter(option => option !== null);
  
  if (cheapestOptions.length > 0) {
    const totalCost = cheapestOptions.reduce((sum, option) => sum + option.totalCost, 0);
    
    combinedOptions.push({
      id: 'combined-option',
      label: 'Envío combinado',
      carrier: cheapestOptions.map(opt => opt.carrier).join(' + '),
      totalCost,
      cheapestOptions
    });
  }
  
  return combinedOptions;
};

/**
 * Crea un grupo de envío con formato estándar
 * @param {String} id - ID del grupo
 * @param {String} name - Nombre del grupo
 * @param {Array} items - Productos en el grupo
 * @param {Array} rules - Reglas de envío aplicables
 * @returns {Object} - Grupo de envío formateado
 */
const createShippingGroup = (id, name, items, rules) => {
  const totalWeight = items.reduce((sum, item) => {
    const product = item.product || item;
    const weight = parseFloat(product.weight || 1);
    const quantity = parseInt(item.quantity || 1);
    return sum + (weight * quantity);
  }, 0);
  
  const totalQuantity = items.reduce((sum, item) => {
    return sum + parseInt(item.quantity || 1);
  }, 0);
  
  return {
    id,
    name,
    rules,
    items,
    totalWeight,
    totalQuantity,
    shippingOptions: []
  };
};

/**
 * Crea un grupo único de envío para todos los productos
 * @param {Array} items - Productos a incluir
 * @returns {Array} - Array con un único grupo de envío
 */
const createSingleShippingGroup = (items) => {
  const defaultRule = createDefaultRule();
  
  return [
    createShippingGroup('default-group', 'Todos los productos', items, [defaultRule])
  ];
};

/**
 * Crea una regla de envío por defecto
 * @param {String} id - ID opcional para la regla
 * @returns {Object} - Regla de envío por defecto
 */
const createDefaultRule = (id = 'default-rule') => {
  return {
    id,
    zona: 'Envío estándar',
    activo: true,
    opciones_mensajeria: [{
      nombre: 'Envío Estándar',
      label: 'Envío Estándar (3-5 días)',
      precio: '50',
      tiempo_entrega: '3-5 días',
      minDays: 3,
      maxDays: 5,
      configuracion_paquetes: {
        peso_maximo_paquete: 20,
        costo_por_kg_extra: 10,
        maximo_productos_por_paquete: 10
      }
    }]
  };
};

/**
 * Formatea una opción de envío con estructura estándar
 * @param {Object} option - Opción de envío original
 * @param {Object} rule - Regla de envío asociada
 * @returns {Object} - Opción de envío formateada
 */
const formatShippingOption = (option, rule) => {
  const config = option.configuracion_paquetes || {};
  
  return {
    id: `${rule.id}-${option.nombre}`.replace(/\s+/g, '-').toLowerCase(),
    ruleId: rule.id,
    carrier: option.nombre || 'Servicio estándar',
    label: option.label || option.nombre || 'Envío estándar',
    price: parseFloat(option.precio || 0),
    deliveryTime: option.tiempo_entrega || '3-5 días',
    minDays: parseInt(option.minDays || 3),
    maxDays: parseInt(option.maxDays || 5),
    maxPackageWeight: parseFloat(config.peso_maximo_paquete || 20),
    extraWeightCost: parseFloat(config.costo_por_kg_extra || 10),
    maxProductsPerPackage: parseInt(config.maximo_productos_por_paquete || 10)
  };
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