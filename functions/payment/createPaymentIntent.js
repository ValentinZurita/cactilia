// functions/payment/paymentIntents.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { stripeSecretParam, getOrCreateCustomer, logPaymentIntent, updatePaymentIntentStatus } = require("./stripeService");

/**
 * Cloud Function to create a Stripe Payment Intent
 */
exports.createPaymentIntent = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: ['http://localhost:5174', 'http://localhost:5173']
}, async (request) => {
  // --- Añadir Log de Inicio ---
  console.log("*** createPaymentIntent function started ***");
  console.log("Auth context:", request.auth ? request.auth.uid : 'No auth');
  console.log("Request data:", JSON.stringify(request.data)); // Loguear datos recibidos
  // --- Fin Log de Inicio ---

  // Verify authentication
  if (!request.auth) {
    console.error("Authentication failed: No auth context found."); // Log específico
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to make payments"
    );
  }

  const { amount, paymentMethodId, description = "Purchase at Cactilia" } = request.data;

  // Validate data
  if (!amount || amount <= 0) {
    console.error("Validation failed: Invalid amount.", amount); // Log específico
    throw new HttpsError(
      "invalid-argument",
      "Amount must be greater than zero"
    );
  }

  if (!paymentMethodId) {
    console.error("Validation failed: Missing paymentMethodId."); // Log específico
    throw new HttpsError(
      "invalid-argument",
      "Payment method is required"
    );
  }

  try {
    console.log("Initializing Stripe and getting customer...");
    // Initialize Stripe with the secret
    const stripeApiKey = stripeSecretParam.value();

    const stripe = require("stripe")(stripeApiKey);

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateCustomer(request.auth.uid, stripe);
    console.log("Stripe Customer ID:", stripeCustomerId);

    console.log("Creating Stripe Payment Intent...");
    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'mxn',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      description,
      capture_method: 'manual',
      confirmation_method: 'automatic',
      confirm: false,
      setup_future_usage: 'off_session',
      metadata: {
        firebaseUserId: request.auth.uid
      }
    });
    console.log("Stripe Payment Intent created:", paymentIntent.id, "Status:", paymentIntent.status);

    // Log payment attempt
    console.log("Logging Payment Intent to Firestore...");
    await logPaymentIntent(
      paymentIntent.id,
      request.auth.uid,
      amount,
      paymentIntent.status
    );
    console.log("Payment Intent logged.");

    // Return client_secret for confirming from the client
    console.log("Returning clientSecret and paymentIntentId.");
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error("Error during Payment Intent creation process:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function to confirm an order payment
 */
exports.confirmOrderPayment = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: ['http://localhost:5174', 'http://localhost:5173']
}, async (request) => {
  // Similar implementation to the one you already have, but using v2 format
  // ...
});

/**
 * Function to update inventory after successful purchase
 */
async function updateInventory(items) {
  // Your existing implementation
  // ...
}