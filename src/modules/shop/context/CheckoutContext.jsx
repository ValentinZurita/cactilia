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

  // --- NUEVO MANEJADOR PARA EL TOGGLE DE FACTURA CON PRE-LLENADO ---
  const handleRequiresInvoiceToggle = useCallback((requires) => {
    // 1. Llamar al manejador original de billingManager
    billingManager.handleInvoiceChange(requires);

    // 2. Si se está marcando la casilla (requires === true)
    if (requires) {
      // 3. Obtener la dirección de envío actual
      let shippingAddress = null;
      if (addressManager.selectedAddressType === 'saved' && addressManager.selectedAddressId) {
        shippingAddress = addressManager.addresses.find(addr => addr.id === addressManager.selectedAddressId);
      } else if (addressManager.selectedAddressType === 'new' && addressManager.newAddressData) {
        shippingAddress = addressManager.newAddressData; // Asume que newAddressData tiene la estructura necesaria
      }

      // 4. Obtener datos fiscales actuales y verificar si pre-llenar
      const currentFiscalData = billingManager.fiscalData;
      // Solo pre-llenar si hay una dirección de envío y el CP fiscal está vacío
      if (shippingAddress && !currentFiscalData?.postalCode) {
        console.log('Pre-llenando dirección fiscal desde dirección de envío:', shippingAddress);
        // 5. Crear objeto con datos mapeados (¡AJUSTAR NOMBRES SI ES NECESARIO!)
        const newFiscalAddress = {
          postalCode: shippingAddress.zip || shippingAddress.postalCode || '', // Intentar 'zip' o 'postalCode'
          street: shippingAddress.street || '',
          extNumber: shippingAddress.numExt || shippingAddress.extNumber || '', // Intentar 'numExt' o 'extNumber'
          intNumber: shippingAddress.numInt || shippingAddress.intNumber || '', // Intentar 'numInt' o 'intNumber'
          neighborhood: shippingAddress.colonia || shippingAddress.neighborhood || '', // Intentar 'colonia' o 'neighborhood'
          city: shippingAddress.city || '',
          state: shippingAddress.state || ''
        };

        // 6. Llamar al manejador para actualizar datos fiscales en billingManager
        billingManager.handleFiscalDataChange(newFiscalAddress);
      }
    }
  }, [billingManager, addressManager]); // Dependencias: los managers
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

    // Datos y métodos de facturación (USAR EL NUEVO HANDLER)
    // ...billingManager, // No hacer spread completo para sobreescribir handleInvoiceChange
    requiresInvoice: billingManager.requiresInvoice,
    fiscalData: billingManager.fiscalData,
    handleFiscalDataChange: billingManager.handleFiscalDataChange,
    handleInvoiceChange: handleRequiresInvoiceToggle, // <--- Usar el nuevo handler

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