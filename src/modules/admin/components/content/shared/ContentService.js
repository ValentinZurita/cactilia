// src/modules/admin/services/contentService.js
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../config/firebase/firebaseConfig.js'

// Colecciones de Firestore
const DRAFT_COLLECTION = 'content';
const PUBLISHED_COLLECTION = 'content_published';

/**
 * Service que maneja operaciones de contenido para páginas dinámicas
 */
export const ContentService = {
  /**
   * Obtiene el contenido de una página específica
   * @param {string} pageId - Identificador de la página (home, about, etc.)
   * @param {string} [version='draft'] - Versión a obtener (draft o published)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  getPageContent: async (pageId, version = 'draft') => {
    try {
      // Determinar colección según versión
      const collectionName = version === 'published' ? PUBLISHED_COLLECTION : DRAFT_COLLECTION;

      // Obtener el documento
      const docRef = doc(FirebaseDB, collectionName, pageId);
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
          ok: true,
          data: null
        };
      }
    } catch (error) {
      console.error(`Error obteniendo contenido de la página ${pageId}:`, error);
      return {
        ok: false,
        error: error.message
      };
    }
  },

  /**
   * Guarda el contenido de una página (borrador)
   * @param {string} pageId - Identificador de la página
   * @param {Object} data - Datos de la página a guardar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  savePageContent: async (pageId, data) => {
    try {
      // Validar datos
      if (!pageId || !data || typeof data !== 'object') {
        throw new Error('Se requieren datos válidos para guardar');
      }

      // Referencia al documento
      const docRef = doc(FirebaseDB, DRAFT_COLLECTION, pageId);

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
      console.error(`Error guardando contenido de la página ${pageId}:`, error);
      return {
        ok: false,
        error: error.message
      };
    }
  },

  /**
   * Publica el contenido (copia el borrador a publicado)
   * @param {string} pageId - Identificador de la página a publicar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  publishPageContent: async (pageId) => {
    try {
      // 1. Obtener el borrador actual
      const draftResult = await ContentService.getPageContent(pageId, 'draft');

      if (!draftResult.ok || !draftResult.data) {
        throw new Error('No se encontró un borrador para publicar');
      }

      // 2. Referencia al documento publicado
      const publishedRef = doc(FirebaseDB, PUBLISHED_COLLECTION, pageId);

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
      console.error(`Error publicando contenido de la página ${pageId}:`, error);
      return {
        ok: false,
        error: error.message
      };
    }
  },

  /**
   * Obtiene todas las páginas disponibles
   * @param {string} [version='draft'] - Versión a obtener
   * @returns {Promise<Object>} - Resultado de la operación
   */
  getAllPages: async (version = 'draft') => {
    try {
      const collectionName = version === 'published' ? PUBLISHED_COLLECTION : DRAFT_COLLECTION;
      const querySnapshot = await getDocs(collection(FirebaseDB, collectionName));

      const pages = [];
      querySnapshot.forEach((doc) => {
        pages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        ok: true,
        data: pages
      };
    } catch (error) {
      console.error('Error obteniendo páginas:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }
};

// Exportamos para uso en otros módulos
export default ContentService;