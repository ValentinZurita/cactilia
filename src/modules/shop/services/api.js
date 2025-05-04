import {
  doc, collection, getDoc, getDocs, query,
  where, orderBy, addDoc, updateDoc, deleteDoc,
  serverTimestamp, writeBatch, setDoc, limit, startAfter
} from 'firebase/firestore'
// Volver a importar el SDK de Functions
import { getFunctions, httpsCallable } from 'firebase/functions' 
import { FirebaseApp } from '../../../config/firebase/firebaseConfig.js' // Mantener si se usa en otras partes o para obtener Auth token si es necesario
import { FirebaseDB } from '../../../config/firebase/firebaseConfig.js'

// Importar FirebaseAuth para obtener el token si es necesario (httpsCallable lo maneja)
// import { getAuth, getIdToken } from 'firebase/auth';

// Obtener instancia de Functions (puede hacerse una vez)
const functions = getFunctions(FirebaseApp, 'us-central1'); // Especificar región

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
   * Obtiene una lista de documentos con filtros, ordenamiento y paginación
   *
   * @param {string} collectionName - Nombre de la colección
   * @param {Array} filters - Array de condiciones [campo, operador, valor]
   * @param {Array} sortBy - Array de ordenamiento [campo, dirección]
   * @param {string} path - Ruta adicional (opcional)
   * @param {number} pageSize - Número de documentos por página (opcional)
   * @param {DocumentSnapshot} startAfterDoc - Documento después del cual empezar (opcional)
   * @returns {Promise<Object>} - Resultado: { ok, data, lastVisible, hasMore, error }
   */
  async getDocuments(collectionName, filters = [], sortBy = null, path = '', pageSize = null, startAfterDoc = null) {
    try {
      let collRef = path
        ? collection(FirebaseDB, path, collectionName)
        : collection(FirebaseDB, collectionName);

      // Construir la query con filtros, ordenamiento, paginación
      let queryConstraints = [];

      // Aplicar filtros
      if (filters.length > 0) {
        filters.forEach(([field, operator, value]) => {
          queryConstraints.push(where(field, operator, value));
        });
      }

      // Aplicar ordenamiento (NECESARIO para paginación consistente)
      if (sortBy) {
        const [field, direction = 'asc'] = Array.isArray(sortBy) ? sortBy : [sortBy, 'asc'];
        queryConstraints.push(orderBy(field, direction));
      } else if (pageSize) {
         // Si hay paginación, DEBE haber un orderBy para que startAfter funcione correctamente.
         // Usar un campo común como 'createdAt' o el ID del documento si no se especifica sortBy.
         // ¡¡IMPORTANTE!! Ajustar 'createdAt' si el campo de timestamp es diferente o no existe.
         // Si no hay un campo común fiable, la paginación puede ser inconsistente.
         console.warn(`Paginación sin orden explícito en ${collectionName}. Usando 'createdAt' descendente por defecto. Asegúrate de que este campo exista y esté indexado.`);
         queryConstraints.push(orderBy('createdAt', 'desc')); // <-- Orden por defecto para paginación
      }


      // Aplicar paginación (startAfter)
      if (startAfterDoc) {
        queryConstraints.push(startAfter(startAfterDoc));
      }

      // Aplicar paginación (limit)
      if (pageSize) {
        queryConstraints.push(limit(pageSize));
      }

      const finalQuery = query(collRef, ...queryConstraints); // Aplicar todas las restricciones


      const snapshot = await getDocs(finalQuery); // Usar finalQuery
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      const hasMore = pageSize ? docs.length === pageSize : false; // Hay más si obtuvimos una página completa

      return { ok: true, data: docs, lastVisible, hasMore, error: null }; // <-- Devolver lastVisible y hasMore
    } catch (error) {
      console.error(`Error al obtener documentos ${collectionName}:`, error);
      // Asegúrate de devolver la estructura esperada incluso en caso de error para consistencia
      return { ok: false, data: [], lastVisible: null, hasMore: false, error: error.message };
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
   * Llama a una Cloud Function de Firebase usando el SDK httpsCallable.
   *
   * @param {string} functionName - Nombre de la función
   * @param {Object} data - Datos a enviar
   * @returns {Promise<Object>} - Resultado de la operación (la estructura devuelta por la función)
   */
  async callCloudFunction(functionName, data = {}) {
    console.log(`Intentando llamar a Cloud Function via httpsCallable: ${functionName}`);
    try {
      // Crear una referencia callable a la función
      const callableFunction = httpsCallable(functions, functionName);

      // Llamar a la función con los datos. El SDK maneja la autenticación (token) y CORS.
      const result = await callableFunction(data); // No es necesario envolver en { data: ... }

      console.log(`Respuesta recibida de ${functionName} (callable):`, JSON.stringify(result));

      // contiene lo que la función retornó.
      // return result.data; // <-- NO devolver solo la data

      // Devolver una estructura consistente { ok, data, error }
      return {
        ok: true,
        data: result.data, // La data devuelta por la función va aquí
        error: null
      };

    } catch (error) {
      console.error(`Error al llamar a Cloud Function ${functionName} via callable:`, error); // <-- Corregir template literal
      // Mapear el error HttpsError a nuestra estructura { ok, error }
      return {
        ok: false,
        error: error.message || 'Error desconocido al llamar la función.',
        code: error.code // opcional: incluir el código de error HttpsError
      };
    }
  },
}; // <-- Asegurar que el objeto apiService cierre correctamente