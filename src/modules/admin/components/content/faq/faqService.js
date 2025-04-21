/**
 * Servicio para gestionar las operaciones CRUD y de publicación
 * relacionadas con el contenido de la página de Preguntas Frecuentes (FAQ)
 * en Firestore.
 */
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../config/firebase/firebaseConfig';

const FAQ_COLLECTION = 'content';
const FAQ_DOC_ID = 'faq';

/**
 * Obtiene los datos de la página de FAQ desde Firestore.
 * Si el documento no existe, devuelve datos iniciales/por defecto.
 * @returns {Promise<object>} Objeto con los datos de la página de FAQ.
 */
export const getFaqContent = async () => {
  const docRef = doc(FirebaseDB, FAQ_COLLECTION, FAQ_DOC_ID);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Devuelve una estructura por defecto si el documento no existe
      return {
        id: FAQ_DOC_ID,
        pageTitle: 'Preguntas Frecuentes',
        pageDescription: 'Encuentra respuestas a las preguntas más comunes.',
        faqItems: [],
        createdAt: null,
        updatedAt: null,
      };
    }
  } catch (error) {
    console.error("Error al obtener el contenido de FAQ:", error);
    throw new Error("No se pudo cargar el contenido de FAQ.");
  }
};

/**
 * Guarda o actualiza los datos de la página de FAQ en Firestore.
 * @param {object} faqData - Objeto completo con los datos de la página de FAQ a guardar.
 * @returns {Promise<void>}
 */
export const saveFaqContent = async (faqData) => {
  const docRef = doc(FirebaseDB, FAQ_COLLECTION, FAQ_DOC_ID);
  try {
    const dataToSave = {
      ...faqData,
      updatedAt: serverTimestamp(),
    };
    if (!faqData.createdAt) {
      dataToSave.createdAt = serverTimestamp();
    }
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    console.error("Error al guardar el contenido de FAQ:", error);
    throw new Error("No se pudo guardar el contenido de FAQ.");
  }
};

/**
 * Obtiene los datos PUBLICADOS de la página de FAQ desde Firestore.
 * Lee desde la colección 'content_published'.
 * @returns {Promise<object|null>} Objeto con los datos publicados o null si no existe.
 */
export const getPublishedFaqContent = async () => {
  const docRef = doc(FirebaseDB, 'content_published', FAQ_DOC_ID);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el contenido publicado de FAQ:", error);
    throw new Error("No se pudo cargar el contenido publicado de FAQ."); // Lanzar error aquí también
  }
}; 