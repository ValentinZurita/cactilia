const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { stripeSecretParam, updatePaymentIntentStatus } = require("./stripeService"); // Reutilizamos stripeService
const admin = require("firebase-admin"); // Necesario para verificar permisos de admin (opcional pero recomendado)

/**
 * Cloud Function to manually capture a Stripe Payment Intent.
 * Requires admin privileges (simplistic check for now).
 */
exports.capturePaymentIntent = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: ['http://localhost:5174', 'http://localhost:5173', 'https://cactilia-3678a.web.app']
}, async (request) => {
  console.log("*** capturePaymentIntent function started ***");
  console.log("Auth context:", request.auth ? request.auth.uid : 'No auth');
  console.log("Request data:", JSON.stringify(request.data));

  // --- Verificación de Autenticación y Permisos (Simplificada) ---
  if (!request.auth) {
    console.error("Authentication failed: No auth context.");
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  // TODO: Implementar una verificación de roles robusta.
  // Por ahora, asumimos que cualquier usuario autenticado que llame es admin.
  // const userRecord = await admin.auth().getUser(request.auth.uid);
  // if (!userRecord.customClaims || !userRecord.customClaims.admin) {
  //   console.error("Authorization failed: User is not an admin.");
  //   throw new HttpsError("permission-denied", "Admin privileges required.");
  // }
  // --- Fin Verificación ---

  const { paymentIntentId } = request.data;

  if (!paymentIntentId) {
    console.error("Validation failed: Missing paymentIntentId.");
    throw new HttpsError("invalid-argument", "Payment Intent ID is required.");
  }

  try {
    console.log(`Attempting to capture Payment Intent: ${paymentIntentId}`);
    const stripeApiKey = stripeSecretParam.value();
    const stripe = require("stripe")(stripeApiKey);

    // Capturar el Payment Intent
    const capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    console.log(`Payment Intent ${capturedPaymentIntent.id} captured successfully. Status: ${capturedPaymentIntent.status}`);

    // Opcional: Actualizar el estado en Firestore inmediatamente (aunque el webhook lo hará también)
    // Podrías querer hacerlo aquí para una respuesta más rápida en el UI del admin
    // await updatePaymentIntentStatus(capturedPaymentIntent.id, capturedPaymentIntent.status);

    // Devolver éxito
    return {
      success: true,
      status: capturedPaymentIntent.status // Devolver el nuevo estado (debería ser 'succeeded')
    };

  } catch (error) {
    console.error(`Error capturing Payment Intent ${paymentIntentId}:`, error);
    // Devolver un error específico de Stripe si está disponible
    if (error.type === 'StripeCardError') {
       throw new HttpsError("aborted", `Capture failed: ${error.message} (Code: ${error.code})`);
    } else if (error.code === 'payment_intent_unexpected_state') {
       console.warn(`Payment Intent ${paymentIntentId} is not in a capturable state (e.g., already captured or failed). Current status: ${error.payment_intent?.status}`);
       // Devolver un mensaje específico indicando que no se puede capturar
       throw new HttpsError("failed-precondition", `Payment Intent cannot be captured. Status: ${error.payment_intent?.status}. Message: ${error.message}`);
    } else {
       throw new HttpsError("internal", `An unexpected error occurred during capture: ${error.message}`);
    }
  }
}); 