/**
 * Componente para mostrar un método de pago individual
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.payment - Datos del método de pago
 * @param {Function} props.onSetDefault - Función para establecer como predeterminado
 * @param {Function} props.onDelete - Función para eliminar el método de pago
 * @param {Function} props.onEdit - Función para editar el método de pago
 * @returns {JSX.Element}
 */
export const PaymentItem = ({ payment, onSetDefault, onDelete, onEdit }) => {

  /**
   * Obtener icono para tipo de tarjeta
   * @param {string} type - Tipo de tarjeta
   * @returns {string} - Clase de icono
   */
  const getCardIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'visa': return 'bi-credit-card-2-front';
      case 'mastercard': return 'bi-credit-card';
      case 'amex': return 'bi-credit-card-fill';
      default: return 'bi-credit-card';
    }
  };


  /**
   * Formatear tipo de tarjeta
   * @param {string} type - Tipo de tarjeta
   * @returns {string} - Nombre formateado
   */
  const formatCardType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Obtener el nombre del titular, comprobando ambas posibles propiedades
  const holderName = payment.cardholderName || payment.cardHolder || null;

  return (

    <li className="payment-item">

      {/* Encabezado del metodo de pago */}
      <div className="payment-header">

        {/* Icono y detalles del metodo de pago */}
        <div className="payment-left">
          <i className={`bi ${getCardIcon(payment.type)} card-icon`}></i>

          {/* Información del metodo de pago */}
          <div className="payment-info">
            <h5 className="card-type">{formatCardType(payment.type)}</h5>
            <div className="card-number">{payment.cardNumber}</div>
            {holderName && (
              <div className="card-holder">{holderName}</div>
            )}
            <div className="expiry-date">Vence: {payment.expiryDate}</div>
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

        {/* Botón Editar */}
        <button
          className="payment-action-btn edit"
          title="Editar método de pago"
          onClick={() => onEdit(payment)}
        >
          <i className="bi bi-pencil"></i>
        </button>

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