import {
  doc, collection, getDoc, getDocs, query,
  where, orderBy, addDoc, updateDoc, deleteDoc,
  serverTimestamp, writeBatch, setDoc,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FirebaseDB } from '../../../firebase/firebaseConfig.js'

/**
 * Servicio base para operaciones con Firebase
 * Centraliza la lógica común de acceso a datos
 */
export const apiService = {
  /**
   * Obtiene un documento por su ID
   *
   * @param {string} collectionName - Nombre de la colección
   * @param {string} docId - ID del documento
   * @param {string} path - Ruta adicional (opcional)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async getDocument(collectionName, docId, path = '') {
    try {
      const docRef = path
        ? doc(FirebaseDB, path, collectionName, docId)
        : doc(FirebaseDB, collectionName, docId);

      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { ok: false, error: 'Documento no encontrado' };
      }

      return {
        ok: true,
        data: { id: docSnap.id, ...docSnap.data() },
        error: null
      };
    } catch (error) {
      console.error(`Error al obtener documento ${collectionName}/${docId}:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Obtiene una lista de documentos con filtros
   *
   * @param {string} collectionName - Nombre de la colección
   * @param {Array} filters - Array de condiciones [campo, operador, valor]
   * @param {Array} sortBy - Array de ordenamiento [campo, dirección]
   * @param {string} path - Ruta adicional (opcional)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async getDocuments(collectionName, filters = [], sortBy = null, path = '') {
    try {
      let collRef = path
        ? collection(FirebaseDB, path, collectionName)
        : collection(FirebaseDB, collectionName);

      // Aplicar filtros
      let queryRef = collRef;
      if (filters.length > 0) {
        const queryFilters = filters.map(([field, operator, value]) =>
          where(field, operator, value)
        );
        queryRef = query(collRef, ...queryFilters);
      }

      // Aplicar ordenamiento
      if (sortBy) {
        const [field, direction = 'asc'] = Array.isArray(sortBy) ? sortBy : [sortBy, 'asc'];
        queryRef = query(queryRef, orderBy(field, direction));
      }

      const snapshot = await getDocs(queryRef);
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { ok: true, data: docs, error: null };
    } catch (error) {
      console.error(`Error al obtener documentos ${collectionName}:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Crea un documento
   *
   * @param {string} collectionName - Nombre de la colección
   * @param {Object} data - Datos a guardar
   * @param {string} path - Ruta adicional (opcional)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async createDocument(collectionName, data, path = '') {
    try {
      const collRef = path
        ? collection(FirebaseDB, path, collectionName)
        : collection(FirebaseDB, collectionName);

      const timestamp = serverTimestamp();
      const docData = {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const docRef = await addDoc(collRef, docData);

      return { ok: true, id: docRef.id, error: null };
    } catch (error) {
      console.error(`Error al crear documento en ${collectionName}:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Actualiza un documento
   *
   * @param {string} collectionName - Nombre de la colección
   * @param {string} docId - ID del documento
   * @param {Object} data - Datos a actualizar
   * @param {string} path - Ruta adicional (opcional)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async updateDocument(collectionName, docId, data, path = '') {
    try {
      const docRef = path
        ? doc(FirebaseDB, path, collectionName, docId)
        : doc(FirebaseDB, collectionName, docId);

      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);

      return { ok: true, error: null };
    } catch (error) {
      console.error(`Error al actualizar documento ${collectionName}/${docId}:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Elimina un documento
   *
   * @param {string} collectionName - Nombre de la colección
   * @param {string} docId - ID del documento
   * @param {string} path - Ruta adicional (opcional)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async deleteDocument(collectionName, docId, path = '') {
    try {
      const docRef = path
        ? doc(FirebaseDB, path, collectionName, docId)
        : doc(FirebaseDB, collectionName, docId);

      await deleteDoc(docRef);

      return { ok: true, error: null };
    } catch (error) {
      console.error(`Error al eliminar documento ${collectionName}/${docId}:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Guarda o actualiza un documento (upsert)
   *
   * @param {string} collectionName - Nombre de la colección
   * @param {string} docId - ID del documento
   * @param {Object} data - Datos a guardar
   * @param {string} path - Ruta adicional (opcional)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async upsertDocument(collectionName, docId, data, path = '') {
    try {
      const docRef = path
        ? doc(FirebaseDB, path, collectionName, docId)
        : doc(FirebaseDB, collectionName, docId);

      const timestamp = serverTimestamp();
      const docData = {
        ...data,
        updatedAt: timestamp
      };

      await setDoc(docRef, docData, { merge: true });

      return { ok: true, id: docId, error: null };
    } catch (error) {
      console.error(`Error al guardar documento ${collectionName}/${docId}:`, error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Llama a una Cloud Function de Firebase
   *
   * @param {string} functionName - Nombre de la función
   * @param {Object} data - Datos a enviar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async callCloudFunction(functionName, data = {}) {
    try {
      const functions = getFunctions();
      const callFunction = httpsCallable(functions, functionName);

      const result = await callFunction(data);

      return { ok: true, data: result.data, error: null };
    } catch (error) {
      console.error(`Error al llamar a Cloud Function ${functionName}:`, error);
      return { ok: false, error: error.message };
    }
  }
};