// functions/payment/paymentIntents.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { stripe, getOrCreateCustomer, logPaymentIntent, updatePaymentIntentStatus } = require("./stripeService");

/**
 * Cloud Function para crear un Payment Intent de Stripe
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para realizar pagos"
    );
  }

  const { amount, paymentMethodId, description = "Compra en Cactilia" } = data;

  // Validar datos
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "El monto debe ser mayor a cero"
    );
  }

  if (!paymentMethodId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requiere un método de pago"
    );
  }

  try {
    // Obtener o crear cliente Stripe
    const stripeCustomerId = await getOrCreateCustomer(context.auth.uid);

    // Crear un Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Stripe requiere el monto en centavos
      currency: 'mxn', // Moneda mexicana
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      description,
      confirmation_method: 'manual',
      setup_future_usage: 'off_session', // Permite usar este método para pagos futuros
      metadata: {
        firebaseUserId: context.auth.uid
      }
    });

    // Registrar intento de pago
    await logPaymentIntent(
      paymentIntent.id,
      context.auth.uid,
      amount,
      paymentIntent.status
    );

    // Retornar client_secret para confirmar desde el cliente
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error("Error creando Payment Intent:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function para confirmar el pago de una orden
 */
exports.confirmOrderPayment = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para confirmar pagos"
    );
  }

  const { orderId, paymentIntentId } = data;

  // Validar datos
  if (!orderId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requiere un ID de orden"
    );
  }

  if (!paymentIntentId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Se requiere un ID de Payment Intent"
    );
  }

  try {
    // Obtener la orden
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new Error("La orden no existe");
    }

    const orderData = orderSnap.data();

    // Verificar que la orden pertenezca al usuario autenticado
    if (orderData.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "No tienes permiso para confirmar esta orden"
      );
    }

    // Consultar el estado del Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Actualizar el registro de Payment Intent
    await updatePaymentIntentStatus(paymentIntentId, paymentIntent.status);

    // Determinar el estado de la orden basado en el resultado del pago
    let orderStatus;
    let paymentStatus;

    switch (paymentIntent.status) {
      case 'succeeded':
        orderStatus = 'processing'; // La orden pasa a procesamiento
        paymentStatus = 'succeeded';
        break;
      case 'processing':
        orderStatus = 'pending';
        paymentStatus = 'processing';
        break;
      case 'requires_payment_method':
        orderStatus = 'payment_failed';
        paymentStatus = 'failed';
        break;
      case 'canceled':
        orderStatus = 'cancelled';
        paymentStatus = 'cancelled';
        break;
      default:
        orderStatus = 'pending';
        paymentStatus = paymentIntent.status;
    }

    // Actualizar la orden con el estado del pago
    await orderRef.update({
      status: orderStatus,
      'payment.status': paymentStatus,
      'payment.paymentIntentId': paymentIntentId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Si el pago fue exitoso, actualizar el inventario
    if (paymentStatus === 'succeeded') {
      await updateInventory(orderData.items);
    }

    return {
      success: true,
      orderStatus,
      paymentStatus
    };
  } catch (error) {
    console.error("Error confirmando pago:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Función para actualizar el inventario después de una compra exitosa
 */
async function updateInventory(items) {
  // Obtener un batch para hacer múltiples actualizaciones
  const batch = admin.firestore().batch();

  // Iterar sobre cada producto en la orden
  for (const item of items) {
    const productRef = admin.firestore().collection('products').doc(item.id);
    const productSnap = await productRef.get();

    if (productSnap.exists) {
      const product = productSnap.data();
      const newStock = Math.max(0, (product.stock || 0) - item.quantity);

      // Actualizar el stock
      batch.update(productRef, {
        stock: newStock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }

  // Ejecutar todas las actualizaciones en un batch
  await batch.commit();
}