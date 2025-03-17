import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../../../../store/messages/messageSlice';
import { Modal } from '../shared/Modal';

/**
 * Custom card form that uses Stripe Elements for secure card collection
 */
export const CardForm = ({
                           isOpen,
                           onClose,
                           onSuccess,
                           loading: externalLoading = false
                         }) => {
  const [cardHolder, setCardHolder] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
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
      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: cardHolder,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
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
      elements.getElement(CardElement).clear();

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

  // Custom styles for the Stripe CardElement
  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        },
        padding: '10px 12px',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    },
    hidePostalCode: true
  };

  // Render form
  // Prevent modal from auto-closing when clicking inside form
  const handleFormClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Payment Method"
      showFooter={false}
    >
      <form onSubmit={handleSubmit} onClick={handleFormClick}>
        {/* Error message */}
        {error && (
          <div className="alert alert-danger py-2 mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Card holder name */}
        <div className="mb-3">
          <label htmlFor="cardHolder" className="form-label">Card Holder Name</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-person"></i>
            </span>
            <input
              type="text"
              className="form-control"
              id="cardHolder"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Name on card"
              required
            />
          </div>
        </div>

        {/* Stripe Card Element */}
        <div className="mb-3">
          <label className="form-label">Card Details</label>
          <div className="card-element-container p-3 border rounded">
            <CardElement options={cardElementOptions} />
          </div>
          <small className="text-muted mt-1 d-block">
            Your card information is secured by Stripe
          </small>
        </div>

        {/* Default payment method checkbox */}
        <div className="mb-4">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="defaultPayment"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="defaultPayment">
              Set as default payment method
            </label>
          </div>
        </div>

        {/* Submit button */}
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={loading || externalLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-green-3 text-white"
            disabled={!stripe || loading || externalLoading}
          >
            {loading || externalLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              'Add Payment Method'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};