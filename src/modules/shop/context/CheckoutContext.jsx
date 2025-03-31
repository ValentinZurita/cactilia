import React, { createContext, useContext, useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import { useCart } from '../features/cart/hooks/useCart';
import { useAddressManager, useBillingManager, usePaymentManager, useOrderProcessor } from './hooks/index.js';

// Crear el contexto
const CheckoutContext = createContext(null);

/**
 * Proveedor para el contexto de checkout
 * Este componente centraliza la gestión del proceso de checkout
 * delegando las responsabilidades específicas a hooks personalizados
 *
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export const CheckoutProvider = ({ children }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { uid } = useSelector(state => state.auth);
  const cart = useCart();

  // Estados generales
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');

  // Usar hooks especializados para cada área de responsabilidad
  const addressManager = useAddressManager(uid);
  const paymentManager = usePaymentManager(uid);
  const billingManager = useBillingManager();

  // Hook para procesamiento de órdenes (se pasa lo necesario como dependencias)
  const orderProcessor = useOrderProcessor({
    stripe,
    elements,
    cart,
    uid,
    addressManager,
    paymentManager,
    billingManager,
    orderNotes,
    setStep,
    setError,
    setIsProcessing,
    setOrderId
  });

  // Manejador para notas del pedido
  const handleNotesChange = (e) => {
    setOrderNotes(e.target.value);
  };

  // Construir el estado completo del contexto
  const checkoutState = {
    // Estados generales
    step,
    error,
    setError,
    isProcessing,
    orderId,
    orderNotes,
    handleNotesChange,

    // Datos y métodos del carrito
    ...cart,

    // Datos y métodos de dirección
    ...addressManager,

    // Datos y métodos de pago
    ...paymentManager,

    // Datos y métodos de facturación
    ...billingManager,

    // Métodos de procesamiento de orden
    handleProcessOrder: orderProcessor.processOrder
  };

  return (
    <CheckoutContext.Provider value={checkoutState}>
      {children}
    </CheckoutContext.Provider>
  );
};

/**
 * Hook para acceder al contexto de checkout
 * @returns {Object} Estado y métodos del checkout
 */
export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckoutContext debe ser usado dentro de un CheckoutProvider');
  }
  return context;
};