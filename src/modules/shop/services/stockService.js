import { doc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js';
import { logError } from '../utils/errorLogger.js';

/**
 * Servicio especializado en operaciones relacionadas con stock de productos
 * Centraliza todas las funciones de validación y consulta de stock
 */
const StockService = {
  /**
   * Obtiene el stock actual de un producto directamente desde Firestore
   *
   * @param {string} productId - ID del producto
   * @returns {Promise<number>} - Cantidad en stock actual o 0 si hay error
   */
  async getProductStock(productId) {
    try {
      if (!productId) return 0;

      const productRef = doc(FirebaseDB, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        console.warn(`Producto con ID ${productId} no encontrado`);
        return 0;
      }

      const productData = productSnap.data();
      return productData.stock !== undefined && productData.stock !== null
        ? productData.stock
        : 0;
    } catch (error) {
      logError('Error al obtener stock del producto', error, { productId });
      return 0;
    }
  },

  /**
   * Verifica el stock actual de múltiples productos
   *
   * @param {Array<string>} productIds - Array de IDs de productos
   * @returns {Promise<Object>} - Mapa de ID de producto a su stock actual
   */
  async getMultipleProductsStock(productIds) {
    try {
      if (!productIds || !productIds.length) return {};

      // Eliminar duplicados
      const uniqueIds = [...new Set(productIds)];
      const stockMap = {};

      // Realizar consultas en paralelo
      const promises = uniqueIds.map(id => this.getProductStock(id));
      const results = await Promise.all(promises);

      // Construir mapa de resultados
      uniqueIds.forEach((id, index) => {
        stockMap[id] = results[index];
      });

      return stockMap;
    } catch (error) {
      logError('Error al obtener stock múltiple', error, { productIds });
      return {};
    }
  },

  /**
   * Verifica si hay suficiente stock para una lista de productos
   *
   * @param {Array<Object>} items - Items a verificar (cada uno con id y quantity)
   * @returns {Promise<{valid: boolean, outOfStockItems: Array}>}
   */
  async validateItemsStock(items) {
    try {
      if (!items || !items.length) {
        return { valid: true, outOfStockItems: [] };
      }

      // Obtener stock actual de todos los productos
      const productIds = items.map(item => item.id);
      const stockMap = await this.getMultipleProductsStock(productIds);

      // Verificar cada item
      const outOfStockItems = [];

      for (const item of items) {
        const currentStock = stockMap[item.id] || 0;

        if (currentStock < item.quantity) {
          outOfStockItems.push({
            ...item,
            currentStock,
            requested: item.quantity,
            name: item.name || item.title || 'Producto' // Asegurar nombre para mensajes de error
          });
        }
      }

      return {
        valid: outOfStockItems.length === 0,
        outOfStockItems
      };
    } catch (error) {
      logError('Error validando stock', error, { itemsCount: items?.length });
      return {
        valid: false,
        outOfStockItems: [],
        error: error.message
      };
    }
  },

  /**
   * Formatea un mensaje de error amigable basado en problemas de stock
   *
   * @param {Array<Object>} outOfStockItems - Lista de ítems con problemas de stock
   * @returns {string} Mensaje de error formateado para usuario final
   */
  formatStockErrorMessage(outOfStockItems) {
    if (!outOfStockItems || outOfStockItems.length === 0) {
      return 'Ha ocurrido un error al verificar el stock disponible.';
    }

    if (outOfStockItems.length === 1) {
      const item = outOfStockItems[0];
      const itemName = item.name || 'El producto seleccionado';

      if (item.currentStock <= 0) {
        return `${itemName} ya no está disponible.`;
      } else {
        return `${itemName} solo tiene ${item.currentStock} unidades disponibles.`;
      }
    } else {
      return 'Algunos productos en tu carrito no están disponibles en la cantidad solicitada. Por favor, revisa tu carrito.';
    }
  }
};

export default StockService;