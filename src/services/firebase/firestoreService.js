// Placeholder: Import necessary Firebase functions (getFirestore, doc, getDoc, setDoc, updateDoc)
// import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
// import { db } from './firebaseConfig'; // Assuming you have firebaseConfig.js

// Add required Firestore imports
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
// Correct the relative path and the imported variable name
import { FirebaseDB } from '../../config/firebase/firebaseConfig.js';

const SOCIAL_MEDIA_COLLECTION = 'companyInfo';
const SOCIAL_MEDIA_DOC_ID = 'socialMedia';

/**
 * Obtiene la lista de enlaces de redes sociales desde Firestore.
 * @returns {Promise<Array<object>>} Una promesa que resuelve con el array de enlaces sociales, o un array vacío si no existe o hay error.
 */
export const getSocialMediaLinks = async () => {
  try {
    // const firestore = getFirestore(); // O usa la instancia 'db' directamente
    const docRef = doc(FirebaseDB, SOCIAL_MEDIA_COLLECTION, SOCIAL_MEDIA_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && Array.isArray(docSnap.data().links)) {
      // Asegúrate de que el campo 'links' existe y es un array
      return docSnap.data().links;
    } else {
      console.log("Documento 'socialMedia' o campo 'links' no encontrado/inválido. Devolviendo array vacío.");
      // Considera crear el documento/campo si no existe la primera vez?
      return []; // Devuelve un array vacío si no hay datos o no es un array
    }
  } catch (error) {
    console.error("Error fetching social media links:", error);
    // Aquí podrías implementar un manejo de errores más robusto (e.g., Sentry)
    return []; // Devuelve array vacío en caso de error
  }
};

/**
 * Actualiza (sobrescribe) la lista completa de enlaces de redes sociales en Firestore.
 * @param {Array<object>} updatedLinksArray - El nuevo array completo de enlaces sociales.
 * @returns {Promise<boolean>} Una promesa que resuelve a true si la actualización fue exitosa, false si falló.
 */
export const updateSocialMediaLinks = async (updatedLinksArray) => {
  // Validación básica
  if (!Array.isArray(updatedLinksArray)) {
      console.error("Error: updatedLinksArray debe ser un array.");
      return false;
  }

  try {
    // const firestore = getFirestore(); // O usa la instancia 'db' directamente
    const docRef = doc(FirebaseDB, SOCIAL_MEDIA_COLLECTION, SOCIAL_MEDIA_DOC_ID);
    
    // Usamos setDoc con merge:true o updateDoc. 
    // updateDoc es más seguro si quieres asegurarte de que el documento existe
    // y solo quieres actualizar/añadir el campo 'links'.
    // setDoc con merge:true creará el documento si no existe, 
    // o actualizará el campo 'links' si existe (sin borrar otros campos).
    await setDoc(docRef, { links: updatedLinksArray }, { merge: true }); 
    
    // Opcionalmente, podrías usar updateDoc si prefieres que falle si el documento no existe:
    // await updateDoc(docRef, { links: updatedLinksArray });

    console.log("Social media links updated successfully!");
    return true;
  } catch (error) {
    console.error("Error updating social media links:", error);
    // Manejo de errores
    return false;
  }
};

// Podrías añadir más funciones relacionadas aquí...

// --- (Existing code in firestoreService.js if any) --- 
// ... existing code ... 