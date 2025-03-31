import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { FirebaseDB } from "../../../config/firebase/firebaseConfig";

/**
 * Servicio para gestionar los bloques de contenido de las páginas
 * Permite crear, leer, actualizar y eliminar bloques de contenido configurables
 * Soporta gestión de borradores y publicación
 */
export const ContentService = {

  /**
   * Obtiene la configuración de una página por su identificador
   * @param {string} pageId - Identificador de la página (ej: "home", "about", "contact")
   * @param {string} [version='draft'] - Versión a cargar ('draft' o 'published')
   * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
   */
  getPageContent: async (pageId, version = 'draft') => {
    try {
      // Verificar parámetro
      if (!pageId) {
        throw new Error("Se requiere un ID de página");
      }

      // Determinar la colección según la versión
      const collectionName = version === 'published' ? "content_published" : "content";

      // Referencia al documento de la página
      const pageRef = doc(FirebaseDB, collectionName, pageId);
      const pageDoc = await getDoc(pageRef);

      // Si no existe, devolvemos un objeto vacío
      if (!pageDoc.exists()) {
        return {
          ok: true,
          data: {
            id: pageId,
            blocks: [],
            updatedAt: null,
            createdAt: null
          }
        };
      }

      // Devolvemos los datos
      return {
        ok: true,
        data: {
          id: pageDoc.id,
          ...pageDoc.data()
        }
      };
    } catch (error) {
      console.error(`Error obteniendo contenido de página [${pageId}]:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Guarda la configuración completa de una página (borrador)
   * @param {string} pageId - Identificador de la página
   * @param {Object} pageData - Datos de la página y sus bloques
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  savePageContent: async (pageId, pageData) => {

    console.log("Guardando página:", pageId);
    console.log("Con datos:", pageData);


    try {
      // Verificar parámetros
      if (!pageId) {
        throw new Error("Se requiere un ID de página");
      }

      // Referencia al documento
      const pageRef = doc(FirebaseDB, "content", pageId);

      // Verificar si ya existe
      const pageDoc = await getDoc(pageRef);

      // Preparar datos con timestamps
      const dataToSave = {
        ...pageData,
        updatedAt: serverTimestamp()
      };

      // Si no existe, añadir timestamp de creación
      if (!pageDoc.exists()) {
        dataToSave.createdAt = serverTimestamp();
      }

      // Guardar en Firestore
      await setDoc(pageRef, dataToSave, { merge: true });

      return { ok: true };
    } catch (error) {
      console.error(`Error guardando contenido de página [${pageId}]:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Publica la configuración actual de la página
   * Copia el contenido de la colección "content" a "content_published"
   * @param {string} pageId - Identificador de la página
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  publishPageContent: async (pageId) => {
    try {
      // Verificar parámetros
      if (!pageId) {
        throw new Error("Se requiere un ID de página");
      }

      // Obtener el contenido actual (borrador)
      const { ok, data, error } = await ContentService.getPageContent(pageId, 'draft');
      if (!ok) {
        throw new Error(error || "Error obteniendo contenido para publicar");
      }

      // Referencia al documento publicado
      const publishedRef = doc(FirebaseDB, "content_published", pageId);

      // Preparar datos para publicar con timestamps
      const dataToPublish = {
        ...data,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Si es la primera vez que se publica, añadir timestamp de creación
      const publishedDoc = await getDoc(publishedRef);
      if (!publishedDoc.exists()) {
        dataToPublish.createdAt = serverTimestamp();
      }

      // Guardar en Firestore como publicado
      await setDoc(publishedRef, dataToPublish, { merge: true });

      return { ok: true };
    } catch (error) {
      console.error(`Error publicando contenido de página [${pageId}]:`, error);
      return { ok: false, error: error.message };
    }
  },

};