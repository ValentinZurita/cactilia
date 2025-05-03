// functions/payment/stripeService.js
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

// Define Stripe secret key as a secret parameter
const stripeSecretParam = defineSecret("STRIPE_SECRET_KEY");
// Define Stripe webhook secret as a secret parameter
const stripeWebhookSecretParam = defineSecret("STRIPE_WEBHOOK_SECRET");

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
  updatePaymentIntentStatus
};