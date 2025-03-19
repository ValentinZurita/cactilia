// src/modules/user/pages/PaymentsPage.jsx
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { SectionTitle, AddItemButton } from '../components/shared/index.js';
import { usePayments } from '../hooks/usePayments.js';
import '../styles/profilePayments.css';
import '../styles/sharedComponents.css';
import { PaymentsList, SecurityNote } from '../components/payments/index.js';
import { PaymentFormModal } from '../components/payments/PaymentFormModal.jsx';
import { ConfirmationModal } from '../components/shared/ConfirmationModal.jsx';
import { getFirebaseFunctions } from '../../../utils/firebaseFunctions';

// Load Stripe once (outside component to avoid reinitialization)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

/**
 * Enhanced page for managing payment methods with Stripe
 */
export const PaymentsPage = () => {
  // Initialize Firebase Functions once at component mount
  useEffect(() => {
    getFirebaseFunctions();
  }, []);

  // Get methods and state from custom hook
  const {
    paymentMethods,
    loading,
    error,
    showForm,
    showConfirmModal,
    confirmData,
    isProcessing,
    setDefaultPayment,
    confirmDeletePayment,
    handleConfirmedAction,
    cancelConfirmation,
    addPayment,
    closeForm,
    handlePaymentAdded
  } = usePayments();

  // Local state for Stripe readiness
  const [stripeReady, setStripeReady] = useState(false);

  // State to control if Elements is visible
  const [elementsVisible, setElementsVisible] = useState(false);

  // Check when Stripe is ready
  useEffect(() => {
    if (stripePromise) {
      stripePromise.then(() => {
        setStripeReady(true);
      }).catch(err => {
        console.error("Error initializing Stripe:", err);
        setStripeReady(false);
      });
    }
  }, []);

  // Effects to handle Elements visibility
  useEffect(() => {
    if (showForm) {
      setElementsVisible(true);
    }
  }, [showForm]);

  // Handle form closure
  const handleSafeClose = () => {
    closeForm();
    // Don't hide Elements immediately to allow pending operations to complete
    setTimeout(() => {
      setElementsVisible(false);
    }, 500);
  };

  // Handle successful payment method addition
  const handleSuccess = () => {
    handlePaymentAdded();
    // Allow time for Stripe to finish any pending operations
    setTimeout(() => {
      setElementsVisible(false);
    }, 1000);
  };

  // Enhanced options for Stripe Elements
  const stripeElementsOptions = {
    locale: 'es',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#34C749',
        fontFamily: 'Arial, sans-serif',
      },
    },
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700',
      },
    ],
  };

  // Get formatted payment method details for the modal
  const getPaymentDetails = () => {
    if (!confirmData) return null;

    // Format the last 4 digits
    const cardNumber = confirmData.cardNumber || '';
    const lastFourDigits = cardNumber.trim().split(' ').pop() || 'xxxx';

    // Format card type
    const cardType = confirmData.type ? confirmData.type.charAt(0).toUpperCase() + confirmData.type.slice(1) : 'card';

    return `${cardType} ending in ${lastFourDigits}`;
  };

  return (
    <div className="payments-container">
      {/* Section title */}
      <SectionTitle title="Payment Methods" />

      {/* Description about payment methods */}
      <p className="text-muted mb-4">
        Manage your payment methods to make purchases securely and quickly.
      </p>

      {/* General error message */}
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Payment methods list */}
      <PaymentsList
        payments={paymentMethods}
        onSetDefault={setDefaultPayment}
        onDelete={confirmDeletePayment}
        loading={loading}
      />

      {/* Button to add payment method */}
      <AddItemButton
        onClick={addPayment}
        label="Add payment method"
        icon="plus"
      />

      {/* Security note */}
      <SecurityNote />

      {/* Confirmation modal for deleting payment method */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={cancelConfirmation}
        onConfirm={handleConfirmedAction}
        title="Delete payment method"
        message={getPaymentDetails()}
        detail={
          <p>
            If you don't want this payment method to appear in your list of payment options,
            click "Confirm delete". <br/><br/>
            <span className="text-muted small">
              Disabling this payment method won't cancel any of your open orders
              or fail any automatic payment settings using this method.
            </span>
          </p>
        }
        confirmText="Confirm delete"
        cancelText="Cancel"
        icon="bi-credit-card-2-front"
        iconColor="danger"
        confirmColor="danger"
        loading={isProcessing}
      />

      {/* Render Elements when needed */}
      {elementsVisible && stripeReady && (
        <Elements stripe={stripePromise} options={stripeElementsOptions}>
          <PaymentFormModal
            isOpen={showForm}
            onClose={handleSafeClose}
            onSuccess={handleSuccess}
          />
        </Elements>
      )}

      {/* Loading message if Stripe isn't ready */}
      {showForm && !stripeReady && (
        <div className="payment-loading-overlay">
          <div className="payment-loading-content">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Initializing payment gateway...</p>
          </div>
        </div>
      )}
    </div>
  );
};