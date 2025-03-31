import { doc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js';

/**
 * Obtiene el stock actual de un producto directamente desde Firestore
 * @param {string} productId - ID del producto
 * @returns {Promise<number>} - Cantidad en stock actual o 0 si hay error
 */
export const getProductCurrentStock = async (productId) => {
  try {
    if (!productId) return 0;

    const productRef = doc(FirebaseDB, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      console.error(`Producto con ID ${productId} no encontrado`);
      return 0;
    }

    const productData = productSnap.data();
    return productData.stock !== undefined && productData.stock !== null
      ? productData.stock
      : 0;
  } catch (error) {
    console.error('Error al obtener stock del producto:', error);
    return 0;
  }
};

/**
 * Verifica el stock actual de múltiples productos
 * @param {Array} productIds - Array de IDs de productos
 * @returns {Promise<Object>} - Mapa de ID de producto a su stock actual
 */
export const getMultipleProductsStock = async (productIds) => {
  try {
    if (!productIds || !productIds.length) return {};

    // Eliminar duplicados
    const uniqueIds = [...new Set(productIds)];
    const stockMap = {};

    // Realizar consultas en paralelo
    const promises = uniqueIds.map(id => getProductCurrentStock(id));
    const results = await Promise.all(promises);

    // Construir mapa de resultados
    uniqueIds.forEach((id, index) => {
      stockMap[id] = results[index];
    });

    return stockMap;
  } catch (error) {
    console.error('Error al obtener stock múltiple:', error);
    return {};
  }
};

/**
 * Verifica si hay suficiente stock para una lista de productos
 * @param {Array} items - Items a verificar (cada uno con id y quantity)
 * @returns {Promise<{valid: boolean, outOfStockItems: Array}>}
 */
export const validateItemsStock = async (items) => {
  try {
    if (!items || !items.length) {
      return { valid: true, outOfStockItems: [] };
    }

    // Obtener stock actual de todos los productos
    const productIds = items.map(item => item.id);
    const stockMap = await getMultipleProductsStock(productIds);

    // Verificar cada item
    const outOfStockItems = [];

    for (const item of items) {
      const currentStock = stockMap[item.id] || 0;

      if (currentStock < item.quantity) {
        outOfStockItems.push({
          ...item,
          currentStock,
          requested: item.quantity
        });
      }
    }

    return {
      valid: outOfStockItems.length === 0,
      outOfStockItems
    };
  } catch (error) {
    console.error('Error validando stock:', error);
    return { valid: false, outOfStockItems: [], error: error.message };
  }
};


/**
 * Obtiene el stock actual de múltiples productos en una sola consulta por lotes
 * para mayor eficiencia.
 *
 * @param {Array} productIds - Lista de IDs de productos
 * @returns {Promise<Object>} - Mapa de ID -> stock actual
 */
export const getBatchProductStock = async (productIds) => {
  if (!productIds || !productIds.length) {
    return {};
  }

  // Eliminar duplicados
  const uniqueIds = [...new Set(productIds)];

  try {
    // Usar batches para optimizar consultas
    const batchSize = 10; // Firestore tiene límite de 10 getDoc por lote
    const stockMap = {};

    // Procesar en lotes
    for (let i = 0; i < uniqueIds.length; i += batchSize) {
      const batch = uniqueIds.slice(i, i + batchSize);

      // Crear referencias a documentos
      const refs = batch.map(id => doc(FirebaseDB, 'products', id));

      // Obtener documentos en un lote
      const snapshots = await Promise.all(refs.map(ref => getDoc(ref)));

      // Procesar resultados
      snapshots.forEach((snap, index) => {
        const id = batch[index];
        if (snap.exists()) {
          const data = snap.data();
          stockMap[id] = data.stock !== undefined ? data.stock : 0;
        } else {
          stockMap[id] = 0;
        }
      });
    }

    return stockMap;
  } catch (error) {
    console.error('Error obteniendo stock por lotes:', error);
    return {};
  }
};