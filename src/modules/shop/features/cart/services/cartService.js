
import { apiService } from '../../../services/api.js';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../firebase/firebaseConfig.js';

/**
 * Guarda el carrito de un usuario en Firestore
 *
 * @param {string} userId - ID del usuario
 * @param {Array} items - Elementos del carrito
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveCart = async (userId, items) => {
  if (!userId) return { ok: false, error: 'ID de usuario requerido' };

  try {
    return await apiService.upsertDocument('carts', userId, {
      userId,
      items
    });
  } catch (error) {
    console.error('Error al guardar el carrito:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene el carrito de un usuario desde Firestore
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getCart = async (userId) => {
  if (!userId) return { ok: false, error: 'ID de usuario requerido' };

  try {
    const result = await apiService.getDocument('carts', userId);

    if (!result.ok) {
      return { ok: true, data: { items: [] } };
    }

    return result;
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Elimina el carrito de un usuario de Firestore
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const deleteCart = async (userId) => {
  if (!userId) return { ok: false, error: 'ID de usuario requerido' };

  try {
    await apiService.deleteDocument('carts', userId);
    return { ok: true };
  } catch (error) {
    console.error('Error al eliminar el carrito:', error);
    return { ok: false, error: error.message };
  }
};



