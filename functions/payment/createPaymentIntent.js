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
  cors: true // Allow CORS from any origin during development
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be logged in to make payments"
    );
  }

  const { amount, paymentMethodId, description = "Purchase at Cactilia" } = request.data;

  // Validate data
  if (!amount || amount <= 0) {
    throw new HttpsError(
      "invalid-argument",
      "Amount must be greater than zero"
    );
  }

  if (!paymentMethodId) {
    throw new HttpsError(
      "invalid-argument",
      "Payment method is required"
    );
  }

  try {
    // Initialize Stripe with the secret
    const stripe = require("stripe")(stripeSecretParam.value());

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateCustomer(request.auth.uid, stripe);

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Stripe requires amount in cents
      currency: 'mxn', // Mexican currency
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      description,
      confirmation_method: 'manual',
      setup_future_usage: 'off_session', // Allow using this method for future payments
      metadata: {
        firebaseUserId: request.auth.uid
      }
    });

    // Log payment attempt
    await logPaymentIntent(
      paymentIntent.id,
      request.auth.uid,
      amount,
      paymentIntent.status
    );

    // Return client_secret for confirming from the client
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error("Error creating Payment Intent:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function to confirm an order payment
 */
exports.confirmOrderPayment = onCall({
  region: "us-central1",
  secrets: [stripeSecretParam],
  cors: true // Allow CORS from any origin during development
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