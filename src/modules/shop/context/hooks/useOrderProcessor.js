import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { processPayment } from '@modules/checkout/checkout/services/index.js'
import { clearCartWithSync } from '../../features/cart/store/index.js'
import { validateItemsStock } from '../../services/productServices.js'
import { getAuth } from 'firebase/auth'
import { CardElement } from '@stripe/react-stripe-js'
import { apiService } from '../../services/api.js'
import { addAddress } from '@modules/user/services/addressService.js'

// Definir constante localmente
const ORDERS_COLLECTION = 'orders';

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
                                    setOrderId,
                                  }) => {
  const dispatch = useDispatch()

  /**
   * Procesa la orden completa.
   * Acepta la opción seleccionada y el costo TOTAL calculado.
   */
  const processOrder = useCallback(async (selectedOption, shippingCost) => {
    // === INICIO LOG ===
    console.log(`🅿️ [useOrderProcessor] processOrder RECIBIÓ:`, {
      optionId: selectedOption?.id,
      optionName: selectedOption?.name,
      optionInternalCost: selectedOption?.price ?? selectedOption?.totalCost ?? selectedOption?.calculatedCost,
      shippingCostArg: shippingCost, // Loggear el costo recibido
    })
    // === FIN LOG ===

    // Verificar que Stripe y Elements estén disponibles
    if (!stripe || !elements) {
      setError('El sistema de pagos no está listo. Por favor, inténtalo de nuevo.')
      return
    }

    // Limpiar errores previos, iniciar el estado de procesamiento y deshabilitar el botón
    // para evitar múltiples clics en el botón de pago
    setIsProcessing(true)
    setError(null)

    try {

      // 1. Verificar stock en tiempo real
      await validateStockBeforeCheckout(cart.items)

      // 2. Validar información necesaria
      validateCheckoutData()

      // 3. Cambiar al paso de procesamiento
      setStep(2)

      // 4. Preparar datos de la orden (pasando ambos argumentos)
      const orderData = prepareOrderData(selectedOption, shippingCost)

      // 5. Procesar el pago y crear la orden
      const result = await createAndProcessOrder(orderData)

      // 6. Si la orden se creó con éxito (tenemos orderId)
      if (result && result.orderId) {
        setOrderId(result.orderId)

        // <<<--- INICIO: Lógica para guardar dirección nueva si se marcó el checkbox --->>>
        // Log detallado ANTES de la condición
        console.log('[useOrderProcessor] Verificando si guardar dirección:', {
          selectedType: addressManager.selectedAddressType,
          shouldSave: addressManager.saveNewAddress,
          hasUid: !!uid,
          hasNewData: !!addressManager.newAddressData
        });

        if (
          addressManager.selectedAddressType === 'new' &&
          addressManager.saveNewAddress && 
          uid &&
          addressManager.newAddressData
        ) {
          // Log DENTRO de la condición
          console.log('[useOrderProcessor] CONDICIÓN CUMPLIDA: Intentando guardar dirección.');
          try {
            const dataToSave = { ...addressManager.newAddressData };
            
            console.log('[useOrderProcessor] Llamando a addAddress con:', uid, dataToSave);
            await addAddress(uid, dataToSave);
            console.log('[useOrderProcessor] Llamada a addAddress completada (sin error inmediato).');
          } catch (saveError) {
            console.error('[useOrderProcessor] Error DENTRO del bloque saveAddress:', saveError);
          }
        } else {
            // Log si la condición NO se cumple
            console.log('[useOrderProcessor] CONDICIÓN NO CUMPLIDA: No se intentará guardar dirección.');
        }
        // <<<--- FIN: Lógica para guardar dirección nueva --->>>

        // 7. Si es OXXO, no limpiar el carrito
        if (paymentManager.selectedPaymentType !== 'oxxo') {
          dispatch(clearCartWithSync())
        }

        // 8. Redirigir a la página de éxito usando window.location para una navegación forzada
        const redirectPath = paymentManager.selectedPaymentType === 'oxxo'
          ? `/shop/order-success/${result.orderId}?payment=oxxo`
          : `/shop/order-success/${result.orderId}`

        // Usar window.location para una redirección dura que evita problemas con React Router
        window.location.href = redirectPath
      }

      // 9. Devolver el resultado del procesamiento
      return result

    } catch (error) {
      console.error('Error en processOrder:', error)
      setError(error.message || 'Error desconocido al procesar la orden')
      setStep(1) // Volver al paso de formulario en caso de error
      return { success: false, error: error.message }

    } finally {
      setIsProcessing(false)
    }

  }, [
    stripe, elements, cart,
    addressManager, paymentManager, billingManager,
    orderNotes, uid, dispatch,
    setOrderId, setStep, setError, setIsProcessing
  ])

  /**
   * Verifica el stock antes de procesar el checkout
   * @param {Array} items - Items del carrito
   */
  const validateStockBeforeCheckout = async (items) => {
    try {
      const stockCheck = await validateItemsStock(items)

      if (!stockCheck.valid) {
        // Formatear un mensaje de error amigable
        let errorMessage = 'Algunos productos no están disponibles en la cantidad solicitada.'

        if (stockCheck.outOfStockItems && stockCheck.outOfStockItems.length === 1) {
          const item = stockCheck.outOfStockItems[0]
          errorMessage = `"${item.name}" no está disponible en la cantidad solicitada. Solo hay ${item.currentStock || 0} unidades disponibles.`
        }

        throw new Error(errorMessage)
      }

      // La validación de stock fue exitosa
      // No necesitamos la verificación local adicional, ya que duplica el proceso
      // y puede causar errores. Si decidimos mantenerla, debemos asegurarnos
      // de que ambas validaciones sean coherentes.

      // Ejemplo seguro de verificación local opcional:
      if (cart.hasStockIssues) {
        throw new Error('Hay problemas de stock en tu carrito. Por favor revisa las cantidades.')
      }

      return true // Devolver un resultado exitoso
    } catch (error) {
      // Capturar cualquier error y relanzarlo para que se maneje adecuadamente
      console.error('Error en validateStockBeforeCheckout:', error)
      throw error
    }
  }

  /**
   * Valida que todos los datos necesarios para el checkout estén presentes
   */
  const validateCheckoutData = () => {
    // Validar dirección según tipo
    if (addressManager.selectedAddressType === 'saved') {
      if (!addressManager.selectedAddressId || !addressManager.selectedAddress) {
        throw new Error('La dirección seleccionada no es válida')
      }
    } else if (addressManager.selectedAddressType === 'new') {
      // Validar campos obligatorios de dirección nueva
      const requiredFields = ['name', 'street', 'city', 'state', 'zip']
      const missingFields = requiredFields.filter(field => !addressManager.newAddressData[field])

      if (missingFields.length > 0) {
        throw new Error('Completa todos los campos obligatorios de la dirección')
      }
    } else {
      throw new Error('Selecciona una dirección de envío')
    }

    // Validar metodo de pago según tipo
    if (paymentManager.selectedPaymentType === 'card') {
      const paymentMethod = paymentManager.paymentMethods.find(
        method => method.id === paymentManager.selectedPaymentId,
      )

      if (!paymentMethod) {
        throw new Error('El método de pago seleccionado no es válido')
      }
    } else if (paymentManager.selectedPaymentType === 'new_card') {
      // Validar campos de tarjeta nueva
      if (!paymentManager.newCardData.cardholderName) {
        throw new Error('Ingresa el nombre del titular de la tarjeta')
      }

      if (!paymentManager.newCardData.isComplete) {
        throw new Error('Completa los datos de la tarjeta')
      }
    } else if (paymentManager.selectedPaymentType !== 'oxxo') {
      throw new Error('Selecciona un método de pago válido')
    }

    // Validar facturación si es requerida
    if (billingManager.requiresInvoice) {
      if (!billingManager.fiscalData.rfc || !billingManager.fiscalData.businessName) {
        throw new Error('Completa los datos fiscales para la facturación')
      }
    }
  }

  /**
   * Prepara los datos de la orden para enviar al servidor
   * Acepta la opción seleccionada (para detalles) y el costo total (para números).
   */
  const prepareOrderData = (selectedOption, shippingCost) => {
    // Obtener dirección según tipo
    let shippingAddress
    if (addressManager.selectedAddressType === 'saved') {
      shippingAddress = { ...addressManager.selectedAddress }
    } else if (addressManager.selectedAddressType === 'new') {
      shippingAddress = { ...addressManager.newAddressData }
    } else {
      throw new Error('Selecciona una dirección de envío')
    }

    // Obtener el email del usuario autenticado (que se necesita para OXXO)
    const userEmail = addressManager.addresses && addressManager.addresses.length > 0
      ? addressManager.addresses[0].email  // Usar el email de dirección
      : null

    if (!selectedOption) {
      console.error('prepareOrderData: No se recibió selectedOption. Usando defaults para ID/Nombre.')
    }

    // === INICIO CAMBIO ===
    // Usar selectedOption para detalles, usar el argumento shippingCost para el valor numérico.
    const finalShippingCost = shippingCost ?? 0 // Asegurar que sea un número
    console.log(`[prepareOrderData] Usando costo FINAL del argumento: ${finalShippingCost}`)

    const shippingDetails = {
      id: selectedOption?.id || 'unknown',
      name: selectedOption?.name || selectedOption?.label || 'Envío Estándar',
      cost: finalShippingCost, // <-- Usar el costo del argumento
    }
    // === FIN CAMBIO ===

    // === INICIO CAMBIO CRÍTICO: Filtrar items y recalcular totales ===

    // 1. Obtener IDs de productos cubiertos (con seguridad)
    const coveredProductIds = selectedOption?.coveredProductIds || [];
    if (!selectedOption || coveredProductIds.length === 0) {
      // Esto no debería pasar si el botón se deshabilita correctamente,
      // pero es una guarda de seguridad.
      throw new Error('No se pueden procesar 0 productos. Revisa la selección de envío.');
    }

    // 2. Filtrar los items del carrito
    const coveredItems = cart.items.filter(item => 
      coveredProductIds.includes(item.id)
    );
    // ---> LOG: VER ESTRUCTURA DEL ITEM DEL CARRITO <---
    if (coveredItems.length > 0) {
      console.log('[DEBUG] Sample covered cart item structure:', coveredItems[0]);
    }

    // 3. Recalcular subtotal e impuestos BASADOS EN LOS ITEMS CUBIERTOS
    // Asumiendo que item.price INCLUYE IVA (16%)
    const coveredSubtotal = coveredItems.reduce((sum, item) => {
      const priceBeforeTax = (item.price || 0) / 1.16;
      return sum + (priceBeforeTax * item.quantity);
    }, 0);
    const coveredTaxes = coveredSubtotal * 0.16; 
    // El total final debe ser la suma de subtotal + impuestos + envío
    const coveredGrandTotal = coveredSubtotal + coveredTaxes + finalShippingCost;
    // Comprobación numérica: coveredGrandTotal debería ser aprox. igual a: 
    // coveredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + finalShippingCost

    console.log(`[prepareOrderData] Items filtrados: ${coveredItems.length} de ${cart.items.length}. Recalculando totales (precio incluye IVA).`);
    console.log(`[prepareOrderData] Totales recalculados: Subtotal=${coveredSubtotal.toFixed(2)}, Tax=${coveredTaxes.toFixed(2)}, Shipping=${finalShippingCost}, Total=${coveredGrandTotal.toFixed(2)}`);

    // === FIN CAMBIO CRÍTICO ===

    // Preparar datos de la orden
    return {
      userId: uid,
      customer: {
        email: billingManager.fiscalData.email || shippingAddress.email || userEmail || '',
      },
      // Usar los items FILTRADOS
      items: coveredItems.map(item => { 
        const mappedItem = {
        id: item.id,
        name: item.name || item.title,
        price: item.price,
        quantity: item.quantity,
          imageUrl: item.imageUrl || item.image || item.productImage || item.img || null, 
          variant: item.variant || null,
        };
        // ---> LOG: VER ITEM MAPEADO <---
        console.log('[DEBUG] Mapped order item:', mappedItem);
        return mappedItem;
      }),
      shippingAddress: shippingAddress, 
      billingAddress: billingManager.requiresInvoice ? { /* ... datos fiscales ... */ } : null,
      payment: {
        type: paymentManager.selectedPaymentType,
        ...(paymentManager.selectedPaymentType === 'card' && (() => {
          // Verificar si paymentMethods está cargado antes de buscar
          if (!paymentManager.paymentMethods || paymentManager.loadingPayments) {
              console.warn('[prepareOrderData] paymentMethods no está listo, usando null para brand/last4.');
              return { 
                  methodId: paymentManager.selectedPaymentId, 
                  brand: null, 
                  last4: null 
              };
          }
          const card = paymentManager.paymentMethods.find(
            c => c.id === paymentManager.selectedPaymentId
          );
          console.log(`[prepareOrderData] Buscando tarjeta ID: ${paymentManager.selectedPaymentId}. Encontrada:`, card);
          // Extraer los últimos 4 dígitos de cardNumber si existe
          const lastFourDigits = card?.cardNumber?.slice(-4) || null;
          return {
        methodId: paymentManager.selectedPaymentId,
            brand: card?.brand || null, // Seguir usando null si no existe card.brand
            last4: lastFourDigits // Usar los dígitos extraídos o null
          };
        })()),
        ...(paymentManager.selectedPaymentType === 'new_card' && {
          cardholderName: paymentManager.newCardData?.cardholderName || '',
          saveForFuture: !!paymentManager.saveNewCard
        })
      },
      shipping: shippingDetails, 
      // Usar los totales RECALCULADOS
      totals: { 
        subtotal: parseFloat(coveredSubtotal.toFixed(2)), // Redondear a 2 decimales
        tax: parseFloat(coveredTaxes.toFixed(2)),      // Redondear a 2 decimales
        shipping: finalShippingCost,
        finalTotal: parseFloat(coveredGrandTotal.toFixed(2)), // Redondear a 2 decimales
      },
      notes: orderNotes,
      status: 'pending',
      requiresInvoice: billingManager.requiresInvoice,
      fiscalData: billingManager.requiresInvoice ? { /* ... datos fiscales ... */ } : null,
      selectedShippingOption: selectedOption ? { /* ... detalles opción ... */ } : null,
    };
  }

  /**
   * Crea la orden y procesa el pago
   * @param {Object} orderData - Datos completos de la orden
   * @returns {Object} Resultado del procesamiento
   */
  const createAndProcessOrder = async (orderData) => {
    try {
      // Verificar que el total sea válido
      if (!orderData.totals.finalTotal || orderData.totals.finalTotal <= 0) {
        throw new Error('El total de la orden es inválido. Verifica los productos en tu carrito.')
      }

      let paymentMethodId = null

      // Procesar según el tipo de pago seleccionado
      if (orderData.payment.type === 'new_card') {
        if (!stripe || !elements) {
          console.error('Stripe or elements not initialized')
          throw new Error('Error en la inicialización de Stripe')
        }

        // Get the stripe CardElement instance
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) {
          console.error('Card element not found')
          throw new Error('Error al obtener el elemento de tarjeta')
        }

        // Create payment method with the card element
        const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: orderData.payment.cardholderName || '',
          },
        })

        if (paymentMethodError) {
          throw new Error(paymentMethodError.message)
        }

        paymentMethodId = paymentMethod.id
      } else if (orderData.payment.type === 'card') {
        const paymentMethod = paymentManager.paymentMethods.find(
          method => method.id === orderData.payment.methodId,
        )

        if (!paymentMethod) {
          throw new Error('El método de pago seleccionado no es válido')
        }

        paymentMethodId = paymentMethod.stripePaymentMethodId
      }

      // Obtener el email del cliente
      let customerEmail = null
      if (orderData.payment.type === 'oxxo') {
        // Intentar obtener el email en este orden:
        // 1. Datos fiscales
        // 2. Email del cliente en orderData
        // 3. Email de dirección
        // 4. Email del usuario autenticado
        customerEmail = orderData.billing?.fiscalData?.email || orderData.customer?.email || ''

        // Si aún no tenemos email, obtenerlo directamente de Firebase Auth
        if (!customerEmail) {
          const auth = getAuth()
          const currentUser = auth.currentUser

          if (currentUser && currentUser.email) {
            customerEmail = currentUser.email
            console.log(`OXXO: Usando email del usuario autenticado: ${customerEmail}`)
          }
        }
      }

      // ---> LOG ANTES <----
      console.log(`[createAndProcessOrder] Llamando a processPayment con orderData:`, orderData, ` paymentMethodId: ${paymentMethodId}, paymentType: ${orderData.payment.type}`);

      // Paso 1: Procesar la orden y crear el Payment Intent (obteniendo clientSecret)
      const paymentResult = await processPayment(
        orderData,
        paymentMethodId,
        orderData.payment.type === 'new_card' && orderData.payment.saveForFuture,
        orderData.payment.type,
        customerEmail
      );

      // ---> LOG DESPUÉS de processPayment <----
      console.log(`[createAndProcessOrder] processPayment completado con resultado:`, paymentResult);

      // Verificar si processPayment (creación de PI) fue exitoso y si tenemos clientSecret
      if (!paymentResult.ok || !paymentResult.clientSecret) {
        throw new Error(paymentResult.error || 'No se pudo obtener el clientSecret para confirmar el pago.');
      }

      // Desestructurar directamente desde paymentResult
      const { clientSecret, orderId, paymentIntentId, cardBrand, cardLast4, paymentMethodIdUsed, confirmedPaymentIntent } = paymentResult;

      // Paso 2: Confirmar/Autorizar el pago en el frontend con Stripe.js
      if (orderData.payment.type === 'card' || orderData.payment.type === 'new_card') {
        console.log(`[createAndProcessOrder] Confirmando/Autorizando pago con Stripe.js para PI: ${paymentIntentId}`);

        // Asegurar que stripe y elements estén inicializados
        if (!stripe || !elements) { throw new Error('Stripe o Elements no inicializados'); }

        let confirmPromise;

        if (orderData.payment.type === 'new_card') {
          // --- Confirmación con NUEVA TARJETA --- 
          const cardElement = elements.getElement(CardElement);
          if (!cardElement) { throw new Error('Elemento CardElement no encontrado'); }
          
          // Definir las opciones para confirmCardPayment
          const confirmOptions = {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: orderData.payment.cardholderName || '',
              },
            },
            setup_future_usage: orderData.payment.saveForFuture ? 'off_session' : undefined,
          };

          // ---> LOG DE OPCIONES ANTES DE CONFIRMAR <--- 
          console.log(`[createAndProcessOrder] Opciones para stripe.confirmCardPayment (nueva tarjeta):`, confirmOptions);

          console.log(`[createAndProcessOrder] Llamando a confirmCardPayment (nueva tarjeta)`);
          confirmPromise = stripe.confirmCardPayment(clientSecret, confirmOptions); // Usar las opciones definidas

        } else { // orderData.payment.type === 'card'
          // --- Confirmación con TARJETA GUARDADA --- 
          // Asegurarse de que paymentMethodId (el ID de Stripe, ej: pm_...) esté disponible
          if (!paymentMethodId) { throw new Error('ID del método de pago guardado no encontrado'); }
          
          console.log(`[createAndProcessOrder] Llamando a confirmCardPayment (tarjeta guardada: ${paymentMethodId})`);
          confirmPromise = stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethodId, // Pasar el ID de la tarjeta guardada
          });
        }
        
        // Ejecutar la promesa de confirmación
        const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await confirmPromise;

        if (confirmError) {
          console.error('[createAndProcessOrder] Error en confirmCardPayment:', confirmError);
          try { await apiService.updateDocument(ORDERS_COLLECTION, orderId, { status: 'payment_failed', 'payment.status': 'failed' }); } catch (e) {}
          throw new Error(confirmError.message || 'Error al confirmar el pago.');
        }

        // Verificar que el estado sea el esperado para captura manual
        if (confirmedPaymentIntent.status !== 'requires_capture') {
            console.warn(`[createAndProcessOrder] Estado inesperado tras confirmar: ${confirmedPaymentIntent.status}. Se esperaba 'requires_capture'.`);
            try { await apiService.updateDocument(ORDERS_COLLECTION, orderId, { status: 'payment_failed', 'payment.status': confirmedPaymentIntent.status }); } catch (e) {}
            throw new Error(`La autorización del pago falló o ya fue capturado. Estado: ${confirmedPaymentIntent.status}`);
        }

        console.log(`[createAndProcessOrder] Pago autorizado (requiere captura). Estado: ${confirmedPaymentIntent.status}`);

        // <<<--- INICIO: Actualizar Orden con Detalles de Tarjeta y Guardar PM si aplica --->>>
        try {
          console.log('[createAndProcessOrder] Intentando actualizar Firestore y guardar PM si aplica...');

          // Determinar datos para actualizar Firestore
          const updatePayload = {};
          if (cardBrand && cardLast4) {
            updatePayload['payment.brand'] = cardBrand;
            updatePayload['payment.last4'] = cardLast4;
          }
          // Usar el ID del PM confirmado en frontend o el devuelto por backend
          const finalPmId = confirmedPaymentIntent?.payment_method || paymentMethodIdUsed;
          if (finalPmId) {
             updatePayload['payment.stripePaymentMethodId'] = finalPmId;
          }
          updatePayload['payment.status'] = 'requires_capture'; // Siempre actualizar estado

          console.log(`[createAndProcessOrder] Actualizando orden ${orderId} con datos:`, updatePayload);
          await apiService.updateDocument(ORDERS_COLLECTION, orderId, updatePayload);
          console.log(`[createAndProcessOrder] Orden ${orderId} actualizada.`);

          // --- Llamar a saveUserPaymentMethod SI se marcó el checkbox --- 
          // Usar orderData original para verificar la intención del usuario
          if (orderData.payment.type === 'new_card' && orderData.payment.saveForFuture) {
              console.log(`[createAndProcessOrder] Usuario marcó guardar tarjeta. Llamando a saveUserPaymentMethod...`);
              // Asegurarnos de tener los datos necesarios
              // Extraer stripeCustomerId del resultado de processPayment
              const customerIdFromPayment = paymentResult.stripeCustomerId; 
              const pmIdToSave = finalPmId; // Usar el ID final determinado antes
              const brandToSave = cardBrand; // Usar el brand obtenido
              const last4ToSave = cardLast4; // Usar el last4 obtenido
              
              if (uid && pmIdToSave && customerIdFromPayment && brandToSave && last4ToSave) {
                  try {
                      const saveData = {
                          stripePaymentMethodId: pmIdToSave,
                          stripeCustomerId: customerIdFromPayment,
                          cardBrand: brandToSave,
                          cardLast4: last4ToSave
                      };
                      console.log('[createAndProcessOrder] Datos para saveUserPaymentMethod:', saveData);
                      const saveResult = await apiService.callCloudFunction('saveUserPaymentMethod', saveData);
                      if (saveResult.ok) {
                          console.log('[createAndProcessOrder] saveUserPaymentMethod ejecutado con éxito:', saveResult.message);
                           // Opcional: llamar a refreshPaymentMethods si está disponible en este hook
                           // if (typeof refreshPaymentMethods === 'function') { refreshPaymentMethods(); }
                      } else {
                          console.error('[createAndProcessOrder] Error en saveUserPaymentMethod:', saveResult.error);
                          // No lanzar error aquí para no detener el flujo principal, solo loggear.
                      }
                  } catch (savePmError) {
                      console.error('[createAndProcessOrder] Excepción al llamar a saveUserPaymentMethod:', savePmError);
                  }
              } else {
                  console.warn('[createAndProcessOrder] Faltan datos necesarios para llamar a saveUserPaymentMethod:', { uid, pmIdToSave, customerIdFromPayment, brandToSave, last4ToSave });
              }
          } else {
             console.log('[createAndProcessOrder] No se marcó guardar tarjeta o no es tarjeta nueva. Omitiendo saveUserPaymentMethod.');
          }
          // --- Fin llamada a saveUserPaymentMethod --- 

        } catch (updateError) {
          console.error(`[createAndProcessOrder] Error DENTRO del bloque de actualización Firestore / Guardar PM para orden ${orderId}:`, updateError);
           // Intentar actualizar al menos el estado en caso de error
           try {
             await apiService.updateDocument(ORDERS_COLLECTION, orderId, { 'payment.status': 'requires_capture' });
             console.log(`[createAndProcessOrder] Orden ${orderId} actualizada solo con estado 'requires_capture' (tras error catch).`);
           } catch (finalFallbackError) {
              console.error(`[createAndProcessOrder] Falló incluso la actualización de estado de fallback final para orden ${orderId}:`, finalFallbackError);
           }
        }
        // <<<--- FIN: Actualizar Orden con Detalles de Tarjeta / Guardar PM --->>>

      } else if (orderData.payment.type === 'oxxo') {
        console.log('[createAndProcessOrder] Pago OXXO, no se requiere confirmación en frontend.');
      }

      // Si todo fue bien (creación de PI y autorización FE si aplica), retornar el resultado
      return paymentResult;

    } catch (error) {
      // Si hay productos sin stock, mostrar mensaje amigable
      if (error.outOfStockItems && error.outOfStockItems.length > 0) {
        // Crear un mensaje más amigable sin mostrar cantidades específicas
        const productNames = error.outOfStockItems.map(item => item.name).join(', ')

        // Si hay varios productos
        if (error.outOfStockItems.length > 1) {
          throw new Error(`Algunos productos en tu carrito no están disponibles en este momento. Por favor, revisa tu carrito y ajusta tu pedido.`)
        }
        // Si hay solo un producto
        else {
          throw new Error(`"${productNames}" no está disponible en la cantidad solicitada. Por favor, ajusta la cantidad en tu carrito.`)
        }
      }

      throw error
    }
  }

  return {
    processOrder,
  }
}