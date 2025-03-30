import React, { useCallback } from 'react';
import { Elements, useCheckout } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

// Componentes
import { ErrorAlert } from '../components/common/ErrorAlert';
import { CheckoutForm } from '../features/checkout/components/CheckoutForm';
import { CheckoutSummaryPanel } from '../features/checkout/components/CheckoutSummaryPanel';

// Hooks y utilidades
import { useCart } from '../features/cart/hooks/useCart';

// Estilos
import '../features/checkout/styles/checkout.css';

// Stripe config
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

  // Obtener estado y métodos del checkout
  const {
    // Estados generales
    step,
    error,
    isProcessing,

    // Datos de dirección
    selectedAddressId,
    selectedAddressType,
    addresses,
    loadingAddresses,
    newAddressData,

    // Datos de pago
    selectedPaymentId,
    selectedPaymentType,
    paymentMethods,
    loadingPayments,
    newCardData,

    // Datos de facturación
    requiresInvoice,
    fiscalData,
    orderNotes,

    // Manejadores
    handleAddressChange,
    handleNewAddressSelect,
    handleNewAddressDataChange,
    handlePaymentChange,
    handleNewCardSelect,
    handleOxxoSelect,
    handleNewCardDataChange,
    handleInvoiceChange,
    handleFiscalDataChange,
    handleNotesChange,
    handleProcessOrder
  } = useCheckout();

  // Verificar si el botón debe estar deshabilitado
  const isButtonDisabled = () => {
    // Si hay problemas de stock, deshabilitar el botón
    if (hasStockIssues) return true;

    // Verificar dirección según el tipo
    const hasValidAddress = (
      (selectedAddressType === 'saved' && selectedAddressId) ||
      (selectedAddressType === 'new' && newAddressData.street && newAddressData.city && newAddressData.state && newAddressData.zip)
    );

    if (!hasValidAddress) return true;

    // Verificar según el tipo de pago
    switch (selectedPaymentType) {
      case 'card':
        return !selectedPaymentId;
      case 'new_card':
        return !newCardData.cardholderName || !newCardData.isComplete;
      case 'oxxo':
        return false; // Para OXXO no se necesita información adicional
      default:
        return true; // Si no hay tipo seleccionado, deshabilitar
    }
  };

  // Manejador para procesar orden con verificación de stock
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

    handleProcessOrder();
  }, [validateCheckout, handleProcessOrder, dispatch]);

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <div className="container checkout-page my-5">
        {/* Título de la página */}
        <h1 className="checkout-title mb-4">Finalizar Compra</h1>

        {/* Mensajes de error globales */}
        <ErrorAlert message={error} />

        <div className="row">
          {/* Columna izquierda: Formulario */}
          <CheckoutForm
            // Datos de dirección
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            selectedAddressType={selectedAddressType}
            loadingAddresses={loadingAddresses}
            handleAddressChange={handleAddressChange}
            handleNewAddressSelect={handleNewAddressSelect}
            handleNewAddressDataChange={handleNewAddressDataChange}

            // Datos de pago
            paymentMethods={paymentMethods}
            selectedPaymentId={selectedPaymentId}
            selectedPaymentType={selectedPaymentType}
            loadingPayments={loadingPayments}
            handlePaymentChange={handlePaymentChange}
            handleNewCardSelect={handleNewCardSelect}
            handleOxxoSelect={handleOxxoSelect}
            handleNewCardDataChange={handleNewCardDataChange}

            // Datos de facturación
            requiresInvoice={requiresInvoice}
            fiscalData={fiscalData}
            handleInvoiceChange={handleInvoiceChange}
            handleFiscalDataChange={handleFiscalDataChange}

            // Notas
            orderNotes={orderNotes}
            handleNotesChange={handleNotesChange}
          />

          {/* Columna derecha: Resumen y pago */}
          <CheckoutSummaryPanel
            // Datos del carrito
            cartItems={cartItems}
            cartSubtotal={cartSubtotal}
            cartTaxes={cartTaxes}
            cartShipping={cartShipping}
            cartTotal={cartTotal}
            isFreeShipping={isFreeShipping}

            // Estado del proceso
            isProcessing={isProcessing}
            isButtonDisabled={isButtonDisabled()}
            hasStockIssues={hasStockIssues}

            // Tipo de pago
            selectedPaymentType={selectedPaymentType}

            // Manejadores
            processOrderWithChecks={processOrderWithChecks}

            // Paso actual
            step={step}
          />
        </div>
      </div>
    </Elements>
  );
};