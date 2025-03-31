import { doc, writeBatch, getDoc, runTransaction } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js';
import { logError } from '../utils/errorLogger.js';

/**
 * Servicio especializado en operaciones por lotes con productos
 * Optimiza las operaciones de Firestore cuando se trabaja con múltiples productos
 */
const ProductBatchService = {
  /**
   * Obtiene el stock actual de múltiples productos en una sola consulta por lotes
   * para mayor eficiencia.
   *
   * @param {Array<string>} productIds - Lista de IDs de productos
   * @returns {Promise<Object>} - Mapa de ID -> stock actual
   */
  async getBatchProductStock(productIds) {
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
      logError('Error obteniendo stock por lotes', error, { productCount: uniqueIds.length });
      return {};
    }
  },

  /**
   * Actualiza el stock de varios productos en una sola operación transaccional
   *
   * @param {Array<Object>} items - Array de {id, quantity} para actualizar stock
   * @returns {Promise<{success: boolean, updatedItems: Array, errors: Array}>}
   */
  async updateProductStockBatch(items) {
    if (!items || !items.length) {
      return { success: true, updatedItems: [], errors: [] };
    }

    try {
      const updatedItems = [];
      const errors = [];

      // Usar una transacción para asegurar consistencia
      await runTransaction(FirebaseDB, async (transaction) => {
        // Paso 1: Leer todos los productos primero
        const productRefs = items.map(item => ({
          ref: doc(FirebaseDB, 'products', item.id),
          quantity: item.quantity
        }));

        const snapshots = await Promise.all(
          productRefs.map(({ ref }) => transaction.get(ref))
        );

        // Paso 2: Verificar disponibilidad y preparar actualizaciones
        for (let i = 0; i < snapshots.length; i++) {
          const snapshot = snapshots[i];
          const { ref, quantity } = productRefs[i];
          const id = ref.id;

          if (!snapshot.exists()) {
            errors.push({
              id,
              error: 'Producto no encontrado'
            });
            continue;
          }

          const data = snapshot.data();
          const currentStock = data.stock || 0;

          // Verificar si hay suficiente stock
          if (currentStock < quantity) {
            errors.push({
              id,
              error: 'Stock insuficiente',
              requested: quantity,
              available: currentStock
            });
            continue;
          }

          // Actualizar stock
          transaction.update(ref, {
            stock: currentStock - quantity,
            updatedAt: new Date()
          });

          updatedItems.push({
            id,
            previousStock: currentStock,
            newStock: currentStock - quantity,
            quantity
          });
        }

        // Si hay errores, abortar transacción
        if (errors.length > 0) {
          throw new Error('Algunos productos no tienen stock suficiente');
        }
      });

      return {
        success: errors.length === 0,
        updatedItems,
        errors
      };
    } catch (error) {
      logError('Error actualizando stock por lotes', error, { items });
      return {
        success: false,
        updatedItems: [],
        errors: [{
          error: error.message || 'Error al actualizar stock'
        }]
      };
    }
  },

  /**
   * Verifica y actualiza el stock de productos para una orden
   *
   * @param {Array<Object>} orderItems - Items de la orden {id, quantity}
   * @returns {Promise<{valid: boolean, outOfStockItems: Array}>}
   */
  async verifyAndUpdateStockForOrder(orderItems) {
    if (!orderItems || !orderItems.length) {
      return { valid: true, outOfStockItems: [] };
    }

    try {
      const outOfStockItems = [];

      // Usar runTransaction para garantizar consistencia en la base de datos
      await runTransaction(FirebaseDB, async (transaction) => {
        // PASO 1: Realizar todas las lecturas primero
        const productRefs = [];
        const productSnapshots = [];

        // Creamos referencias y obtenemos todos los productos primero
        for (const item of orderItems) {
          const productRef = doc(FirebaseDB, 'products', item.id);
          productRefs.push({ ref: productRef, item });

          // Obtener el documento dentro de la transacción
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists()) {
            throw new Error(`Producto no encontrado: ${item.id}`);
          }

          productSnapshots.push({
            doc: productDoc,
            data: productDoc.data(),
            item
          });
        }

        // PASO 2: Verificar stock y crear lista de productos sin stock suficiente
        for (const { doc, data, item } of productSnapshots) {
          const currentStock = data.stock || 0;

          // Verificar si hay suficiente stock
          if (currentStock < item.quantity) {
            outOfStockItems.push({
              id: item.id,
              name: item.name || data.name,
              requestedQuantity: item.quantity,
              availableStock: currentStock
            });
          }
        }

        // Si hay productos sin stock suficiente, no continuamos con la transacción
        if (outOfStockItems.length > 0) {
          throw new Error('Productos con stock insuficiente');
        }

        // PASO 3: Realizar todas las escrituras después de todas las lecturas
        for (const { doc, data, item } of productSnapshots) {
          const currentStock = data.stock || 0;

          // Actualizar el stock
          transaction.update(doc.ref, {
            stock: currentStock - item.quantity,
            updatedAt: new Date()
          });
        }
      });

      return {
        valid: outOfStockItems.length === 0,
        outOfStockItems
      };
    } catch (error) {
      logError('Error en verifyAndUpdateStockForOrder', error, { orderItems });

      // Si hay productos sin stock, devolvemos la lista
      if (error.message === 'Productos con stock insuficiente') {
        return {
          valid: false,
          error: 'Algunos productos no tienen suficiente existencia',
          outOfStockItems
        };
      }

      return {
        valid: false,
        error: error.message,
        outOfStockItems: []
      };
    }
  }
};

export default ProductBatchService;