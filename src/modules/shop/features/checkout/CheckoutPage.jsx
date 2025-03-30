
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Componentes del checkout
import { CheckoutSummary } from './components/CheckoutSummary';


// Estilos
import './styles/checkout.css';

// Hook personalizado
import { useCheckout } from './hooks/useCheckout';
import { CheckoutSection } from './components/CheckoutSection.jsx'
import { LoadingSpinner } from '../../shared/components/LoadingSpinner.jsx'
import { AddressSelector } from './components/AddressSelector.jsx'
import { PaymentMethodSelector } from './components/PaymentMethodSelector.jsx'
import { BillingInfoForm } from './components/BillingInfoForm.jsx'
import { CheckoutButton } from './components/CheckoutButton.jsx'

// Cargar instancia de Stripe con la key de entorno
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
 * Componente principal de la página de Checkout
 * Gestiona el proceso completo de finalización de compra
 *
 * @returns {JSX.Element} Pantalla principal del Checkout
 */
export const CheckoutPage = () => {
  // Obtener autenticación
  const { status } = useSelector(state => state.auth);

  // Verificar si el usuario está autenticado
  if (status !== 'authenticated') {
    return <Navigate to="/auth/login?redirect=checkout" replace />;
  }

  // Obtener todo el estado y métodos necesarios del hook useCheckout
  const {
    // Estados generales
    step,
    error,
    isProcessing,

    // Estados del carrito
    cartItems,
    cartSubtotal,
    cartTaxes,
    cartShipping,
    cartTotal,
    isFreeShipping,
    hasOutOfStockItems,

    // Estados de dirección
    selectedAddressId,
    selectedAddressType,
    addresses,
    loadingAddresses,
    newAddressData,

    // Estados de pago
    selectedPaymentId,
    selectedPaymentType,
    paymentMethods,
    loadingPayments,
    newCardData,

    // Estados para facturación
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

  // Verificar si el carrito está vacío
  if (!cartItems || cartItems.length === 0) {
    return <Navigate to="/shop" replace />;
  }

  // Verificar si el botón debe estar deshabilitado
  const isButtonDisabled = () => {
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

  // Obtener texto del botón según el método de pago
  const getButtonText = () => {
    if (isProcessing) return "Procesando...";

    if (selectedPaymentType === 'oxxo') {
      return "Generar voucher OXXO";
    }

    return "Completar Compra";
  };

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
            <CheckoutSection
              title="Dirección de Envío"
              stepNumber={1}
            >
              {loadingAddresses ? (
                <LoadingSpinner size="sm" text="Cargando direcciones..." />
              ) : (
                <AddressSelector
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  selectedAddressType={selectedAddressType}
                  onAddressSelect={handleAddressChange}
                  onNewAddressSelect={handleNewAddressSelect}
                  onNewAddressDataChange={handleNewAddressDataChange}
                />
              )}
            </CheckoutSection>

            {/* Sección: Método de Pago */}
            <CheckoutSection
              title="Método de Pago"
              stepNumber={2}
            >
              {loadingPayments ? (
                <LoadingSpinner size="sm" text="Cargando métodos de pago..." />
              ) : (
                <PaymentMethodSelector
                  paymentMethods={paymentMethods}
                  selectedPaymentId={selectedPaymentId}
                  selectedPaymentType={selectedPaymentType}
                  onPaymentSelect={handlePaymentChange}
                  onNewCardSelect={handleNewCardSelect}
                  onOxxoSelect={handleOxxoSelect}
                  onNewCardDataChange={handleNewCardDataChange}
                />
              )}
            </CheckoutSection>

            {/* Sección: Información Fiscal (opcional) */}
            <CheckoutSection
              title="Información Fiscal"
              stepNumber={3}
            >
              <BillingInfoForm
                requiresInvoice={requiresInvoice}
                onRequiresInvoiceChange={handleInvoiceChange}
                fiscalData={fiscalData}
                onFiscalDataChange={handleFiscalDataChange}
              />
            </CheckoutSection>

            {/* Sección: Notas adicionales */}
            <CheckoutSection
              title="Notas Adicionales"
              stepNumber={4}
            >
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
            </CheckoutSection>
          </div>

          {/* Columna Derecha: Resumen del pedido y botón de pago */}
          <div className="col-lg-4">
            <div className="checkout-summary-container">
              {/* Resumen del carrito */}
              <CheckoutSummary
                items={cartItems}
                subtotal={cartSubtotal}
                taxes={cartTaxes}
                shipping={cartShipping}
                total={cartTotal}
                isFreeShipping={isFreeShipping}
                hasOutOfStockItems={hasOutOfStockItems}
              />

              {/* Botón para procesar la compra */}
              <div className="mt-4 px-3">
                <CheckoutButton
                  onCheckout={handleProcessOrder}
                  isProcessing={isProcessing}
                  disabled={isButtonDisabled()}
                  buttonText={getButtonText()}
                  paymentType={selectedPaymentType}
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
                      El voucher tiene validez de 24 horas y tu pedido será procesado una vez que recibamos la confirmación del pago.
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