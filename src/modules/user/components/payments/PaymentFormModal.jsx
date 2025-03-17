import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../../../../store/messages/messageSlice';
import '../../styles/paymentFormModal.css';

export const PaymentFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [cardHolder, setCardHolder] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const { uid } = useSelector(state => state.auth);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCardHolder('');
      setIsDefault(false);
      setError(null);
      setCardComplete(false);
    }
  }, [isOpen]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe is not yet initialized. Please wait a moment and try again.");
      return;
    }

    if (!cardComplete) {
      setError("Please complete your card details");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create a Setup Intent
      const functions = getFunctions();
      const createSetupIntent = httpsCallable(functions, 'createSetupIntent');
      const setupIntentResult = await createSetupIntent();

      const { clientSecret, setupIntentId } = setupIntentResult.data;

      // 2. Confirm card setup with CardElement
      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cardHolder,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!setupIntent) {
        throw new Error('Something went wrong with the payment setup');
      }

      // 3. Save the payment method to Firestore
      const savePaymentMethod = httpsCallable(functions, 'savePaymentMethod');
      await savePaymentMethod({
        setupIntentId,
        paymentMethodId: setupIntent.payment_method,
        isDefault
      });

      // 4. Clear the form and show success message
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.clear();
      }

      dispatch(addMessage({
        type: 'success',
        text: 'Payment method added successfully'
      }));

      // 5. Close the modal and notify parent component
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error adding payment method:', err);
      setError(err.message);

      dispatch(addMessage({
        type: 'error',
        text: 'There was a problem adding your payment method'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle card element change
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  // Prevent modal from closing when clicking inside
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  // Better card element styling to ensure it's visible and interactive
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
        padding: '15px'
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

  return (
    <div className="payment-modal-backdrop" onClick={onClose}>
      <div className="payment-modal-content" onClick={handleModalContentClick}>
        <div className="payment-modal-header">
          <h5 className="payment-modal-title">Add Payment Method</h5>
          <button type="button" className="payment-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="payment-modal-body">
          <form onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="payment-alert-error">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Card holder name */}
            <div className="payment-form-group">
              <label htmlFor="cardHolder">Card Holder Name</label>
              <input
                type="text"
                id="cardHolder"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Name on card"
                required
                className="payment-form-input"
              />
            </div>

            {/* Stripe Card Element with better visualization */}
            <div className="payment-form-group">
              <label>Card Details</label>
              <div className="payment-card-element">
                <CardElement options={cardElementOptions} onChange={handleCardChange} />
              </div>
              <small className="payment-text-muted">
                Enter card number, expiration date and CVC code.
              </small>
              {cardComplete && (
                <div className="payment-card-complete">
                  <i className="bi bi-check-circle-fill"></i> Card information complete
                </div>
              )}
            </div>

            {/* Default payment method checkbox */}
            <div className="payment-form-check">
              <input
                type="checkbox"
                id="defaultPayment"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="payment-form-checkbox"
              />
              <label htmlFor="defaultPayment">
                Set as default payment method
              </label>
            </div>

            {/* Test card info for development */}
            <div className="payment-test-cards">
              <p className="payment-text-muted">
                <strong>Test Card:</strong> Use 4242 4242 4242 4242, any future date and any 3 digits for CVC
              </p>
            </div>

            {/* Form actions */}
            <div className="payment-form-actions">
              <button
                type="button"
                className="payment-btn-cancel"
                onClick={onClose}
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
    </div>
  );
};