import { apiService } from '../../../services/api.js';

const ORDERS_COLLECTION = 'orders';

/**
 * Obtiene una orden por su ID
 *
 * @param {string} orderId - ID de la orden
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getOrderById = async (orderId) => {
  if (!orderId) {
    return { ok: false, error: 'ID de orden no proporcionado' };
  }

  try {
    return await apiService.getDocument(ORDERS_COLLECTION, orderId);
  } catch (error) {
    console.error('Error al obtener la orden:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene las órdenes de un usuario con paginación opcional
 *
 * @param {string} userId - ID del usuario
 * @param {number} [pageSize] - Número de órdenes por página
 * @param {DocumentSnapshot} [startAfterDoc] - Documento después del cual empezar
 * @returns {Promise<Object>} - Resultado de la operación { ok, data, lastVisible, hasMore, error }
 */
export const getUserOrders = async (userId, pageSize = null, startAfterDoc = null) => {
  if (!userId) {
    return { ok: false, error: 'ID de usuario no proporcionado' };
  }

  try {
    const sortBy = ['createdAt', 'desc'];
    const filters = [['userId', '==', userId]];

    return await apiService.getDocuments(
      ORDERS_COLLECTION,
      filters,
      sortBy,
      '',
      pageSize,
      startAfterDoc
    );
  } catch (error) {
    console.error('Error al obtener las órdenes del usuario:', error);
    return { ok: false, data: [], lastVisible: null, hasMore: false, error: error.message };
  }
};

/**
 * Actualiza el estado de una orden
 *
 * @param {string} orderId - ID de la orden
 * @param {string} status - Nuevo estado
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    return await apiService.updateDocument(ORDERS_COLLECTION, orderId, {
      status,
      'payment.status': status === 'cancelled' ? 'cancelled' : 'processing'
    });
  } catch (error) {
    console.error('Error al actualizar el estado de la orden:', error);
    return { ok: false, error: error.message };
  }
};