// src/modules/shop/pages/CheckoutPage.jsx
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Componentes
import { CheckoutForm } from '../features/checkout/components/CheckoutForm';
import { CheckoutSummaryPanel } from '../features/checkout/components/CheckoutSummaryPanel';
import { ErrorAlert } from '../components/common/ErrorAlert';

// Hooks
import { useCart } from '../features/cart/hooks/useCart';
import { CheckoutProvider } from '../context/CheckoutContext';
import { useCheckout } from '../features/checkout/hooks/useCheckout';

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
 * Contenido interno de la página de checkout
 */
const CheckoutPageContent = () => {
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

  return (
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
          processOrderWithChecks={checkout.handleProcessOrder}
          step={checkout.step}
        />
      </div>
    </div>
  );
};

/**
 * Página principal de checkout
 */
export const CheckoutPage = () => {
  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <CheckoutProvider>
        <CheckoutPageContent />
      </CheckoutProvider>
    </Elements>
  );
};