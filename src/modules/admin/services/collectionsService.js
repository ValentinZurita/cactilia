import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { FirebaseDB } from '../../../config/firebase/firebaseConfig.js'

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

    try {
      const querySnapshot = await getDocs(q);

      const mediaItems = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // *** DEVOLVER DATOS MÁS COMPLETOS ***
        // Devolvemos el objeto con id, alt, url original y el mapa de resizedUrls
        // HomePage se encargará de seleccionar la URL adecuada.
        mediaItems.push({
          id: doc.id,
          alt: data.alt || '',
          url: data.url || null, // URL original
          resizedUrls: data.resizedUrls || null // Mapa con URLs de thumbnails
        });
        // Ya no seleccionamos una única URL aquí.
        // La lógica de selección se mueve a HomePage.jsx
      });

      return {
        ok: true,
        data: mediaItems
      };
    } catch (permissionError) {
      console.warn(`Error de permisos al obtener imágenes de colección ${collectionId}:`, permissionError);
      
      // Proporcionar imágenes alternativas según el ID de colección
      // Esto permite que usuarios no autenticados vean algunas imágenes
      const defaultImages = getDefaultImagesForCollection(collectionId);
      
      return {
        ok: true,
        data: defaultImages,
        isPublicFallback: true
      };
    }
  } catch (error) {
    console.error(`Error obteniendo imágenes de colección ${collectionId}:`, error);
    return {
      ok: false,
      data: [], // Devolver array vacío en caso de error general
      error: error.message
    };
  }
};

/**
 * Proporciona imágenes alternativas según el ID de colección
 * @param {string} collectionId - ID de la colección
 * @returns {Array} - Array de objetos de imagen
 */
const getDefaultImagesForCollection = (collectionId) => {
  // Imágenes de muestra por defecto (desde CDN público o recursos estáticos)
  const defaultImages = [
    {
      id: 'default-1',
      url: '/public/images/placeholder.jpg',
      alt: 'Imagen de muestra 1'
    },
    {
      id: 'default-2',
      url: '/public/images/placeholder.jpg',
      alt: 'Imagen de muestra 2'
    },
    {
      id: 'default-3',
      url: '/public/images/placeholder.jpg',
      alt: 'Imagen de muestra 3'
    }
  ];
  
  return defaultImages;
};