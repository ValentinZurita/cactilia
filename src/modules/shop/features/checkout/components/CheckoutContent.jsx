// src/modules/shop/features/checkout/components/CheckoutContent.jsx
import React, { useCallback } from 'react';
import { useCart } from '../../cart/hooks/useCart';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutSummaryPanel } from './CheckoutSummaryPanel';
import { ErrorAlert } from '../../../components/common/ErrorAlert';
import { useCheckout } from '../hooks/index.js'

/**
 * Componente principal del contenido de checkout
 * Conecta con el contexto de checkout y muestra el formulario y resumen
 *
 * @returns {JSX.Element} Contenido completo del proceso de checkout
 */
export const CheckoutContent = () => {
  // Obtener datos del contexto de checkout
  const checkout = useCheckout();

  // Obtener datos del carrito
  const {
    items: cartItems,
    subtotal: cartSubtotal,
    taxes: cartTaxes,
    shipping: cartShipping,
    finalTotal: cartTotal,
    isFreeShipping,
    hasStockIssues,
  } = useCart();

  /**
   * Determina si el botón de procesamiento debe estar deshabilitado
   * basado en el estado actual del checkout
   */
  const isButtonDisabled = useCallback(() => {
    // Si hay problemas de stock, deshabilitar
    if (hasStockIssues) return true;

    // Si está procesando, deshabilitar
    if (checkout.isProcessing) return true;

    // Verificar dirección según el tipo
    const hasValidAddress = (
      (checkout.selectedAddressType === 'saved' && checkout.selectedAddressId) ||
      (checkout.selectedAddressType === 'new' &&
        checkout.newAddressData?.street &&
        checkout.newAddressData?.city &&
        checkout.newAddressData?.state &&
        checkout.newAddressData?.zip)
    );

    if (!hasValidAddress) return true;

    // Verificar según el tipo de pago
    switch (checkout.selectedPaymentType) {
      case 'card':
        return !checkout.selectedPaymentId;
      case 'new_card':
        return !checkout.newCardData?.cardholderName ||
          !checkout.newCardData?.isComplete;
      case 'oxxo':
        return false; // Para OXXO no se necesita información adicional
      default:
        return true; // Si no hay tipo seleccionado, deshabilitar
    }
  }, [
    hasStockIssues,
    checkout.isProcessing,
    checkout.selectedAddressType,
    checkout.selectedAddressId,
    checkout.newAddressData,
    checkout.selectedPaymentType,
    checkout.selectedPaymentId,
    checkout.newCardData
  ]);

  return (
    <div className="container checkout-page my-5">
      <h1 className="checkout-title mb-4">Finalizar Compra</h1>

      {/* Mostrar errores si existen */}
      {checkout.error && <ErrorAlert message={checkout.error} />}

      <div className="row">
        {/* Formulario de checkout */}
        <CheckoutForm
          // Pasar solo las props necesarias
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

          error={checkout.error}
          setError={checkout.setError}
          cartItems={cartItems}
        />

        {/* Resumen del pedido y botón de procesamiento */}
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