// src/modules/user/components/payments/PaymentFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../../../../store/messages/messageSlice';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import '../../styles/paymentFormModal.css';

/**
 * Simplified modal form for adding payment methods with Stripe
 */
export const PaymentFormModal = ({ isOpen, onClose, onSuccess }) => {
  // Local states
  const [cardHolder, setCardHolder] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  // References for safe cleanup
  const isSubmittingRef = useRef(false);
  const formRef = useRef(null);
  const { uid } = useSelector(state => state.auth);

  // Get Firebase Functions instance
  const functionsRef = useRef(getFunctions());
  const hasConnectedRef = useRef(false);

  // Connect to emulator in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !hasConnectedRef.current) {
      try {
        connectFunctionsEmulator(functionsRef.current, "localhost", 5001);
        console.log("Connected to Firebase Functions emulator in PaymentFormModal");
        hasConnectedRef.current = true;
      } catch (e) {
        console.log("Emulator connection error (can be ignored if already connected):", e);
      }
    }
  }, []);

  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  // Clean form when opened
  useEffect(() => {
    if (isOpen) {
      setCardHolder('');
      setIsDefault(false);
      setError(null);
      setCardComplete(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loading, onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // If modal is not open, render nothing
  if (!isOpen) return null;

  // Handle card element changes
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setError(event.error ? event.error.message : null);
  };

  // Handle form submission safely
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Avoid duplicate submissions
    if (isSubmittingRef.current || loading) {
      return;
    }

    // Initial validations
    if (!stripe || !elements) {
      setError("Stripe is not initialized. Please wait a moment and try again.");
      return;
    }

    if (!cardComplete) {
      setError("Please complete your card details");
      return;
    }

    if (!cardHolder.trim()) {
      setError("Please enter the cardholder's name");
      return;
    }

    // Get the CardElement - must be done BEFORE changing state
    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Could not access card form. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);
    isSubmittingRef.current = true;

    try {
      // Create SetupIntent via Cloud Function
      const createSetupIntent = httpsCallable(functionsRef.current, 'createSetupIntent');
      const setupResponse = await createSetupIntent({});

      if (!setupResponse.data?.clientSecret) {
        throw new Error("Failed to create setup intent");
      }

      // Confirm the setup with Stripe
      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(
        setupResponse.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardHolder
            }
          }
        }
      );

      if (setupError) {
        throw new Error(setupError.message);
      }

      if (!setupIntent || !setupIntent.payment_method) {
        throw new Error("Setup failed. Please try again.");
      }

      // Save the payment method via Cloud Function
      const savePaymentMethod = httpsCallable(functionsRef.current, 'savePaymentMethod');
      await savePaymentMethod({
        setupIntentId: setupIntent.id,
        paymentMethodId: setupIntent.payment_method,
        isDefault: isDefault,
        cardHolder: cardHolder
      });

      // Show success message
      dispatch(addMessage({
        type: 'success',
        text: 'Payment method added successfully'
      }));

      // Clear the form
      setCardHolder('');
      setIsDefault(false);

      // Call onSuccess and close modal
      if (onSuccess) {
        onSuccess();
      }

      // Safe to close now
      onClose();
    } catch (err) {
      console.error('Error adding payment method:', err);
      setError(err.message || "An error occurred while processing the card");

      dispatch(addMessage({
        type: 'error',
        text: 'There was a problem adding your payment method'
      }));

      // Allow a new attempt
      isSubmittingRef.current = false;
    } finally {
      // Reset these states even if there's an error
      setLoading(false);
    }
  };

  // Prevent modal from closing when clicking inside
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  // Only close if not in submission process
  const handleSafeClose = () => {
    if (!loading && !isSubmittingRef.current) {
      onClose();
    }
  };

  // Enhanced options for card element
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666EE8',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
      complete: {
        iconColor: '#66bb6a'
      }
    },
    hidePostalCode: true
  };

  return ReactDOM.createPortal(
    <div
      className="payment-modal-backdrop"
      onClick={handleSafeClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        className="payment-modal-content"
        onClick={handleModalContentClick}
        role="document"
      >
        <div className="payment-modal-header">
          <h5 className="payment-modal-title" id="payment-modal-title">Add Payment Method</h5>
          <button
            type="button"
            className="payment-modal-close"
            onClick={handleSafeClose}
            aria-label="Close"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="payment-modal-body">
          <form onSubmit={handleSubmit} ref={formRef}>
            {/* Error message */}
            {error && (
              <div className="payment-alert-error" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Cardholder name */}
            <div className="payment-form-group">
              <label htmlFor="cardHolder">Cardholder name</label>
              <input
                type="text"
                id="cardHolder"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Full name as it appears on card"
                required
                className="payment-form-input"
                disabled={loading}
                autoComplete="cc-name"
              />
            </div>

            {/* Stripe card element */}
            <div className="payment-form-group">
              <label>Card details</label>
              <div className="payment-card-element">
                <CardElement
                  options={cardElementOptions}
                  onChange={handleCardChange}
                  disabled={loading}
                />
              </div>
              <small className="payment-text-muted">
                Enter card number, expiration date, and CVC.
              </small>
              {cardComplete && (
                <div className="payment-card-complete">
                  <i className="bi bi-check-circle-fill"></i> Card information complete
                </div>
              )}
            </div>

            {/* Default payment checkbox */}
            <div className="payment-form-check">
              <input
                type="checkbox"
                id="defaultPayment"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="payment-form-checkbox"
                disabled={loading}
              />
              <label htmlFor="defaultPayment">
                Set as default payment method
              </label>
            </div>

            {/* Test card info for development */}
            <div className="payment-test-cards">
              <p className="payment-text-muted">
                <strong>Test card:</strong> Use 4242 4242 4242 4242, any future date, and 3 digits for CVC
              </p>
            </div>

            {/* Form actions */}
            <div className="payment-form-actions">
              <button
                type="button"
                className="payment-btn-cancel"
                onClick={handleSafeClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="payment-btn-save"
                disabled={!stripe || loading || !cardComplete}
              >
                {loading ? (
                  <>
                    <span className="payment-spinner"></span>
                    Processing...
                  </>
                ) : (
                  'Add Payment Method'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};