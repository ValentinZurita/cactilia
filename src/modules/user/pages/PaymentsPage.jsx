import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { SectionTitle, AddItemButton } from '../components/shared/index.js';
import { usePayments } from '../hooks/usePayments.js';
import '../styles/profilePayments.css';
import '../styles/sharedComponents.css';
import { PaymentsList, SecurityNote } from '../components/payments/index.js';
import { PaymentFormModal } from '../components/payments/PaymentFormModal';

// Replace this with your actual publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Better configuration for Stripe Elements
const stripeElementsOptions = {
  locale: 'en',
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

/**
 * PaymentsPage - Page for managing payment methods
 * Uses Stripe Elements for secure card collection
 */
export const PaymentsPage = () => {
  // Get methods and state from the custom hook
  const {
    paymentMethods,
    loading,
    error,
    showForm,
    setDefaultPayment,
    deletePayment,
    addPayment,
    closeForm,
    handlePaymentAdded
  } = usePayments();

  return (
    <div>
      {/* Section title */}
      <SectionTitle title="Payment Methods" />

      {/* Error message */}
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
        onDelete={deletePayment}
        loading={loading}
      />

      {/* Add payment method button */}
      <AddItemButton
        onClick={addPayment}
        label="Add payment method"
        icon="plus"
      />

      {/* Security note */}
      <SecurityNote />

      {/* Only render Stripe Elements when the form is open */}
      {showForm && (
        <Elements stripe={stripePromise} options={stripeElementsOptions}>
          <PaymentFormModal
            isOpen={showForm}
            onClose={closeForm}
            onSuccess={handlePaymentAdded}
          />
        </Elements>
      )}
    </div>
  );
};