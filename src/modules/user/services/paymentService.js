import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc, getDoc } from 'firebase/firestore'
import { FirebaseDB } from '../../../firebase/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Collection name for payment methods
const PAYMENT_METHODS_COLLECTION = 'payment_methods';

/**
 * Get all payment methods for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<{ok: boolean, data: Array, error: string}>}
 */
export const getUserPaymentMethods = async (userId) => {
  try {
    if (!userId) {
      return { ok: false, data: [], error: 'User ID not provided' };
    }

    // Query payment methods filtering by user ID
    const paymentMethodsRef = collection(FirebaseDB, PAYMENT_METHODS_COLLECTION);
    const q = query(paymentMethodsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    // Transform documents to payment method objects
    const paymentMethods = [];
    querySnapshot.forEach((doc) => {
      paymentMethods.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { ok: true, data: paymentMethods, error: null };

  } catch (error) {
    console.error('Error getting payment methods:', error);
    return { ok: false, data: [], error: error.message };
  }
};

/**
 * Save a new payment method token to Firestore
 * Note: This only stores the token - the actual card details are stored by Stripe
 *
 * @param {string} userId - User ID
 * @param {Object} paymentData - Payment method data with Stripe token
 * @returns {Promise<{ok: boolean, id: string, error: string}>}
 */
export const savePaymentMethod = async (userId, paymentData) => {
  try {
    if (!userId) {
      return { ok: false, error: 'User ID not provided' };
    }

    if (!paymentData.paymentMethodId) {
      return { ok: false, error: 'Payment method ID not provided' };
    }

    // If this is the first payment method or it's marked as default,
    // reset any existing default payment methods
    if (paymentData.isDefault) {
      await resetDefaultPaymentMethods(userId);
    }

    // Create a copy of the data to avoid modifying the original object
    const dataToSave = { ...paymentData };

    // Remove the id if it exists, as Firestore generates its own id
    if ('id' in dataToSave) {
      delete dataToSave.id;
    }

    // Add payment method to Firestore
    const paymentMethodsRef = collection(FirebaseDB, PAYMENT_METHODS_COLLECTION);
    const docRef = await addDoc(paymentMethodsRef, {
      ...dataToSave,
      userId,
      createdAt: new Date()
    });

    return { ok: true, id: docRef.id, error: null };

  } catch (error) {
    console.error('Error saving payment method:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Delete a payment method
 *
 * @param {string} paymentMethodId - Firestore ID of the payment method
 * @param {string} stripePaymentMethodId - Stripe payment method ID
 * @returns {Promise<{ok: boolean, error: string}>}
 */
export const deletePaymentMethod = async (paymentMethodId, stripePaymentMethodId) => {
  try {
    if (!paymentMethodId) {
      return { ok: false, error: 'Payment method ID not provided' };
    }

    // First check if this is the default payment method
    const paymentMethodRef = doc(FirebaseDB, PAYMENT_METHODS_COLLECTION, paymentMethodId);
    const paymentMethodSnap = await getDoc(paymentMethodRef);

    if (!paymentMethodSnap.exists()) {
      return { ok: false, error: 'Payment method does not exist' };
    }

    const paymentMethodData = paymentMethodSnap.data();

    // Don't allow deletion of default payment method
    if (paymentMethodData.isDefault) {
      return {
        ok: false,
        error: 'Cannot delete default payment method. Set another as default first.'
      };
    }

    // Call Cloud Function to detach the payment method from Stripe
    if (stripePaymentMethodId) {
      const functions = getFunctions();
      const detachPaymentMethod = httpsCallable(functions, 'detachPaymentMethod');
      await detachPaymentMethod({ paymentMethodId: stripePaymentMethodId });
    }

    // Delete from Firestore
    await deleteDoc(paymentMethodRef);

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Set a payment method as default
 *
 * @param {string} userId - User ID
 * @param {string} paymentMethodId - ID of the payment method to set as default
 * @returns {Promise<{ok: boolean, error: string}>}
 */
export const setDefaultPaymentMethod = async (userId, paymentMethodId) => {
  try {
    if (!userId || !paymentMethodId) {
      return { ok: false, error: 'User ID and payment method ID are required' };
    }

    // First, reset all existing default payment methods
    await resetDefaultPaymentMethods(userId);

    // Then set the selected payment method as default
    const paymentMethodRef = doc(FirebaseDB, PAYMENT_METHODS_COLLECTION, paymentMethodId);
    await updateDoc(paymentMethodRef, {
      isDefault: true,
      updatedAt: new Date()
    });

    // Call Cloud Function to update default payment method in Stripe
    const functions = getFunctions();
    const updateDefaultPaymentMethod = httpsCallable(functions, 'updateDefaultPaymentMethod');
    await updateDefaultPaymentMethod({ paymentMethodId });

    return { ok: true, error: null };

  } catch (error) {
    console.error('Error setting default payment method:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Helper function to reset all default payment methods for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const resetDefaultPaymentMethods = async (userId) => {
  const paymentMethodsRef = collection(FirebaseDB, PAYMENT_METHODS_COLLECTION);
  const q = query(
    paymentMethodsRef,
    where('userId', '==', userId),
    where('isDefault', '==', true)
  );

  const querySnapshot = await getDocs(q);

  const updatePromises = [];
  querySnapshot.forEach((document) => {
    const paymentMethodRef = doc(FirebaseDB, PAYMENT_METHODS_COLLECTION, document.id);
    updatePromises.push(
      updateDoc(paymentMethodRef, {
        isDefault: false,
        updatedAt: new Date()
      })
    );
  });

  await Promise.all(updatePromises);
};