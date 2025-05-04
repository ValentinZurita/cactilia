/**
 * Cloud Function para crear PaymentIntents para pagos con OXXO en Stripe
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { stripeSecretParam, getOrCreateCustomer, logPaymentIntent } = require("./stripeService");

/**
 * Cloud Function para crear un PaymentIntent de Stripe para pagos con OXXO
 */
exports.createOxxoPaymentIntent = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: true
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para realizar pagos"
    );
  }

  const { amount, description = "Compra en Cactilia", customer_email, orderId } = request.data;

  // Validar datos
  if (!amount || amount <= 0) {
    throw new HttpsError(
      "invalid-argument",
      "El monto debe ser mayor a cero"
    );
  }

  if (!customer_email) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un email de cliente para pagos con OXXO"
    );
  }

  if (!orderId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un ID de orden para asociar al pago."
    );
  }

  try {
    // Inicializar Stripe con el secreto
    const stripe = require("stripe")(stripeSecretParam.value());

    // Obtener o crear cliente Stripe
    const stripeCustomerId = await getOrCreateCustomer(request.auth.uid, stripe);

    // Crear un PaymentIntent para OXXO
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Stripe requiere el monto en centavos
      currency: 'mxn', // Moneda mexicana
      customer: stripeCustomerId,
      description,
      payment_method_types: ['oxxo'], // Especificamos que es tipo OXXO
      receipt_email: customer_email, // Para enviar recibo
      payment_method_options: {
        oxxo: {
          expires_after_days: 3,
        }
      },
      metadata: {
        firebaseUserId: request.auth.uid,
        paymentType: 'oxxo',
        orderId: orderId
      }
    });

    // Registrar intento de pago
    await logPaymentIntent(
      paymentIntent.id,
      request.auth.uid,
      amount,
      paymentIntent.status,
      'oxxo'
    );

    // Retornar client_secret para usar en el cliente
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error("Error creando OXXO PaymentIntent:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function para verificar el estado de un pago con OXXO
 * Esta función se puede llamar periódicamente o cuando el usuario
 * regresa a la aplicación para verificar si ya se realizó el pago
 */
exports.checkOxxoPaymentStatus = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: true
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para verificar el estado del pago"
    );
  }

  const { paymentIntentId, orderId } = request.data;

  // Validar datos
  if (!paymentIntentId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un ID de PaymentIntent"
    );
  }

  if (!orderId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un ID de orden"
    );
  }

  try {
    // Inicializar Stripe con el secreto
    const stripe = require("stripe")(stripeSecretParam.value());

    // Verificar estado del pago
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Obtener la orden
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new Error("La orden no existe");
    }

    const orderData = orderSnap.data();

    // Verificar que la orden pertenezca al usuario autenticado
    if (orderData.userId !== request.auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "No tienes permiso para verificar esta orden"
      );
    }

    // Actualizar estado de la orden según el estado del pago
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
      case 'requires_payment':
        // Estado especial para OXXO mientras espera el pago
        orderStatus = 'pending';
        paymentStatus = 'awaiting_payment';
        break;
      case 'canceled':
        orderStatus = 'cancelled';
        paymentStatus = 'cancelled';
        break;
      default:
        orderStatus = 'pending';
        paymentStatus = paymentIntent.status;
    }

    // Actualizar la orden con el estado actual
    await orderRef.update({
      status: orderStatus,
      'payment.status': paymentStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      orderStatus,
      paymentStatus,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        // Si hay un voucher de OXXO, incluirlo en la respuesta
        next_action: paymentIntent.next_action
      }
    };
  } catch (error) {
    console.error("Error verificando pago OXXO:", error);
    throw new HttpsError("internal", error.message);
  }
});