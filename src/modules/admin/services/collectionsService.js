import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js'

// Colección de Firestore
const COLLECTIONS_COLLECTION = 'mediaCollections';
const MEDIA_COLLECTION = 'media';

/**
 * Obtiene todas las colecciones de medios
 * @returns {Promise<{ok: boolean, data: Array, error: string?}>}
 */
export const getCollections = async () => {
  try {
    const querySnapshot = await getDocs(collection(FirebaseDB, COLLECTIONS_COLLECTION));

    const collections = [];
    querySnapshot.forEach((doc) => {
      collections.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      ok: true,
      data: collections
    };
  } catch (error) {
    console.error('Error obteniendo colecciones:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Crea una nueva colección
 * @param {Object} collectionData - Datos de la colección
 * @returns {Promise<{ok: boolean, id: string?, error: string?}>}
 */
export const createCollection = async (collectionData) => {
  try {
    const docRef = await addDoc(collection(FirebaseDB, COLLECTIONS_COLLECTION), {
      ...collectionData,
      createdAt: new Date().toISOString()
    });

    return {
      ok: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error creando colección:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Actualiza una colección existente
 * @param {string} collectionId - ID de la colección
 * @param {Object} collectionData - Nuevos datos de la colección
 * @returns {Promise<{ok: boolean, error: string?}>}
 */
export const updateCollection = async (collectionId, collectionData) => {
  try {
    await updateDoc(doc(FirebaseDB, COLLECTIONS_COLLECTION, collectionId), {
      ...collectionData,
      updatedAt: new Date().toISOString()
    });

    return { ok: true };
  } catch (error) {
    console.error('Error actualizando colección:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Elimina una colección
 * @param {string} collectionId - ID de la colección a eliminar
 * @returns {Promise<{ok: boolean, error: string?}>}
 */
export const deleteCollection = async (collectionId) => {
  try {
    await deleteDoc(doc(FirebaseDB, COLLECTIONS_COLLECTION, collectionId));

    return { ok: true };
  } catch (error) {
    console.error('Error eliminando colección:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Obtiene una colección por su ID
 * @param {string} collectionId - ID de la colección
 * @returns {Promise<{ok: boolean, data: Object?, error: string?}>}
 */
export const getCollectionById = async (collectionId) => {
  try {
    const docRef = doc(FirebaseDB, COLLECTIONS_COLLECTION, collectionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        ok: true,
        data: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } else {
      return {
        ok: false,
        error: 'Colección no encontrada'
      };
    }
  } catch (error) {
    console.error('Error obteniendo colección:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Obtiene todas las imágenes de una colección específica
 * @param {string} collectionId - ID de la colección
 * @returns {Promise<{ok: boolean, data: Array, error: string?}>}
 */
export const getCollectionImages = async (collectionId) => {
  try {
    // Consulta para obtener elementos de media que pertenecen a esta colección
    const q = query(
      collection(FirebaseDB, MEDIA_COLLECTION),
      where('collectionId', '==', collectionId)
    );

    const querySnapshot = await getDocs(q);

    const mediaItems = [];
    querySnapshot.forEach((doc) => {
      mediaItems.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      ok: true,
      data: mediaItems
    };
  } catch (error) {
    console.error(`Error obteniendo imágenes de colección ${collectionId}:`, error);
    return {
      ok: false,
      error: error.message
    };
  }
};