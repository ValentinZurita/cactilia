import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Obtiene todas las direcciones de un usuario desde Firestore
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<{ok: boolean, data: Array, error: string}>} - Resultado de la operación
 */
export const getUserAddresses = async (userId) => {
  if (!userId) return { ok: false, error: 'ID de usuario requerido' };

  try {
    const addressesRef = collection(FirebaseDB, `users/${userId}/addresses`);
    const q = query(addressesRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const addresses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { ok: true, data: addresses, error: null };
  } catch (error) {
    console.error('Error al obtener direcciones:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene una dirección específica por su ID
 *
 * @param {string} userId - ID del usuario
 * @param {string} addressId - ID de la dirección
 * @returns {Promise<{ok: boolean, data: Object, error: string}>} - Resultado de la operación
 */
export const getAddressById = async (userId, addressId) => {
  if (!userId || !addressId) return { ok: false, error: 'ID de usuario y dirección requeridos' };

  try {
    const addressRef = doc(FirebaseDB, `users/${userId}/addresses/${addressId}`);
    const snapshot = await getDoc(addressRef);

    if (!snapshot.exists()) {
      return { ok: false, error: 'Dirección no encontrada' };
    }

    return {
      ok: true,
      data: {
        id: snapshot.id,
        ...snapshot.data()
      },
      error: null
    };
  } catch (error) {
    console.error('Error al obtener dirección:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Guarda una nueva dirección en Firestore
 *
 * @param {string} userId - ID del usuario
 * @param {Object} addressData - Datos de la dirección
 * @param {boolean} isDefault - Si es la dirección predeterminada
 * @returns {Promise<{ok: boolean, id: string, error: string}>} - Resultado de la operación
 */
export const saveAddress = async (userId, addressData, isDefault = false) => {
  if (!userId || !addressData) return { ok: false, error: 'ID de usuario y datos requeridos' };

  try {
    // Usar Cloud Function para guardar dirección (maneja lógica de dirección predeterminada)
    const functions = getFunctions();
    const saveAddressFunction = httpsCallable(functions, 'saveAddress');

    const result = await saveAddressFunction({
      address: addressData,
      isDefault
    });

    return {
      ok: true,
      id: result.data.addressId,
      error: null
    };
  } catch (error) {
    console.error('Error al guardar dirección:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Actualiza una dirección existente
 *
 * @param {string} userId - ID del usuario
 * @param {string} addressId - ID de la dirección
 * @param {Object} addressData - Datos actualizados
 * @param {boolean} isDefault - Si es la dirección predeterminada
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const updateAddress = async (userId, addressId, addressData, isDefault = false) => {
  if (!userId || !addressId || !addressData) {
    return { ok: false, error: 'Datos incompletos para actualizar dirección' };
  }

  try {
    const db = FirebaseDB;
    const batch = writeBatch(db);

    // Si es dirección predeterminada, desmarcar cualquier otra
    if (isDefault) {
      const addressesRef = collection(db, `users/${userId}/addresses`);
      const q = query(addressesRef, where('isDefault', '==', true));

      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => {
        if (doc.id !== addressId) {
          batch.update(doc.ref, { isDefault: false });
        }
      });
    }

    // Actualizar la dirección
    const addressRef = doc(db, `users/${userId}/addresses/${addressId}`);
    batch.update(addressRef, {
      ...addressData,
      isDefault,
      updatedAt: serverTimestamp()
    });

    await batch.commit();

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error al actualizar dirección:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Elimina una dirección
 *
 * @param {string} userId - ID del usuario
 * @param {string} addressId - ID de la dirección
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const deleteAddress = async (userId, addressId) => {
  if (!userId || !addressId) return { ok: false, error: 'ID de usuario y dirección requeridos' };

  try {
    const addressRef = doc(FirebaseDB, `users/${userId}/addresses/${addressId}`);
    await deleteDoc(addressRef);

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error al eliminar dirección:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Establece una dirección como predeterminada
 *
 * @param {string} userId - ID del usuario
 * @param {string} addressId - ID de la dirección
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const setDefaultAddress = async (userId, addressId) => {
  if (!userId || !addressId) return { ok: false, error: 'ID de usuario y dirección requeridos' };

  try {
    const db = FirebaseDB;
    const batch = writeBatch(db);

    // Desmarcar cualquier dirección predeterminada
    const addressesRef = collection(db, `users/${userId}/addresses`);
    const q = query(addressesRef, where('isDefault', '==', true));

    const snapshot = await getDocs(q);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isDefault: false });
    });

    // Marcar la nueva dirección predeterminada
    const newDefaultRef = doc(db, `users/${userId}/addresses/${addressId}`);
    batch.update(newDefaultRef, { isDefault: true });

    await batch.commit();

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error al establecer dirección predeterminada:', error);
    return { ok: false, error: error.message };
  }
};