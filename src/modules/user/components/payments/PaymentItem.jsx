/**
 * Componente para mostrar un método de pago individual
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.payment - Datos del método de pago
 * @param {Function} props.onSetDefault - Función para establecer como predeterminado
 * @param {Function} props.onDelete - Función para eliminar el método de pago
 * @returns {JSX.Element}
 */
export const PaymentItem = ({ payment, onSetDefault, onDelete }) => {

  /**
   * Obtener icono para tipo de tarjeta
   * @param {string} brand - Marca de la tarjeta
   * @returns {string} - Clase de icono
   */
  const getCardIcon = (brand) => {
    // Handle case where brand might be undefined initially
    if (!brand) return 'bi-credit-card';
    switch(brand.toLowerCase()) {
      case 'visa': return 'bi-credit-card-2-front';
      case 'mastercard': return 'bi-credit-card'; // Assuming same icon for now
      case 'amex': return 'bi-credit-card-fill'; // Assuming specific icon
      // Add other card types if needed (discover, diners, jcb, etc.)
      default: return 'bi-credit-card';
    }
  };


  /**
   * Formatear tipo de tarjeta
   * @param {string} brand - Marca de la tarjeta
   * @returns {string} - Nombre formateado
   */
  const formatCardBrand = (brand) => {
    // Handle case where brand might be undefined
    if (!brand) return 'Tarjeta';
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  // Obtener el nombre del titular, comprobando ambas posibles propiedades y si existen
  const holderName = payment?.cardholderName || payment?.cardHolder || null;
  const cardLast4 = payment?.last4 || payment?.cardNumber || '****'; // Use last4 if available, fallback to cardNumber, then ****
  const expiryDate = payment?.expiryDate; // Directly use expiryDate if available

  return (

    <li className="payment-item">

      {/* Encabezado del metodo de pago */}
      <div className="payment-header">

        {/* Icono y detalles del metodo de pago */}
        <div className="payment-left">
          {/* Use payment.brand for the icon */}
          <i className={`bi ${getCardIcon(payment.brand)} card-icon`}></i>

          {/* Información del metodo de pago */}
          <div className="payment-info">
            {/* Use payment.brand for the type display */}
            <h5 className="card-type">{formatCardBrand(payment.brand)}</h5>
            {/* Display last 4 digits */}
            <div className="card-number">**** **** **** {cardLast4}</div>
            {/* Conditionally render holder name */}
            {holderName && (
              <div className="card-holder">{holderName}</div>
            )}
             {/* Conditionally render expiry date */}
            {expiryDate && (
               <div className="expiry-date">Vence: {expiryDate}</div>
            )}
          </div>
        </div>

        {/* Etiqueta de predeterminada */}
        {payment.isDefault && (
          <span className="payment-default-tag">
            <i className="bi bi-check-circle-fill"></i>
            Predeterminada
          </span>
        )}
      </div>

      <div className="payment-actions">

        {/* Botón Predeterminada (solo si no es la predeterminada) */}
        {!payment.isDefault && (
          <button
            className="payment-action-btn default"
            title="Establecer como predeterminada"
            onClick={() => onSetDefault(payment.id)}
          >
            <i className="bi bi-star"></i>
          </button>
        )}

        {/* Botón Eliminar (solo si no es la predeterminada) */}
        {!payment.isDefault && (
          <button
            className="payment-action-btn delete"
            title="Eliminar método de pago"
            onClick={() => onDelete(payment.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        )}
      </div>
    </li>
  );
};