import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

  /**
   * Procesa la orden completa.
   * Acepta la opción seleccionada y el costo TOTAL calculado.
   */
  const processOrder = useCallback(async (selectedOption, shippingCost) => {

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

        // 8. Redirigir a la página de éxito
        let redirectPath = `/shop/order-success/${result.orderId}`;
        if (result.paymentType === 'oxxo') {
            const queryParams = new URLSearchParams({
                payment: 'oxxo',
                ...(result.oxxoAmount && { amount: result.oxxoAmount }),
                ...(result.oxxoExpiresAt && { expires: result.oxxoExpiresAt })
            });
            redirectPath = `${redirectPath}?${queryParams.toString()}`;
        }

        // Usar navigate de react-router-dom en lugar de window.location
        console.log(`[processOrder] Navegando a: ${redirectPath}`);
        navigate(redirectPath, { replace: true });
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
    setOrderId, setStep, setError, setIsProcessing, navigate
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
    // --- CORRECCIÓN: Obtener email de Auth como último recurso REAL --- 
    let finalUserEmail = null;
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser?.email) {
        finalUserEmail = currentUser.email;
      }
    } catch (authError) {
      console.warn("Error al obtener usuario Auth en prepareOrderData:", authError);
    }

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
        // Usar el email de Auth (finalUserEmail) como ÚLTIMO fallback
        email: billingManager.fiscalData.email || shippingAddress.email || finalUserEmail || '',
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
      fiscalData: billingManager.requiresInvoice ? { ...billingManager.fiscalData } : null,
      selectedShippingOption: selectedOption ? { ...selectedOption } : null,
    };
  }

  /**
   * Crea la orden y procesa el pago
   * @param {Object} orderData - Datos completos de la orden
   * @returns {Object} Resultado del procesamiento
   */
  const createAndProcessOrder = async (orderData) => {
    // ---> DECLARAR paymentResult fuera del try para usar en finally si es necesario <----
    let paymentResult = null; 
    let createdOrderId = null; // Para poder referenciarlo en el catch/finally

    try {
      // Verificar total...
      // Determinar paymentMethodId si es tarjeta...
      // (Lógica existente para determinar paymentMethodId o email para OXXO)
      let paymentMethodIdForBackend = null;
      let emailForOxxo = null;

      if (orderData.payment.type === 'new_card') {
         // Lógica para crear PM con stripe.createPaymentMethod...
         const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({ /* ... */ });
         if (pmError) throw new Error(pmError.message);
         paymentMethodIdForBackend = paymentMethod.id;
      } else if (orderData.payment.type === 'card') {
         const savedMethod = paymentManager.paymentMethods.find(m => m.id === orderData.payment.methodId);
         if (!savedMethod) throw new Error('Método guardado no encontrado');
         paymentMethodIdForBackend = savedMethod.stripePaymentMethodId; // Usar el ID de Stripe
      } else if (orderData.payment.type === 'oxxo') {
         // Lógica para obtener email...
         emailForOxxo = orderData.billing?.fiscalData?.email || orderData.customer?.email || '';
         if (!emailForOxxo) {
           const auth = getAuth();
           const currentUser = auth.currentUser;
           if (currentUser?.email) emailForOxxo = currentUser.email;
         }
         console.log(`[createAndProcessOrder] Email para OXXO: ${emailForOxxo}`);
         if (!emailForOxxo) {
            console.warn("No se pudo determinar un email para OXXO, Stripe podría rechazarlo.");
            // Considera lanzar un error si el email es estrictamente requerido
            // throw new Error("Se requiere un email para pagos con OXXO.");
         }
      }

      // ---> LOG ANTES de processPayment <----
      console.log(`[createAndProcessOrder] Llamando a processPayment con:`, { 
          orderTotal: orderData.totals.finalTotal, 
          paymentMethodId: paymentMethodIdForBackend ? '***' : null, 
          paymentType: orderData.payment.type, 
          saveCard: orderData.payment.saveForFuture,
          emailOxxo: emailForOxxo 
      });

      // Paso 1: LLAMAR A processPayment (que crea orden y PI)
      paymentResult = await processPayment(
        orderData,
        paymentMethodIdForBackend, // El ID de Stripe (pm_...) o null
        orderData.payment.type === 'new_card' && orderData.payment.saveForFuture,
        orderData.payment.type,
        emailForOxxo
      );

      // ---> LOG DESPUÉS de processPayment <----
      console.log(`[createAndProcessOrder] processPayment completado con resultado:`, paymentResult);

      // Verificar si processPayment fue exitoso
      if (!paymentResult || !paymentResult.ok) {
        // Lanzar error con detalles si existen
        throw new Error(paymentResult?.error || 'Error al procesar el pago inicial.');
      }

      // Extraer datos COMUNES de la respuesta de processPayment
      createdOrderId = paymentResult.orderId;
      const paymentIntentId = paymentResult.paymentIntentId;
      const stripeCustomerId = paymentResult.stripeCustomerId; // Necesario para guardar PM

      // --- INICIO: Lógica Condicional por Tipo de Pago ---
      if (orderData.payment.type === 'oxxo') {
          // --- LÓGICA PARA OXXO --- 
          console.log('[createAndProcessOrder] Flujo OXXO detectado.');
          // Extraer clientSecret...
          const { clientSecret } = paymentResult;
          // ... (verificación clientSecret)

          // --- INICIO: Búsqueda robusta de nombre (como antes) --- 
          let billingName = 
              orderData.customer?.name || 
              orderData.shippingAddress?.name || 
              orderData.billingAddress?.name;
          const isValidName = billingName && billingName.includes(' ') && billingName.split(' ').every(part => part.length >= 2);
          if (!isValidName) {
             console.warn(`[createAndProcessOrder] Nombre (${billingName}) no válido. Usando fallback.`);
             billingName = 'Cliente Cactilia';
          }
          // --- FIN: Búsqueda robusta de nombre --- 

          // --- OBTENER EMAIL DIRECTAMENTE DE orderData (preparado antes) --- 
          const billingEmail = orderData.customer?.email;
          
          // Validación final del email (ahora solo usa el valor de orderData)
          if (!billingEmail) {
               console.error('[createAndProcessOrder] Email no encontrado en orderData.customer.email');
               throw new Error('Falta el email del cliente para confirmar el pago OXXO.');
          }
          
          console.log(`[createAndProcessOrder] Llamando a stripe.confirmOxxoPayment con clientSecret: ***, nombre: ${billingName}, email: ${billingEmail}`);
          // LLAMAR A confirmOxxoPayment
          const { error: confirmOxxoError, paymentIntent: confirmedOxxoIntent } = await stripe.confirmOxxoPayment(
            clientSecret, 
            {
              payment_method: {
                billing_details: {
                  name: billingName, 
                  email: billingEmail,
                },
              },
            }
          );

          if (confirmOxxoError) {
            console.error('[createAndProcessOrder] Error en confirmOxxoPayment:', confirmOxxoError);
            // Intentar marcar la orden como fallida
            try { await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, { status: 'payment_failed', 'payment.status': 'failed' }); } catch (e) { console.error("Error updating order status to failed after OXXO confirm error:", e); }
            throw new Error(confirmOxxoError.message || 'Error al confirmar el pago con OXXO.');
          }

          // Verificar el estado y extraer la URL del voucher
          if (confirmedOxxoIntent.status === 'requires_action' && confirmedOxxoIntent.next_action?.type === 'oxxo_display_details') {
            const oxxoDetails = confirmedOxxoIntent.next_action.oxxo_display_details;
            const voucherUrl = oxxoDetails.hosted_voucher_url;
            const oxxoExpiresAt = oxxoDetails.expires_after; // Timestamp Unix (segundos)

            // Validar solo voucherUrl y expiresAt
            if (!voucherUrl || oxxoExpiresAt === undefined) { 
                console.error('[createAndProcessOrder] Faltan voucherUrl o expiresAt en next_action:', oxxoDetails);
                throw new Error('No se pudieron obtener los detalles completos del voucher OXXO.'); // Mensaje más genérico
            }
            
            // Obtener el monto original de la orden (convertido a centavos)
            const orderAmountInCents = Math.round(orderData.totals.finalTotal * 100);

            console.log(`[createAndProcessOrder] OXXO Detalles obtenidos: URL=${voucherUrl}, Expires=${oxxoExpiresAt}. Monto original=${orderAmountInCents}`);
            
            // Opcional pero recomendado: Actualizar orden con detalles OXXO
            try {
              await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, { 
                  'payment.voucherUrl': voucherUrl,
                  'payment.oxxoAmount': orderAmountInCents, // <-- Guardar monto original
                  'payment.oxxoExpiresAt': oxxoExpiresAt 
              });
               console.log(`[createAndProcessOrder] Orden ${createdOrderId} actualizada con detalles OXXO.`);
            } catch(updateErr) {
               console.warn(`[createAndProcessOrder] No se pudo actualizar la orden ${createdOrderId} con detalles OXXO:`, updateErr);
            }

            // Devolver éxito con datos específicos de OXXO
            return {
                ok: true,
                orderId: createdOrderId,
                voucherUrl: voucherUrl,
                paymentType: 'oxxo',
                oxxoAmount: orderAmountInCents, // <-- Devolver monto original
                oxxoExpiresAt: oxxoExpiresAt 
            };
          } else {
            // Estado inesperado después de confirmar OXXO
            console.error(`[createAndProcessOrder] Estado inesperado ${confirmedOxxoIntent.status} después de confirmOxxoPayment. Se esperaba requires_action con oxxo_display_details.`);
            try { await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, { status: 'payment_failed', 'payment.status': confirmedOxxoIntent.status }); } catch (e) { console.error("Error updating order status to unexpected after OXXO confirm:", e); }
            throw new Error('Hubo un problema al generar las instrucciones de pago OXXO.');
          }
          // --- FIN LÓGICA OXXO --- 

      } else if (orderData.payment.type === 'card' || orderData.payment.type === 'new_card') {
          // --- LÓGICA PARA TARJETA --- 
          console.log(`[createAndProcessOrder] Flujo Tarjeta (${orderData.payment.type}) detectado.`);
          const { clientSecret, cardBrand, cardLast4, paymentMethodIdUsed } = paymentResult;

          if (!clientSecret) {
              console.error('[createAndProcessOrder] No se recibió clientSecret para pago con tarjeta.');
              throw new Error('Error interno al procesar el pago con tarjeta.');
          }

          console.log(`[createAndProcessOrder] Confirmando/Autorizando pago con Stripe.js para PI: ${paymentIntentId}`);
          if (!stripe || !elements) { throw new Error('Stripe o Elements no inicializados'); }

          let confirmPromise;
          let pmIdForConfirmation = paymentMethodIdUsed || paymentMethodIdForBackend; // Usar el ID devuelto por backend si existe

          if (orderData.payment.type === 'new_card') {
              const cardElement = elements.getElement(CardElement);
              if (!cardElement) { throw new Error('Elemento CardElement no encontrado'); }
              const confirmOptions = { /* ... opciones como antes ... */ };
              console.log(`[createAndProcessOrder] Opciones para stripe.confirmCardPayment (nueva tarjeta):`, confirmOptions);
              confirmPromise = stripe.confirmCardPayment(clientSecret, confirmOptions);
              pmIdForConfirmation = null; // Se usa el cardElement, no un ID
          } else { // Tarjeta guardada
              if (!pmIdForConfirmation) { throw new Error('ID del método de pago guardado no encontrado para confirmar.'); }
              console.log(`[createAndProcessOrder] Llamando a confirmCardPayment (tarjeta guardada: ${pmIdForConfirmation})`);
              confirmPromise = stripe.confirmCardPayment(clientSecret, {
                  payment_method: pmIdForConfirmation,
              });
          }
          
          const { error: confirmError, paymentIntent: confirmedPaymentIntent } = await confirmPromise;

          if (confirmError) {
            console.error('[createAndProcessOrder] Error en confirmCardPayment:', confirmError);
            // Intentar marcar la orden como fallida
            try { await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, { status: 'payment_failed', 'payment.status': 'failed' }); } catch (e) { console.error("Error updating order status to failed:", e); }
            throw new Error(confirmError.message || 'Error al confirmar el pago.');
          }

          if (confirmedPaymentIntent.status !== 'requires_capture') {
              console.warn(`[createAndProcessOrder] Estado inesperado tras confirmar: ${confirmedPaymentIntent.status}.`);
              try { await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, { status: 'payment_failed', 'payment.status': confirmedPaymentIntent.status }); } catch (e) { console.error("Error updating order status to unexpected:", e); }
              throw new Error(`La autorización del pago falló. Estado: ${confirmedPaymentIntent.status}`);
          }

          console.log(`[createAndProcessOrder] Pago autorizado (requiere captura). Estado: ${confirmedPaymentIntent.status}`);

          // --- Actualizar Orden y Guardar PM --- 
          try {
              console.log('[createAndProcessOrder] Actualizando Firestore y guardando PM si aplica...');
              const finalPmId = confirmedPaymentIntent?.payment_method || pmIdForConfirmation;
              const updatePayload = { 'payment.status': 'requires_capture' };
              if (cardBrand) updatePayload['payment.brand'] = cardBrand;
              if (cardLast4) updatePayload['payment.last4'] = cardLast4;
              if (finalPmId) updatePayload['payment.stripePaymentMethodId'] = finalPmId;

              console.log(`[createAndProcessOrder] Actualizando orden ${createdOrderId} con datos:`, updatePayload);
              await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, updatePayload);
              console.log(`[createAndProcessOrder] Orden ${createdOrderId} actualizada.`);

              // --- Llamar a saveUserPaymentMethod --- 
              if (orderData.payment.type === 'new_card' && orderData.payment.saveForFuture) {
                  console.log(`[createAndProcessOrder] Intentando guardar PM...`);
                  const brandToSave = cardBrand; // Usar el brand devuelto por processPayment
                  const last4ToSave = cardLast4; // Usar el last4 devuelto por processPayment
                  
                  if (uid && finalPmId && stripeCustomerId && brandToSave && last4ToSave) {
                      try {
                          const saveData = { /* ... datos como antes usando stripeCustomerId, finalPmId, brandToSave, last4ToSave ... */ };
                          console.log('[createAndProcessOrder] Datos para saveUserPaymentMethod:', saveData);
                          const saveResult = await apiService.callCloudFunction('saveUserPaymentMethod', saveData);
                          if (saveResult.ok) {
                              console.log('[createAndProcessOrder] saveUserPaymentMethod éxito:', saveResult.message);
                          } else {
                              console.error('[createAndProcessOrder] Error en saveUserPaymentMethod:', saveResult.error);
                          }
                      } catch (savePmError) {
                          console.error('[createAndProcessOrder] Excepción al llamar saveUserPaymentMethod:', savePmError);
                      }
                  } else {
                      console.warn('[createAndProcessOrder] Faltan datos para saveUserPaymentMethod:', { uid, finalPmId, stripeCustomerId, brandToSave, last4ToSave });
                  }
              } else {
                 console.log('[createAndProcessOrder] No se guarda PM.');
              }
              // --- Fin llamada a saveUserPaymentMethod --- 

          } catch (updateError) {
              console.error(`[createAndProcessOrder] Error DENTRO del bloque de actualización/guardado PM para orden ${createdOrderId}:`, updateError);
              // Intentar actualizar estado como fallback
              try { await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, { 'payment.status': 'requires_capture' }); } catch (e) { console.error("Fallback update status error:", e); }
          }
          // --- Fin Actualizar Orden y Guardar PM --- 

          // Devolver éxito para tarjeta
          return {
              ok: true,
              orderId: createdOrderId,
              paymentIntentId: paymentIntentId,
              paymentType: orderData.payment.type // Indicar el tipo
          };
          // --- FIN LÓGICA TARJETA --- 

      } else {
          // Tipo de pago desconocido
          console.error(`[createAndProcessOrder] Tipo de pago desconocido: ${orderData.payment.type}`);
          throw new Error(`Tipo de pago no soportado: ${orderData.payment.type}`);
      }
      // --- FIN: Lógica Condicional por Tipo de Pago ---

    } catch (error) {
      console.error("[createAndProcessOrder] Error principal capturado:", error);
      // ---> INTENTAR ACTUALIZAR ORDEN A FALLIDA SI YA TENEMOS ID <----
      if (createdOrderId) {
        try {
          await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, { status: 'payment_failed', 'payment.status': 'failed', 'payment.error': error.message });
          console.log(`[createAndProcessOrder] Orden ${createdOrderId} marcada como fallida tras error.`);
        } catch (updateFailError) {
          console.error(`[createAndProcessOrder] Falló al intentar marcar la orden ${createdOrderId} como fallida:`, updateFailError);
        }
      }
      // Relanzar el error para que lo maneje processOrder
      throw error;
    }
  }

  return {
    processOrder,
  }
}
