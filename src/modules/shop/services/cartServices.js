import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig';


/**
 * Service for cart operations with Firestore
 */


// Helper to get cart document reference
const getCartRef = (userId) => doc(FirebaseDB, 'carts', userId);



/**
 * Save a user's cart to Firestore
 *
 * @param {string} userId - The user's ID
 * @param {Array} items - Array of cart items
 * @returns {Promise<Object>} - Result of the operation
 */

export const saveCart = async (userId, items) => {
  if (!userId) return { ok: false, error: 'User ID is required' };

  try {
    const cartRef = getCartRef(userId);

    await setDoc(cartRef, {
      userId,
      items,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { ok: true };
  } catch (error) {
    console.error('Error saving cart:', error);
    return { ok: false, error: error.message };
  }
};



/**
 * Get a user's cart from Firestore
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Cart data or error
 */

export const getCart = async (userId) => {
  if (!userId) return { ok: false, error: 'User ID is required' };

  try {
    const cartRef = getCartRef(userId);
    const cartDoc = await getDoc(cartRef);

    if (cartDoc.exists()) {
      return {
        ok: true,
        data: cartDoc.data()
      };
    } else {
      return {
        ok: true,
        data: { items: [] }
      };
    }
  } catch (error) {
    console.error('Error getting cart:', error);
    return { ok: false, error: error.message };
  }
};



/**
 * Delete a user's cart from Firestore
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Result of the operation
 */

export const deleteCart = async (userId) => {
  if (!userId) return { ok: false, error: 'User ID is required' };

  try {
    const cartRef = getCartRef(userId);
    await deleteDoc(cartRef);

    return { ok: true };
  } catch (error) {
    console.error('Error deleting cart:', error);
    return { ok: false, error: error.message };
  }
};