/**
 * Utilidades para validación de stock en tiempo real
 */

import { getMultipleProductsStock } from '../services/productServices.js'

const validationCache = {
  results: {},
  timestamp: {},
  // Cache TTL: 30 segundos
  TTL: 30000
};

/**
 * Verifica el stock para múltiples productos simultáneamente
 * utilizando caché para reducir consultas
 * @param {Array} cartItems - Items del carrito a verificar
 * @returns {Promise<{valid: boolean, outOfStockItems: Array}>}
 */
export const validateCartStock = async (cartItems) => {
  if (!cartItems || !cartItems.length) {
    return { valid: true, outOfStockItems: [] };
  }

  // Generar un ID para esta combinación específica de items
  const cacheKey = generateCacheKey(cartItems);

  // Verificar si tenemos un resultado en caché válido
  const now = Date.now();
  if (validationCache.results[cacheKey] &&
    validationCache.timestamp[cacheKey] &&
    (now - validationCache.timestamp[cacheKey]) < validationCache.TTL) {
    console.log('Usando resultado de validación en caché');
    return validationCache.results[cacheKey];
  }

  try {
    // Obtener IDs únicos de productos en el carrito
    const productIds = cartItems.map(item => item.id);

    // Consultar stock actual en servidor
    const stockMap = await getMultipleProductsStock(productIds);

    // Verificar cada item contra el stock actual
    const outOfStockItems = [];

    for (const item of cartItems) {
      const currentStock = stockMap[item.id] || 0;

      // Si la cantidad solicitada excede el stock actual
      if (item.quantity > currentStock) {
        outOfStockItems.push({
          ...item,
          requestedQuantity: item.quantity,
          actualStock: currentStock,
          name: item.name || item.title || 'Producto' // Asegurar que siempre hay un nombre
        });
      }
    }

    const result = {
      valid: outOfStockItems.length === 0,
      outOfStockItems
    };

    // Guardar en caché
    validationCache.results[cacheKey] = result;
    validationCache.timestamp[cacheKey] = now;

    return result;
  } catch (error) {
    console.error('Error validando stock del carrito:', error);
    return {
      valid: false,
      error: 'Error al verificar disponibilidad de productos',
      outOfStockItems: []
    };
  }
};

/**
 * Genera una clave única para la caché basada en los items del carrito
 * @param {Array} items - Items del carrito
 * @returns {string} - Clave para la caché
 */
function generateCacheKey(items) {
  // Crear un objeto simplificado solo con los campos relevantes
  const simplified = items.map(item => ({
    id: item.id,
    quantity: item.quantity
  }));

  // Ordenar por ID para asegurar consistencia
  simplified.sort((a, b) => a.id.localeCompare(b.id));

  // Generar string para la clave
  return JSON.stringify(simplified);
}

/**
 * Actualiza la información de stock de items del carrito
 * @param {Array} cartItems - Items del carrito
 * @returns {Promise<Array>} - Items con stock actualizado
 */
export const refreshCartItemsStock = async (cartItems) => {
  if (!cartItems || !cartItems.length) return [];

  try {
    // Obtener stock actual
    const productIds = cartItems.map(item => item.id);
    const stockMap = await getMultipleProductsStock(productIds);

    // Crear copia con stock actualizado
    return cartItems.map(item => ({
      ...item,
      stock: stockMap[item.id] !== undefined ? stockMap[item.id] : item.stock,
      stockValidated: true
    }));
  } catch (error) {
    console.error('Error actualizando stock de items:', error);
    return cartItems;
  }
};