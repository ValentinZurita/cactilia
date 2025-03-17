import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { SectionTitle, AddItemButton } from '../components/shared/index.js';
import { usePayments } from '../hooks/usePayments.js';
import '../styles/profilePayments.css';
import '../styles/sharedComponents.css';
import { PaymentsList, SecurityNote } from '../components/payments/index.js';
import { PaymentFormModal } from '../components/payments/PaymentFormModal.jsx';

// Cargar Stripe solo una vez (fuera del componente para que no se reinicie)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

/**
 * Página mejorada para gestionar métodos de pago con Stripe
 *
 * @returns {JSX.Element} Componente de página de pagos
 */
export const PaymentsPage = () => {
  // Obtener métodos y estado del hook personalizado
  const {
    paymentMethods,
    loading,
    error,
    showForm,
    setDefaultPayment,
    deletePayment,
    addPayment,
    closeForm,
    handlePaymentAdded
  } = usePayments();

  // Estado local para controlar si Stripe está listo
  const [stripeReady, setStripeReady] = useState(false);

  // Mantener Elements montado incluso cuando el modal está cerrado
  // Esto previene el error de "elemento no montado"
  const [elementsVisible, setElementsVisible] = useState(false);

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

  // Cuando se solicita abrir el formulario, también mostramos Elements
  useEffect(() => {
    if (showForm) {
      setElementsVisible(true);
    }
  }, [showForm]);

  // Manejar el cierre seguro del modal
  const handleSafeClose = () => {
    closeForm();
    // No ocultamos Elements inmediatamente para permitir
    // que cualquier operación pendiente se complete
    setTimeout(() => {
      setElementsVisible(false);
    }, 500);
  };

  // Opciones mejoradas para Stripe Elements
  const stripeElementsOptions = {
    locale: 'es',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#34C749',
        fontFamily: 'Arial, sans-serif',
      },
    },
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700',
      },
    ],
  };

  return (
    <div className="payments-container">
      {/* Título de sección */}
      <SectionTitle title="Métodos de Pago" />

      {/* Descripción sobre métodos de pago */}
      <p className="text-muted mb-4">
        Administra tus métodos de pago para realizar compras de manera segura y rápida.
      </p>

      {/* Mensaje de error general */}
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Lista de métodos de pago */}
      <PaymentsList
        payments={paymentMethods}
        onSetDefault={setDefaultPayment}
        onDelete={deletePayment}
        loading={loading}
      />

      {/* Botón para agregar método de pago */}
      <AddItemButton
        onClick={addPayment}
        label="Agregar método de pago"
        icon="plus"
      />

      {/* Nota de seguridad */}
      <SecurityNote />

      {/*
        Renderizar Elements SIEMPRE que elementsVisible sea true,
        incluso si el modal no está visible. Esto previene que se
        desmonte mientras se está usando.
      */}
      {elementsVisible && stripeReady ? (
        <Elements stripe={stripePromise} options={stripeElementsOptions}>
          <PaymentFormModal
            isOpen={showForm}
            onClose={handleSafeClose}
            onSuccess={handlePaymentAdded}
          />
        </Elements>
      ) : null}

      {/* Mensaje de carga si Stripe no está listo */}
      {showForm && !stripeReady && (
        <div className="payment-loading-overlay">
          <div className="payment-loading-content">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Inicializando pasarela de pago...</p>
          </div>
        </div>
      )}
    </div>
  );
};