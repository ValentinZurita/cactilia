import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAsync } from '../../../hooks/useAsync.js';
import { processPayment } from '../services/index.js';
import { clearCartWithSync } from '../../cart/store/index.js'

/**
 * Hook para procesar órdenes en el checkout
 *
 * @param {Object} options - Opciones del procesamiento
 * @param {Object} options.auth - Información de autenticación
 * @param {Object} options.cart - Información del carrito (items, totales)
 * @param {Object} options.form - Datos del formulario de checkout
 * @param {Object} options.stripe - Instancia de Stripe
 * @param {Object} options.elements - Elementos Stripe
 * @returns {Object} - Funciones y estado para procesar órdenes
 */
export const useOrderProcessing = ({
                                     auth,
                                     cart,
                                     form,
                                     stripe,
                                     elements
                                   }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1); // 1: Formulario, 2: Procesando
  const [orderId, setOrderId] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  // Estado para el procesamiento asíncrono
  const {
    execute: processOrder,
    isPending: isProcessing,
    error,
    isSuccess,
    reset: resetProcessingState
  } = useAsync(async () => {
    // Validar entrada
    validateCheckoutData();

    // Verificar stock de productos
    validateProductStock();

    // Preparar datos
    const orderData = prepareOrderData();

    // Cambiar a paso de procesamiento
    setStep(2);

    // Crear orden y procesar pago
    const result = await createAndProcessOrder(orderData);

    // Guardar ID de orden y resultado
    if (result && result.orderId) {
      setOrderId(result.orderId);
      setOrderResult(result);
    }

    return result;
  });

  // Efecto para manejar navegación después de procesar orden
  useEffect(() => {
    if (orderResult && orderId) {
      const paymentType = form.selectedPaymentType;

      // Si el pago es exitoso, limpiar el carrito
      if (paymentType !== 'oxxo') {
        dispatch(clearCartWithSync());
      }

      // Redirigir a la página de éxito
      const redirectPath = paymentType === 'oxxo'
        ? `/shop/order-success/${orderId}?payment=oxxo`
        : `/shop/order-success/${orderId}`;

      navigate(redirectPath, { replace: true });
    }
  }, [orderResult, orderId, form.selectedPaymentType, dispatch, navigate]);

  // Validar datos del checkout
  const validateCheckoutData = useCallback(() => {
    // Validar dirección
    if (form.selectedAddressType === 'saved') {
      if (!form.selectedAddressId || !form.selectedAddress) {
        throw new Error('Debes seleccionar una dirección de envío');
      }
    } else if (form.selectedAddressType === 'new') {
      const requiredFields = ['name', 'street', 'city', 'state', 'zip'];
      const missingFields = requiredFields.filter(field => !form.newAddressData[field]);

      if (missingFields.length > 0) {
        throw new Error('Por favor completa todos los campos obligatorios de la dirección');
      }

      if (!/^\d{5}$/.test(form.newAddressData.zip)) {
        throw new Error('El código postal debe tener 5 dígitos');
      }
    } else {
      throw new Error('Debes seleccionar o ingresar una dirección de envío');
    }

    // Validar método de pago
    if (!form.selectedPaymentType) {
      throw new Error('Debes seleccionar un método de pago');
    }

    if (form.selectedPaymentType === 'card' && !form.selectedPaymentId) {
      throw new Error('Debes seleccionar una tarjeta');
    }

    if (form.selectedPaymentType === 'new_card') {
      if (!form.newCardData.cardholderName) {
        throw new Error('Debes ingresar el nombre del titular de la tarjeta');
      }

      if (!form.newCardData.isComplete) {
        throw new Error('Los datos de la tarjeta están incompletos o son inválidos');
      }
    }

    // Validar datos fiscales
    if (form.requiresInvoice && (!form.fiscalData.rfc || !form.fiscalData.businessName)) {
      throw new Error('Se requieren datos fiscales para la facturación');
    }

    // Validar Stripe
    if (!stripe || !elements) {
      throw new Error('El sistema de pagos no está listo. Por favor, inténtalo de nuevo.');
    }
  }, [form, stripe, elements]);

  // Validar stock de productos
  const validateProductStock = useCallback(() => {
    const outOfStockItems = cart.items.filter(item => item.stock === 0);

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.name).join(', ');
      throw new Error(`Productos sin existencia: ${itemNames}`);
    }

    // Verificar si hay productos con cantidad mayor que stock disponible
    const insufficientStockItems = cart.items.filter(item =>
      item.stock > 0 && item.quantity > item.stock
    );

    if (insufficientStockItems.length > 0) {
      const itemsList = insufficientStockItems.map(item =>
        `${item.name} (solicitados: ${item.quantity}, disponibles: ${item.stock})`
      ).join(', ');

      throw new Error(`Stock insuficiente para: ${itemsList}`);
    }
  }, [cart.items]);

  // Preparar datos de la orden
  const prepareOrderData = useCallback(() => {
    // Información de envío
    let shippingInfo = {
      method: 'standard',
      cost: cart.isFreeShipping ? 0 : cart.shipping,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    };

    // Agregar dirección según tipo
    if (form.selectedAddressType === 'saved') {
      shippingInfo = {
        ...shippingInfo,
        addressId: form.selectedAddressId,
        address: { ...form.selectedAddress },
        addressType: 'saved'
      };
    } else if (form.selectedAddressType === 'new') {
      shippingInfo = {
        ...shippingInfo,
        address: { ...form.newAddressData },
        addressType: 'new',
        saveForFuture: form.newAddressData.saveAddress
      };
    }

    // Información de pago según tipo
    let paymentInfo = {};

    if (form.selectedPaymentType === 'new_card') {
      paymentInfo = {
        type: 'card',
        newCard: true,
        cardholderName: form.newCardData.cardholderName,
        saveForFuture: form.newCardData.saveCard,
        status: 'pending'
      };
    } else if (form.selectedPaymentType === 'card') {
      paymentInfo = {
        type: 'card',
        methodId: form.selectedPaymentId,
        method: {
          type: form.selectedPayment.type,
          last4: form.selectedPayment.cardNumber.split(' ').pop(),
          brand: form.selectedPayment.type,
        },
        status: 'pending',
        stripePaymentMethodId: form.selectedPayment.stripePaymentMethodId,
      };
    } else if (form.selectedPaymentType === 'oxxo') {
      paymentInfo = {
        type: 'oxxo',
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
    }

    // Información fiscal
    const billingInfo = {
      requiresInvoice: form.requiresInvoice,
      fiscalData: form.requiresInvoice ? form.fiscalData : null,
    };

    // Objeto principal de la orden
    return {
      userId: auth.uid,
      items: cart.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        stock: item.stock // Añadir stock actual para verificación posterior
      })),
      shipping: shippingInfo,
      payment: paymentInfo,
      billing: billingInfo,
      totals: {
        subtotal: cart.subtotal,
        tax: cart.taxes,
        shipping: cart.isFreeShipping ? 0 : cart.shipping,
        discount: 0,
        total: cart.finalTotal
      },
      notes: form.orderNotes,
      status: 'pending',
      createdAt: new Date()
    };
  }, [auth, cart, form]);

  // Crear orden y procesar pago
  const createAndProcessOrder = useCallback(async (orderData) => {
    try {
      // Procesar según el tipo de pago
      if (form.selectedPaymentType === 'new_card') {
        // Crear Payment Method con Stripe Elements
        const cardElement = elements.getElement('CardElement');

        if (!cardElement) {
          throw new Error('No se pudo acceder al formulario de tarjeta');
        }

        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: form.newCardData.cardholderName
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        // Procesar orden con el nuevo método de pago
        return await processPayment(orderData, paymentMethod.id, form.newCardData.saveCard);
      }
      else if (form.selectedPaymentType === 'card') {
        // Usar método de pago guardado
        return await processPayment(orderData, form.selectedPayment.stripePaymentMethodId);
      }
      else if (form.selectedPaymentType === 'oxxo') {
        // Procesar con OXXO
        return await processPayment(orderData, null, false, 'oxxo', auth.email);
      }

      throw new Error('Tipo de pago no soportado');
    } catch (error) {
      setStep(1); // Volver al formulario en caso de error
      throw error;
    }
  }, [stripe, elements, form, auth]);

  return {
    step,
    orderId,
    isProcessing,
    isSuccess,
    error,
    processOrder,
    resetProcessingState
  };
};