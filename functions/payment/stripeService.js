// functions/payment/stripeService.js
const Stripe = require('stripe'); // Import Stripe library
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

// Define Stripe secret key as a secret parameter
const stripeSecretParam = defineSecret("STRIPE_SECRET_KEY");
// Define Stripe webhook secret as a secret parameter
const stripeWebhookSecretParam = defineSecret("STRIPE_WEBHOOK_SECRET");

// Keep track of initialized Stripe instance
let stripeInstance = null;

/**
 * Initializes the Stripe instance using the secret key.
 * Should be called once per function instance.
 * @returns {Stripe} Initialized Stripe instance
 */
function initializeStripe() {
  if (!stripeInstance) {
    const stripeSecretKey = stripeSecretParam.value(); // Access the secret value
    if (!stripeSecretKey) {
      console.error("Stripe secret key is not configured!");
      throw new Error("Stripe secret key is missing. Configure STRIPE_SECRET_KEY secret.");
    }
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10' // Use a recent API version
    });
    console.log("Stripe instance initialized.");
  } else {
    console.log("Stripe instance already initialized.");
  }
  return stripeInstance;
}

/**
 * Get or create a Stripe customer for a user
 */
async function getOrCreateCustomer(uid, stripeInstance) {
  try {
    // Look for existing customerId
    const userSnapshot = await admin.firestore()
      .collection('users')
      .doc(uid)
      .get();

    let stripeCustomerId = userSnapshot.exists ? userSnapshot.data().stripeCustomerId : null;

    // If it doesn't exist, create a new Stripe customer
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

      // Save ID to Firestore
      await admin.firestore()
        .collection('users')
        .doc(uid)
        .set({ stripeCustomerId }, { merge: true });
    }

    return stripeCustomerId;
  } catch (error) {
    console.error("Error getting/creating Stripe customer:", error);
    throw error;
  }
}

/**
 * Log a payment intent in Firestore for tracking
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
    console.error("Error logging payment intent:", error);
    // Don't throw to avoid interrupting the main flow
  }
}

/**
 * Update a payment intent status in Firestore
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
    console.error("Error updating payment intent status:", error);
  }
}

module.exports = {
  stripeSecretParam,
  stripeWebhookSecretParam,
  getOrCreateCustomer,
  logPaymentIntent,
  updatePaymentIntentStatus,
  initializeStripe
};