import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { processPayment } from '@modules/checkout/checkout/services/index.js'
import { clearCartWithSync } from '../../features/cart/store/index.js'
import { validateItemsStock } from '../../services/productServices.js'
import { getAuth } from 'firebase/auth'
import { CardElement } from '@stripe/react-stripe-js'

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

      // 5. Procesar el pago
      const result = await createAndProcessOrder(orderData)

      // 6. Establecer ID de la orden resultado
      if (result && result.orderId) {
        setOrderId(result.orderId)

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

    // Preparar datos de la orden
    return {
      userId: uid,
      customer: {
        email: billingManager.fiscalData.email || shippingAddress.email || userEmail || '',
      },
      items: cart.items.map(item => ({
        id: item.id,
        name: item.name || item.title,
        price: item.price,
        image: item.image || item.mainImage,
        category: item.category,
        quantity: item.quantity,
        stock: item.stock || 0,
      })),
      shipping: {
        methodId: shippingDetails.id,
        methodName: shippingDetails.name,
        cost: shippingDetails.cost, // <-- Usar el costo del argumento
        address: shippingAddress,
        addressType: addressManager.selectedAddressType,
        saveForFuture: addressManager.selectedAddressType === 'new' &&
          addressManager.newAddressData.saveAddress,
      },
      payment: {
        type: paymentManager.selectedPaymentType,
        methodId: paymentManager.selectedPaymentId,
        cardholderName: paymentManager.newCardData.cardholderName,
        saveForFuture: paymentManager.selectedPaymentType === 'new_card' &&
          paymentManager.newCardData.saveCard,
      },
      billing: {
        requiresInvoice: billingManager.requiresInvoice,
        fiscalData: billingManager.requiresInvoice ? billingManager.fiscalData : null,
      },
      notes: orderNotes,
      totals: {
        subtotal: cart.subtotal,
        taxes: cart.taxes,
        shipping: shippingDetails.cost, // <-- Usar el costo del argumento
        total: cart.total, // (subtotal + taxes)
        // Recalcular finalTotal con el costo del argumento
        finalTotal: Number((cart.subtotal + cart.taxes + shippingDetails.cost).toFixed(2)),
      },
      status: 'pending',
      createdAt: new Date(),
    }
  }

  /**
   * Crea la orden y procesa el pago
   * @param {Object} orderData - Datos completos de la orden
   * @returns {Object} Resultado del procesamiento
   */
  const createAndProcessOrder = async (orderData) => {
    try {
      // Verificar que el total sea válido
      if (!orderData.totals.total || orderData.totals.total <= 0) {
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

      // Si es OXXO, asegurarnos de tener un email
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

      // Procesar la orden
      return await processPayment(
        orderData,
        paymentMethodId,
        orderData.payment.type === 'new_card' && orderData.payment.saveForFuture,
        orderData.payment.type,
        customerEmail,
      )
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