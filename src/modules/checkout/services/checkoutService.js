import { shouldUseMocks } from '../../user/services/stripeMock.js'
import { apiService } from '../../shop/services/api.js'
import { doc, runTransaction } from 'firebase/firestore'
import { FirebaseDB } from '@config/firebase/firebaseConfig.js'
import { getAuth } from 'firebase/auth'

const ORDERS_COLLECTION = 'orders'
const PRODUCTS_COLLECTION = 'products'

/**
 * Crea una nueva orden en Firestore
 *
 * @param {Object} orderData - Datos de la orden
 * @returns {Promise<{ok: boolean, id: string, error: string}>} - Resultado de la operación
 */
export const createOrder = async (orderData) => {
  try {
    // Validar datos mínimos requeridos
    if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
      return { ok: false, error: 'Datos de orden incompletos' }
    }

    // Crear la orden
    return await apiService.createDocument(ORDERS_COLLECTION, orderData)
  } catch (error) {
    console.error('Error al crear la orden:', error)
    return { ok: false, error: error.message }
  }
}

/**
 * Verifica y actualiza el stock de productos
 * Usa una transacción de Firebase para garantizar consistencia
 *
 * @param {Array} items - Productos a verificar y actualizar
 * @returns {Promise<{ok: boolean, error: string, outOfStockItems: Array}>}
 */
export const verifyAndUpdateStock = async (items) => {
  if (!items || items.length === 0) {
    return { ok: false, error: 'No hay productos para verificar' }
  }

  // Declaramos outOfStockItems fuera del bloque try para que esté disponible en el catch
  let outOfStockItems = []

  try {
    // Usar runTransaction para garantizar consistencia en la base de datos
    await runTransaction(FirebaseDB, async (transaction) => {
      // PASO 1: Realizar todas las lecturas primero
      const productRefs = []
      const productSnapshots = []

      // Creamos referencias y obtenemos todos los productos primero
      for (const item of items) {
        const productRef = doc(FirebaseDB, PRODUCTS_COLLECTION, item.id)
        productRefs.push({ ref: productRef, item })

        // Obtener el documento dentro de la transacción
        const productDoc = await transaction.get(productRef)

        if (!productDoc.exists()) {
          throw new Error(`Producto no encontrado: ${item.id}`)
        }

        productSnapshots.push({
          doc: productDoc,
          data: productDoc.data(),
          item,
        })
      }

      // PASO 2: Verificar stock y crear lista de productos sin stock suficiente
      for (const { doc, data, item } of productSnapshots) {
        const currentStock = data.stock || 0

        // Verificar si hay suficiente stock
        if (currentStock < item.quantity) {
          outOfStockItems.push({
            id: item.id,
            name: item.name,
            requestedQuantity: item.quantity,
            availableStock: currentStock,
          })
        }
      }

      // Si hay productos sin stock suficiente, no continuamos con la transacción
      if (outOfStockItems.length > 0) {
        throw new Error('Productos con stock insuficiente')
      }

      // PASO 3: Realizar todas las escrituras después de todas las lecturas
      for (const { doc, data, item } of productSnapshots) {
        const currentStock = data.stock || 0

        // Actualizar el stock
        transaction.update(doc.ref, {
          stock: currentStock - item.quantity,
          updatedAt: new Date(),
        })
      }
    })

    return { ok: true, error: null }
  } catch (error) {
    console.error('Error verificando stock:', error)

    // Si hay productos sin stock, devolvemos la lista
    if (error.message === 'Productos con stock insuficiente') {
      return {
        ok: false,
        error: 'Algunos productos no tienen suficiente existencia',
        outOfStockItems,
      }
    }

    return { ok: false, error: error.message }
  }
}

