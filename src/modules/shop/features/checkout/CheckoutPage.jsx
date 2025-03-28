import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Importar componentes de checkout
import { CheckoutSummary } from './components/CheckoutSummary.jsx';
import { AddressSelector } from './components/AddressSelector.jsx';
import { PaymentMethodSelector } from './components/PaymentMethodSelector.jsx';
import { BillingInfoForm } from './components/BillingInfoForm.jsx';
import { CheckoutButton } from './components/CheckoutButton.jsx';

// Importar estilos
import './styles/checkout.css';
import './styles/processingIndicator.css';

// Importar nuestro custom hook
import { useCheckout } from './hooks/useCheckout.js';

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
    selectedPaymentType,
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
    // Estado para tarjeta nueva
    useNewCard,
    newCardData,

    // Manejadores
    handleAddressChange,
    handlePaymentChange,
    handleInvoiceChange,
    handleFiscalDataChange,
    handleNotesChange,
    handleProcessOrder,
    // Manejadores para tarjeta nueva y OXXO
    handleNewCardSelect,
    handleOxxoSelect,
    handleNewCardDataChange,
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

  // Verificar si el botón debe estar deshabilitado
  const isButtonDisabled = () => {
    // Siempre necesitamos una dirección
    if (!selectedAddressId) return true;

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

  // Obtener texto del botón según el método de pago
  const getButtonText = () => {
    if (isProcessing) return "Procesando...";

    if (selectedPaymentType === 'oxxo') {
      return "Generar voucher OXXO";
    }

    return "Completar Compra";
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
                selectedPaymentType={selectedPaymentType}
                onPaymentSelect={handlePaymentChange}
                onNewCardSelect={handleNewCardSelect}
                onOxxoSelect={handleOxxoSelect}
                onNewCardDataChange={handleNewCardDataChange}
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
                  disabled={isButtonDisabled()}
                  buttonText={getButtonText()}
                />

                {/* Términos y condiciones */}
                <div className="checkout-terms mt-3">
                  <small className="text-muted">
                    Al completar tu compra, aceptas nuestros{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
                  </small>
                </div>

                {/* Detalles según el método de pago seleccionado */}
                {selectedPaymentType === 'oxxo' && !isProcessing && (
                  <div className="payment-info-box mt-3 p-3 bg-light border rounded">
                    <p className="small mb-2">
                      <i className="bi bi-info-circle-fill me-2 text-primary"></i>
                      Al hacer clic en "Generar voucher OXXO", crearemos un voucher de pago que podrás presentar en cualquier tienda OXXO en México.
                    </p>
                    <p className="small mb-0">
                      El voucher tiene validez de 24 horas y tu pedido será procesado una vez que realices el pago.
                    </p>
                  </div>
                )}

                {/* Indicadores de procesamiento - Mostrar durante el paso 2 */}
                {step === 2 && (
                  <div className="processing-indicators mt-4 p-3 border rounded">
                    <div className="processing-step mb-2">
                      <i className="bi bi-arrow-repeat spin me-2"></i>
                      <span>
                        {selectedPaymentType === 'oxxo' ?
                          'Generando voucher de pago...' :
                          'Procesando tu pago...'}
                      </span>
                    </div>
                    <small className="text-muted d-block">
                      Espera un momento mientras procesamos tu solicitud. No cierres esta ventana.
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};