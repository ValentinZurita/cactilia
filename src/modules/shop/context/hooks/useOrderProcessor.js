import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { processPayment } from '../../features/checkout/services/index.js';
import { clearCartWithSync } from '../../features/cart/store/index.js';
import { validateItemsStock } from '../../services/productServices.js';

/**
 * Hook personalizado para la lógica de procesamiento de órdenes
 *
 * Centraliza toda la lógica relacionada con:
 * - Validación de datos antes de procesar
 * - Verificación de stock en tiempo real
 * - Proceso de pago y creación de orden
 * - Manejo de errores durante el proceso
 *
 * @param {Object} params - Parámetros necesarios
 * @returns {Object} Métodos para procesamiento de órdenes
 */
export const useOrderProcessor = ({
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
                                  }) => {
  const dispatch = useDispatch();

  /**
   * Procesa la orden completa: validación, pago y redirección
   */
  const processOrder = useCallback(async () => {
    if (!stripe || !elements) {
      setError('El sistema de pagos no está listo. Por favor, inténtalo de nuevo.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Verificar stock en tiempo real
      await validateStockBeforeCheckout(cart.items);

      // 2. Validar información necesaria
      validateCheckoutData();

      // 3. Cambiar al paso de procesamiento
      setStep(2);

      // 4. Preparar datos de la orden
      const orderData = prepareOrderData();

      // 5. Procesar el pago
      const result = await createAndProcessOrder(orderData);

      // 6. Establecer ID de la orden resultado
      setOrderId(result.orderId);

      // 7. Si es OXXO, no limpiar el carrito
      if (paymentManager.selectedPaymentType !== 'oxxo') {
        dispatch(clearCartWithSync());
      }

      // 8. Redirectionar a página de éxito (esto se hace en el componente superior)
      return result;
    } catch (error) {
      console.error('Error en processOrder:', error);
      setError(error.message || 'Error desconocido al procesar la orden');
      setStep(1); // Volver al paso de formulario en caso de error
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  }, [
    stripe, elements, cart,
    addressManager, paymentManager, billingManager,
    orderNotes, uid, dispatch
  ]);

  /**
   * Verifica el stock antes de procesar el checkout
   * @param {Array} items - Items del carrito
   */
  const validateStockBeforeCheckout = async (items) => {
    try {
      const stockCheck = await validateItemsStock(items);

      if (!stockCheck.valid) {
        // Formatear un mensaje de error amigable
        let errorMessage = 'Algunos productos no están disponibles en la cantidad solicitada.';

        if (stockCheck.outOfStockItems && stockCheck.outOfStockItems.length === 1) {
          const item = stockCheck.outOfStockItems[0];
          errorMessage = `"${item.name}" no está disponible en la cantidad solicitada. Solo hay ${item.currentStock || 0} unidades disponibles.`;
        }

        throw new Error(errorMessage);
      }

      // La validación de stock fue exitosa
      // No necesitamos la verificación local adicional, ya que duplica el proceso
      // y puede causar errores. Si decidimos mantenerla, debemos asegurarnos
      // de que ambas validaciones sean coherentes.

      // Ejemplo seguro de verificación local opcional:
      if (cart.hasStockIssues) {
        throw new Error('Hay problemas de stock en tu carrito. Por favor revisa las cantidades.');
      }

      return true; // Devolver un resultado exitoso
    } catch (error) {
      // Capturar cualquier error y relanzarlo para que se maneje adecuadamente
      console.error('Error en validateStockBeforeCheckout:', error);
      throw error;
    }
  };

  /**
   * Valida que todos los datos necesarios para el checkout estén presentes
   */
  const validateCheckoutData = () => {
    // Validar dirección según tipo
    if (addressManager.selectedAddressType === 'saved') {
      if (!addressManager.selectedAddressId || !addressManager.selectedAddress) {
        throw new Error('La dirección seleccionada no es válida');
      }
    } else if (addressManager.selectedAddressType === 'new') {
      // Validar campos obligatorios de dirección nueva
      const requiredFields = ['name', 'street', 'city', 'state', 'zip'];
      const missingFields = requiredFields.filter(field => !addressManager.newAddressData[field]);

      if (missingFields.length > 0) {
        throw new Error('Completa todos los campos obligatorios de la dirección');
      }
    } else {
      throw new Error('Selecciona una dirección de envío');
    }

    // Validar método de pago según tipo
    if (paymentManager.selectedPaymentType === 'card') {
      const paymentMethod = paymentManager.paymentMethods.find(
        method => method.id === paymentManager.selectedPaymentId
      );

      if (!paymentMethod) {
        throw new Error('El método de pago seleccionado no es válido');
      }
    } else if (paymentManager.selectedPaymentType === 'new_card') {
      // Validar campos de tarjeta nueva
      if (!paymentManager.newCardData.cardholderName) {
        throw new Error('Ingresa el nombre del titular de la tarjeta');
      }

      if (!paymentManager.newCardData.isComplete) {
        throw new Error('Completa los datos de la tarjeta');
      }
    } else if (paymentManager.selectedPaymentType !== 'oxxo') {
      throw new Error('Selecciona un método de pago válido');
    }

    // Validar facturación si es requerida
    if (billingManager.requiresInvoice) {
      if (!billingManager.fiscalData.rfc || !billingManager.fiscalData.businessName) {
        throw new Error('Completa los datos fiscales para la facturación');
      }
    }
  };

  /**
   * Prepara los datos de la orden para enviar al servidor
   * @returns {Object} Datos de la orden listos para procesar
   */
  const prepareOrderData = () => {
    // Obtener dirección según tipo
    let shippingAddress;
    if (addressManager.selectedAddressType === 'saved') {
      shippingAddress = { ...addressManager.selectedAddress };
    } else if (addressManager.selectedAddressType === 'new') {
      shippingAddress = { ...addressManager.newAddressData };
    } else {
      throw new Error('Selecciona una dirección de envío');
    }

    // Preparar datos de la orden
    return {
      userId: uid,
      items: cart.items.map(item => ({
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
        addressType: addressManager.selectedAddressType,
        saveForFuture: addressManager.selectedAddressType === 'new' &&
          addressManager.newAddressData.saveAddress
      },
      payment: {
        type: paymentManager.selectedPaymentType,
        methodId: paymentManager.selectedPaymentId,
        cardholderName: paymentManager.newCardData.cardholderName,
        saveForFuture: paymentManager.selectedPaymentType === 'new_card' &&
          paymentManager.newCardData.saveCard
      },
      billing: {
        requiresInvoice: billingManager.requiresInvoice,
        fiscalData: billingManager.requiresInvoice ? billingManager.fiscalData : null
      },
      notes: orderNotes,
      totals: {
        subtotal: cart.subtotal,
        tax: cart.taxes,
        shipping: cart.shipping,
        total: cart.finalTotal // Total incluyendo envío
      },
      status: 'pending',
      createdAt: new Date()
    };
  };

  /**
   * Crea la orden y procesa el pago
   * @param {Object} orderData - Datos completos de la orden
   * @returns {Object} Resultado del procesamiento
   */
  const createAndProcessOrder = async (orderData) => {
    try {
      // Verificar que el total sea válido
      if (!orderData.totals.total || orderData.totals.total <= 0) {
        throw new Error('El total de la orden es inválido. Verifica los productos en tu carrito.');
      }

      let paymentMethodId = null;

      // Procesar según el tipo de pago seleccionado
      if (paymentManager.selectedPaymentType === 'new_card') {
        const cardElement = elements.getElement('CardElement');

        if (!cardElement) {
          throw new Error('No se pudo acceder al formulario de tarjeta');
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: paymentManager.newCardData.cardholderName
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        paymentMethodId = paymentMethod.id;
      } else if (paymentManager.selectedPaymentType === 'card') {
        const paymentMethod = paymentManager.paymentMethods.find(
          method => method.id === paymentManager.selectedPaymentId
        );

        if (!paymentMethod) {
          throw new Error('El método de pago seleccionado no es válido');
        }

        paymentMethodId = paymentMethod.stripePaymentMethodId;
      }

      // Procesar la orden
      return await processPayment(
        orderData,
        paymentMethodId,
        paymentManager.selectedPaymentType === 'new_card' && paymentManager.newCardData.saveCard,
        paymentManager.selectedPaymentType,
        paymentManager.selectedPaymentType === 'oxxo' ? billingManager.fiscalData.email || '' : null
      );
    } catch (error) {
      // Si hay productos sin stock, mostrar mensaje amigable
      if (error.outOfStockItems && error.outOfStockItems.length > 0) {
        // Crear un mensaje más amigable sin mostrar cantidades específicas
        const productNames = error.outOfStockItems.map(item => item.name).join(', ');

        // Si hay varios productos
        if (error.outOfStockItems.length > 1) {
          throw new Error(`Algunos productos en tu carrito no están disponibles en este momento. Por favor, revisa tu carrito y ajusta tu pedido.`);
        }
        // Si hay solo un producto
        else {
          throw new Error(`"${productNames}" no está disponible en la cantidad solicitada. Por favor, ajusta la cantidad en tu carrito.`);
        }
      }

      throw error;
    }
  };

  return {
    processOrder
  };
};