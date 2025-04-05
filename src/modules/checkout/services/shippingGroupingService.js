/**
 * Servicio para agrupar productos según reglas de envío
 * y calcular opciones disponibles para el checkout
 * ADAPTADO para la estructura de Firestore de Cactilia
 */

import {
  groupProductsIntoPackages,
  calculateTotalShippingCost,
  shouldApplyFreeShipping
} from '../utils/shippingCalculator';
import { fetchShippingRuleById } from '../../admin/shipping/api/shippingApi.js'

/**
 * Agrupa los productos del carrito según sus reglas de envío
 * @param {Array} cartItems - Productos en el carrito
 * @returns {Promise<Array>} Grupos de productos con reglas comunes
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
  const productsWithoutRules = []; // Lista de productos sin reglas válidas
  
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
    
    // Si no tiene reglas de envío, saltamos y marcamos el producto
    if (shippingRuleIds.length === 0) {
      console.warn(`⚠️ Producto ${product.name || productId} no tiene reglas de envío asignadas`);
      productsWithoutRules.push(item);
      continue;
    }
    
    // Obtener detalles de cada regla
    const productRules = [];
    
    for (const ruleId of shippingRuleIds) {
      if (!ruleId) continue;
      
      // Verificar si la regla ya está en caché
      if (!shippingRulesCache.has(ruleId)) {
        try {
          const ruleData = await fetchShippingRuleById(ruleId);
          
          if (!ruleData) {
            console.warn(`⚠️ Regla de envío ${ruleId} no encontrada`);
            continue;
          }
          
          // Verificar que la regla tenga opciones de mensajería
          if (!ruleData.opciones_mensajeria || !Array.isArray(ruleData.opciones_mensajeria) || ruleData.opciones_mensajeria.length === 0) {
            console.warn(`⚠️ Regla de envío ${ruleId} no tiene opciones de mensajería`);
            continue;
          }
          
          shippingRulesCache.set(ruleId, ruleData);
        } catch (error) {
          console.error(`Error obteniendo regla ${ruleId}:`, error);
          continue;
        }
      }
      
      // Si tenemos la regla, la agregamos
      if (shippingRulesCache.has(ruleId)) {
        productRules.push(shippingRulesCache.get(ruleId));
      }
    }
    
    // IMPORTANTE: Solo mapear productos con al menos una regla válida
    if (productRules.length > 0) {
      productRulesMap.set(productId, productRules);
    } else {
      console.warn(`⚠️ Producto ${product.name || productId} no tiene reglas de envío válidas en Firestore`);
      productsWithoutRules.push(item);
    }
  }
  
  // Log productos sin reglas
  if (productsWithoutRules.length > 0) {
    console.warn(`⚠️ Hay ${productsWithoutRules.length} productos que no pueden ser enviados:`, 
      productsWithoutRules.map(item => (item.product || item).name || (item.product || item).id));
  }
  
  // Paso 2: Agrupar productos por reglas de envío comunes
  const shippingGroups = [];
  const processedProductIds = new Set();
  
  // Si ningún producto tiene reglas, crear un grupo sin reglas para todos
  if (productRulesMap.size === 0) {
    console.warn('⚠️ Ningún producto tiene reglas de envío válidas');
    return [];
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
  
  console.log(`Se crearon ${shippingGroups.length} grupos de envío con ${processedProductIds.size} productos`);
  return shippingGroups;
};

/**
 * Prepara las opciones de envío para el checkout
 * @param {Array} cartItems - Productos en el carrito
 * @param {Object} userAddress - Dirección del usuario
 * @returns {Promise<Object>} Grupos y opciones de envío
 */
export const prepareShippingOptionsForCheckout = async (cartItems, userAddress) => {
  console.log('🚚 INICIO: Preparando opciones con', cartItems?.length || 0, 'productos');
  
  // Obtener grupos de productos
  const groups = await groupProductsByShippingRules(cartItems);
  
  if (!groups || groups.length === 0) {
    console.warn('⚠️ No se pudieron crear grupos de envío válidos');
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
  
  console.log('🚚 FIN: Opciones generadas:', {
    grupos: groups.length,
    opcionesTotales: totalOptions.length,
    opcionesPrimeras: totalOptions.slice(0, 2).map(o => ({
      id: o.id,
      label: o.label,
      costo: o.totalCost
    }))
  });
  
  return {
    groups,
    totalOptions
  };
};

/**
 * Genera las opciones de envío combinadas para todos los grupos
 * @param {Array} groups - Grupos de envío con sus opciones
 * @returns {Array} Opciones de envío para mostrar al usuario
 */
const generateTotalShippingOptions = (groups) => {
  if (!groups || groups.length === 0) {
    return [];
  }

  // Si solo hay un grupo, devolvemos sus opciones directamente
  if (groups.length === 1) {
    return groups[0].shippingOptions.map(option => ({
      id: option.id,
      label: option.label,
      carrier: option.carrier,
      totalCost: option.totalCost,
      deliveryTime: option.deliveryTime,
      isFreeShipping: option.isFreeShipping,
      groups: [{
        groupId: groups[0].id,
        option,
        items: groups[0].items
      }]
    }));
  }

  // Para múltiples grupos, generamos combinaciones de opciones
  const combinedOptions = [];

  // Por simplicidad, ofrecemos primero la opción más barata de cada grupo
  const cheapestCombination = {
    id: 'combined-cheapest',
    label: 'Envío combinado - Opción económica',
    carrier: 'Varios servicios',
    totalCost: 0,
    groups: []
  };

  // Suma de tiempos de entrega para estimación
  let maxDeliveryDays = 0;

  groups.forEach(group => {
    if (!group.shippingOptions || group.shippingOptions.length === 0) {
      return;
    }

    // Tomar la opción más barata del grupo
    const cheapestOption = group.shippingOptions[0];

    // Añadir al costo total
    cheapestCombination.totalCost += cheapestOption.totalCost;

    // Actualizar días máximos de entrega
    const deliveryDaysMatch = cheapestOption.deliveryTime?.match(/\d+-(\d+)/);
    const maxDays = deliveryDaysMatch ? parseInt(deliveryDaysMatch[1]) : 5;
    maxDeliveryDays = Math.max(maxDeliveryDays, maxDays);

    // Añadir grupo a la combinación
    cheapestCombination.groups.push({
      groupId: group.id,
      option: cheapestOption,
      items: group.items
    });
  });

  // Establecer tiempo de entrega estimado
  cheapestCombination.deliveryTime = `${maxDeliveryDays} días`;

  // Añadir la combinación a las opciones
  if (cheapestCombination.groups.length > 0) {
    combinedOptions.push(cheapestCombination);
  }

  return combinedOptions;
};