/**
 * Crea un Payment Intent en Stripe
 *
 * @param {number} amount - Monto en centavos
 * @param {string} paymentMethodId - ID del método de pago (opcional para OXXO)
 * @param {string} customerEmail - Email del cliente (para OXXO)
 * @param {string} paymentType - Tipo de pago ('card', 'oxxo')
 * @param {boolean} savePaymentMethod - Si se debe guardar el método
 * @param {string} orderId - ID de la orden asociada
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const createPaymentIntent = async (amount, paymentMethodId = null, customerEmail = null, paymentType = 'card', savePaymentMethod = false, orderId = null) => {
  try {
    // Validar parámetros
    if (!amount || amount <= 0) {
      return { ok: false, error: 'Monto inválido' }
    }

    if (paymentType === 'card' && !paymentMethodId) {
      return { ok: false, error: 'Método de pago no proporcionado' }
    }

    // Para OXXO, intenta obtener el email del usuario actual como último recurso
    if (paymentType === 'oxxo' && !customerEmail) {
      // Obtener el usuario actual desde Firebase Auth
      const auth = getAuth()
      const currentUser = auth.currentUser

      if (currentUser && currentUser.email) {
        console.log(`Usando email del usuario autenticado para OXXO: ${currentUser.email}`)
        customerEmail = currentUser.email
      } else {
        return { ok: false, error: 'Email de cliente no proporcionado para OXXO' }
      }
    }

    // Usar mocks si es necesario (desarrollo)
    if (shouldUseMocks()) {
      console.log('Usando mock para createPaymentIntent')
      return {
        ok: true,
        data: {
          clientSecret: `mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`,
          paymentIntentId: `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          ...(paymentType === 'oxxo' ? { voucherUrl: 'https://example.com/oxxo-voucher.pdf' } : {}),
        },
        error: null,
      }
    }

    // Determinar la función a llamar según el tipo de pago
    const functionName = paymentType === 'oxxo'
      ? 'createOxxoPaymentIntent'
      : 'createPaymentIntent'

    // Preparar parámetros según el tipo de pago
    const params = paymentType === 'oxxo'
      ? {
        amount,
        description: 'Compra en Cactilia',
        customer_email: customerEmail,
        orderId: orderId
      }
      : {
        amount,
        paymentMethodId,
        description: 'Compra en Cactilia',
        savePaymentMethod: !!savePaymentMethod,
        orderId: orderId
      }

    // Llamar a la función correspondiente
    console.log(`[checkoutService] Llamando a Cloud Function: ${functionName} con params:`, params);
    return await apiService.callCloudFunction(functionName, params)
  } catch (error) {
    console.error('Error al crear Payment Intent:', error)
    return { ok: false, error: error.message }
  }
}

/**
 * Confirma el pago de una orden
 *
 * @param {string} orderId - ID de la orden
 * @param {string} paymentIntentId - ID del Payment Intent
 * @param {string} paymentType - Tipo de pago ('card', 'oxxo')
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const confirmOrderPayment = async (orderId, paymentIntentId, paymentType = 'card') => {
  try {
    if (!orderId || !paymentIntentId) {
      return { ok: false, error: 'ID de orden o pago no proporcionado' }
    }

    if (shouldUseMocks()) {
      console.log('Usando mock para confirmOrderPayment')
      return { ok: true, data: { success: true }, error: null }
    }

    return await apiService.callCloudFunction('confirmOrderPayment', {
      orderId,
      paymentIntentId,
      paymentType,
    })
  } catch (error) {
    console.error('Error al confirmar el pago:', error)
    return { ok: false, error: error.message }
  }
}

/**
 * Actualiza campos específicos de pago en una orden existente
 *
 * @param {string} orderId - ID de la orden
 * @param {Object} paymentDetailsUpdate - Objeto con los campos de pago a actualizar (ej: {'payment.voucherDetails': ..., 'payment.status': ...})
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const updateOrderPaymentDetails = async (orderId, paymentDetailsUpdate) => {
  // Log al inicio de la función
  console.log(`[updateOrderPaymentDetails] Iniciando actualización para orden ${orderId}`);
  try {
    if (!orderId || !paymentDetailsUpdate || Object.keys(paymentDetailsUpdate).length === 0) {
      console.error('[updateOrderPaymentDetails] Error: Datos inválidos recibidos.', { orderId, paymentDetailsUpdate });
      return { ok: false, error: 'ID de orden o detalles de pago no proporcionados para actualizar' };
    }
    // Log para ver qué se va a actualizar
    console.log(`[updateOrderPaymentDetails] Payload a enviar a apiService.updateDocument:`, JSON.stringify(paymentDetailsUpdate));
    
    // Llamada al servicio de API
    const updateResult = await apiService.updateDocument(ORDERS_COLLECTION, orderId, paymentDetailsUpdate);
    
    // Log del resultado DIRECTO de apiService.updateDocument
    console.log(`[updateOrderPaymentDetails] Resultado de apiService.updateDocument para orden ${orderId}:`, updateResult);

    // Verificar si la actualización fue realmente exitosa según la respuesta del apiService
    if (updateResult && updateResult.ok) {
       console.log(`[updateOrderPaymentDetails] Actualización marcada como OK por apiService para orden ${orderId}.`);
       return { ok: true }; // Devolver éxito explícito
    } else {
       console.error(`[updateOrderPaymentDetails] apiService.updateDocument marcó la actualización como FALLIDA para orden ${orderId}. Respuesta:`, updateResult);
       // Devolver el error específico del apiService si existe
       return { ok: false, error: updateResult?.error || 'Error desconocido durante la actualización del documento' };
    }

  } catch (error) {
    // Log del error capturado en el catch
    console.error(`[updateOrderPaymentDetails] Error CATCH ejecutando actualización para la orden ${orderId}:`, error);
    return { ok: false, error: error.message };
  }
};

/**
 * Procesa el pago y crea la orden completa
 * Incluye verificación de stock
 *
 * @param {Object} orderData - Datos de la orden
 * @param {string} paymentMethodId - ID del método de pago
 * @param {boolean} savePaymentMethod - Si se debe guardar el método de pago
 * @param {string} paymentType - Tipo de pago ('card', 'oxxo')
 * @param {string} customerEmail - Email del cliente (para OXXO)
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const processPayment = async (
  orderData,
  paymentMethodId = null,
  savePaymentMethod = false,
  paymentType = 'card',
  customerEmail = null
) => {
  let createdOrderId = null; // <-- Declarar FUERA del try
  try {
    // Validar datos mínimos de la orden
    if (!orderData || !orderData.userId || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return { ok: false, error: 'Datos de orden incompletos o inválidos' }
    }

    // Validar que hay totales definidos
    if (!orderData.totals || typeof orderData.totals.finalTotal !== 'number' || orderData.totals.finalTotal <= 0) {
      return { ok: false, error: 'Total de la orden inválido' }
    }

    console.log('Procesando pago con datos:', {
      items: orderData.items.length,
      total: orderData.totals.finalTotal,
      paymentType,
      paymentMethodId: paymentMethodId ? '***' : null,
    })

    // === 1. VERIFICAR STOCK ===
    console.log(`📦 [processPayment] Verificando stock para ${orderData.items.length} productos...`);
    const stockResult = await verifyAndUpdateStock(orderData.items)
    if (!stockResult.ok) {
      return {
        ok: false,
        error: stockResult.error,
        outOfStockItems: stockResult.outOfStockItems || [],
      }
    }

    // Loggear el objeto orderData COMPLETO justo antes de crearlo en Firestore
    console.log('📦 [processPayment] Datos FINALES de la orden ANTES de createOrder:', JSON.stringify(orderData, null, 2))

    // 2. Crear la orden
    const orderResult = await createOrder(orderData)
    if (!orderResult.ok) {
      throw new Error(orderResult.error || 'Error al crear la orden')
    }
    createdOrderId = orderResult.id; // <-- Asignar valor
    console.log(`✅ [processPayment] Orden creada con ID: ${createdOrderId}`);

    // 3. Crear el Payment Intent
    const amount = Math.round(orderData.totals.finalTotal * 100)

    console.log(`Creando Payment Intent por $${orderData.totals.finalTotal} (${amount} centavos)`)

    // Si es un pago OXXO y no hay email proporcionado, intentar obtenerlo del objeto orderData
    let emailForOxxo = customerEmail
    if (paymentType === 'oxxo' && !emailForOxxo) {
      // Intentar obtener el email de orderData
      emailForOxxo = orderData.customer?.email || orderData.shipping?.address?.email || ''

      // Si aún no tenemos email, obtenerlo desde el usuario autenticado
      if (!emailForOxxo) {
        const auth = getAuth()
        const currentUser = auth.currentUser

        if (currentUser && currentUser.email) {
          emailForOxxo = currentUser.email
          console.log(`Usando email del usuario autenticado para OXXO: ${emailForOxxo}`)
        }
      }

      console.log(`Usando email de respaldo para OXXO: ${emailForOxxo || 'No disponible'}`)
    }

    const paymentIntent = await createPaymentIntent(
      amount,
      paymentMethodId,
      emailForOxxo,
      paymentType,
      savePaymentMethod,
      createdOrderId
    )

    // Verificar si la llamada a la Cloud Function fue exitosa
    if (!paymentIntent || !paymentIntent.ok) {
        console.error('[processPayment] Falló la llamada a la Cloud Function:', paymentIntent);
        throw new Error(paymentIntent?.error || 'No se pudo contactar al servicio de pago.');
    }

    let clientSecret, piId, cardBrand, cardLast4, paymentMethodIdUsed, voucherUrl = null, stripeCustomerId;

    // Procesar respuesta según el tipo de pago
    if (paymentType === 'oxxo') {
        // OXXO devuelve datos directamente en .data
        if (!paymentIntent.data || !paymentIntent.data.clientSecret || !paymentIntent.data.paymentIntentId) {
            console.error('[processPayment] Respuesta inválida de createOxxoPaymentIntent:', paymentIntent.data);
            throw new Error('Respuesta inválida del servicio de pago OXXO.');
        }
        clientSecret = paymentIntent.data.clientSecret;
        piId = paymentIntent.data.paymentIntentId;
        // stripeCustomerId puede no venir de createOxxoPaymentIntent, lo obtenemos luego si es necesario o lo pasamos
        // Aquí asumimos que getOrCreateCustomer ya lo guardó y no lo necesitamos devolver explícitamente aquí.
        // Si se necesitara, createOxxoPaymentIntent debería devolverlo.
        console.log(`[processPayment] Datos OXXO extraídos: clientSecret=${clientSecret ? '***' : 'null'}, piId=${piId}`);
    } else {
        // Tarjeta devuelve datos anidados AHORA en .data.data.result (ajuste por cambio en CF)
        if (!paymentIntent.data?.data?.result || !paymentIntent.data.data.result.clientSecret) {
             console.error('[processPayment] Respuesta inválida de createPaymentIntent (tarjeta) - verificando .data.data.result:', paymentIntent.data);
             throw new Error('Respuesta inválida del servicio de pago con tarjeta.');
        }
        const resultData = paymentIntent.data.data.result; // <-- Acceder al nivel correcto
        clientSecret = resultData.clientSecret;
        piId = resultData.paymentIntentId;
        cardBrand = resultData.cardBrand;
        cardLast4 = resultData.cardLast4;
        paymentMethodIdUsed = resultData.paymentMethodIdUsed;
        stripeCustomerId = resultData.stripeCustomerId; // Para guardar PM
        console.log(`[processPayment] Datos Tarjeta extraídos: clientSecret=${clientSecret ? '***' : 'null'}, piId=${piId}, Brand=${cardBrand}, Last4=${cardLast4}, PM Used=${paymentMethodIdUsed}, CustID=${stripeCustomerId}`);
    }

    // Verificar que tenemos el clientSecret (esencial para AMBOS flujos ahora, OXXO lo usa para confirmOxxoPayment)
    if (!clientSecret) {
      console.error('[processPayment] No se pudo obtener clientSecret.');
      throw new Error('Error interno: No se recibió identificador de pago.');
    }

    // Actualizar la orden (la ÚNICA que se creó) con el ID del Payment Intent y estado inicial
    // Usar piId extraído de la respuesta
    console.log('[processPayment] Construyendo updateData. paymentIntent.data existe:', !!paymentIntent.data);
    // --- Logs limpiados para no usar la ruta .result incorrecta ---
    console.log(`[processPayment] Extracted payment details: piId=${piId}, clientSecret=${clientSecret ? '***' : 'null'}, voucherUrl=${voucherUrl}`);

    const paymentStatus = paymentType === 'oxxo' ? 'pending_payment' : 'pending';
    console.log(`[processPayment] Estado inicial del pago para tipo ${paymentType}: ${paymentStatus}`);

    const updateData = {
      'payment.paymentIntentId': piId || null, // Usar piId extraído
      'payment.status': paymentStatus,
      ...(paymentType === 'oxxo' && voucherUrl && { 'payment.voucherUrl': voucherUrl }),
      // Podemos añadir brand/last4 aquí si ya los tenemos
      ...(cardBrand && { 'payment.brand': cardBrand }),
      ...(cardLast4 && { 'payment.last4': cardLast4 }),
      ...(paymentMethodIdUsed && { 'payment.stripePaymentMethodId': paymentMethodIdUsed })
    };
    
    // Filtrar claves con valor undefined antes de actualizar
    const finalUpdateData = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Usar la variable renombrada
    console.log(`[processPayment] Intentando actualizar orden ${createdOrderId} con updateData:`, finalUpdateData);
    await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, finalUpdateData);

    // Devolver todos los datos necesarios al hook useOrderProcessor
    return {
      ok: true,
      orderId: createdOrderId, 
      clientSecret: clientSecret, 
      paymentIntentId: piId,      
      voucherUrl: null, // <-- Devolver null aquí, se obtiene después
      cardBrand: cardBrand, // Será null para OXXO
      cardLast4: cardLast4, // Será null para OXXO
      paymentMethodIdUsed: paymentMethodIdUsed, // Será null para OXXO
      stripeCustomerId: stripeCustomerId // <-- Incluirlo
    };

  } catch (error) {
    console.error('Error al procesar el pago:', error)
    // Ahora el chequeo if (createdOrderId) ES SEGURO
    if (createdOrderId) { 
       try {
         await apiService.updateDocument(ORDERS_COLLECTION, createdOrderId, { status: 'failed', 'payment.status': 'failed', 'payment.error': error.message });
       } catch (updateError) {
         console.error(`Error al intentar marcar la orden ${createdOrderId} como fallida:`, updateError);
       }
    }
    return { ok: false, error: error.message }
  }
}