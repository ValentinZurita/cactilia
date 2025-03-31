// src/modules/shop/context/CheckoutContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { useCart } from '../features/cart/hooks/useCart';
import { getUserAddresses } from '../../user/services/addressService';
import { getUserPaymentMethods } from '../../user/services/paymentService';
import { processPayment } from '../features/checkout/services/index.js';
import { clearCartWithSync } from '../features/cart/store/index.js';
import { validateItemsStock } from '../services/productServices.js'

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
  const {
    items,
    validateCheckout,
    subtotal,
    taxes,
    shipping,
    finalTotal
  } = useCart();

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

  // Estados para método de pago
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

  // Estados para facturación
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

  // Referencia para evitar múltiples llamadas durante el montaje inicial
  const initialLoadComplete = useRef({
    addresses: false,
    payments: false
  });

  // Cargar direcciones
  useEffect(() => {
    const loadAddresses = async () => {
      if (!uid) {
        setLoadingAddresses(false);
        return;
      }

      if (initialLoadComplete.current.addresses) return;

      setLoadingAddresses(true);
      try {
        const result = await getUserAddresses(uid);
        if (result.ok) {
          const addressData = result.data || [];
          setAddresses(addressData);

          // Seleccionar dirección por defecto
          if (addressData.length > 0 && !selectedAddressId) {
            const defaultAddress = addressData.find(addr => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setSelectedAddressType('saved');
            } else {
              setSelectedAddressId(addressData[0].id);
              setSelectedAddressType('saved');
            }
          }

          initialLoadComplete.current.addresses = true;
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
      if (!uid) {
        setLoadingPayments(false);
        return;
      }

      if (initialLoadComplete.current.payments) return;

      setLoadingPayments(true);
      try {
        const result = await getUserPaymentMethods(uid);
        if (result.ok) {
          const paymentData = result.data || [];
          setPaymentMethods(paymentData);

          // Seleccionar método por defecto
          if (paymentData.length > 0 && !selectedPaymentId) {
            const defaultMethod = paymentData.find(method => method.isDefault);
            if (defaultMethod) {
              setSelectedPaymentId(defaultMethod.id);
              setSelectedPaymentType('card');
            } else {
              setSelectedPaymentId(paymentData[0].id);
              setSelectedPaymentType('card');
            }
          }

          initialLoadComplete.current.payments = true;
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
      // Verificar stock en tiempo real
      const stockCheck = await validateItemsStock(items);
      if (!stockCheck.valid) {
        // Formatear un mensaje de error amigable
        let errorMessage = 'Algunos productos no están disponibles en la cantidad solicitada.';

        if (stockCheck.outOfStockItems && stockCheck.outOfStockItems.length === 1) {
          const item = stockCheck.outOfStockItems[0];
          errorMessage = `"${item.name}" no está disponible en la cantidad solicitada. Solo hay ${item.currentStock} unidades disponibles.`;
        }

        throw new Error(errorMessage);
      }

      // Verificar stock local (validación adicional)
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
        // Validar campos obligatorios
        const requiredFields = ['name', 'street', 'city', 'state', 'zip'];
        const missingFields = requiredFields.filter(field => !newAddressData[field]);

        if (missingFields.length > 0) {
          throw new Error('Completa todos los campos obligatorios de la dirección');
        }

        shippingAddress = { ...newAddressData };
      } else {
        throw new Error('Selecciona una dirección de envío');
      }

      // Obtener método de pago seleccionado
      let paymentMethodId = null;
      let cardholderName = '';

      if (selectedPaymentType === 'card') {
        const paymentMethod = paymentMethods.find(method => method.id === selectedPaymentId);
        if (!paymentMethod) {
          throw new Error('El método de pago seleccionado no es válido');
        }
        paymentMethodId = paymentMethod.stripePaymentMethodId;
      } else if (selectedPaymentType === 'new_card') {
        // Para tarjeta nueva, validamos campos y creamos el PaymentMethod
        if (!newCardData.cardholderName) {
          throw new Error('Ingresa el nombre del titular de la tarjeta');
        }

        if (!newCardData.isComplete) {
          throw new Error('Completa los datos de la tarjeta');
        }

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

        paymentMethodId = paymentMethod.id;
        cardholderName = newCardData.cardholderName;
      }

      // Preparar datos de la orden
      const orderData = {
        userId: uid,
        items: items.map(item => ({
          id: item.id,
          name: item.name || item.title,
          price: item.price,
          image: item.image || item.mainImage,
          category: item.category,
          quantity: item.quantity,
          stock: item.stock || 0
        })),
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
        notes: orderNotes,
        totals: {
          subtotal: subtotal,
          tax: taxes,
          shipping: shipping,
          total: finalTotal // Total incluyendo envío
        },
        status: 'pending', // Aseguramos que el estado inicial sea 'pending'
        createdAt: new Date() // Aseguramos que tenga fecha de creación
      };

      // Verificar que el total sea válido
      if (!orderData.totals.total || orderData.totals.total <= 0) {
        throw new Error('El total de la orden es inválido. Verifica los productos en tu carrito.');
      }

      // Procesar la orden
      const result = await processPayment(
        orderData,
        paymentMethodId,
        selectedPaymentType === 'new_card' && newCardData.saveCard,
        selectedPaymentType,
        selectedPaymentType === 'oxxo' ? fiscalData.email || '' : null
      );

      if (!result.ok) {
        // Si hay productos sin stock, mostrar mensaje amigable
        if (result.outOfStockItems && result.outOfStockItems.length > 0) {
          // Crear un mensaje más amigable sin mostrar cantidades específicas
          const productNames = result.outOfStockItems.map(item => item.name).join(', ');

          // Si hay varios productos
          if (result.outOfStockItems.length > 1) {
            throw new Error(`Algunos productos en tu carrito no están disponibles en este momento. Por favor, revisa tu carrito y ajusta tu pedido.`);
          }
          // Si hay solo un producto
          else {
            throw new Error(`"${productNames}" no está disponible en la cantidad solicitada. Por favor, ajusta la cantidad en tu carrito.`);
          }
        }

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
    uid, items, dispatch,
    subtotal, taxes, shipping, finalTotal, validateItemsStock
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
    setError, // Exponemos setError para permitir que componentes hijos limpien el error
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