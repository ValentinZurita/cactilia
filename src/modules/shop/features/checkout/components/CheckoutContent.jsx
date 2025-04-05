import React, { useCallback, useEffect } from 'react';
import { useCart } from '../../cart/hooks/useCart';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutSummaryPanel } from './CheckoutSummaryPanel';
import { useCheckout } from '../hooks/index.js'
import { CheckoutDebugInfo } from './CheckoutDebugInfo';

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
    shippingDetails,
    shippingGroups,
    shippingRules,
    isLoadingShipping
  } = useCart();

  // Agregar Log de diagnóstico al cargar la vista
  useEffect(() => {
    console.warn('🚨 CHECKOUT CONTENT LOADED 🚨');
    console.warn('🛒 CART ITEMS:', cartItems);
    console.warn('💲 CART TOTAL:', cartTotal);
    console.warn('📍 ADDRESSES:', checkout.addresses);
    console.warn('💳 PAYMENT METHODS:', checkout.paymentMethods);
    console.warn('🚚 SHIPPING GROUPS:', shippingGroups);
    console.warn('📏 SHIPPING RULES:', shippingRules);
  }, [cartItems, cartTotal, checkout.addresses, checkout.paymentMethods, shippingGroups, shippingRules]);

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
      {/* Alerta de Diagnóstico */}
      <div className="alert alert-danger mb-4 p-4 text-center">
        <h3 className="mb-3">PANEL DE DIAGNÓSTICO</h3>
        <p>Este panel aparece para diagnosticar problemas con el checkout</p>
        <hr/>
        <div className="row">
          <div className="col-md-6 text-start">
            <h5 className="mb-2">Información de envío:</h5>
            <ul className="list-unstyled">
              <li><strong>Direcciones disponibles:</strong> {checkout.addresses ? checkout.addresses.length : 0}</li>
              <li><strong>Dirección seleccionada:</strong> {checkout.selectedAddressId || 'Ninguna'}</li>
              <li><strong>Métodos de pago:</strong> {checkout.paymentMethods ? checkout.paymentMethods.length : 0}</li>
            </ul>
          </div>
          <div className="col-md-6 text-start">
            <h5 className="mb-2">Información del carrito:</h5>
            <ul className="list-unstyled">
              <li><strong>Productos en carrito:</strong> {cartItems ? cartItems.length : 0}</li>
              <li><strong>Subtotal:</strong> ${cartSubtotal?.toFixed(2) || '0.00'}</li>
              <li><strong>Envío:</strong> ${cartShipping?.toFixed(2) || '0.00'}</li>
              <li><strong>Total:</strong> ${cartTotal?.toFixed(2) || '0.00'}</li>
            </ul>
          </div>
        </div>
        <div className="mt-3">
          <button 
            className="btn btn-warning"
            onClick={() => {
              console.warn('DATOS COMPLETOS PARA DEBUGGING:', {
                cart: {
                  items: cartItems,
                  subtotal: cartSubtotal,
                  taxes: cartTaxes,
                  shipping: cartShipping,
                  total: cartTotal,
                  shippingGroups,
                  shippingRules
                },
                checkout: {
                  addresses: checkout.addresses,
                  selectedAddressId: checkout.selectedAddressId,
                  paymentMethods: checkout.paymentMethods,
                  selectedPaymentId: checkout.selectedPaymentId
                }
              });
              alert('Datos de diagnóstico enviados a la consola');
            }}
          >
            Mostrar Datos en Consola
          </button>
        </div>
      </div>

      {/* Añadir componente de debug bajo el panel de alerta */}
      <CheckoutDebugInfo 
        cartInfo={{
          items: cartItems,
          itemsCount: cartItems?.reduce((total, item) => total + item.quantity, 0) || 0,
          subtotal: cartSubtotal,
          taxes: cartTaxes,
          shipping: cartShipping,
          finalTotal: cartTotal,
          isFreeShipping,
          hasStockIssues,
          shippingDetails: shippingDetails || {},
          shippingGroups: shippingGroups || [],
          shippingRules: shippingRules || [],
          isLoadingShipping
        }}
        checkoutInfo={{
          addresses: checkout.addresses,
          selectedAddressId: checkout.selectedAddressId,
          selectedAddressType: checkout.selectedAddressType,
          paymentMethods: checkout.paymentMethods,
          selectedPaymentId: checkout.selectedPaymentId,
          selectedPaymentType: checkout.selectedPaymentType,
          step: checkout.step,
          error: checkout.error
        }}
      />

      <h1 className="checkout-title mb-4">Finalizar Compra</h1>

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