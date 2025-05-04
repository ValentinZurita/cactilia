import React, { createContext, useContext, useState, useCallback } from 'react';
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

  // Hook para procesamiento de órdenes
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

  // --- MANEJADOR ORIGINAL PARA EL TOGGLE DE FACTURA (SIN PRE-LLENADO) ---
  const handleRequiresInvoiceToggle = useCallback((requires) => {
    // 1. Llamar al manejador original de billingManager (que limpia si requires es false)
    billingManager.handleInvoiceChange(requires);
    // ¡Ya no hay lógica de pre-llenado automático aquí!
  }, [billingManager]);
  // ------------------------------------------------------------------

  // --- NUEVA FUNCIÓN PARA PRE-LLENAR DATOS FISCALES DESDE ENVÍO ---
  const fillFiscalAddressFromShipping = useCallback(() => {
    // 1. Obtener la dirección de envío actual
    let shippingAddress = null;
    if (addressManager.selectedAddressType === 'saved' && addressManager.selectedAddressId) {
      shippingAddress = addressManager.addresses.find(addr => addr.id === addressManager.selectedAddressId);
    } else if (addressManager.selectedAddressType === 'new' && addressManager.newAddressData) {
      shippingAddress = addressManager.newAddressData;
    }

    // 2. Si existe una dirección de envío
    if (shippingAddress) {
      console.log('Botón presionado: Pre-llenando dirección fiscal desde envío:', shippingAddress);
      // 3. Crear objeto con datos mapeados
      const newFiscalAddress = {
        postalCode: shippingAddress.zip || shippingAddress.postalCode || '',
        street: shippingAddress.street || '',
        extNumber: shippingAddress.numExt || shippingAddress.extNumber || '',
        intNumber: shippingAddress.numInt || shippingAddress.intNumber || '',
        neighborhood: shippingAddress.colonia || shippingAddress.neighborhood || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || ''
      };

      // 4. Llamar al manejador para actualizar datos fiscales en billingManager
      billingManager.handleFiscalDataChange(newFiscalAddress);
    } else {
      console.warn('Botón presionado, pero no hay dirección de envío seleccionada para copiar.');
      // Opcionalmente: Mostrar un mensaje al usuario con setError
      // setError('Selecciona una dirección de envío primero para poder copiarla.');
    }
  }, [addressManager, billingManager]); // Dependencias: los managers
  // ------------------------------------------------------------------

  // Crear la función handleProcessOrder que acepta ambos argumentos
  const handleProcessOrder = useCallback(async (selectedOption, shippingCost) => {
    // Llamar a la función del hook con los argumentos recibidos
    return orderProcessor.processOrder(selectedOption, shippingCost);
  }, [orderProcessor]);

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

    // Datos y métodos de pago (modificar handleOxxoSelect para pasar billingManager)
    ...paymentManager,
    handleOxxoSelect: () => paymentManager.handleOxxoSelect(billingManager),

    // Datos y métodos de facturación (USAR HANDLER ORIGINAL Y AÑADIR NUEVA FUNCIÓN)
    requiresInvoice: billingManager.requiresInvoice,
    fiscalData: billingManager.fiscalData,
    handleFiscalDataChange: billingManager.handleFiscalDataChange,
    handleInvoiceChange: handleRequiresInvoiceToggle, // <--- El handler simple sin pre-llenado
    fillFiscalAddressFromShipping: fillFiscalAddressFromShipping, // <--- Nueva función para el botón

    // Método de procesamiento de orden actualizado
    handleProcessOrder
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