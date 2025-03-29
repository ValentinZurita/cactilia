import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { PaymentFormModal } from '../../../user/components/payments/PaymentFormModal.jsx';
import { NewCardForm } from './NewCardForm.jsx';
import '../../../shop/styles/newCardForm.css';
import '../../styles/paymentSelector.css';
import '../../styles/oxxoPayment.css';
import { OxxoPaymentOption } from './OxxoPaymentOption.jsx'

/**
 * Componente para seleccionar método de pago
 * Permite seleccionar tarjetas guardadas, nuevas o pago en OXXO
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.paymentMethods - Lista de métodos de pago disponibles
 * @param {string} props.selectedPaymentId - ID del método de pago seleccionado
 * @param {string} props.selectedPaymentType - Tipo de pago seleccionado ('card', 'new_card', 'oxxo')
 * @param {Function} props.onPaymentSelect - Función que se ejecuta al seleccionar un método
 * @param {Function} props.onNewCardSelect - Función que se ejecuta al seleccionar "Usar tarjeta nueva"
 * @param {Function} props.onOxxoSelect - Función que se ejecuta al seleccionar pago en OXXO
 * @param {Function} props.onNewCardDataChange - Función que se ejecuta cuando cambian los datos de la nueva tarjeta
 * @param {boolean} props.loading - Indica si están cargando los métodos de pago
 */
export const PaymentMethodSelector = ({
                                        paymentMethods = [],
                                        selectedPaymentId,
                                        selectedPaymentType,
                                        onPaymentSelect,
                                        onNewCardSelect,
                                        onOxxoSelect,
                                        onNewCardDataChange,
                                        loading = false
                                      }) => {
  // Estado local para mostrar formulario de nuevo método
  const [showForm, setShowForm] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);

  // Estados para el formulario de nueva tarjeta
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [cardState, setCardState] = useState({ complete: false, error: null });

  // Calcular estados derivados
  const isNewCardSelected = selectedPaymentType === 'new_card';
  const isOxxoSelected = selectedPaymentType === 'oxxo';

  // Usar hooks de Stripe
  const stripe = useStripe();

  // Verificar cuando Stripe esté listo
  useEffect(() => {
    if (stripe) {
      setStripeReady(true);
    }
  }, [stripe]);

  // Efecto para seleccionar el método predeterminado cuando se cargan
  useEffect(() => {
    if (!selectedPaymentId && !selectedPaymentType && paymentMethods.length > 0 && !loading) {
      // Buscar método predeterminado
      const defaultMethod = paymentMethods.find(method => method.isDefault);

      if (defaultMethod) {
        onPaymentSelect(defaultMethod.id, 'card');
      } else if (paymentMethods.length > 0) {
        // Si no hay método predeterminado, usar el primero
        onPaymentSelect(paymentMethods[0].id, 'card');
      }
    }
  }, [paymentMethods, selectedPaymentId, selectedPaymentType, loading, onPaymentSelect]);

  // Actualizar los datos de la tarjeta nueva cuando cambian
  useEffect(() => {
    if (isNewCardSelected && onNewCardDataChange) {
      onNewCardDataChange({
        cardholderName,
        saveCard,
        isComplete: cardState.complete,
        error: cardState.error
      });
    }
  }, [isNewCardSelected, cardholderName, saveCard, cardState, onNewCardDataChange]);

  // Obtener icono según tipo de tarjeta
  const getCardIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'visa': return 'bi-credit-card-2-front';
      case 'mastercard': return 'bi-credit-card';
      case 'amex': return 'bi-credit-card-fill';
      default: return 'bi-credit-card';
    }
  };

  // Formatear tipo de tarjeta
  const formatCardType = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Función para manejar la selección de tarjeta nueva
  const handleNewCardSelection = () => {
    console.log('Seleccionando tarjeta nueva');
    if (onNewCardSelect) {
      onNewCardSelect(); // Esta función debería llamar a setSelectedPaymentType('new_card')
    }
  };

  // Función para manejar la selección de OXXO
  const handleOxxoSelection = () => {
    console.log('Seleccionando OXXO');
    if (onOxxoSelect) {
      onOxxoSelect(); // Esta función debería llamar a setSelectedPaymentType('oxxo')
    }
  };


  // Función para manejar la selección de tarjeta guardada
  const handleSavedCardSelection = (id) => {
    console.log('Seleccionando tarjeta guardada:', id);
    onPaymentSelect(id, 'card'); // Asegurarse de pasar el tipo 'card'
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
      {/* Sección de OXXO */}
      <div className="payment-section mb-4">
        <OxxoPaymentOption
          selected={selectedPaymentType === 'oxxo'}
          onSelect={handleOxxoSelection}
        />
      </div>

      {/* Separador entre OXXO y tarjetas */}
      <div className="payment-methods-separator mb-4">
        <span className="separator-text">o paga con tarjeta</span>
      </div>

      {/* Sección de tarjetas */}
      <div className="payment-section">
        {/* Lista de métodos de pago con tarjeta */}
        <div className="payment-method-list">
          {/* Opción para usar una tarjeta nueva */}
          <div className={`payment-method-option ${isNewCardSelected ? 'active-payment-option' : ''}`}>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="paymentMethodSelection"
                id="payment-new-card"
                checked={isNewCardSelected}
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

            {/* Formulario de nueva tarjeta (si está seleccionado) */}
            {isNewCardSelected && stripeReady && (
              <div className="new-card-form-container mt-3">
                <NewCardForm
                  onCardChange={handleCardChange}
                  saveCard={saveCard}
                  onSaveCardChange={setSaveCard}
                  cardholderName={cardholderName}
                  onCardholderNameChange={setCardholderName}
                />
              </div>
            )}

            {/* Mensaje si Stripe no está listo */}
            {isNewCardSelected && !stripeReady && (
              <div className="alert alert-info mt-3">
                <i className="bi bi-info-circle me-2"></i>
                Cargando el procesador de pagos...
              </div>
            )}
          </div>

          {/* Separador si hay métodos guardados */}
          {paymentMethods.length > 0 && (
            <div className="payment-methods-separator my-3">
              <span className="separator-text">o usa una tarjeta guardada</span>
            </div>
          )}

          {/* Métodos guardados */}
          {paymentMethods.map(method => (
            <div key={method.id} className={`payment-method-option ${selectedPaymentId === method.id && selectedPaymentType === 'card' ? 'active-payment-option' : ''}`}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethodSelection"
                  id={`payment-${method.id}`}
                  checked={selectedPaymentId === method.id && selectedPaymentType === 'card'}
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

        {/* Acciones */}
        <div className="payment-method-actions mt-3">
          {/* Solo mostrar botón para guardar métodos de pago si no estamos en tarjeta nueva */}
          {!isNewCardSelected && (
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
      </div>
    </div>
  );
};