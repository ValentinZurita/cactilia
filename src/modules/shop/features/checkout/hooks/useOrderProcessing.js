import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB } from '../../../../../firebase/firebaseConfig.js';
import { clearCartWithSync } from '../../../../../store/cart/cartThunk.js';
import { addMessage } from '../../../../../store/messages/messageSlice.js';
import { mockCreatePaymentIntent, mockConfirmOrderPayment, shouldUseMocks } from '../../../../user/services/stripeMock.js';

/**
 * Hook para el procesamiento de órdenes en el checkout
 *
 * @param {Object} options - Opciones y dependencias
 * @returns {Object} Funciones para procesamiento de órdenes
 */
export const useOrderProcessing = ({
                                     auth,
                                     items,
                                     subtotal,
                                     taxes,
                                     shipping,
                                     finalTotal,
                                     isFreeShipping,
                                     addressSelection,
                                     paymentSelection,
                                     fiscalData,
                                     orderNotes,
                                     stripe,
                                     elements,
                                     dispatch,
                                     setStep,
                                     setError,
                                     setOrderId,
                                     setIsProcessing,
                                     setClientSecret
                                   }) => {
  const navigate = useNavigate();
  const { uid } = auth;
  const functions = getFunctions();

  // Validar que todos los datos necesarios estén presentes
  const validateCheckoutData = useCallback(() => {
    // Validar dirección según el tipo seleccionado
    if (addressSelection.selectedAddressType === 'saved') {
      if (!addressSelection.selectedAddressId || !addressSelection.selectedAddress) {
        setError('Debes seleccionar una dirección de envío');
        return false;
      }
    } else if (addressSelection.selectedAddressType === 'new') {
      // Validar campos requeridos para dirección nueva
      const { newAddressData } = addressSelection;
      const requiredFields = ['name', 'street', 'city', 'state', 'zip'];
      const missingFields = requiredFields.filter(field => !newAddressData[field]);

      if (missingFields.length > 0) {
        setError('Por favor completa todos los campos obligatorios de la dirección');
        return false;
      }

      // Validación específica para código postal
      if (!/^\d{5}$/.test(newAddressData.zip)) {
        setError('El código postal debe tener 5 dígitos');
        return false;
      }
    } else {
      setError('Debes seleccionar o ingresar una dirección de envío');
      return false;
    }

    // Validar método de pago
    if (!paymentSelection.selectedPaymentType) {
      setError('Debes seleccionar un método de pago');
      return false;
    }

    // Si es tarjeta guardada, verificar que haya una seleccionada
    if (paymentSelection.selectedPaymentType === 'card' && !paymentSelection.selectedPaymentId) {
      setError('Debes seleccionar una tarjeta');
      return false;
    }

    // Si es tarjeta nueva, validar los datos
    if (paymentSelection.selectedPaymentType === 'new_card') {
      if (!paymentSelection.newCardData.cardholderName) {
        setError('Debes ingresar el nombre del titular de la tarjeta');
        return false;
      }

      if (!paymentSelection.newCardData.isComplete) {
        setError('Los datos de la tarjeta están incompletos o son inválidos');
        return false;
      }
    }

    // Validar datos fiscales si requiere factura
    if (fiscalData.requiresInvoice && (!fiscalData.data || !fiscalData.data.rfc)) {
      setError('Se requieren datos fiscales para la facturación');
      return false;
    }

    // Validar que no haya productos sin stock
    if (items.some(item => item.stock === 0)) {
      setError('Hay productos sin stock en tu carrito');
      return false;
    }

    // Validar que Stripe esté listo
    if (!stripe || !elements) {
      setError('El sistema de pagos no está listo. Por favor, inténtalo de nuevo.');
      return false;
    }

    // Si todo pasa...
    setError(null);
    return true;
  }, [
    addressSelection,
    paymentSelection,
    fiscalData,
    items,
    stripe,
    elements,
    setError
  ]);

  // Preparar el objeto de datos de la orden
  const prepareOrderData = useCallback(() => {
    // Información de envío según el tipo de dirección
    let shippingInfo = {
      method: 'standard',
      cost: isFreeShipping ? 0 : shipping,
      // Ejemplo de fecha estimada a 7 días
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    };

    if (addressSelection.selectedAddressType === 'saved') {
      // Usar dirección guardada
      shippingInfo = {
        ...shippingInfo,
        addressId: addressSelection.selectedAddressId,
        address: { ...addressSelection.selectedAddress },
        addressType: 'saved'
      };
    } else if (addressSelection.selectedAddressType === 'new') {
      // Usar dirección temporal
      shippingInfo = {
        ...shippingInfo,
        address: { ...addressSelection.newAddressData },
        addressType: 'new',
        saveForFuture: addressSelection.newAddressData.saveAddress
      };
    }

    // Información de pago según el tipo seleccionado
    let paymentInfo = {};

    if (paymentSelection.selectedPaymentType === 'new_card') {
      // Para tarjeta nueva sin guardar
      paymentInfo = {
        type: 'card',
        newCard: true,
        cardholderName: paymentSelection.newCardData.cardholderName,
        saveForFuture: paymentSelection.newCardData.saveCard,
        status: 'pending'
      };
    } else if (paymentSelection.selectedPaymentType === 'card') {
      // Para método de pago guardado
      paymentInfo = {
        type: 'card',
        methodId: paymentSelection.selectedPaymentId,
        method: {
          type: paymentSelection.selectedPayment.type,
          last4: paymentSelection.selectedPayment.cardNumber.split(' ').pop(),
          brand: paymentSelection.selectedPayment.type,
        },
        status: 'pending',
        stripePaymentMethodId: paymentSelection.selectedPayment.stripePaymentMethodId,
      };
    } else if (paymentSelection.selectedPaymentType === 'oxxo') {
      // Para pago en OXXO
      paymentInfo = {
        type: 'oxxo',
        status: 'pending',
        // El voucher se generará después del pago
        voucherUrl: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas de validez
      };
    }

    const billingInfo = {
      requiresInvoice: fiscalData.requiresInvoice,
      fiscalData: fiscalData.requiresInvoice ? fiscalData.data : null,
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
    addressSelection,
    paymentSelection,
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

  // Procesar el pedido completo
  const processOrder = useCallback(async () => {
    // 1. Validar los datos de checkout
    if (!validateCheckoutData()) {
      return;
    }

    setIsProcessing(true);
    setStep(2); // Cambiamos a paso 2: procesando

    try {
      // 2. Preparar los datos de la orden
      const orderData = prepareOrderData();

      // 3. Procesar el pago según el tipo seleccionado
      let paymentMethodId = null;
      let paymentResponse = null;

      if (paymentSelection.selectedPaymentType === 'new_card') {
        // Crear Payment Method con Stripe Elements para tarjeta nueva
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
          throw new Error('No se pudo acceder al formulario de tarjeta');
        }

        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: paymentSelection.newCardData.cardholderName
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        paymentMethodId = paymentMethod.id;

        // Guardar tarjeta si el usuario lo solicitó
        if (paymentSelection.newCardData.saveCard) {
          const savePaymentMethod = httpsCallable(functions, 'savePaymentMethod');

          await savePaymentMethod({
            paymentMethodId: paymentMethod.id,
            cardHolder: paymentSelection.newCardData.cardholderName,
            isDefault: false
          });
        }

        // Crear PaymentIntent para tarjeta
        if (shouldUseMocks()) {
          console.log('Usando mock para createPaymentIntent (tarjeta)');
          paymentResponse = await mockCreatePaymentIntent({
            amount: Math.round(orderData.totals.total * 100),
            paymentMethodId: paymentMethodId,
            description: 'Order at Cactilia',
          });
        } else {
          const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
          paymentResponse = await createPaymentIntent({
            amount: Math.round(orderData.totals.total * 100),
            paymentMethodId: paymentMethodId,
            description: 'Order at Cactilia',
          });
        }
      }
      else if (paymentSelection.selectedPaymentType === 'card') {
        // Usar método de pago guardado
        paymentMethodId = orderData.payment.stripePaymentMethodId;

        // Crear PaymentIntent para tarjeta guardada
        if (shouldUseMocks()) {
          console.log('Usando mock para createPaymentIntent (tarjeta guardada)');
          paymentResponse = await mockCreatePaymentIntent({
            amount: Math.round(orderData.totals.total * 100),
            paymentMethodId: paymentMethodId,
            description: 'Order at Cactilia',
          });
        } else {
          const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
          paymentResponse = await createPaymentIntent({
            amount: Math.round(orderData.totals.total * 100),
            paymentMethodId: paymentMethodId,
            description: 'Order at Cactilia',
          });
        }
      }
      else if (paymentSelection.selectedPaymentType === 'oxxo') {
        // Crear PaymentIntent para OXXO
        if (shouldUseMocks()) {
          console.log('Usando mock para createOxxoPaymentIntent');
          // Simulamos la respuesta para OXXO en modo de desarrollo
          paymentResponse = {
            data: {
              clientSecret: `oxxo_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`,
              paymentIntentId: `pi_oxxo_mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
              // En un entorno real, Stripe retornaría una URL para el voucher de OXXO
              voucherUrl: 'https://example.com/oxxo-voucher.pdf'
            }
          };
        } else {
          // En producción, deberemos llamar a una Cloud Function que cree un PaymentIntent
          // con método de pago tipo 'oxxo'
          const createOxxoPaymentIntent = httpsCallable(functions, 'createOxxoPaymentIntent');
          paymentResponse = await createOxxoPaymentIntent({
            amount: Math.round(orderData.totals.total * 100),
            description: 'Order at Cactilia',
            customer_email: auth.email, // Necesario para que Stripe envíe el correo con el voucher
          });
        }

        // Guardamos la URL del voucher para mostrarlo después
        if (paymentResponse.data && paymentResponse.data.voucherUrl) {
          orderData.payment.voucherUrl = paymentResponse.data.voucherUrl;
        }
      }

      if (!paymentResponse || !paymentResponse.data || !paymentResponse.data.clientSecret) {
        throw new Error('No se pudo crear el intento de pago');
      }

      const { clientSecret, paymentIntentId } = paymentResponse.data;
      setClientSecret(clientSecret);

      // 4. Guardar la orden en Firestore con el paymentIntentId
      const orderToSave = {
        ...orderData,
        payment: {
          ...orderData.payment,
          paymentIntentId,
          paymentMethodId: paymentMethodId || null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(FirebaseDB, 'orders'), orderToSave);
      setOrderId(orderRef.id);

      // 5. Confirmar el pago según el tipo seleccionado
      let stripeConfirmation = null;

      if (paymentSelection.selectedPaymentType === 'card' || paymentSelection.selectedPaymentType === 'new_card') {
        // Confirmar el pago para tarjetas
        if (shouldUseMocks()) {
          console.log('Usando mock para confirmCardPayment');
          stripeConfirmation = {
            paymentIntent: {
              id: paymentIntentId,
              status: 'succeeded'
            },
            error: null
          };
        } else {
          stripeConfirmation = await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethodId
          });

          if (stripeConfirmation.error) {
            throw new Error(stripeConfirmation.error.message);
          }
        }
      }
      else if (paymentSelection.selectedPaymentType === 'oxxo') {
        // Para OXXO no se confirma el pago, solo se genera el voucher
        if (shouldUseMocks()) {
          console.log('Usando mock para confirmOxxoPayment');
          stripeConfirmation = {
            paymentIntent: {
              id: paymentIntentId,
              status: 'requires_payment' // Estado especial para OXXO
            },
            error: null
          };
        } else {
          // No hay confirmación inmediata para OXXO, pero sí podemos
          // confirmar que se ha creado el voucher correctamente
          const oxxoPaymentResult = await stripe.confirmOxxoPayment(clientSecret, {
            payment_method: {
              billing_details: {
                name: `${auth.displayName || 'Cliente'}`,
                email: auth.email || '',
              }
            }
          });

          if (oxxoPaymentResult.error) {
            throw new Error(oxxoPaymentResult.error.message);
          }

          stripeConfirmation = oxxoPaymentResult;
        }
      }

      // 6. Informar a nuestra Cloud Function sobre el estado del pago
      let confirmResult;
      if (shouldUseMocks()) {
        console.log('Usando mock para confirmOrderPayment');
        confirmResult = await mockConfirmOrderPayment({
          orderId: orderRef.id,
          paymentIntentId,
          paymentType: paymentSelection.selectedPaymentType
        });
      } else {
        const confirmOrderPayment = httpsCallable(functions, 'confirmOrderPayment');
        confirmResult = await confirmOrderPayment({
          orderId: orderRef.id,
          paymentIntentId,
          paymentType: paymentSelection.selectedPaymentType
        });
      }

      // 7. Guardar la dirección nueva si el usuario lo solicitó
      if (addressSelection.selectedAddressType === 'new' && addressSelection.newAddressData.saveAddress) {
        try {
          const saveAddress = httpsCallable(functions, 'saveAddress');

          await saveAddress({
            address: addressSelection.newAddressData,
            isDefault: false
          });
        } catch (error) {
          console.error('Error al guardar la dirección:', error);
          // No interrumpimos el flujo principal si falla el guardado
        }
      }

      // 8. Mensaje y limpiar carrito
      if (paymentSelection.selectedPaymentType === 'oxxo') {
        dispatch(addMessage({
          type: 'success',
          text: 'Pedido registrado correctamente. Revisa tu correo para el voucher de pago OXXO.',
          autoHide: true,
          duration: 8000
        }));
      } else {
        dispatch(clearCartWithSync());

        dispatch(addMessage({
          type: 'success',
          text: '¡Pedido completado correctamente!',
          autoHide: true,
          duration: 5000
        }));
      }

      // 9. Redireccionar
      setTimeout(() => {
        if (paymentSelection.selectedPaymentType === 'oxxo') {
          navigate(`/shop/order-success/${orderRef.id}?payment=oxxo`, { replace: true });
        } else {
          navigate(`/shop/order-success/${orderRef.id}`, { replace: true });
        }
      }, 100);

    } catch (err) {
      console.error('Error procesando orden:', err);
      setError(err.message || 'Error procesando tu pedido. Por favor intenta de nuevo.');

      dispatch(addMessage({
        type: 'error',
        text: err.message || 'Error procesando el pago.',
        autoHide: true,
        duration: 5000
      }));

      setStep(1); // Regresamos al paso 1 (formulario) si hubo error
      setIsProcessing(false);
    }
  }, [
    validateCheckoutData,
    prepareOrderData,
    addressSelection,
    paymentSelection,
    auth,
    stripe,
    elements,
    functions,
    navigate,
    dispatch,
    orderNotes,
    finalTotal,
    shipping,
    isFreeShipping,
    subtotal,
    taxes,
    uid,
    items,
    setClientSecret,
    setError,
    setIsProcessing,
    setOrderId,
    setStep
  ]);

  return {
    processOrder
  };
};