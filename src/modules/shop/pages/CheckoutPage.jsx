import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Componentes de checkout
import { CheckoutSummary } from '../components/checkout/CheckoutSummary';
import { AddressSelector } from '../components/checkout/AddressSelector';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { BillingInfoForm } from '../components/checkout/BillingInfoForm';
import { CheckoutButton } from '../components/checkout/CheckoutButton';
import { OrderConfirmation } from '../components/checkout/OrderConfirmation';
import '../styles/checkout.css';

// Hooks
import { useCheckout } from '../hooks/useCheckout';

// Cargar instancia de Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * CheckoutPage - Página principal para el proceso de pago
 * Integra selección de dirección, método de pago, y resumen del pedido
 */
export const CheckoutPage = () => {
  const {
    // Estados
    selectedAddressId,
    selectedPaymentId,
    requiresInvoice,
    fiscalData,
    orderNotes,
    step,
    error,
    orderId,
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

  // Opciones para Stripe Elements
  const stripeOptions = {
    locale: 'es',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#34C749',
      },
    },
  };

  // Si está en paso de confirmación, mostrar pantalla de confirmación
  if (step === 3) {
    return <OrderConfirmation orderId={orderId} />;
  }

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <div className="container checkout-page my-5">
        {/* Título */}
        <h1 className="checkout-title mb-4">Finalizar Compra</h1>

        {/* Mensajes de error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <div className="row">
          {/* Columna izquierda: Formulario de checkout */}
          <div className="col-lg-8">
            {/* Dirección de envío */}
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

            {/* Método de Pago */}
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

            {/* Información fiscal (opcional) */}
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

            {/* Notas adicionales */}
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
                  Por ejemplo: "Dejar con el portero" o "Llamar antes de entregar"
                </small>
              </div>
            </div>
          </div>

          {/* Columna derecha: Resumen del pedido y botón de pago */}
          <div className="col-lg-4">
            <div className="checkout-summary-container">
              {/* Componente de resumen del carrito */}
              <CheckoutSummary />

              <div className="mt-4 px-3">
                {/* Botón para procesar la compra */}
                <CheckoutButton
                  onCheckout={handleProcessOrder}
                  isProcessing={isProcessing}
                  disabled={!selectedAddressId || !selectedPaymentId}
                />

                <div className="checkout-terms mt-3">
                  <small className="text-muted">
                    Al completar tu compra, aceptas nuestros <a href="/terms" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y <a href="/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
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