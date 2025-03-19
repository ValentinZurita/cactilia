// functions/payment/stripeService.js
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

// Definir la clave secreta de Stripe como un parámetro secreto
const stripeSecretParam = defineSecret("STRIPE_SECRET_KEY");

// No inicializar Stripe aquí, sino en cada función
// Así lo inicializamos en tiempo de ejecución

/**
 * Obtiene o crea un cliente de Stripe para un usuario
 */
async function getOrCreateCustomer(uid, stripeInstance) {
  try {
    // Buscar si ya existe un customerID
    const userSnapshot = await admin.firestore()
      .collection('users')
      .doc(uid)
      .get();

    let stripeCustomerId = userSnapshot.exists ? userSnapshot.data().stripeCustomerId : null;

    // Si no existe, crear nuevo cliente en Stripe
    if (!stripeCustomerId) {
      const user = await admin.auth().getUser(uid);

      const customer = await stripeInstance.customers.create({
        email: user.email,
        name: user.displayName || '',
        metadata: {
          firebaseUserId: uid
        }
      });

      stripeCustomerId = customer.id;

      // Guardar ID en Firestore
      await admin.firestore()
        .collection('users')
        .doc(uid)
        .set({ stripeCustomerId }, { merge: true });
    }

    return stripeCustomerId;
  } catch (error) {
    console.error("Error al obtener/crear cliente Stripe:", error);
    throw error;
  }
}

/**
 * Registra un intento de pago en Firestore para seguimiento
 */
async function logPaymentIntent(paymentIntentId, userId, amount, status) {
  try {
    await admin.firestore()
      .collection('payment_intents')
      .doc(paymentIntentId)
      .set({
        userId,
        amount,
        status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
  } catch (error) {
    console.error("Error al registrar intento de pago:", error);
    // No lanzamos error para que no interrumpa el flujo principal
  }
}

/**
 * Actualiza el estado de un intento de pago en Firestore
 */
async function updatePaymentIntentStatus(paymentIntentId, status) {
  try {
    await admin.firestore()
      .collection('payment_intents')
      .doc(paymentIntentId)
      .update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
  } catch (error) {
    console.error("Error al actualizar estado del intento de pago:", error);
  }
}

module.exports = {
  stripeSecretParam,
  getOrCreateCustomer,
  logPaymentIntent,
  updatePaymentIntentStatus
};