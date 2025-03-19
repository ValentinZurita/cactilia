// src/modules/user/hooks/usePayments.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';
import {
  getUserPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod
} from '../services/paymentService';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { useFirebaseFunctionsMock } from '../services/mockFirebaseFunctions.js';

/**
 * Custom hook for payment methods management
 */
export const usePayments = () => {
  const dispatch = useDispatch();
  const { uid, status } = useSelector(state => state.auth);

  // Get Firebase Functions instance
  const functions = getFunctions();
  const hasConnected = useRef(false);

  // Connect to emulator in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !hasConnected.current) {
      try {
        connectFunctionsEmulator(functions, "localhost", 5001);
        console.log("Connected to Firebase Functions emulator in usePayments");
        hasConnected.current = true;
      } catch (e) {
        // Already connected, ignore
        console.log("Emulator connection error (can be ignored if already connected):", e);
      }
    }
  }, []);

  // Operation in progress reference to prevent duplicates
  const operationInProgressRef = useRef(false);

  // States for payment methods
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // States for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use mocks in development
  if (process.env.NODE_ENV !== 'production') {
    useFirebaseFunctionsMock();
  }

  // Load payment methods from Firestore
  const loadPaymentMethods = useCallback(async () => {
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
        console.log('Payment methods loaded:', result.data);
        setPaymentMethods(result.data);
      } else {
        setError(result.error || 'Error loading payment methods');
        dispatch(addMessage({
          type: 'error',
          text: 'Could not load your payment methods'
        }));
      }
    } catch (err) {
      console.error('Error in usePayments:', err);
      setError('Error loading payment methods');
      dispatch(addMessage({
        type: 'error',
        text: 'Error loading payment methods'
      }));
    } finally {
      setLoading(false);
    }
  }, [uid, status, dispatch]);

  // Load payment methods when refresh trigger changes
  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods, refreshTrigger]);

  // Refresh payment methods
  const refreshPaymentMethods = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Set a payment method as default
  const setDefaultPayment = useCallback(async (id) => {
    if (!id) return;

    // Prevent duplicate operations
    if (operationInProgressRef.current) return;
    operationInProgressRef.current = true;

    setLoading(true);

    try {
      const result = await setDefaultPaymentMethod(uid, id);

      if (result.ok) {
        // Update local state for faster response
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
        throw new Error(result.error || 'Error updating default payment method');
      }
    } catch (err) {
      console.error('Error setting default payment method:', err);
      dispatch(addMessage({
        type: 'error',
        text: err.message || 'Error updating default payment method'
      }));

      // Reload to ensure data is synced
      refreshPaymentMethods();
    } finally {
      setLoading(false);
      operationInProgressRef.current = false;
    }
  }, [uid, dispatch, refreshPaymentMethods]);

  // Confirm action with modal (generic function)
  const confirmWithModal = useCallback((action, data) => {
    setConfirmAction(action);
    setConfirmData(data);
    setShowConfirmModal(true);
  }, []);

  // Initiate confirmation to delete a payment method
  const confirmDeletePayment = useCallback((id) => {
    // Find payment method to get details
    const paymentMethod = paymentMethods.find(method => method.id === id);

    if (!paymentMethod) {
      dispatch(addMessage({
        type: 'error',
        text: 'Payment method not found'
      }));
      return;
    }

    // Don't allow deleting default payment method
    if (paymentMethod.isDefault) {
      dispatch(addMessage({
        type: 'error',
        text: 'Cannot delete default payment method'
      }));
      return;
    }

    confirmWithModal('deletePayment', paymentMethod);
  }, [paymentMethods, dispatch, confirmWithModal]);

  // Process payment method deletion
  const deletePaymentHandler = useCallback(async (paymentMethod) => {
    if (!paymentMethod) return;

    // Prevent duplicate operations
    if (operationInProgressRef.current) return;
    operationInProgressRef.current = true;

    // Update processing state
    setIsProcessing(true);

    try {
      // Call the deletePaymentMethod function which needs to be updated
      // to use the functions object properly
      const result = await deletePaymentMethod(
        paymentMethod.id,
        paymentMethod.stripePaymentMethodId,
        functions
      );

      if (result.ok) {
        // Update local state
        setPaymentMethods(prevMethods =>
          prevMethods.filter(method => method.id !== paymentMethod.id)
        );

        dispatch(addMessage({
          type: 'success',
          text: 'Payment method deleted successfully'
        }));

        // Close the modal
        setShowConfirmModal(false);
        setConfirmData(null);
        setConfirmAction(null);
      } else {
        throw new Error(result.error || 'Error deleting payment method');
      }
    } catch (err) {
      console.error('Error deleting payment method:', err);
      dispatch(addMessage({
        type: 'error',
        text: err.message || 'Error deleting payment method'
      }));

      // Reload to ensure data is synced
      refreshPaymentMethods();
    } finally {
      setIsProcessing(false);
      operationInProgressRef.current = false;
    }
  }, [dispatch, refreshPaymentMethods, functions]);

  // Handle confirmed action
  const handleConfirmedAction = useCallback(() => {
    if (!confirmAction || !confirmData) return;

    switch(confirmAction) {
      case 'deletePayment':
        deletePaymentHandler(confirmData);
        break;
      // Add more cases here for other actions
      default:
        console.warn(`Action not implemented: ${confirmAction}`);
        setShowConfirmModal(false);
    }
  }, [confirmAction, confirmData, deletePaymentHandler]);

  // Cancel confirmation
  const cancelConfirmation = useCallback(() => {
    setShowConfirmModal(false);
    setConfirmData(null);
    setConfirmAction(null);
  }, []);

  // Open form to add a new payment method
  const addPayment = useCallback(() => {
    setShowForm(true);
  }, []);

  // Close form safely
  const closeForm = useCallback(() => {
    if (!operationInProgressRef.current) {
      setShowForm(false);
    }
  }, []);

  // Handle success after adding a payment method
  const handlePaymentAdded = useCallback(() => {
    // Small delay to ensure Firestore has updated data
    setTimeout(() => {
      refreshPaymentMethods();
    }, 500);
  }, [refreshPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    showForm,
    showConfirmModal,
    confirmData,
    confirmAction,
    isProcessing,
    setDefaultPayment,
    confirmDeletePayment,
    handleConfirmedAction,
    cancelConfirmation,
    addPayment,
    closeForm,
    handlePaymentAdded,
    refreshPaymentMethods,
    loadPaymentMethods
  };
};