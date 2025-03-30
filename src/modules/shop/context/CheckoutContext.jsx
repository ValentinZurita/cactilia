// src/modules/shop/context/CheckoutContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { useCart } from '../features/cart/hooks/useCart';
import { getUserAddresses } from '../../user/services/addressService';
import { getUserPaymentMethods } from '../../user/services/paymentService';
import { processPayment } from '../features/checkout/services/index.js';
import { clearCartWithSync } from '../../../store/cart/cartThunk';

// Crear el contexto
const CheckoutContext = createContext(null);

/**
 * Proveedor para el contexto de checkout
 */
export const CheckoutProvider = ({ children }) => {
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const { uid } = useSelector(state => state.auth);
  const { items, validateCheckout } = useCart();

  // Estados generales
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Estados de dirección
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddressType, setSelectedAddressType] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [newAddressData, setNewAddressData] = useState({
    name: '',
    street: '',
    numExt: '',
    numInt: '',
    colonia: '',
    city: '',
    state: '',
    zip: '',
    references: '',
    saveAddress: false
  });

  // Estados de método de pago
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [newCardData, setNewCardData] = useState({
    cardholderName: '',
    saveCard: false,
    isComplete: false,
    error: null
  });

  // Estados de facturación
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [fiscalData, setFiscalData] = useState({
    rfc: '',
    businessName: '',
    email: '',
    regimenFiscal: '',
    usoCFDI: 'G03' // Por defecto: Gastos en general
  });

  // Estado para notas
  const [orderNotes, setOrderNotes] = useState('');

  // Cargar direcciones
  useEffect(() => {
    const loadAddresses = async () => {
      if (!uid) return;
      setLoadingAddresses(true);
      try {
        const result = await getUserAddresses(uid);
        if (result.ok) {
          setAddresses(result.data || []);

          // Seleccionar dirección por defecto
          if (result.data && result.data.length > 0 && !selectedAddressId) {
            const defaultAddress = result.data.find(addr => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setSelectedAddressType('saved');
            } else {
              setSelectedAddressId(result.data[0].id);
              setSelectedAddressType('saved');
            }
          }
        } else {
          console.error('Error cargando direcciones:', result.error);
          setAddresses([]);
        }
      } catch (error) {
        console.error('Error en loadAddresses:', error);
        setAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [uid, selectedAddressId]);

  // Cargar métodos de pago
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!uid) return;
      setLoadingPayments(true);
      try {
        const result = await getUserPaymentMethods(uid);
        if (result.ok) {
          setPaymentMethods(result.data || []);

          // Seleccionar método por defecto
          if (result.data && result.data.length > 0 && !selectedPaymentId) {
            const defaultMethod = result.data.find(method => method.isDefault);
            if (defaultMethod) {
              setSelectedPaymentId(defaultMethod.id);
              setSelectedPaymentType('card');
            } else {
              setSelectedPaymentId(result.data[0].id);
              setSelectedPaymentType('card');
            }
          }
        } else {
          console.error('Error cargando métodos de pago:', result.error);
          setPaymentMethods([]);
        }
      } catch (error) {
        console.error('Error en loadPaymentMethods:', error);
        setPaymentMethods([]);
      } finally {
        setLoadingPayments(false);
      }
    };

    loadPaymentMethods();
  }, [uid, selectedPaymentId]);

  // Manejador para cambio de dirección
  const handleAddressChange = useCallback((addressId, addressType = 'saved') => {
    setSelectedAddressId(addressId);
    setSelectedAddressType(addressType);
  }, []);

  // Manejador para seleccionar dirección nueva
  const handleNewAddressSelect = useCallback(() => {
    setSelectedAddressId(null);
    setSelectedAddressType('new');
  }, []);

  // Manejador para actualizar datos de dirección nueva
  const handleNewAddressDataChange = useCallback((data) => {
    setNewAddressData(prev => ({ ...prev, ...data }));
  }, []);

  // Manejador para cambio de método de pago
  const handlePaymentChange = useCallback((paymentId, paymentType = 'card') => {
    setSelectedPaymentId(paymentId);
    setSelectedPaymentType(paymentType);
  }, []);

  // Manejador para seleccionar tarjeta nueva
  const handleNewCardSelect = useCallback(() => {
    setSelectedPaymentId(null);
    setSelectedPaymentType('new_card');
  }, []);

  // Manejador para seleccionar OXXO
  const handleOxxoSelect = useCallback(() => {
    setSelectedPaymentId(null);
    setSelectedPaymentType('oxxo');
  }, []);

  // Manejador para actualizar datos de tarjeta nueva
  const handleNewCardDataChange = useCallback((data) => {
    setNewCardData(prev => ({ ...prev, ...data }));
  }, []);

  // Manejador para requerir factura
  const handleInvoiceChange = useCallback((requires) => {
    setRequiresInvoice(requires);
  }, []);

  // Manejador para actualizar datos fiscales
  const handleFiscalDataChange = useCallback((data) => {
    setFiscalData(prev => ({ ...prev, ...data }));
  }, []);

  // Manejador para notas
  const handleNotesChange = useCallback((e) => {
    setOrderNotes(e.target.value);
  }, []);

  // Manejador para procesar la orden
  const handleProcessOrder = useCallback(async () => {
    if (!stripe || !elements) {
      setError('El sistema de pagos no está listo. Por favor, inténtalo de nuevo.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Verificar stock
      const checkoutValidation = validateCheckout();
      if (!checkoutValidation.valid) {
        throw new Error(checkoutValidation.error);
      }

      // Cambiar al paso de procesamiento
      setStep(2);

      // Obtener dirección seleccionada
      let shippingAddress;
      if (selectedAddressType === 'saved') {
        const address = addresses.find(addr => addr.id === selectedAddressId);
        if (!address) {
          throw new Error('La dirección seleccionada no es válida');
        }
        shippingAddress = { ...address };
      } else if (selectedAddressType === 'new') {
        shippingAddress = { ...newAddressData };
      } else {
        throw new Error('Selecciona una dirección de envío');
      }

      // Obtener método de pago seleccionado
      let paymentMethod = null;
      if (selectedPaymentType === 'card') {
        paymentMethod = paymentMethods.find(method => method.id === selectedPaymentId);
        if (!paymentMethod) {
          throw new Error('El método de pago seleccionado no es válido');
        }
      } else if (selectedPaymentType === 'new_card') {
        // Para tarjeta nueva, el paymentMethod se crea en el servidor
        const cardElement = elements.getElement('CardElement');
        if (!cardElement) {
          throw new Error('No se pudo acceder al formulario de tarjeta');
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: newCardData.cardholderName
          }
        });

        if (error) {
          throw new Error(error.message);
        }
      }

      // Preparar datos de la orden
      const orderData = {
        userId: uid,
        items: items,
        shipping: {
          method: 'standard',
          address: shippingAddress,
          addressType: selectedAddressType,
          saveForFuture: selectedAddressType === 'new' && newAddressData.saveAddress
        },
        payment: {
          type: selectedPaymentType,
          methodId: selectedPaymentId,
          cardholderName: newCardData.cardholderName,
          saveForFuture: selectedPaymentType === 'new_card' && newCardData.saveCard
        },
        billing: {
          requiresInvoice,
          fiscalData: requiresInvoice ? fiscalData : null
        },
        notes: orderNotes
      };

      // Procesar la orden
      const result = await processPayment(orderData);

      if (!result.ok) {
        throw new Error(result.error || 'Error al procesar el pago');
      }

      setOrderId(result.orderId);

      // Si es OXXO, no limpiar el carrito
      if (selectedPaymentType !== 'oxxo') {
        dispatch(clearCartWithSync());
      }

      // Redirigir a página de éxito
      const redirectPath = selectedPaymentType === 'oxxo'
        ? `/shop/order-success/${result.orderId}?payment=oxxo`
        : `/shop/order-success/${result.orderId}`;

      window.location.href = redirectPath;
    } catch (error) {
      console.error('Error en handleProcessOrder:', error);
      setError(error.message || 'Error desconocido al procesar la orden');
      setStep(1); // Volver al paso de formulario en caso de error
    } finally {
      setIsProcessing(false);
    }
  }, [
    stripe, elements, validateCheckout,
    selectedAddressType, selectedAddressId, addresses, newAddressData,
    selectedPaymentType, selectedPaymentId, paymentMethods, newCardData,
    requiresInvoice, fiscalData, orderNotes,
    uid, items, dispatch
  ]);

  // Obtener dirección y método de pago seleccionados
  const selectedAddress = selectedAddressType === 'saved'
    ? addresses.find(addr => addr.id === selectedAddressId)
    : null;

  const selectedPayment = selectedPaymentType === 'card'
    ? paymentMethods.find(method => method.id === selectedPaymentId)
    : null;

  const checkoutState = {
    // Estados generales
    step,
    error,
    isProcessing,
    orderId,

    // Estados de dirección
    addresses,
    selectedAddressId,
    selectedAddressType,
    selectedAddress,
    loadingAddresses,
    newAddressData,

    // Estados de método de pago
    paymentMethods,
    selectedPaymentId,
    selectedPaymentType,
    selectedPayment,
    loadingPayments,
    newCardData,

    // Estados de facturación
    requiresInvoice,
    fiscalData,

    // Estado para notas
    orderNotes,

    // Manejadores de dirección
    handleAddressChange,
    handleNewAddressSelect,
    handleNewAddressDataChange,

    // Manejadores de método de pago
    handlePaymentChange,
    handleNewCardSelect,
    handleOxxoSelect,
    handleNewCardDataChange,

    // Manejadores de facturación
    handleInvoiceChange,
    handleFiscalDataChange,

    // Manejador de notas
    handleNotesChange,

    // Manejador de procesamiento
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
 */
export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('Could not find CheckoutProvider context; You need to wrap the part of your app that calls useCheckout() in an <CheckoutProvider> provider.');
  }
  return context;
};