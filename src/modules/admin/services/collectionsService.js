import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { FirebaseDB } from "../../../firebase/firebaseConfig";

/**
 * Servicio para gestionar colecciones de archivos multimedia
 * Proporciona funciones CRUD para las colecciones de imágenes
 */

const COLLECTIONS_PATH = "mediaCollections";

/**
 * Obtiene todas las colecciones disponibles
 * @returns {Promise<{ok: boolean, data?: Array, error?: string}>}
 */
export const getCollections = async () => {
  try {
    // Consulta colecciones ordenadas por nombre
    const collectionsQuery = query(
      collection(FirebaseDB, COLLECTIONS_PATH),
      orderBy("name", "asc")
    );

    const querySnapshot = await getDocs(collectionsQuery);

    // Procesar resultados
    const collections = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convertir timestamps para una visualización adecuada
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }));

    return { ok: true, data: collections };
  } catch (error) {
    console.error("Error obteniendo colecciones:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene una colección específica por su ID
 * @param {string} collectionId - ID de la colección
 * @returns {Promise<{ok: boolean, data?: Object, error?: string}>}
 */
export const getCollectionById = async (collectionId) => {
  try {
    if (!collectionId) {
      throw new Error("ID de colección requerido");
    }

    const collectionRef = doc(FirebaseDB, COLLECTIONS_PATH, collectionId);
    const collectionSnap = await getDoc(collectionRef);

    if (!collectionSnap.exists()) {
      throw new Error("Colección no encontrada");
    }

    return {
      ok: true,
      data: {
        id: collectionSnap.id,
        ...collectionSnap.data(),
        createdAt: collectionSnap.data().createdAt?.toDate?.() || new Date(),
        updatedAt: collectionSnap.data().updatedAt?.toDate?.() || new Date()
      }
    };
  } catch (error) {
    console.error("Error obteniendo colección:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Crea una nueva colección de imágenes
 * @param {Object} collectionData - Datos de la colección
 * @param {string} collectionData.name - Nombre de la colección
 * @param {string} collectionData.description - Descripción de la colección
 * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
 */
export const createCollection = async (collectionData) => {
  try {
    // Validar datos mínimos requeridos
    if (!collectionData?.name) {
      throw new Error("El nombre de la colección es obligatorio");
    }

    // Preparar datos para guardar
    const dataToSave = {
      ...collectionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Crear documento en Firestore
    const docRef = await addDoc(
      collection(FirebaseDB, COLLECTIONS_PATH),
      dataToSave
    );

    return { ok: true, id: docRef.id };
  } catch (error) {
    console.error("Error creando colección:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Actualiza una colección existente
 * @param {string} collectionId - ID de la colección a actualizar
 * @param {Object} updatedData - Datos actualizados
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export const updateCollection = async (collectionId, updatedData) => {
  try {
    if (!collectionId) {
      throw new Error("ID de colección requerido para actualizar");
    }

    // Preparar datos para actualizar
    const dataToUpdate = {
      ...updatedData,
      updatedAt: serverTimestamp()
    };

    // Actualizar documento en Firestore
    const collectionRef = doc(FirebaseDB, COLLECTIONS_PATH, collectionId);
    await updateDoc(collectionRef, dataToUpdate);

    return { ok: true };
  } catch (error) {
    console.error("Error actualizando colección:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Elimina una colección
 * @param {string} collectionId - ID de la colección a eliminar
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export const deleteCollection = async (collectionId) => {
  try {
    if (!collectionId) {
      throw new Error("ID de colección requerido para eliminar");
    }

    // Eliminar documento en Firestore
    const collectionRef = doc(FirebaseDB, COLLECTIONS_PATH, collectionId);
    await deleteDoc(collectionRef);

    return { ok: true };
  } catch (error) {
    console.error("Error eliminando colección:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene todos los medios asociados a una colección
 * @param {string} collectionId - ID de la colección
 * @returns {Promise<{ok: boolean, data?: Array, error?: string}>}
 */
export const getMediaByCollection = async (collectionId) => {
  try {
    if (!collectionId) {
      throw new Error("ID de colección requerido");
    }

    // Consultar medios de esta colección
    const mediaQuery = query(
      collection(FirebaseDB, "media"),
      orderBy("uploadedAt", "desc")
    );

    const querySnapshot = await getDocs(mediaQuery);

    // Filtrar los resultados por collectionId
    const mediaItems = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date()
      }))
      .filter(item => item.collectionId === collectionId);

    return { ok: true, data: mediaItems };
  } catch (error) {
    console.error("Error obteniendo medios de la colección:", error);
    return { ok: false, error: error.message };
  }
};