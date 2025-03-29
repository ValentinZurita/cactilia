import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { PaymentOption } from './PaymentOption';
import { OxxoPaymentOption } from './OxxoPaymentOption';
import { NewCardForm } from './NewCardForm';
import '../styles/paymentSelector.css';

/**
 * Componente para seleccionar método de pago
 * Permite seleccionar tarjetas guardadas, nuevas o pago en OXXO
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.paymentMethods - Lista de métodos de pago disponibles
 * @param {string} props.selectedPaymentId - ID del método de pago seleccionado
 * @param {string} props.selectedPaymentType - Tipo de pago seleccionado ('card', 'new_card', 'oxxo')
 * @param {Function} props.onPaymentSelect - Función para seleccionar un método guardado
 * @param {Function} props.onNewCardSelect - Función para seleccionar tarjeta nueva
 * @param {Function} props.onOxxoSelect - Función para seleccionar pago OXXO
 * @param {Function} props.onNewCardDataChange - Función cuando cambian datos de tarjeta nueva
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

  // Estados para la tarjeta nueva
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

  // Manejar cambios en el estado de la tarjeta
  const handleCardChange = (cardData) => {
    setCardState(cardData);
  };

  // Manejador para guardar la opción de guardar tarjeta
  const handleSaveCardChange = (save) => {
    setSaveCard(save);
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
          onSelect={onOxxoSelect}
        />
      </div>

      {/* Separador entre OXXO y tarjetas */}
      <div className="payment-methods-separator mb-4">
        <span className="separator-text">o paga con tarjeta</span>
      </div>

      {/* Sección de tarjetas */}
      <div className="payment-section">
        {/* Opción para usar una tarjeta nueva */}
        <PaymentOption
          isSelected={isNewCardSelected}
          onSelect={onNewCardSelect}
          icon="bi-plus-circle"
          name="Usar tarjeta nueva"
          description="Ingresa los datos de una tarjeta para esta compra"
          id="payment-new-card"
        >
          {isNewCardSelected && stripeReady && (
            <div className="new-card-form-container mt-3">
              <NewCardForm
                onCardChange={handleCardChange}
                saveCard={saveCard}
                onSaveCardChange={handleSaveCardChange}
                cardholderName={cardholderName}
                onCardholderNameChange={setCardholderName}
              />
            </div>
          )}

          {isNewCardSelected && !stripeReady && (
            <div className="alert alert-info mt-3">
              <i className="bi bi-info-circle me-2"></i>
              Cargando el procesador de pagos...
            </div>
          )}
        </PaymentOption>

        {/* Separador si hay métodos guardados */}
        {paymentMethods.length > 0 && (
          <div className="payment-methods-separator my-3">
            <span className="separator-text">o usa una tarjeta guardada</span>
          </div>
        )}

        {/* Métodos guardados */}
        {paymentMethods.map(method => (
          <PaymentOption
            key={method.id}
            isSelected={selectedPaymentId === method.id && selectedPaymentType === 'card'}
            onSelect={() => onPaymentSelect(method.id, 'card')}
            icon={getCardIcon(method.type)}
            name={`${formatCardType(method.type)} ${method.cardNumber}`}
            description={`Vence: ${method.expiryDate}`}
            isDefault={method.isDefault}
            id={`payment-${method.id}`}
          />
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

      {/* Modal para guardar método de pago - Se implementaría por separado */}
      {showForm && stripeReady && (
        <div className="modal-placeholder">
          {/* Aquí irá el modal de formulario de método de pago */}
          {/* Se mantiene por compatibilidad pero debe implementarse por separado */}
        </div>
      )}
    </div>
  );
};

/**
 * Obtener icono según tipo de tarjeta
 * @param {string} type - Tipo de tarjeta
 * @returns {string} - Clase de icono
 */
function getCardIcon(type) {
  switch(type?.toLowerCase()) {
    case 'visa': return 'bi-credit-card-2-front';
    case 'mastercard': return 'bi-credit-card';
    case 'amex': return 'bi-credit-card-fill';
    default: return 'bi-credit-card';
  }
}

/**
 * Formatear tipo de tarjeta
 * @param {string} type - Tipo de tarjeta
 * @returns {string} - Tipo formateado
 */
function formatCardType(type) {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
}