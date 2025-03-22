/**
 * useCheckout.js
 *
 * Hook personalizado para manejar el flujo de checkout:
 * - Selección de dirección de envío
 * - Selección de método de pago
 * - Facturación (factura / fiscalData)
 * - Creación de orden en Firestore
 * - Creación/confirmación de PaymentIntent con Stripe (o mocks en dev)
 *
 * Finalmente, redirige a la página de confirmación con el ID del pedido.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements } from '@stripe/react-stripe-js';

import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator
} from 'firebase/functions';
import {
  addDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';

import { FirebaseDB } from '../../../firebase/firebaseConfig';
import { addMessage } from '../../../store/messages/messageSlice';
import { clearCartWithSync } from '../../../store/cart/cartThunk';
import { useCart } from '../../user/hooks/useCart';

import {
  mockCreatePaymentIntent,
  mockConfirmOrderPayment,
  shouldUseMocks
} from '../../user/services/stripeMock.js';

/**
 * @function useCheckout
 * @returns {Object} Estado y funciones para manejar el flujo de Checkout.
 */
export const useCheckout = () => {
  // -------------------------------------------------------------------------
  // React/Redux/Firebase Hooks
  // -------------------------------------------------------------------------
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();     // Manejo de pagos con Stripe
  const elements = useElements(); // Para manejar el form de tarjeta (Stripe Elements)

  // Obtener las funciones de Firebase
  const functions = getFunctions();

  // -------------------------------------------------------------------------
  // Conectar al emulador de funciones en desarrollo
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const hasConnected = useRef(false);

    useEffect(() => {
      if (!hasConnected.current) {
        try {
          connectFunctionsEmulator(functions, 'localhost', 5001);
          console.log('Connected to Firebase Functions emulator');
          hasConnected.current = true;
        } catch (e) {
          console.log(
            'Emulator connection error (can be ignored if already connected):',
            e
          );
        }
      }
    }, [functions]);
  }

  // -------------------------------------------------------------------------
  // Data del usuario autenticado
  // -------------------------------------------------------------------------
  const { uid, status } = useSelector(state => state.auth);

  // -------------------------------------------------------------------------
  // Datos del carrito
  // -------------------------------------------------------------------------
  const {
    items,
    subtotal,
    taxes,
    shipping,
    finalTotal,
    isFreeShipping,
    hasOutOfStockItems,
  } = useCart();

  // -------------------------------------------------------------------------
  // Estados locales
  // -------------------------------------------------------------------------
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [fiscalData, setFiscalData] = useState(null);

  const [orderNotes, setOrderNotes] = useState('');
  const [step, setStep] = useState(1);   // 1: Formulario, 2: Procesando
  const [error, setError] = useState(null);

  // ID del pedido en Firestore
  const [orderId, setOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Almacena el clientSecret de Stripe si fuera necesario
  const [clientSecret, setClientSecret] = useState(null);

  // Listas de direcciones y métodos de pago del usuario
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Banderas para mostrar loaders mientras se cargan direcciones y métodos de pago
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // -------------------------------------------------------------------------
  // Efecto: Verificar que el usuario esté autenticado
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (status !== 'authenticated') {
      // Si no está autenticado, se redirige al login con redirect=checkout
      navigate('/auth/login?redirect=checkout');
    }
  }, [status, navigate]);

  // -------------------------------------------------------------------------
  // Efecto: Verificar que el carrito tenga items
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (items.length === 0 && status === 'authenticated') {
      // Si el carrito está vacío y el usuario sí está autenticado,
      // lo enviamos a la página de tienda.
      navigate('/shop');
    }
  }, [items, status, navigate]);

  // -------------------------------------------------------------------------
  // Efecto: Cargar direcciones de envío del usuario
  // -------------------------------------------------------------------------
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (status !== 'authenticated' || !uid) return;

      setLoadingAddresses(true);
      try {
        // Importación dinámica del servicio de direcciones
        const { getUserAddresses } = await import('../../user/services/addressService');
        const result = await getUserAddresses(uid);

        if (result.ok) {
          setAddresses(result.data);
        } else {
          console.error('Error loading addresses:', result.error);
          dispatch(
            addMessage({
              type: 'error',
              text: 'Could not load your shipping addresses'
            })
          );
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadUserAddresses();
  }, [uid, status, dispatch]);

  // -------------------------------------------------------------------------
  // Efecto: Cargar métodos de pago del usuario
  // -------------------------------------------------------------------------
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (status !== 'authenticated' || !uid) return;

      setLoadingPayments(true);
      try {
        // Importación dinámica del servicio de métodos de pago
        const { getUserPaymentMethods } = await import('../../user/services/paymentService');
        const result = await getUserPaymentMethods(uid);

        if (result.ok) {
          setPaymentMethods(result.data);
        } else {
          console.error('Error loading payment methods:', result.error);
          dispatch(
            addMessage({
              type: 'error',
              text: 'Could not load your payment methods'
            })
          );
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      } finally {
        setLoadingPayments(false);
      }
    };

    loadPaymentMethods();
  }, [uid, status, dispatch]);

  // -------------------------------------------------------------------------
  // Helpers: Actualizar dirección seleccionada
  // -------------------------------------------------------------------------
  const updateSelectedAddress = useCallback((addressesList, addressId) => {
    if (!addressesList || !addressId) return;
    const address = addressesList.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddress(address);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Helpers: Actualizar método de pago seleccionado
  // -------------------------------------------------------------------------
  const updateSelectedPayment = useCallback((paymentList, paymentId) => {
    if (!paymentList || !paymentId) return;
    const payment = paymentList.find(method => method.id === paymentId);
    if (payment) {
      setSelectedPayment(payment);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Manejo de cambios en dirección y método de pago
  // -------------------------------------------------------------------------
  const handleAddressChange = useCallback(
    (addressId) => {
      setSelectedAddressId(addressId);
      updateSelectedAddress(addresses, addressId);
    },
    [updateSelectedAddress, addresses]
  );

  const handlePaymentChange = useCallback(
    (paymentId) => {
      setSelectedPaymentId(paymentId);
      updateSelectedPayment(paymentMethods, paymentId);
    },
    [updateSelectedPayment, paymentMethods]
  );

  // -------------------------------------------------------------------------
  // Manejo de la facturación
  // -------------------------------------------------------------------------
  const handleInvoiceChange = useCallback((requires) => {
    setRequiresInvoice(requires);
    // Si ya no requiere factura, limpiamos los datos fiscales
    if (!requires) {
      setFiscalData(null);
    }
  }, []);

  const handleFiscalDataChange = useCallback((data) => {
    setFiscalData(data);
  }, []);

  // -------------------------------------------------------------------------
  // Manejo de las notas del pedido
  // -------------------------------------------------------------------------
  const handleNotesChange = useCallback((e) => {
    setOrderNotes(e.target.value);
  }, []);

  // -------------------------------------------------------------------------
  // Validar que el Checkout esté completo antes de procesar
  // -------------------------------------------------------------------------
  const validateCheckoutData = useCallback(() => {
    if (!selectedAddressId || !selectedAddress) {
      setError('You must select a shipping address');
      return false;
    }
    if (!selectedPaymentId || !selectedPayment) {
      setError('You must select a payment method');
      return false;
    }
    if (requiresInvoice && (!fiscalData || !fiscalData.rfc)) {
      setError('Fiscal data is required for invoicing');
      return false;
    }
    if (hasOutOfStockItems) {
      setError('There are out-of-stock items in your cart');
      return false;
    }
    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return false;
    }

    // Si todo pasa...
    setError(null);
    return true;
  }, [
    selectedAddressId,
    selectedAddress,
    selectedPaymentId,
    selectedPayment,
    requiresInvoice,
    fiscalData,
    hasOutOfStockItems,
    stripe,
    elements
  ]);

  // -------------------------------------------------------------------------
  // Preparar el objeto "orderData" para guardar en Firestore
  // -------------------------------------------------------------------------
  const prepareOrderData = useCallback(() => {
    const shippingInfo = {
      addressId: selectedAddressId,
      address: { ...selectedAddress },
      method: 'standard',
      cost: isFreeShipping ? 0 : shipping,
      // Ejemplo de fecha estimada a 7 días
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    };

    const paymentInfo = {
      methodId: selectedPaymentId,
      method: {
        type: selectedPayment.type,
        last4: selectedPayment.cardNumber.split(' ').pop(),
        brand: selectedPayment.type,
      },
      status: 'pending',
      stripePaymentMethodId: selectedPayment.stripePaymentMethodId,
    };

    const billingInfo = {
      requiresInvoice,
      fiscalData: requiresInvoice ? fiscalData : null,
    };

    // Objeto principal de la orden
    return {
      userId: uid,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shipping: shippingInfo,
      payment: paymentInfo,
      billing: billingInfo,
      totals: {
        subtotal,
        tax: taxes,
        shipping: isFreeShipping ? 0 : shipping,
        discount: 0,
        total: finalTotal
      },
      notes: orderNotes,
      status: 'pending',
      createdAt: new Date()
    };
  }, [
    selectedAddressId,
    selectedAddress,
    selectedPaymentId,
    selectedPayment,
    requiresInvoice,
    fiscalData,
    isFreeShipping,
    shipping,
    subtotal,
    taxes,
    finalTotal,
    orderNotes,
    uid,
    items
  ]);

  // -------------------------------------------------------------------------
  // Procesar el pedido (creación de PaymentIntent, guardado en Firestore, etc.)
  // -------------------------------------------------------------------------
  const handleProcessOrder = useCallback(async () => {
    // 1. Validar los datos de checkout
    if (!validateCheckoutData()) {
      return;
    }

    setIsProcessing(true);
    setStep(2); // Cambiamos a paso 2: procesando

    try {
      // 2. Preparar los datos de la orden
      const orderData = prepareOrderData();

      // 3. Crear PaymentIntent (mock o real)
      let paymentResponse;
      if (shouldUseMocks()) {
        console.log('Usando mock para createPaymentIntent');
        paymentResponse = await mockCreatePaymentIntent({
          amount: Math.round(orderData.totals.total * 100),
          paymentMethodId: orderData.payment.stripePaymentMethodId,
          description: 'Order at Cactilia',
        });
      } else {
        const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
        paymentResponse = await createPaymentIntent({
          amount: Math.round(orderData.totals.total * 100),
          paymentMethodId: orderData.payment.stripePaymentMethodId,
          description: 'Order at Cactilia',
        });
      }

      if (!paymentResponse.data || !paymentResponse.data.clientSecret) {
        throw new Error('Could not create payment intent');
      }

      const { clientSecret, paymentIntentId } = paymentResponse.data;
      console.log('PaymentIntent creado:', { clientSecret, paymentIntentId });

      // 4. Guardar la orden en Firestore con el paymentIntentId
      const orderToSave = {
        ...orderData,
        payment: {
          ...orderData.payment,
          paymentIntentId,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(FirebaseDB, 'orders'), orderToSave);
      setOrderId(orderRef.id);
      console.log('✅ Pedido creado exitosamente con ID:', orderRef.id);

      // 5. Confirmar pago con Stripe
      let stripeConfirmation;
      if (shouldUseMocks()) {
        // Mock de confirmación exitosa
        console.log('Usando mock para confirmCardPayment');
        stripeConfirmation = {
          paymentIntent: {
            id: paymentIntentId,
            status: 'succeeded'
          },
          error: null
        };
      } else {
        // Confirmación real
        stripeConfirmation = await stripe.confirmCardPayment(clientSecret, {
          payment_method: orderData.payment.stripePaymentMethodId
        });
        if (stripeConfirmation.error) {
          throw new Error(stripeConfirmation.error.message);
        }
      }

      // 6. Confirmar pago también con Cloud Function (mock o real)
      let confirmResult;
      if (shouldUseMocks()) {
        console.log('Usando mock para confirmOrderPayment');
        confirmResult = await mockConfirmOrderPayment({
          orderId: orderRef.id,
          paymentIntentId
        });
      } else {
        const confirmOrderPayment = httpsCallable(functions, 'confirmOrderPayment');
        confirmResult = await confirmOrderPayment({
          orderId: orderRef.id,
          paymentIntentId
        });
      }

      // 7. Mostrar mensaje de éxito, limpiar carrito y redirigir a la página de éxito
      dispatch(addMessage({
        type: 'success',
        text: 'Payment completed successfully! Your order has been processed.',
        autoHide: true,
        duration: 5000
      }));

      dispatch(clearCartWithSync());

      // IMPORTANTE: Redirigir a la ruta de éxito con el ID de la orden
      console.log('Redirigiendo a la página de éxito...');
      setTimeout(() => {
        navigate(`/shop/order-success/${orderRef.id}`, { replace: true });
      }, 100);

    } catch (err) {
      console.error('Error processing order:', err);
      setError(err.message || 'Error processing your order. Please try again.');

      dispatch(addMessage({
        type: 'error',
        text: err.message || 'Error processing payment.',
        autoHide: true,
        duration: 5000
      }));

      setStep(1); // Regresamos al paso 1 (formulario) si hubo error
    } finally {
      setIsProcessing(false);
    }
  }, [
    validateCheckoutData,
    prepareOrderData,
    dispatch,
    functions,
    stripe,
    navigate
  ]);

  // -------------------------------------------------------------------------
  // Retorno del hook
  // -------------------------------------------------------------------------
  return {
    // Estados que el componente Checkout necesita
    selectedAddressId,
    selectedPaymentId,
    requiresInvoice,
    fiscalData,
    orderNotes,
    step,
    error,
    orderId,
    isProcessing,
    addresses,
    paymentMethods,
    loadingAddresses,
    loadingPayments,

    // Funciones manejadoras
    handleAddressChange,
    handlePaymentChange,
    handleInvoiceChange,
    handleFiscalDataChange,
    handleNotesChange,
    handleProcessOrder,

    // Helpers expuestos (por si se necesitan en pruebas)
    updateSelectedAddress,
    updateSelectedPayment,
  };
};
