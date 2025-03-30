import { CheckoutSummary } from './summary/index.js';
import { CheckoutButton } from './CheckoutButton';

/**
 * Panel de resumen de compra para checkout
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element}
 */
export const CheckoutSummaryPanel = ({
                                       // Datos del carrito
                                       cartItems,
                                       cartSubtotal,
                                       cartTaxes,
                                       cartShipping,
                                       cartTotal,
                                       isFreeShipping,

                                       // Estado del proceso
                                       isProcessing,
                                       isButtonDisabled,
                                       hasStockIssues,

                                       // Tipo de pago
                                       selectedPaymentType,

                                       // Manejadores
                                       processOrderWithChecks,

                                       // Paso actual
                                       step
                                     }) => {
  // Obtener texto del botón según el método de pago
  const getButtonText = () => {
    if (isProcessing) return "Procesando...";

    if (hasStockIssues) {
      return "Revisar problemas de stock";
    }

    if (selectedPaymentType === 'oxxo') {
      return "Generar voucher OXXO";
    }

    return "Completar Compra";
  };

  return (
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
        />

        {/* Botón para procesar la compra */}
        <div className="mt-4 px-3">
          <CheckoutButton
            onCheckout={processOrderWithChecks}
            isProcessing={isProcessing}
            disabled={isButtonDisabled}
            buttonText={getButtonText()}
            paymentType={selectedPaymentType}
            hasStockIssues={hasStockIssues}
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
                  {selectedPaymentType === 'oxxo'
                    ? 'Generando voucher de pago...'
                    : 'Procesando tu pago...'}
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
  );
};