// functions/payment/paymentMethods.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { stripeSecretParam, getOrCreateCustomer } = require("./stripeService");

/**
 * Cloud Function para crear un Setup Intent
 */
exports.createSetupIntent = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam]
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para crear un setup intent"
    );
  }

  try {
    // Inicializar Stripe con el secreto
    const stripe = require("stripe")(stripeSecretParam.value());

    // Obtener o crear cliente Stripe
    const stripeCustomerId = await getOrCreateCustomer(request.auth.uid, stripe);

    // Crear un SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      usage: 'off_session', // Permite usar este método para pagos futuros
    });

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    };
  } catch (error) {
    console.error("Error creando setup intent:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function para guardar un método de pago
 */
exports.savePaymentMethod = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam]
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para guardar un método de pago"
    );
  }

  const { setupIntentId, paymentMethodId, isDefault = false, cardHolder } = request.data;

  if (!setupIntentId || !paymentMethodId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requieren ID de setup intent y método de pago"
    );
  }

  try {
    // Inicializar Stripe con el secreto
    const stripe = require("stripe")(stripeSecretParam.value());

    // Verificar que el setup intent se completó correctamente
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== 'succeeded') {
      throw new HttpsError(
        "failed-precondition",
        "El setup intent no se ha completado correctamente"
      );
    }

    // Obtener detalles del método de pago
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Obtener o crear cliente Stripe
    const stripeCustomerId = await getOrCreateCustomer(request.auth.uid, stripe);

    // Si debe ser el método predeterminado, actualizar en Stripe
    if (isDefault) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Actualizar todos los métodos de pago existentes a no predeterminados
      const existingMethods = await admin.firestore()
        .collection('payment_methods')
        .where('userId', '==', request.auth.uid)
        .where('isDefault', '==', true)
        .get();

      const batch = admin.firestore().batch();
      existingMethods.forEach(doc => {
        batch.update(doc.ref, { isDefault: false });
      });
      await batch.commit();
    }

    // Guardar método de pago en Firestore
    const paymentMethodData = {
      userId: request.auth.uid,
      stripePaymentMethodId: paymentMethod.id,
      type: paymentMethod.card.brand.toLowerCase(),
      cardNumber: `**** **** **** ${paymentMethod.card.last4}`,
      expiryDate: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
      cardHolder: cardHolder || paymentMethod.billing_details.name || '',
      isDefault: isDefault,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await admin.firestore()
      .collection('payment_methods')
      .add(paymentMethodData);

    return {
      success: true,
      paymentMethodId: docRef.id
    };
  } catch (error) {
    console.error("Error guardando método de pago:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function para eliminar un método de pago
 */
exports.detachPaymentMethod = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam]
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Debes iniciar sesión para eliminar un método de pago"
    );
  }

  const { paymentMethodId, stripePaymentMethodId } = request.data;

  if (!paymentMethodId || !stripePaymentMethodId) {
    throw new HttpsError(
      "invalid-argument",
      "Se requieren IDs del método de pago"
    );
  }

  try {
    // Inicializar Stripe con el secreto
    const stripe = require("stripe")(stripeSecretParam.value());

    // Verificar que el método existe y pertenece al usuario
    const methodRef = admin.firestore().collection('payment_methods').doc(paymentMethodId);
    const methodDoc = await methodRef.get();

    if (!methodDoc.exists) {
      throw new HttpsError("not-found", "Método de pago no encontrado");
    }

    const methodData = methodDoc.data();
    if (methodData.userId !== request.auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "No tienes permiso para eliminar este método de pago"
      );
    }

    // No permitir eliminar el método predeterminado
    if (methodData.isDefault) {
      throw new HttpsError(
        "failed-precondition",
        "No puedes eliminar el método de pago predeterminado"
      );
    }

    // Eliminar método de pago en Stripe
    await stripe.paymentMethods.detach(stripePaymentMethodId);

    // Eliminar método de pago en Firestore
    await methodRef.delete();

    return { success: true };
  } catch (error) {
    console.error("Error eliminando método de pago:", error);
    throw new HttpsError("internal", error.message);
  }
});