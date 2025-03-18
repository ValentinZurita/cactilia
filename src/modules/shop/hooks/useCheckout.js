import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { addMessage } from '../../../store/messages/messageSlice';
import { clearCartWithSync } from '../../../store/cart/cartThunk';
import { useCart } from '../../user/hooks/useCart';

/**
 * Hook personalizado para manejar el proceso de checkout
 * Gestiona la selección de dirección, método de pago, y procesamiento de la orden
 *
 * @returns {Object} - Estados y funciones para el checkout
 */
export const useCheckout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

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
    clearCart
  } = useCart();

  // Mock de direcciones y métodos de pago para pruebas
  const mockAddresses = [
    {
      id: 'addr1',
      name: 'Casa',
      street: 'Calle Principal 123',
      numExt: '456',
      colonia: 'Centro',
      city: 'Ciudad de México',
      state: 'CDMX',
      zip: '01000',
      isDefault: true
    },
    {
      id: 'addr2',
      name: 'Oficina',
      street: 'Av. Reforma',
      numExt: '222',
      colonia: 'Juárez',
      city: 'Ciudad de México',
      state: 'CDMX',
      zip: '06600',
      isDefault: false
    }
  ];

  const mockPaymentMethods = [
    {
      id: 'pay1',
      type: 'visa',
      cardNumber: '•••• •••• •••• 4242',
      expiryDate: '12/25',
      isDefault: true,
      stripePaymentMethodId: 'pm_mock_1'
    },
    {
      id: 'pay2',
      type: 'mastercard',
      cardNumber: '•••• •••• •••• 5555',
      expiryDate: '10/24',
      isDefault: false,
      stripePaymentMethodId: 'pm_mock_2'
    }
  ];

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
  const [addresses, setAddresses] = useState(mockAddresses);
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);

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

    setError(null);
    return true;
  }, [
    selectedAddressId,
    selectedAddress,
    selectedPaymentId,
    selectedPayment,
    requiresInvoice,
    fiscalData,
    hasOutOfStockItems
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
      status: 'pending'
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
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
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
      // Preparar datos de la orden
      const orderData = prepareOrderData();

      // Simular procesamiento de orden para pruebas
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear un ID de orden simulado
      const simulatedOrderId = `order_${Date.now()}`;
      setOrderId(simulatedOrderId);

      // Mostrar mensaje de éxito
      dispatch(addMessage({
        type: 'success',
        text: '¡Pago completado con éxito! Tu pedido ha sido procesado.',
        autoHide: true,
        duration: 5000
      }));

      // Limpiar el carrito
      dispatch(clearCartWithSync());

      // Cambiar a paso de confirmación
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
    dispatch
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