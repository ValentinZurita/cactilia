import { collection, addDoc, getDoc, getDocs, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Colección donde se guardarán las órdenes
const ORDERS_COLLECTION = 'orders';

/**
 * Crea una nueva orden en Firestore
 *
 * @param {Object} orderData - Datos de la orden
 * @param {string} orderData.userId - ID del usuario
 * @param {Array} orderData.items - Productos en la orden
 * @param {Object} orderData.shipping - Información de envío
 * @param {Object} orderData.payment - Información de pago
 * @param {Object} orderData.billing - Información de facturación
 * @param {Object} orderData.totals - Totales de la orden
 * @param {string} orderData.notes - Notas adicionales
 * @returns {Promise<{ok: boolean, id: string, error: string}>} - Resultado de la operación
 */
export const createOrder = async (orderData) => {
  try {
    // Validar datos mínimos requeridos
    if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
      return { ok: false, error: 'Datos de orden incompletos' };
    }

    // Agregar timestamps
    const timestamp = new Date();
    const orderToSave = {
      ...orderData,
      status: 'pending', // Estado inicial: pendiente
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Guardar la orden en Firestore
    const orderRef = await addDoc(collection(FirebaseDB, ORDERS_COLLECTION), orderToSave);

    return { ok: true, id: orderRef.id, error: null };
  } catch (error) {
    console.error('Error al crear la orden:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene una orden por su ID
 *
 * @param {string} orderId - ID de la orden
 * @returns {Promise<{ok: boolean, data: Object, error: string}>} - Resultado de la operación
 */
export const getOrderById = async (orderId) => {
  try {
    if (!orderId) {
      return { ok: false, error: 'ID de orden no proporcionado' };
    }

    const orderRef = doc(FirebaseDB, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return { ok: false, error: 'Orden no encontrada' };
    }

    return { ok: true, data: { id: orderSnap.id, ...orderSnap.data() }, error: null };
  } catch (error) {
    console.error('Error al obtener la orden:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene todas las órdenes de un usuario
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<{ok: boolean, data: Array, error: string}>} - Resultado de la operación
 */
export const getUserOrders = async (userId) => {
  try {
    if (!userId) {
      return { ok: false, error: 'ID de usuario no proporcionado' };
    }

    const ordersQuery = query(
      collection(FirebaseDB, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(ordersQuery);
    const orders = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { ok: true, data: orders, error: null };
  } catch (error) {
    console.error('Error al obtener las órdenes del usuario:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Actualiza el estado de una orden
 *
 * @param {string} orderId - ID de la orden
 * @param {string} status - Nuevo estado
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    if (!orderId || !status) {
      return { ok: false, error: 'ID de orden o estado no proporcionado' };
    }

    const orderRef = doc(FirebaseDB, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date()
    });

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error al actualizar el estado de la orden:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Crea un Payment Intent en Stripe
 *
 * @param {number} amount - Monto a cobrar (en pesos mexicanos)
 * @param {string} paymentMethodId - ID del método de pago a usar
 * @returns {Promise<{ok: boolean, clientSecret: string, error: string}>} - Resultado de la operación
 */
export const createPaymentIntent = async (amount, paymentMethodId) => {
  try {
    if (!amount || amount <= 0) {
      return { ok: false, error: 'Monto inválido' };
    }

    if (!paymentMethodId) {
      return { ok: false, error: 'Método de pago no proporcionado' };
    }

    // Llamar a la Cloud Function para crear el Payment Intent
    const functions = getFunctions();
    const createIntent = httpsCallable(functions, 'createPaymentIntent');

    const result = await createIntent({
      amount, // Monto en pesos mexicanos
      paymentMethodId
    });

    if (!result.data || !result.data.clientSecret) {
      throw new Error('No se pudo crear el intento de pago');
    }

    return {
      ok: true,
      clientSecret: result.data.clientSecret,
      paymentIntentId: result.data.paymentIntentId,
      error: null
    };
  } catch (error) {
    console.error('Error al crear el intento de pago:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Procesa una orden completa (creación de orden y procesamiento de pago)
 *
 * @param {Object} orderData - Datos de la orden
 * @param {string} paymentMethodId - ID del método de pago
 * @returns {Promise<{ok: boolean, orderId: string, error: string}>} - Resultado de la operación
 */
export const processOrder = async (orderData, paymentMethodId) => {
  try {
    // 1. Crear la orden con estado "pending"
    const orderResult = await createOrder(orderData);

    if (!orderResult.ok) {
      throw new Error(orderResult.error || 'Error al crear la orden');
    }

    const orderId = orderResult.id;

    // 2. Crear el Payment Intent
    const paymentIntent = await createPaymentIntent(
      orderData.totals.finalTotal * 100, // Convertir a centavos para Stripe
      paymentMethodId
    );

    if (!paymentIntent.ok) {
      // Si falla el pago, actualizar la orden a "cancelled"
      await updateOrderStatus(orderId, 'cancelled');
      throw new Error(paymentIntent.error || 'Error al procesar el pago');
    }

    // 3. Actualizar la orden con el ID del Payment Intent
    const orderRef = doc(FirebaseDB, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      'payment.stripePaymentIntentId': paymentIntent.paymentIntentId,
      'payment.status': 'pending',
      updatedAt: new Date()
    });

    return {
      ok: true,
      orderId,
      clientSecret: paymentIntent.clientSecret,
      error: null
    };
  } catch (error) {
    console.error('Error al procesar la orden:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Confirma el pago de una orden
 *
 * @param {string} orderId - ID de la orden
 * @param {string} paymentIntentId - ID del Payment Intent de Stripe
 * @returns {Promise<{ok: boolean, error: string}>} - Resultado de la operación
 */
export const confirmOrderPayment = async (orderId, paymentIntentId) => {
  try {
    if (!orderId || !paymentIntentId) {
      return { ok: false, error: 'ID de orden o pago no proporcionado' };
    }

    // Llamar a la Cloud Function para confirmar el pago
    const functions = getFunctions();
    const confirmPayment = httpsCallable(functions, 'confirmOrderPayment');

    const result = await confirmPayment({
      orderId,
      paymentIntentId
    });

    if (!result.data || !result.data.success) {
      throw new Error(result.data?.error || 'No se pudo confirmar el pago');
    }

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error al confirmar el pago de la orden:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Solicita la generación de factura para una orden
 *
 * @param {string} orderId - ID de la orden
 * @param {Object} fiscalData - Datos fiscales para la factura
 * @returns {Promise<{ok: boolean, invoiceId: string, error: string}>} - Resultado de la operación
 */
export const requestInvoice = async (orderId, fiscalData) => {
  try {
    if (!orderId || !fiscalData || !fiscalData.rfc || !fiscalData.businessName) {
      return { ok: false, error: 'Datos incompletos para facturación' };
    }

    // Llamar a la Cloud Function para generar la factura
    const functions = getFunctions();
    const generateInvoice = httpsCallable(functions, 'generateInvoice');

    const result = await generateInvoice({
      orderId,
      fiscalData
    });

    if (!result.data || !result.data.invoiceId) {
      throw new Error(result.data?.error || 'No se pudo generar la factura');
    }

    return {
      ok: true,
      invoiceId: result.data.invoiceId,
      error: null
    };
  } catch (error) {
    console.error('Error al solicitar factura:', error);
    return { ok: false, error: error.message };
  }
};