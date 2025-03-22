/**
 * CheckoutPage.jsx
 *
 * Página principal para el proceso de pago (Checkout).
 * - Integra la selección de dirección, método de pago e información fiscal.
 * - Muestra un resumen de pedido y un botón para procesar la compra.
 * - Utiliza `useCheckout` para la lógica de obtención de direcciones, métodos de pago y manejo del pago.
 *
 * Al completar correctamente la compra, el usuario es redirigido a la ruta:
 *   "/order-success/:orderId"
 * donde se muestra la confirmación del pedido.
 */

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Importar componentes de checkout
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';
import { AddressSelector } from '../components/checkout/AddressSelector';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { BillingInfoForm } from '../components/checkout/BillingInfoForm';
import { CheckoutButton } from '../components/checkout/CheckoutButton';
// Eliminamos import de OrderConfirmation, ya que iremos a la ruta separada
// import { OrderConfirmation } from '../components/checkout/OrderConfirmation';

import '../styles/checkout.css';

// Importar nuestro custom hook
import { useCheckout } from '../hooks/useCheckout';

// Cargar instancia de Stripe con la key de entorno
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * @component
 * @returns {JSX.Element} Pantalla principal del Checkout.
 */
export const CheckoutPage = () => {
  // Obtenemos todo el estado y métodos necesarios del hook useCheckout
  const {
    // Estados
    selectedAddressId,
    selectedPaymentId,
    requiresInvoice,
    fiscalData,
    orderNotes,
    step,
    error,
    isProcessing,
    addresses,
    paymentMethods,
    loadingAddresses,
    loadingPayments,

    // Manejadores
    handleAddressChange,
    handlePaymentChange,
    handleInvoiceChange,
    handleFiscalDataChange,
    handleNotesChange,
    handleProcessOrder,
  } = useCheckout();

  // Opciones de configuración para Stripe Elements
  const stripeOptions = {
    locale: 'es',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#34C749',
      },
    },
  };

  // ------------------------------------------------------------------------
  // Renderizado principal
  // ------------------------------------------------------------------------
  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <div className="container checkout-page my-5">
        {/* Título de la página */}
        <h1 className="checkout-title mb-4">Finalizar Compra</h1>

        {/* Mensajes de error globales */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <div className="row">
          {/* Columna Izquierda: Formulario de checkout */}
          <div className="col-lg-8">
            {/* Sección: Dirección de Envío */}
            <div className="checkout-section">
              <h2 className="section-title">
                <span className="step-number">1</span>
                Dirección de Envío
              </h2>
              <AddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onAddressSelect={handleAddressChange}
                loading={loadingAddresses}
              />
            </div>

            {/* Sección: Método de Pago */}
            <div className="checkout-section">
              <h2 className="section-title">
                <span className="step-number">2</span>
                Método de Pago
              </h2>
              <PaymentMethodSelector
                paymentMethods={paymentMethods}
                selectedPaymentId={selectedPaymentId}
                onPaymentSelect={handlePaymentChange}
                loading={loadingPayments}
              />
            </div>

            {/* Sección: Información Fiscal (opcional) */}
            <div className="checkout-section">
              <h2 className="section-title">
                <span className="step-number">3</span>
                Información Fiscal
              </h2>
              <BillingInfoForm
                requiresInvoice={requiresInvoice}
                onRequiresInvoiceChange={handleInvoiceChange}
                fiscalData={fiscalData}
                onFiscalDataChange={handleFiscalDataChange}
              />
            </div>

            {/* Sección: Notas adicionales */}
            <div className="checkout-section">
              <h2 className="section-title">
                <span className="step-number">4</span>
                Notas Adicionales
              </h2>
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Instrucciones especiales para la entrega (opcional)"
                  value={orderNotes}
                  onChange={handleNotesChange}
                ></textarea>
                <small className="form-text text-muted">
                  Por ejemplo: "Dejar con el portero" o "Llamar antes de entregar".
                </small>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen del pedido y botón de pago */}
          <div className="col-lg-4">
            <div className="checkout-summary-container">
              {/* Resumen del carrito */}
              <CheckoutSummary />

              {/* Botón para procesar la compra */}
              <div className="mt-4 px-3">
                <CheckoutButton
                  onCheckout={handleProcessOrder}
                  isProcessing={isProcessing}
                  // Deshabilitar si no hay dirección o método de pago seleccionado
                  disabled={!selectedAddressId || !selectedPaymentId}
                />

                {/* Términos y condiciones */}
                <div className="checkout-terms mt-3">
                  <small className="text-muted">
                    Al completar tu compra, aceptas nuestros{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};
