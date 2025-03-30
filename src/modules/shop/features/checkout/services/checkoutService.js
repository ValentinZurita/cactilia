import { shouldUseMocks } from '../../../../user/services/stripeMock.js'
import { apiService } from '../../../services/api.js'

const ORDERS_COLLECTION = 'orders';

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
      return { ok: false, error: 'Datos de orden incompletos' };
    }
    // Crear la orden
    return await apiService.createDocument(ORDERS_COLLECTION, orderData);
  } catch (error) {
    console.error('Error al crear la orden:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Crea un Payment Intent en Stripe
 *
 * @param {number} amount - Monto en centavos
 * @param {string} paymentMethodId - ID del método de pago (opcional para OXXO)
 * @param {string} customerEmail - Email del cliente (para OXXO)
 * @param {string} paymentType - Tipo de pago ('card', 'oxxo')
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const createPaymentIntent = async (amount, paymentMethodId = null, customerEmail = null, paymentType = 'card') => {
  try {
    // Validar parámetros
    if (!amount || amount <= 0) {
      return { ok: false, error: 'Monto inválido' };
    }

    if (paymentType === 'card' && !paymentMethodId) {
      return { ok: false, error: 'Método de pago no proporcionado' };
    }

    if (paymentType === 'oxxo' && !customerEmail) {
      return { ok: false, error: 'Email de cliente no proporcionado para OXXO' };
    }

    // Usar mocks si es necesario (desarrollo)
    if (shouldUseMocks()) {
      console.log('Usando mock para createPaymentIntent');
      return {
        ok: true,
        data: {
          clientSecret: `mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`,
          paymentIntentId: `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          ...(paymentType === 'oxxo' ? { voucherUrl: 'https://example.com/oxxo-voucher.pdf' } : {})
        },
        error: null
      };
    }

    // Determinar la función a llamar según el tipo de pago
    const functionName = paymentType === 'oxxo'
      ? 'createOxxoPaymentIntent'
      : 'createPaymentIntent';

    // Preparar parámetros según el tipo de pago
    const params = paymentType === 'oxxo'
      ? {
        amount,
        description: 'Compra en Cactilia',
        customer_email: customerEmail
      }
      : {
        amount,
        paymentMethodId,
        description: 'Compra en Cactilia'
      };

    // Llamar a la función correspondiente
    return await apiService.callCloudFunction(functionName, params);
  } catch (error) {
    console.error('Error al crear Payment Intent:', error);
    return { ok: false, error: error.message };
  }
};

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
      return { ok: false, error: 'ID de orden o pago no proporcionado' };
    }

    if (shouldUseMocks()) {
      console.log('Usando mock para confirmOrderPayment');
      return { ok: true, data: { success: true }, error: null };
    }

    return await apiService.callCloudFunction('confirmOrderPayment', {
      orderId,
      paymentIntentId,
      paymentType
    });
  } catch (error) {
    console.error('Error al confirmar el pago:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Procesa el pago y crea la orden completa
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
  try {
    // 1. Crear la orden
    const orderResult = await createOrder(orderData);

    if (!orderResult.ok) {
      throw new Error(orderResult.error || 'Error al crear la orden');
    }

    const orderId = orderResult.id;

    // 2. Crear el Payment Intent
    const amount = Math.round(orderData.totals.total * 100); // Convertir a centavos

    const paymentIntent = await createPaymentIntent(
      amount,
      paymentMethodId,
      customerEmail,
      paymentType
    );

    if (!paymentIntent.ok) {
      // Si falla el pago, actualizar la orden a "cancelled"
      await apiService.updateDocument(ORDERS_COLLECTION, orderId, {
        status: 'cancelled',
        'payment.status': 'failed'
      });

      throw new Error(paymentIntent.error || 'Error al procesar el pago');
    }

    // 3. Actualizar la orden con el ID del Payment Intent
    await apiService.updateDocument(ORDERS_COLLECTION, orderId, {
      'payment.paymentIntentId': paymentIntent.data.paymentIntentId,
      'payment.status': 'pending',
      ...(paymentType === 'oxxo' && paymentIntent.data.voucherUrl
        ? { 'payment.voucherUrl': paymentIntent.data.voucherUrl }
        : {})
    });

    // 4. Si se debe guardar el método de pago
    if (paymentType === 'card' && savePaymentMethod && paymentMethodId) {
      await apiService.callCloudFunction('savePaymentMethod', {
        paymentMethodId,
        cardHolder: orderData.payment.cardholderName || '',
        isDefault: false
      });
    }

    // 5. Si se debe guardar la dirección
    if (orderData.shipping.addressType === 'new' && orderData.shipping.saveForFuture) {
      await apiService.callCloudFunction('saveAddress', {
        address: orderData.shipping.address,
        isDefault: false
      });
    }

    return {
      ok: true,
      orderId,
      clientSecret: paymentIntent.data.clientSecret,
      paymentIntentId: paymentIntent.data.paymentIntentId,
      ...(paymentType === 'oxxo' ? { voucherUrl: paymentIntent.data.voucherUrl } : {})
    };
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    return { ok: false, error: error.message };
  }
};