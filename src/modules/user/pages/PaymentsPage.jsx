import { useState } from 'react';
import { EmptyState, SectionTitle } from '../components/shared/index.js'
import '../../../../src/styles/pages/userProfile.css';


/**
 * PaymentsPage - Página rediseñada de métodos de pago
 * Con estilo minimalista y elegante coherente con las otras secciones
 */
export const PaymentsPage = () => {
  // Datos de ejemplo - vendrían de Firebase en implementación real
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'visa',
      cardNumber: '**** **** **** 4242',
      cardHolder: 'Valentin A. Perez',
      expiryDate: '12/28',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      cardNumber: '**** **** **** 5678',
      cardHolder: 'Valentin A. Perez',
      expiryDate: '09/27',
      isDefault: false
    }
  ]);

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

  /**
   * Establecer método de pago como predeterminado
   * @param {string} id - ID del método de pago
   */
  const handleSetDefault = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  /**
   * Eliminar método de pago
   * @param {string} id - ID del método de pago
   */
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este método de pago?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Métodos de Pago" />

      {/* Lista de métodos de pago */}
      {paymentMethods.length > 0 ? (
        <ul className="payment-list">
          {paymentMethods.map(method => (
            <li key={method.id} className="payment-item">
              <div className="payment-header">
                <div className="payment-left">
                  <i className={`bi ${getCardIcon(method.type)} card-icon`}></i>
                  <div className="payment-info">
                    <h5 className="card-type">{formatCardType(method.type)}</h5>
                    <div className="card-number">{method.cardNumber}</div>
                    <div className="expiry-date">Vence: {method.expiryDate}</div>
                  </div>
                </div>

                {method.isDefault && (
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
                >
                  <i className="bi bi-pencil"></i>
                </button>

                {/* Botón Predeterminada (solo si no es la predeterminada) */}
                {!method.isDefault && (
                  <button
                    className="payment-action-btn default"
                    title="Establecer como predeterminada"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    <i className="bi bi-star"></i>
                  </button>
                )}

                {/* Botón Eliminar (solo si no es la predeterminada) */}
                {!method.isDefault && (
                  <button
                    className="payment-action-btn delete"
                    title="Eliminar método de pago"
                    onClick={() => handleDelete(method.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="credit-card"
          title="No hay métodos de pago"
          message="Aún no has agregado ningún método de pago"
        />
      )}

      {/* Botón para agregar método de pago - ahora dentro del contenido */}
      <div className="add-payment-container">
        <button className="add-payment-btn" title="Agregar método de pago">
          <i className="bi bi-plus"></i>
        </button>
        <small className="text-muted mt-2">Agregar método de pago</small>
      </div>

      {/* Nota de seguridad */}
      <div className="alert alert-light mt-3 d-flex align-items-center gap-2">
        <i className="bi bi-shield-lock text-muted"></i>
        <small className="text-muted">
          Tu información de pago se almacena de forma segura.
          Nunca compartiremos tus datos con terceros.
        </small>
      </div>
    </div>
  );
};