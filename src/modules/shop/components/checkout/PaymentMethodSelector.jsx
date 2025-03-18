import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentFormModal } from '../../../user/components/payments/PaymentFormModal.jsx'

// Cargar Stripe (esto debería estar en un contexto superior en una implementación real)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

/**
 * PaymentMethodSelector - Componente para seleccionar método de pago
 * Permite seleccionar un método existente o agregar uno nuevo
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.paymentMethods - Lista de métodos de pago disponibles
 * @param {string} props.selectedPaymentId - ID del método de pago seleccionado
 * @param {Function} props.onPaymentSelect - Función que se ejecuta al seleccionar un método
 * @param {boolean} props.loading - Indica si están cargando los métodos de pago
 */
export const PaymentMethodSelector = ({
                                        paymentMethods = [],
                                        selectedPaymentId,
                                        onPaymentSelect,
                                        loading = false
                                      }) => {
  // Estado local para mostrar formulario de nuevo método
  const [showForm, setShowForm] = useState(false);
  // Estado para controlar si Stripe está listo
  const [stripeReady, setStripeReady] = useState(false);

  // Verificar cuando Stripe esté listo
  useEffect(() => {
    if (stripePromise) {
      stripePromise.then(() => {
        setStripeReady(true);
      }).catch(err => {
        console.error("Error inicializando Stripe:", err);
        setStripeReady(false);
      });
    }
  }, []);

  // Efecto para seleccionar el método predeterminado cuando se cargan
  useEffect(() => {
    if (!selectedPaymentId && paymentMethods.length > 0 && !loading) {
      // Buscar método predeterminado
      const defaultMethod = paymentMethods.find(method => method.isDefault);

      if (defaultMethod) {
        onPaymentSelect(defaultMethod.id);
      } else if (paymentMethods.length > 0) {
        // Si no hay método predeterminado, usar el primero
        onPaymentSelect(paymentMethods[0].id);
      }
    }
  }, [paymentMethods, selectedPaymentId, loading, onPaymentSelect]);

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

  // Manejador para agregar nuevo método de pago
  const handlePaymentAdded = () => {
    // Esta función se llamaría cuando se agrega un nuevo método de pago
    setShowForm(false);
    // Aquí podrías recargar los métodos de pago o realizar otras acciones
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

  // Si no hay métodos de pago, mostrar mensaje y opción para agregar
  if (paymentMethods.length === 0) {
    return (
      <div className="payment-selector-empty">
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No tienes métodos de pago guardados. Por favor, agrega un método de pago.
        </div>

        <button
          className="btn btn-green-3 mt-2"
          onClick={() => setShowForm(true)}
          disabled={!stripeReady}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Método de Pago
        </button>

        {!stripeReady && (
          <div className="text-muted small mt-2">
            <i className="bi bi-exclamation-triangle me-1"></i>
            Cargando pasarela de pago...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="payment-method-selector">
      <div className="payment-method-list">
        {paymentMethods.map(method => (
          <div key={method.id} className="payment-method-option">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="paymentMethodSelection"
                id={`payment-${method.id}`}
                checked={selectedPaymentId === method.id}
                onChange={() => onPaymentSelect(method.id)}
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

      <div className="payment-method-actions mt-3">
        <button
          className="btn btn-outline-secondary btn-sm me-2"
          onClick={() => setShowForm(true)}
          disabled={!stripeReady}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Agregar Nuevo Método de Pago
        </button>

        <Link
          to="/profile/payments"
          className="btn btn-link btn-sm text-decoration-none"
          target="_blank"
        >
          <i className="bi bi-pencil me-1"></i>
          Administrar Métodos de Pago
        </Link>
      </div>

      {/* Modal para agregar método de pago */}
      {showForm && stripeReady && (
        <Elements stripe={stripePromise}>
          <PaymentFormModal
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSuccess={handlePaymentAdded}
          />
        </Elements>
      )}
    </div>
  );
};