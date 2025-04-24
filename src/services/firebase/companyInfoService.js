import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { FirebaseDB } from '../../config/firebase/firebaseConfig.js';

const SOCIAL_MEDIA_COLLECTION = 'companyInfo';
const SOCIAL_MEDIA_DOC_ID = 'socialMedia';


/**
 * Obtiene la lista de enlaces de redes sociales desde Firestore.
 * @returns {Promise<Array<object>>} Una promesa que resuelve con el array de enlaces sociales, o un array vacío si no existe o hay error.
 */

export const getSocialMediaLinks = async () => {
  try {
    const docRef = doc(FirebaseDB, SOCIAL_MEDIA_COLLECTION, SOCIAL_MEDIA_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && Array.isArray(docSnap.data().links)) {
      // Asegúrate de que el campo 'links' existe y es un array
      return docSnap.data().links;
    } else {
      console.log("Documento 'socialMedia' o campo 'links' no encontrado/inválido en companyInfo. Devolviendo array vacío.");
      return []; // Devuelve un array vacío si no hay datos o no es un array
    }
  } catch (error) {
    console.error("Error fetching social media links:", error);
    return []; // Devuelve array vacío en caso de error
  }
};



/**
 * Actualiza (sobrescribe) la lista completa de enlaces de redes sociales en Firestore.
 * @param {Array<object>} updatedLinksArray - El nuevo array completo de enlaces sociales.
 * @returns {Promise<boolean>} Una promesa que resuelve a true si la actualización fue exitosa, false si falló.
 */

export const updateSocialMediaLinks = async (updatedLinksArray) => {
  if (!Array.isArray(updatedLinksArray)) {
      console.error("Error: updatedLinksArray debe ser un array.");
      return false;
  }

  try {
    const docRef = doc(FirebaseDB, SOCIAL_MEDIA_COLLECTION, SOCIAL_MEDIA_DOC_ID);
    await setDoc(docRef, { links: updatedLinksArray }, { merge: true }); 
    console.log("Social media links updated successfully in companyInfo!");
    return true;
  } catch (error) {
    console.error("Error updating social media links:", error);
    return false;
  }
};
