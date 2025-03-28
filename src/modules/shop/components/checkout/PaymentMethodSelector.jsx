import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { PaymentFormModal } from '../../../user/components/payments/PaymentFormModal.jsx';
import { NewCardForm } from './NewCardForm.jsx';
import '../../../shop/styles/newCardForm.css';

/**
 * Componente para seleccionar método de pago
 * Permite seleccionar un método existente, añadir uno nuevo, o usar una tarjeta nueva sin guardarla
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.paymentMethods - Lista de métodos de pago disponibles
 * @param {string} props.selectedPaymentId - ID del método de pago seleccionado
 * @param {Function} props.onPaymentSelect - Función que se ejecuta al seleccionar un método
 * @param {Function} props.onNewCardSelect - Función que se ejecuta al seleccionar "Usar tarjeta nueva"
 * @param {Function} props.onNewCardDataChange - Función que se ejecuta cuando cambian los datos de la nueva tarjeta
 * @param {boolean} props.loading - Indica si están cargando los métodos de pago
 * @param {string} props.newCardSelected - Indica si la opción de tarjeta nueva está seleccionada
 */
export const PaymentMethodSelector = ({
                                        paymentMethods = [],
                                        selectedPaymentId,
                                        onPaymentSelect,
                                        onNewCardSelect,
                                        onNewCardDataChange,
                                        loading = false,
                                        newCardSelected = false
                                      }) => {
  // Estado local para mostrar formulario de nuevo método
  const [showForm, setShowForm] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const [showNewCardForm, setShowNewCardForm] = useState(newCardSelected);

  // Estados para el formulario de nueva tarjeta
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [cardState, setCardState] = useState({ complete: false, error: null });

  // Usar hooks de Stripe
  const stripe = useStripe();

  // Verificar cuando Stripe esté listo
  useEffect(() => {
    if (stripe) {
      setStripeReady(true);
    }
  }, [stripe]);

  // Manejar cambios en el estado de newCardSelected
  useEffect(() => {
    setShowNewCardForm(newCardSelected);
  }, [newCardSelected]);

  // Efecto para seleccionar el método predeterminado cuando se cargan
  useEffect(() => {
    if (!selectedPaymentId && !newCardSelected && paymentMethods.length > 0 && !loading) {
      // Buscar método predeterminado
      const defaultMethod = paymentMethods.find(method => method.isDefault);

      if (defaultMethod) {
        onPaymentSelect(defaultMethod.id);
      } else if (paymentMethods.length > 0) {
        // Si no hay método predeterminado, usar el primero
        onPaymentSelect(paymentMethods[0].id);
      }
    }
  }, [paymentMethods, selectedPaymentId, newCardSelected, loading, onPaymentSelect]);

  // Actualizar los datos de la tarjeta nueva cuando cambian
  useEffect(() => {
    if (showNewCardForm && onNewCardDataChange) {
      onNewCardDataChange({
        cardholderName,
        saveCard,
        isComplete: cardState.complete,
        error: cardState.error
      });
    }
  }, [showNewCardForm, cardholderName, saveCard, cardState, onNewCardDataChange]);

  // Obtener icono según tipo de tarjeta
  const getCardIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'visa': return 'bi-credit-card-2-front';
      case 'mastercard': return 'bi-credit-card';
      case 'amex': return 'bi-credit-card-fill';
      default: return 'bi-credit-card';
    }
  };

  // Formatear tipo de tarjeta
  const formatCardType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Manejar selección de tarjeta nueva
  const handleNewCardSelection = () => {
    setShowNewCardForm(true);
    if (onNewCardSelect) onNewCardSelect();
  };

  // Manejar selección de tarjeta guardada
  const handleSavedCardSelection = (id) => {
    setShowNewCardForm(false);
    onPaymentSelect(id);
  };

  // Manejar cambios en el estado de la tarjeta
  const handleCardChange = (cardData) => {
    setCardState(cardData);
  };

  // Manejador para cuando se añade un nuevo método de pago
  const handlePaymentAdded = () => {
    setShowForm(false);
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando métodos de pago...</span>
        </div>
        <p className="mt-2">Cargando métodos de pago...</p>
      </div>
    );
  }

  return (
    <div className="payment-method-selector">
      {/* Lista de métodos guardados */}
      <div className="payment-method-list">
        {/* Opción para usar una tarjeta nueva */}
        <div className="payment-method-option">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethodSelection"
              id="payment-new-card"
              checked={showNewCardForm}
              onChange={handleNewCardSelection}
            />
            <label
              className="form-check-label d-flex align-items-center"
              htmlFor="payment-new-card"
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-plus-circle me-2 fs-4"></i>
              <div>
                <div className="payment-method-name">
                  Usar tarjeta nueva
                </div>
                <div className="payment-method-details text-muted small">
                  Ingresa los datos de una tarjeta para esta compra
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Separador si hay métodos guardados */}
        {paymentMethods.length > 0 && (
          <div className="payment-methods-separator my-3">
            <span className="separator-text">o usa una tarjeta guardada</span>
          </div>
        )}

        {/* Métodos guardados */}
        {paymentMethods.map(method => (
          <div key={method.id} className="payment-method-option">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="paymentMethodSelection"
                id={`payment-${method.id}`}
                checked={selectedPaymentId === method.id && !showNewCardForm}
                onChange={() => handleSavedCardSelection(method.id)}
              />
              <label
                className="form-check-label d-flex align-items-center"
                htmlFor={`payment-${method.id}`}
                style={{ cursor: 'pointer' }}
              >
                <i className={`bi ${getCardIcon(method.type)} me-2 fs-4`}></i>
                <div>
                  <div className="payment-method-name">
                    {formatCardType(method.type)} {method.cardNumber}
                  </div>
                  <div className="payment-method-details text-muted small">
                    Vence: {method.expiryDate}
                  </div>
                  {method.isDefault && (
                    <span className="badge bg-secondary bg-opacity-25 text-secondary mt-1">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Predeterminada
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario de nueva tarjeta (si está seleccionado) */}
      {showNewCardForm && stripeReady && (
        <NewCardForm
          onCardChange={handleCardChange}
          saveCard={saveCard}
          onSaveCardChange={setSaveCard}
          cardholderName={cardholderName}
          onCardholderNameChange={setCardholderName}
        />
      )}

      {/* Mensaje si Stripe no está listo */}
      {showNewCardForm && !stripeReady && (
        <div className="alert alert-info mt-3">
          <i className="bi bi-info-circle me-2"></i>
          Cargando el procesador de pagos...
        </div>
      )}

      {/* Acciones */}
      <div className="payment-method-actions mt-3">
        {/* Solo mostrar botón para guardar métodos de pago si estamos en una tarjeta guardada */}
        {!showNewCardForm && (
          <button
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={() => setShowForm(true)}
            disabled={!stripeReady}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Guardar Nuevo Método de Pago
          </button>
        )}

        <Link
          to="/profile/payments"
          className="btn btn-link btn-sm text-decoration-none"
          target="_blank"
        >
          <i className="bi bi-pencil me-1"></i>
          Administrar Métodos de Pago
        </Link>
      </div>

      {/* Modal para guardar método de pago */}
      {showForm && stripeReady && (
        <PaymentFormModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={handlePaymentAdded}
        />
      )}

      {/* Estilos adicionales */}
      <style jsx>{`
        .payment-methods-separator {
          display: flex;
          align-items: center;
          text-align: center;
          color: #888;
          font-size: 0.9rem;
        }
        
        .payment-methods-separator::before,
        .payment-methods-separator::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #ddd;
        }
        
        .payment-methods-separator::before {
          margin-right: 1em;
        }
        
        .payment-methods-separator::after {
          margin-left: 1em;
        }
        
        .separator-text {
          padding: 0 10px;
          background-color: white;
        }
      `}</style>
    </div>
  );
};