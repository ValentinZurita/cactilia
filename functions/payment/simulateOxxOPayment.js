const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { stripeSecretParam } = require("./stripeService");

/**
 * Cloud Function para simular un pago completado de OXXO en desarrollo
 * IMPORTANTE: Esta función solo debe estar habilitada en entorno de desarrollo
 */
exports.simulateOxxoPayment = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: true
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para simular pagos"
    );
  }

  // Proteger de uso en producción
  if (process.env.NODE_ENV === 'production') {
    throw new HttpsError(
      "failed-precondition",
      "Esta función solo puede usarse en entorno de desarrollo"
    );
  }

  const { orderId, paymentIntentId } = request.data;

  // Validar datos
  if (!orderId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un ID de orden"
    );
  }

  if (!paymentIntentId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requiere un ID de Payment Intent"
    );
  }

  try {
    // Inicializar Stripe con el secreto
    const stripe = require("stripe")(stripeSecretParam.value());

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
        "No tienes permiso para simular el pago de esta orden"
      );
    }

    // Verificar que sea un pago OXXO pendiente
    if (orderData.payment?.type !== 'oxxo' || orderData.status !== 'pending') {
      throw new HttpsError(
        "failed-precondition",
        "Solo se pueden simular pagos OXXO pendientes"
      );
    }

    // Simular la actualización en Stripe
    // En producción esto lo haría un webhook cuando OXXO confirma el pago
    // Aquí lo simulamos
    let paymentIntent;
    try {
      // Si estamos en modo mock (desarrollo local), crear un objeto de simulación
      if (process.env.FUNCTIONS_EMULATOR === 'true') {
        console.log('📦 Simulando actualización de PaymentIntent en modo mock');
        paymentIntent = {
          id: paymentIntentId,
          status: 'succeeded'
        };
      } else {
        // Si hay conexión a Stripe, intentar actualizar el PaymentIntent real
        paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
          status: 'succeeded'
        });
      }
    } catch (stripeError) {
      console.warn('No se pudo actualizar el PaymentIntent en Stripe, continuando con simulación:', stripeError);
      // Continuar con la simulación aunque Stripe falle
      paymentIntent = {
        id: paymentIntentId,
        status: 'succeeded'
      };
    }

    // Actualizar la orden - Simular lo que haría el webhook
    await orderRef.update({
      status: 'processing', // La orden pasa a procesamiento
      'payment.status': 'succeeded',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Actualizar el registro de Payment Intent
    try {
      const paymentIntentRef = admin.firestore().collection('payment_intents').doc(paymentIntentId);
      await paymentIntentRef.update({
        status: 'succeeded',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (dbError) {
      console.warn('Error actualizando registro de payment_intents:', dbError);
      // No interrumpir el flujo si este registro falla
    }

    // Actualizar el inventario
    try {
      await updateInventory(orderData.items);
    } catch (inventoryError) {
      console.error('Error actualizando inventario:', inventoryError);
      // No interrumpir el flujo si la actualización de inventario falla
    }

    return {
      success: true,
      message: 'Pago OXXO simulado correctamente',
      orderStatus: 'processing',
      paymentStatus: 'succeeded'
    };
  } catch (error) {
    console.error("Error simulando pago OXXO:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Función para actualizar el inventario después de una compra exitosa
 * Copiada de confirmOrderPayment para mantener consistencia
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