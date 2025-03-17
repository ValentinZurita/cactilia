const admin = require("firebase-admin");
const functions = require("firebase-functions");
const stripe = require("stripe")(functions.config().stripe.secret);

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function to create a Setup Intent
 * This allows securely collecting payment details
 */
exports.createSetupIntent = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to create a setup intent"
    );
  }

  try {
    // Check if user already exists in Stripe
    const userSnapshot = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    let stripeCustomerId = userSnapshot.exists ? userSnapshot.data().stripeCustomerId : null;

    // If no Stripe customer exists, create one
    if (!stripeCustomerId) {
      const user = await admin.auth().getUser(context.auth.uid);

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || '',
        metadata: {
          firebaseUserId: context.auth.uid
        }
      });

      stripeCustomerId = customer.id;

      // Save the Stripe customer ID to Firestore
      await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .set({
          stripeCustomerId
        }, { merge: true });
    }

    // Create a SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      usage: 'off_session', // Allows using this payment method for future payments
    });

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    };
  } catch (error) {
    console.error("Error creating setup intent:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function to save payment method details after setup
 */
exports.savePaymentMethod = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to save a payment method"
    );
  }

  const { setupIntentId, paymentMethodId, isDefault } = data;

  if (!setupIntentId || !paymentMethodId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Setup intent ID and payment method ID are required"
    );
  }

  try {
    // Retrieve the setup intent to confirm it completed
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== 'succeeded') {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The setup intent has not succeeded"
      );
    }

    // Retrieve the payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Get the Stripe customer ID
    const userSnapshot = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userSnapshot.exists || !userSnapshot.data().stripeCustomerId) {
      throw new functions.https.HttpsError(
        "not-found",
        "Stripe customer not found"
      );
    }

    const stripeCustomerId = userSnapshot.data().stripeCustomerId;

    // Create a payment method document in Firestore
    const paymentMethodData = {
      userId: context.auth.uid,
      stripePaymentMethodId: paymentMethod.id,
      type: paymentMethod.card.brand.toLowerCase(),
      cardNumber: `**** **** **** ${paymentMethod.card.last4}`,
      expiryDate: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
      cardHolder: paymentMethod.billing_details.name || '',
      isDefault: isDefault || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Check if this is the first payment method or marked as default
    if (isDefault) {
      // Update Stripe customer's default payment method
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id
        }
      });

      // Reset any existing default payment methods
      const existingPaymentMethods = await admin.firestore()
        .collection('payment_methods')
        .where('userId', '==', context.auth.uid)
        .where('isDefault', '==', true)
        .get();

      const batch = admin.firestore().batch();

      existingPaymentMethods.forEach(doc => {
        batch.update(doc.ref, { isDefault: false });
      });

      await batch.commit();
    }

    // Add the new payment method
    const docRef = await admin.firestore()
      .collection('payment_methods')
      .add(paymentMethodData);

    return {
      success: true,
      paymentMethodId: docRef.id
    };
  } catch (error) {
    console.error("Error saving payment method:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function to detach a payment method from Stripe customer
 */
exports.detachPaymentMethod = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to detach a payment method"
    );
  }

  const { paymentMethodId } = data;

  if (!paymentMethodId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Payment method ID is required"
    );
  }

  try {
    // Detach the payment method from the customer
    await stripe.paymentMethods.detach(paymentMethodId);

    return { success: true };
  } catch (error) {
    console.error("Error detaching payment method:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Cloud Function to update default payment method
 */
exports.updateDefaultPaymentMethod = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to update default payment method"
    );
  }

  const { paymentMethodId } = data;

  if (!paymentMethodId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Payment method ID is required"
    );
  }

  try {
    // Get the payment method document
    const paymentMethodSnapshot = await admin.firestore()
      .collection('payment_methods')
      .doc(paymentMethodId)
      .get();

    if (!paymentMethodSnapshot.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Payment method not found"
      );
    }

    const paymentMethodData = paymentMethodSnapshot.data();

    // Verify the payment method belongs to the user
    if (paymentMethodData.userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You don't have permission to modify this payment method"
      );
    }

    // Get the Stripe customer ID
    const userSnapshot = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userSnapshot.exists || !userSnapshot.data().stripeCustomerId) {
      throw new functions.https.HttpsError(
        "not-found",
        "Stripe customer not found"
      );
    }

    const stripeCustomerId = userSnapshot.data().stripeCustomerId;

    // Update Stripe customer's default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodData.stripePaymentMethodId
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating default payment method:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});