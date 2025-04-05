import { doc, updateDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../config/firebase/firebaseConfig';

/**
 * Toggles a product's active status
 * @param {string} productId - ID of the product
 * @param {boolean} newStatus - The new active status
 * @returns {Promise<{ok: boolean, error: string|null}>}
 */
export const toggleProductStatus = async (productId, newStatus) => {
  try {
    const productRef = doc(FirebaseDB, 'products', productId);
    await updateDoc(productRef, { active: newStatus });
    return { ok: true, error: null };
  } catch (error) {
    console.error(`Error toggling status for product ${productId}:`, error);
    return { ok: false, error: error.message };
  }
}; 