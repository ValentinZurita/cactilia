import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';
import {
  getUserPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod
} from '../services/paymentService';
import { useFirebaseFunctionsMock } from '../services/mockFirebaseFunctions.js'

/**
 * Custom hook for managing payment methods
 * Connects to Stripe via Firebase functions
 */
export const usePayments = () => {
  const dispatch = useDispatch();
  const { uid, status } = useSelector(state => state.auth);

  // States for managing payment methods
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (process.env.NODE_ENV !== 'production') {
    useFirebaseFunctionsMock();
  }

  // Load payment methods from Firestore
  useEffect(() => {
    const loadPaymentMethods = async () => {
      // Only load if user is authenticated
      if (status !== 'authenticated' || !uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getUserPaymentMethods(uid);

        if (result.ok) {
          setPaymentMethods(result.data);
        } else {
          setError(result.error || 'Error loading payment methods');
          dispatch(addMessage({
            type: 'error',
            text: 'Failed to load payment methods'
          }));
        }
      } catch (err) {
        console.error('Error in usePayments:', err);
        setError('Error loading payment methods');
        dispatch(addMessage({
          type: 'error',
          text: 'Failed to load payment methods'
        }));
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, [uid, status, dispatch, refreshTrigger]);

  // Refresh payment methods list
  const refreshPaymentMethods = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Set a payment method as default
  const setDefaultPayment = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);

    try {
      const result = await setDefaultPaymentMethod(uid, id);

      if (result.ok) {
        // Update the local state
        setPaymentMethods(prevMethods =>
          prevMethods.map(method => ({
            ...method,
            isDefault: method.id === id
          }))
        );

        dispatch(addMessage({
          type: 'success',
          text: 'Default payment method updated'
        }));
      } else {
        throw new Error(result.error || 'Failed to update default payment method');
      }
    } catch (err) {
      console.error('Error setting default payment method:', err);
      dispatch(addMessage({
        type: 'error',
        text: err.message || 'Failed to update default payment method'
      }));
    } finally {
      setLoading(false);
    }
  }, [uid, dispatch]);

  // Delete a payment method
  const deletePayment = useCallback(async (id) => {
    // Find the payment method to get the Stripe payment method ID
    const paymentMethod = paymentMethods.find(method => method.id === id);

    if (!paymentMethod) {
      dispatch(addMessage({
        type: 'error',
        text: 'Payment method not found'
      }));
      return;
    }

    // Confirm deletion
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setLoading(true);

      try {
        const result = await deletePaymentMethod(
          id,
          paymentMethod.stripePaymentMethodId
        );

        if (result.ok) {
          // Update the local state
          setPaymentMethods(prevMethods =>
            prevMethods.filter(method => method.id !== id)
          );

          dispatch(addMessage({
            type: 'success',
            text: 'Payment method deleted successfully'
          }));
        } else {
          throw new Error(result.error || 'Failed to delete payment method');
        }
      } catch (err) {
        console.error('Error deleting payment method:', err);
        dispatch(addMessage({
          type: 'error',
          text: err.message || 'Failed to delete payment method'
        }));
      } finally {
        setLoading(false);
      }
    }
  }, [paymentMethods, dispatch]);

  // Open the form to add a new payment method
  const addPayment = useCallback(() => {
    setShowForm(true);
  }, []);

  // Close the form
  const closeForm = useCallback(() => {
    setShowForm(false);
  }, []);

  // Handle success after adding a payment method
  const handlePaymentAdded = useCallback(() => {
    refreshPaymentMethods();
  }, [refreshPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    showForm,
    setDefaultPayment,
    deletePayment,
    addPayment,
    closeForm,
    handlePaymentAdded,
    refreshPaymentMethods
  };
};