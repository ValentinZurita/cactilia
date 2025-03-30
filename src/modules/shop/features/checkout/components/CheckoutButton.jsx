import PropTypes from 'prop-types';

/**
 * Botón para finalizar el proceso de compra
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onCheckout - Función que se ejecuta al hacer clic en el botón
 * @param {boolean} props.isProcessing - Indica si se está procesando el pago
 * @param {boolean} props.disabled - Inhabilita el botón si es true
 * @param {string} props.buttonText - Texto personalizado del botón (opcional)
 * @param {string} props.paymentType - Tipo de pago ('card', 'oxxo', etc.) para mostrar icono apropiado
 * @param {boolean} props.hasStockIssues - Indica si hay problemas de stock
 * @returns {JSX.Element}
 */
export const CheckoutButton = ({
                                 onCheckout,
                                 isProcessing = false,
                                 disabled = false,
                                 buttonText = null,
                                 paymentType = 'card',
                                 hasStockIssues = false
                               }) => {
  // Determinar el icono según el tipo de pago
  const getButtonIcon = () => {
    if (isProcessing) return 'spinner-border spinner-border-sm';
    if (hasStockIssues) return 'bi-exclamation-triangle-fill';

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

    if (hasStockIssues) {
      return 'Resolver problemas de stock';
    }

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

  // Determinar la clase del botón
  const getButtonClass = () => {
    if (hasStockIssues) {
      return 'btn-warning';
    }
    return 'btn-green-checkout';
  };

  return (
    <button
      className={`btn ${getButtonClass()} w-100 py-3`}
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

CheckoutButton.propTypes = {
  onCheckout: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
  disabled: PropTypes.bool,
  buttonText: PropTypes.string,
  paymentType: PropTypes.string,
  hasStockIssues: PropTypes.bool
};