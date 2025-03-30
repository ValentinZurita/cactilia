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
 * Obtiene todas las órdenes de un usuario
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getUserOrders = async (userId) => {
  if (!userId) {
    return { ok: false, error: 'ID de usuario no proporcionado' };
  }

  try {
    return await apiService.getDocuments(
      ORDERS_COLLECTION,
      [['userId', '==', userId]],
      ['createdAt', 'desc']
    );
  } catch (error) {
    console.error('Error al obtener las órdenes del usuario:', error);
    return { ok: false, error: error.message };
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