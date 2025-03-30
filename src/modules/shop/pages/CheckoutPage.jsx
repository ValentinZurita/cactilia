import React, { useCallback } from 'react';
import { Elements, useCheckout } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice.js';

// Componentes
import { CheckoutForm } from '../features/checkout/components/CheckoutForm';
import { CheckoutSummaryPanel } from '../features/checkout/components/CheckoutSummaryPanel';
import { ErrorAlert } from '../components/common/ErrorAlert';

// Hooks
import { useCart } from '../features/cart/hooks/useCart';

// Estilos
import '../features/checkout/styles/checkout.css';

// Configuración de Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const stripeOptions = {
  locale: 'es',
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#34C749',
    },
  },
};

/**
 * Página principal de checkout
 * @returns {JSX.Element}
 */
export const CheckoutPage = () => {
  const dispatch = useDispatch();

  // Verificar autenticación
  const { status } = useSelector(state => state.auth);
  if (status !== 'authenticated') {
    return <Navigate to="/auth/login?redirect=checkout" replace />;
  }

  // Obtener datos del carrito
  const {
    items: cartItems,
    subtotal: cartSubtotal,
    taxes: cartTaxes,
    shipping: cartShipping,
    finalTotal: cartTotal,
    isFreeShipping,
    hasStockIssues,
    validateCheckout
  } = useCart();

  // Verificar si el carrito está vacío
  if (!cartItems || cartItems.length === 0) {
    return <Navigate to="/shop" replace />;
  }

  // Obtener datos del checkout
  const checkout = useCheckout();

  // Verificar si el botón debe estar deshabilitado
  const isButtonDisabled = () => {
    // Si hay problemas de stock, deshabilitar
    if (hasStockIssues) return true;

    // Verificar dirección según el tipo
    const hasValidAddress = (
      (checkout.selectedAddressType === 'saved' && checkout.selectedAddressId) ||
      (checkout.selectedAddressType === 'new' &&
        checkout.newAddressData.street &&
        checkout.newAddressData.city &&
        checkout.newAddressData.state &&
        checkout.newAddressData.zip)
    );

    if (!hasValidAddress) return true;

    // Verificar según el tipo de pago
    switch (checkout.selectedPaymentType) {
      case 'card':
        return !checkout.selectedPaymentId;
      case 'new_card':
        return !checkout.newCardData.cardholderName || !checkout.newCardData.isComplete;
      case 'oxxo':
        return false; // Para OXXO no se necesita información adicional
      default:
        return true; // Si no hay tipo seleccionado, deshabilitar
    }
  };

  // Manejador de procesamiento de orden
  const processOrderWithChecks = useCallback(() => {
    const checkoutValidation = validateCheckout();

    if (!checkoutValidation.valid) {
      dispatch(addMessage({
        type: 'error',
        text: checkoutValidation.error,
        autoHide: true,
        duration: 5000
      }));
      return;
    }

    checkout.handleProcessOrder();
  }, [validateCheckout, checkout.handleProcessOrder, dispatch]);

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <div className="container checkout-page my-5">
        <h1 className="checkout-title mb-4">Finalizar Compra</h1>

        <ErrorAlert message={checkout.error} />

        <div className="row">
          {/* Formulario de checkout */}
          <CheckoutForm
            addresses={checkout.addresses}
            selectedAddressId={checkout.selectedAddressId}
            selectedAddressType={checkout.selectedAddressType}
            loadingAddresses={checkout.loadingAddresses}
            handleAddressChange={checkout.handleAddressChange}
            handleNewAddressSelect={checkout.handleNewAddressSelect}
            handleNewAddressDataChange={checkout.handleNewAddressDataChange}

            paymentMethods={checkout.paymentMethods}
            selectedPaymentId={checkout.selectedPaymentId}
            selectedPaymentType={checkout.selectedPaymentType}
            loadingPayments={checkout.loadingPayments}
            handlePaymentChange={checkout.handlePaymentChange}
            handleNewCardSelect={checkout.handleNewCardSelect}
            handleOxxoSelect={checkout.handleOxxoSelect}
            handleNewCardDataChange={checkout.handleNewCardDataChange}

            requiresInvoice={checkout.requiresInvoice}
            fiscalData={checkout.fiscalData}
            handleInvoiceChange={checkout.handleInvoiceChange}
            handleFiscalDataChange={checkout.handleFiscalDataChange}

            orderNotes={checkout.orderNotes}
            handleNotesChange={checkout.handleNotesChange}
          />

          {/* Resumen de checkout */}
          <CheckoutSummaryPanel
            cartItems={cartItems}
            cartSubtotal={cartSubtotal}
            cartTaxes={cartTaxes}
            cartShipping={cartShipping}
            cartTotal={cartTotal}
            isFreeShipping={isFreeShipping}

            isProcessing={checkout.isProcessing}
            isButtonDisabled={isButtonDisabled()}
            hasStockIssues={hasStockIssues}

            selectedPaymentType={checkout.selectedPaymentType}
            processOrderWithChecks={processOrderWithChecks}
            step={checkout.step}
          />
        </div>
      </div>
    </Elements>
  );
};