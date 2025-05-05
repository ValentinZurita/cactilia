import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { FirebaseDB } from '../../config/firebase/firebaseConfig.js';

// Correct constants for reading company info settings
const SETTINGS_COLLECTION = 'settings'; 
const COMPANY_INFO_DOC_ID = 'company_info';


/**
 * Obtiene la lista de enlaces de redes sociales desde Firestore (settings/company_info).
 * @returns {Promise<Array<object>>} Una promesa que resuelve con el array de enlaces sociales (items), o un array vacío si no existe o hay error.
 */
export const getSocialMediaLinks = async () => {
  try {
    // Reference the correct document: settings/company_info
    const docRef = doc(FirebaseDB, SETTINGS_COLLECTION, COMPANY_INFO_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Access the correct nested field: socialMedia.items
      if (data.socialMedia && Array.isArray(data.socialMedia.items)) {
        return data.socialMedia.items;
      } else {
        console.warn(`Campo 'socialMedia.items' no encontrado o no es un array en ${SETTINGS_COLLECTION}/${COMPANY_INFO_DOC_ID}.`);
        return []; 
      }
    } else {
      console.warn(`Documento ${SETTINGS_COLLECTION}/${COMPANY_INFO_DOC_ID} no encontrado.`);
      return []; // Devuelve un array vacío si el documento no existe
    }
  } catch (error) {
    console.error(`Error fetching social media links from ${SETTINGS_COLLECTION}/${COMPANY_INFO_DOC_ID}:`, error);
    return []; // Devuelve array vacío en caso de error
  }
};


/**
 * Actualiza (sobrescribe) la lista completa de enlaces de redes sociales en Firestore (settings/company_info).
 * @param {Array<object>} updatedLinksArray - El nuevo array completo de enlaces sociales.
 * @returns {Promise<boolean>} Una promesa que resuelve a true si la actualización fue exitosa, false si falló.
 */
export const updateSocialMediaLinks = async (updatedLinksArray) => {
  if (!Array.isArray(updatedLinksArray)) {
      console.error("Error: updatedLinksArray debe ser un array.");
      return false;
  }

  try {
    // Reference the correct document: settings/company_info
    const docRef = doc(FirebaseDB, SETTINGS_COLLECTION, COMPANY_INFO_DOC_ID);
    // Update the nested field socialMedia.items
    // Using dot notation for nested field update with merge: true
    await setDoc(docRef, { socialMedia: { items: updatedLinksArray } }, { merge: true }); 
    return true;
  } catch (error) {
    console.error(`Error updating social media links in ${SETTINGS_COLLECTION}/${COMPANY_INFO_DOC_ID}:`, error);
    return false;
  }
};
