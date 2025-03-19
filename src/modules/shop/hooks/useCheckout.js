import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig';
import { addMessage } from '../../../store/messages/messageSlice';
import { clearCartWithSync } from '../../../store/cart/cartThunk';
import { useCart } from '../../user/hooks/useCart';

/**
 * Hook personalizado para manejar el proceso de checkout
 * Gestiona la selección de dirección, método de pago, y procesamiento de la orden
 */
export const useCheckout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const functions = getFunctions();

  // Obtener información del usuario desde Redux
  const { uid, status } = useSelector(state => state.auth);

  // Obtener información del carrito
  const {
    items,
    subtotal,
    taxes,
    shipping,
    finalTotal,
    isFreeShipping,
    hasOutOfStockItems,
  } = useCart();

  // Estados para el checkout
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [fiscalData, setFiscalData] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [step, setStep] = useState(1); // 1: checkout, 2: processing, 3: confirmation
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // Verificar que el usuario esté autenticado
  useEffect(() => {
    if (status !== 'authenticated') {
      navigate('/auth/login?redirect=checkout');
    }
  }, [status, navigate]);

  // Verificar que haya productos en el carrito
  useEffect(() => {
    if (items.length === 0 && status === 'authenticated') {
      navigate('/shop');
    }
  }, [items, status, navigate]);

  // Cargar direcciones del usuario
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (status !== 'authenticated' || !uid) return;

      setLoadingAddresses(true);
      try {
        const { getUserAddresses } = await import('../../user/services/addressService');
        const result = await getUserAddresses(uid);

        if (result.ok) {
          setAddresses(result.data);
        } else {
          console.error("Error al cargar direcciones:", result.error);
          dispatch(addMessage({
            type: 'error',
            text: 'No se pudieron cargar tus direcciones de envío'
          }));
        }
      } catch (error) {
        console.error("Error al cargar direcciones:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadUserAddresses();
  }, [uid, status, dispatch]);

  // Cargar métodos de pago del usuario
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (status !== 'authenticated' || !uid) return;

      setLoadingPayments(true);
      try {
        const { getUserPaymentMethods } = await import('../../user/services/paymentService');
        const result = await getUserPaymentMethods(uid);

        if (result.ok) {
          setPaymentMethods(result.data);
        } else {
          console.error("Error al cargar métodos de pago:", result.error);
          dispatch(addMessage({
            type: 'error',
            text: 'No se pudieron cargar tus métodos de pago'
          }));
        }
      } catch (error) {
        console.error("Error al cargar métodos de pago:", error);
      } finally {
        setLoadingPayments(false);
      }
    };

    loadPaymentMethods();
  }, [uid, status, dispatch]);

  // Actualizar la dirección seleccionada cuando cambia el ID
  const updateSelectedAddress = useCallback((addresses, addressId) => {
    if (!addresses || !addressId) return;

    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddress(address);
    }
  }, []);

  // Actualizar el método de pago seleccionado cuando cambia el ID
  const updateSelectedPayment = useCallback((paymentMethods, paymentId) => {
    if (!paymentMethods || !paymentId) return;

    const payment = paymentMethods.find(method => method.id === paymentId);
    if (payment) {
      setSelectedPayment(payment);
    }
  }, []);

  // Manejar cambio de dirección
  const handleAddressChange = useCallback((addressId) => {
    setSelectedAddressId(addressId);
    updateSelectedAddress(addresses, addressId);
  }, [updateSelectedAddress, addresses]);

  // Manejar cambio de método de pago
  const handlePaymentChange = useCallback((paymentId) => {
    setSelectedPaymentId(paymentId);
    updateSelectedPayment(paymentMethods, paymentId);
  }, [updateSelectedPayment, paymentMethods]);

  // Manejar cambio en requerimiento de factura
  const handleInvoiceChange = useCallback((requires) => {
    setRequiresInvoice(requires);

    // Si ya no requiere factura, limpiar los datos fiscales
    if (!requires) {
      setFiscalData(null);
    }
  }, []);

  // Manejar datos fiscales
  const handleFiscalDataChange = useCallback((data) => {
    setFiscalData(data);
  }, []);

  // Manejar notas del pedido
  const handleNotesChange = useCallback((e) => {
    setOrderNotes(e.target.value);
  }, []);

  // Validar que todo esté completo para procesar la orden
  const validateCheckoutData = useCallback(() => {
    if (!selectedAddressId || !selectedAddress) {
      setError('Debes seleccionar una dirección de envío');
      return false;
    }

    if (!selectedPaymentId || !selectedPayment) {
      setError('Debes seleccionar un método de pago');
      return false;
    }

    if (requiresInvoice && (!fiscalData || !fiscalData.rfc)) {
      setError('Los datos fiscales son requeridos para la factura');
      return false;
    }

    if (hasOutOfStockItems) {
      setError('Hay productos sin stock en tu carrito');
      return false;
    }

    if (!stripe || !elements) {
      setError('El sistema de pagos no está listo. Por favor, intenta de nuevo.');
      return false;
    }

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

  // Preparar los datos de la orden
  const prepareOrderData = useCallback(() => {
    // Crear copia de la información de la dirección
    const shippingInfo = {
      addressId: selectedAddressId,
      address: { ...selectedAddress },
      method: 'standard',
      cost: isFreeShipping ? 0 : shipping,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 días después
    };

    // Crear copia limitada de la información del método de pago (por seguridad)
    const paymentInfo = {
      methodId: selectedPaymentId,
      method: {
        type: selectedPayment.type,
        last4: selectedPayment.cardNumber.split(' ').pop(),
        brand: selectedPayment.type
      },
      status: 'pending',
      stripePaymentMethodId: selectedPayment.stripePaymentMethodId
    };

    // Información de facturación
    const billingInfo = {
      requiresInvoice,
      fiscalData: requiresInvoice ? fiscalData : null
    };

    // Datos completos de la orden
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

  // Procesar la orden
  const handleProcessOrder = useCallback(async () => {
    // Validar datos
    if (!validateCheckoutData()) {
      return;
    }

    setIsProcessing(true);
    setStep(2);

    try {
      // 1. Preparar datos de la orden
      const orderData = prepareOrderData();

      // 2. Crear PaymentIntent en Stripe a través de nuestra Cloud Function
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
      const paymentResponse = await createPaymentIntent({
        amount: Math.round(orderData.totals.total * 100), // Convertir a centavos y redondear
        paymentMethodId: orderData.payment.stripePaymentMethodId,
        description: `Pedido en Cactilia`
      });

      if (!paymentResponse.data || !paymentResponse.data.clientSecret) {
        throw new Error("No se pudo crear el intento de pago");
      }

      const { clientSecret, paymentIntentId } = paymentResponse.data;
      setClientSecret(clientSecret);

      // 3. Guardar la orden en Firestore con el ID del PaymentIntent
      const orderToSave = {
        ...orderData,
        payment: {
          ...orderData.payment,
          paymentIntentId
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const orderRef = await addDoc(collection(FirebaseDB, 'orders'), orderToSave);
      setOrderId(orderRef.id);

      // 4. Confirmar el pago con Stripe
      const { error: stripeError } = await stripe.confirmCardPayment(
        clientSecret, {
          payment_method: orderData.payment.stripePaymentMethodId
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 5. Confirmar el resultado del pago mediante nuestra Cloud Function
      const confirmOrderPayment = httpsCallable(functions, 'confirmOrderPayment');
      const confirmResult = await confirmOrderPayment({
        orderId: orderRef.id,
        paymentIntentId
      });

      if (!confirmResult.data || !confirmResult.data.success) {
        throw new Error("Error al confirmar el pago");
      }

      // 6. Mostrar mensaje de éxito y limpiar el carrito
      dispatch(addMessage({
        type: 'success',
        text: '¡Pago completado con éxito! Tu pedido ha sido procesado.',
        autoHide: true,
        duration: 5000
      }));

      dispatch(clearCartWithSync());

      // 7. Cambiar a paso de confirmación
      setStep(3);

    } catch (err) {
      console.error('Error al procesar la orden:', err);
      setError(err.message || 'Error al procesar tu orden. Por favor, intenta de nuevo.');

      dispatch(addMessage({
        type: 'error',
        text: err.message || 'Error al procesar el pago.',
        autoHide: true,
        duration: 5000
      }));

      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  }, [
    validateCheckoutData,
    prepareOrderData,
    dispatch,
    functions,
    stripe,
    FirebaseDB
  ]);

  return {
    // Estados
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

    // Manejadores
    handleAddressChange,
    handlePaymentChange,
    handleInvoiceChange,
    handleFiscalDataChange,
    handleNotesChange,
    handleProcessOrder,

    // Selectores auxiliares
    updateSelectedAddress,
    updateSelectedPayment
  };
};