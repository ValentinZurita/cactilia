import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc, getDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig';

/**
 * Servicio mejorado para gestionar direcciones de usuario en Firestore
 * Soporta campos adicionales para direcciones mexicanas
 */

const ADDRESSES_COLLECTION = 'addresses';

/**
 * Obtiene todas las direcciones de un usuario
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<{ok: boolean, data: Array, error: string}>} - Resultado de la operación
 */
export const getUserAddresses = async (userId) => {
  try {
    if (!userId) {
      return { ok: false, data: [], error: 'ID de usuario no proporcionado' };
    }

    // Consulta direcciones filtrando por el ID de usuario
    const addressesRef = collection(FirebaseDB, ADDRESSES_COLLECTION);
    const q = query(addressesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    // Transformar documentos en objetos de dirección
    const addresses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Procesamos la calle para extraer número exterior e interior si están en formato antiguo
      let street = data.street || '';
      let numExt = data.numExt || '';
      let numInt = data.numInt || '';

      // Si no tiene campos separados pero tiene calle en formato antiguo
      // intentamos extraer los números
      if (!data.numExt && street) {
        const streetMatch = street.match(/(.*?)(?:\s+#?(\d+)(?:\s*,\s*Int\.\s*(\S+))?)?$/);
        if (streetMatch) {
          // Solo actualizamos si podemos extraer datos válidos
          if (streetMatch[1]?.trim()) {
            street = streetMatch[1].trim();
            numExt = streetMatch[2] || '';
            numInt = streetMatch[3] || '';
          }
        }
      }

      addresses.push({
        id: doc.id,
        ...data,
        // Asegurar que siempre tenga los campos nuevos
        street,
        numExt,
        numInt,
        colonia: data.colonia || '',
        references: data.references || ''
      });
    });

    return { ok: true, data: addresses, error: null };
  } catch (error) {
    console.error('Error obteniendo direcciones:', error);
    return { ok: false, data: [], error: error.message };
  }
};

/**
 * Agrega una nueva dirección para un usuario
 *
 * @param {string} userId - ID del usuario
 * @param {Object} addressData - Datos de la dirección
 * @returns {Promise<{ok: boolean, id: string, error: string}>} - Resultado de la operación
 */
export const addAddress = async (userId, addressData) => {
  try {
    if (!userId) {
      return { ok: false, error: 'ID de usuario no proporcionado' };
    }

    // Si es la primera dirección o está marcada como predeterminada,
    // asegurarse de que no haya otras direcciones predeterminadas
    if (addressData.isDefault) {
      await resetDefaultAddresses(userId);
    }

    // Crear una copia de los datos para evitar modificar el objeto original
    const addressToSave = { ...addressData };

    // Eliminar el id si existe, ya que Firestore genera su propio id
    if ('id' in addressToSave) {
      delete addressToSave.id;
    }

    // Agregar dirección a Firestore
    const addressesRef = collection(FirebaseDB, ADDRESSES_COLLECTION);
    const docRef = await addDoc(addressesRef, {
      ...addressToSave,
      userId,
      createdAt: new Date()
    });

    return { ok: true, id: docRef.id, error: null };
  } catch (error) {
    console.error('Error agregando dirección:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Elimina una dirección específica
 *
 * @param {string} addressId - ID de la dirección a eliminar
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const deleteAddress = async (addressId) => {
  try {
    if (!addressId) {
      return { ok: false, error: 'ID de dirección no proporcionado' };
    }

    // Verificar si la dirección existe y no es predeterminada
    const addressRef = doc(FirebaseDB, ADDRESSES_COLLECTION, addressId);
    const addressSnap = await getDoc(addressRef);

    if (!addressSnap.exists()) {
      return { ok: false, error: 'La dirección no existe' };
    }

    const addressData = addressSnap.data();

    // No permitir eliminar direcciones predeterminadas
    if (addressData.isDefault) {
      return {
        ok: false,
        error: 'No se puede eliminar la dirección predeterminada. Establece otra como predeterminada primero.'
      };
    }

    // Eliminar dirección
    await deleteDoc(addressRef);

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error eliminando dirección:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Establece una dirección como predeterminada
 *
 * @param {string} userId - ID del usuario
 * @param {string} addressId - ID de la dirección a establecer como predeterminada
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const setDefaultAddress = async (userId, addressId) => {
  try {
    if (!userId || !addressId) {
      return { ok: false, error: 'Se requiere ID de usuario y dirección' };
    }

    // Primero, resetear todas las direcciones predeterminadas del usuario
    await resetDefaultAddresses(userId);

    // Luego, establecer la dirección seleccionada como predeterminada
    const addressRef = doc(FirebaseDB, ADDRESSES_COLLECTION, addressId);
    await updateDoc(addressRef, {
      isDefault: true,
      updatedAt: new Date()
    });

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error estableciendo dirección predeterminada:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Actualiza una dirección existente
 *
 * @param {string} addressId - ID de la dirección a actualizar
 * @param {Object} addressData - Nuevos datos de la dirección
 * @param {string} userId - ID del usuario propietario
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const updateAddress = async (addressId, addressData, userId) => {
  try {
    if (!addressId) {
      return { ok: false, error: 'ID de dirección no proporcionado' };
    }

    // Si la dirección actualizada se marca como predeterminada, resetear las demás
    if (addressData.isDefault) {
      await resetDefaultAddresses(userId);
    }

    // Crear una copia de los datos para evitar modificar el objeto original
    const dataToUpdate = { ...addressData };

    // Eliminar el id ya que no necesitamos guardarlo en el documento
    if ('id' in dataToUpdate) {
      delete dataToUpdate.id;
    }

    // Actualizar la dirección en Firestore
    const addressRef = doc(FirebaseDB, ADDRESSES_COLLECTION, addressId);
    await updateDoc(addressRef, {
      ...dataToUpdate,
      updatedAt: new Date()
    });

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error actualizando dirección:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Función auxiliar para eliminar el estado predeterminado de todas las direcciones de un usuario
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<void>}
 */
const resetDefaultAddresses = async (userId) => {
  // Obtener todas las direcciones predeterminadas del usuario
  const addressesRef = collection(FirebaseDB, ADDRESSES_COLLECTION);
  const q = query(
    addressesRef,
    where('userId', '==', userId),
    where('isDefault', '==', true)
  );
  const querySnapshot = await getDocs(q);

  // Eliminar el estado "default" de cada una
  const updatePromises = [];
  querySnapshot.forEach((document) => {
    const addressRef = doc(FirebaseDB, ADDRESSES_COLLECTION, document.id);
    updatePromises.push(
      updateDoc(addressRef, {
        isDefault: false,
        updatedAt: new Date()
      })
    );
  });

  // Esperar a que todas las actualizaciones se completen
  await Promise.all(updatePromises);
};