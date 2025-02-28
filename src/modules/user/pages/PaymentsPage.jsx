import { useState } from 'react';
import { EmptyState, ProfileCard, SectionTitle } from '../components/shared/index.js'


/**
 * PaymentsPage
 *
 * Manages user payment methods
 */
export const PaymentsPage = () => {
  // Mock data - would come from Firebase in real implementation
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
   * Get icon for card type
   * @param {string} type - Card type
   * @returns {string} - Icon class
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
   * Format card type display name
   * @param {string} type - Card type
   * @returns {string} - Formatted name
   */
  const formatCardType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  /**
   * Set a payment method as default
   * @param {string} id - Payment method ID
   */
  const handleSetDefault = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  /**
   * Delete a payment method
   * @param {string} id - Payment method ID
   */
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este método de pago?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  return (
    <div>
      {/* Section title */}
      <SectionTitle title="Métodos de Pago" />

      {/* Add new payment method button */}
      <button className="btn btn-green-3 text-white mb-4">
        <i className="bi bi-plus-circle me-2"></i>
        Agregar método de pago
      </button>

      {/* Payment methods list */}
      {paymentMethods.length > 0 ? (
        <div className="row">
          {paymentMethods.map(method => (
            <div key={method.id} className="col-md-6 mb-3">
              <ProfileCard>
                <div className="d-flex align-items-center mb-3">
                  <i className={`${getCardIcon(method.type)} fs-1 me-3 text-green-3`}></i>
                  <div>
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0">{formatCardType(method.type)}</h5>
                      {method.isDefault && (
                        <span className="badge bg-green-3 ms-2">Predeterminada</span>
                      )}
                    </div>
                    <p className="text-muted mb-0">{method.cardNumber}</p>
                    <p className="text-muted mb-0">Vence: {method.expiryDate}</p>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-sm btn-outline-green">
                    Editar
                  </button>

                  {!method.isDefault && (
                    <>
                      <button
                        className="btn btn-sm btn-outline-green"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Predeterminada
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(method.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </ProfileCard>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="credit-card"
          title="No hay métodos de pago"
          message="Aún no has agregado ningún método de pago"
        />
      )}

      {/* Security note */}
      <div className="alert alert-info mt-3">
        <i className="bi bi-shield-lock me-2"></i>
        <small>
          Tu información de pago se almacena de forma segura.
          Nunca compartiremos tus datos con terceros.
        </small>
      </div>
    </div>
  );
};