import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB } from '../../../../firebase/firebaseConfig';

// Colecciones de Firestore
const DRAFT_COLLECTION = 'content';
const PUBLISHED_COLLECTION = 'content_published';
const HOME_PAGE_ID = 'home';

/**
 * Obtiene la configuración de la página de inicio
 * @param {string} [version='draft'] - Versión a obtener ('draft' o 'published')
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getHomePageContent = async (version = 'draft') => {
  try {
    // Determinar la colección según la versión
    const collectionName = version === 'published' ? PUBLISHED_COLLECTION : DRAFT_COLLECTION;

    // Obtener el documento
    const docRef = doc(FirebaseDB, collectionName, HOME_PAGE_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Documento encontrado
      return {
        ok: true,
        data: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } else {
      // Documento no encontrado, pero no es un error
      return {
        ok: true,
        data: null
      };
    }
  } catch (error) {
    console.error('Error obteniendo contenido de la página de inicio:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Guarda la configuración de la página de inicio (borrador)
 * @param {Object} data - Datos de configuración a guardar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveHomePageContent = async (data) => {
  try {
    // Validar datos mínimos
    if (!data || typeof data !== 'object') {
      throw new Error('Se requieren datos válidos para guardar');
    }

    // Referencia al documento
    const docRef = doc(FirebaseDB, DRAFT_COLLECTION, HOME_PAGE_ID);

    // Preparar datos con timestamps
    const dataToSave = {
      ...data,
      updatedAt: serverTimestamp()
    };

    // Verificar si ya existe
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      dataToSave.createdAt = serverTimestamp();
    }

    // Guardar en Firestore
    await setDoc(docRef, dataToSave);

    return { ok: true };
  } catch (error) {
    console.error('Error guardando contenido de la página de inicio:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Publica la configuración de la página de inicio
 * Copia el borrador a la colección de publicados
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const publishHomePageContent = async () => {
  try {
    // 1. Obtener el borrador actual
    const draftResult = await getHomePageContent('draft');

    if (!draftResult.ok || !draftResult.data) {
      throw new Error('No se encontró un borrador para publicar');
    }

    // 2. Referencia al documento publicado
    const publishedRef = doc(FirebaseDB, PUBLISHED_COLLECTION, HOME_PAGE_ID);

    // 3. Preparar datos con timestamps
    const dataToPublish = {
      ...draftResult.data,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 4. Verificar si ya existe un documento publicado
    const publishedSnap = await getDoc(publishedRef);
    if (!publishedSnap.exists()) {
      dataToPublish.createdAt = serverTimestamp();
    }

    // 5. Guardar en Firestore como publicado
    await setDoc(publishedRef, dataToPublish);

    return { ok: true };
  } catch (error) {
    console.error('Error publicando contenido de la página de inicio:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};