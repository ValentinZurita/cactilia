import React from 'react';

/**
 * CheckoutButton - Botón para finalizar el proceso de compra
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onCheckout - Función que se ejecuta al hacer clic en el botón
 * @param {boolean} props.isProcessing - Indica si se está procesando el pago
 * @param {boolean} props.disabled - Inhabilita el botón si es true
 * @param {string} props.buttonText - Texto personalizado del botón (opcional)
 * @param {string} props.paymentType - Tipo de pago ('card', 'oxxo', etc.) para mostrar icono apropiado
 * @returns {JSX.Element}
 */
export const CheckoutButton = ({
                                 onCheckout,
                                 isProcessing = false,
                                 disabled = false,
                                 buttonText = null,
                                 paymentType = 'card'
                               }) => {
  // Determinar el icono según el tipo de pago
  const getButtonIcon = () => {
    if (isProcessing) return 'spinner-border spinner-border-sm';

    switch (paymentType) {
      case 'oxxo':
        return 'bi-shop';
      case 'card':
      case 'new_card':
      default:
        return 'bi-credit-card-fill';
    }
  };

  // Determinar el texto del botón
  const getButtonText = () => {
    if (buttonText) return buttonText;

    if (isProcessing) {
      return paymentType === 'oxxo' ?
        'Generando voucher...' :
        'Procesando pago...';
    }

    switch (paymentType) {
      case 'oxxo':
        return 'Generar voucher OXXO';
      case 'card':
      case 'new_card':
      default:
        return 'Completar Compra';
    }
  };

  return (
    <button
      className="btn btn-green-checkout w-100 py-3"
      onClick={onCheckout}
      disabled={disabled || isProcessing}
    >
      <i className={getButtonIcon() + " me-2"}
         role={isProcessing ? "status" : null}
         aria-hidden={!isProcessing}></i>
      {getButtonText()}
    </button>
  );
};