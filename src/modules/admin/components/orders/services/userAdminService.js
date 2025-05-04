import { doc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../config/firebase/firebaseConfig.js';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Colección de usuarios en Firestore
const USERS_COLLECTION = 'users';

/**
 * Obtiene los datos de un usuario por su ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<{ok: boolean, data: Object, error: string}>} - Resultado
 */
export const getUserById = async (userId) => {
  try {
    if (!userId) {
      return { ok: false, error: 'ID de usuario no proporcionado' };
    }

    const userRef = doc(FirebaseDB, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { ok: false, error: 'Usuario no encontrado' };
    }

    return {
      ok: true,
      data: { id: userDoc.id, ...userDoc.data() },
      error: null
    };
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    return {
      ok: false,
      data: null,
      error: error.message
    };
  }
};

/**
 * Obtiene información básica de múltiples usuarios
 * @param {Array<string>} userIds - Lista de IDs de usuarios
 * @returns {Promise<{ok: boolean, data: Object, error: string}>} - Resultado
 */
export const getMultipleUsers = async (userIds) => {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return { ok: false, error: 'No se proporcionaron IDs de usuario válidos' };
    }

    const promises = userIds.map(userId => getUserById(userId));
    const results = await Promise.all(promises);

    // Filtrar solo los resultados exitosos y extraer los datos
    const users = results
      .filter(result => result.ok)
      .map(result => result.data);

    return {
      ok: true,
      data: users,
      error: null
    };
  } catch (error) {
    console.error('Error al obtener múltiples usuarios:', error);
    return {
      ok: false,
      data: [],
      error: error.message
    };
  }
};

/**
 * Obtiene todas las órdenes asociadas a un ID de usuario específico.
 * Ordena por fecha de creación descendente.
 * 
 * @param {string} userId - El ID del usuario cuyas órdenes se quieren obtener.
 * @returns {Promise<{ok: boolean, data: Array, error: string|null}>} - Resultado con las órdenes.
 */
export const getOrdersByUserId = async (userId) => {
  if (!userId) {
    return { ok: false, data: [], error: 'Se requiere el ID de usuario.' };
  }

  try {
    const ordersRef = collection(FirebaseDB, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc') // Ordenar por fecha, más recientes primero
    );

    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { ok: true, data: orders, error: null };

  } catch (error) {
    console.error('Error obteniendo órdenes por userId:', error);
    return { ok: false, data: [], error: error.message || 'Error al buscar las órdenes del usuario.' };
  }
};