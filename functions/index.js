/**
 * Main Firebase Functions entry point file
 */
const admin = require("firebase-admin");

// Avoid duplicate initialization
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import payment functions (v2 format)
const paymentFunctions = require('./payment/paymentIntents');
const paymentMethodFunctions = require('./payment/paymentMethods');
const stripeService = require('./payment/stripeService');

// Import auth functions
const authFunctions = require("./auth/setCustomClaims");

// Import test function
const { basicTest } = require("./payment/test-function");

// Export all functions
exports.createPaymentIntent = paymentFunctions.createPaymentIntent;
exports.confirmOrderPayment = paymentFunctions.confirmOrderPayment;
exports.createSetupIntent = paymentMethodFunctions.createSetupIntent;
exports.savePaymentMethod = paymentMethodFunctions.savePaymentMethod;
exports.detachPaymentMethod = paymentMethodFunctions.detachPaymentMethod;

// Export auth functions
exports.setCustomClaims = authFunctions.setCustomClaims;
exports.deleteUser = authFunctions.deleteUser;
exports.getUsersDetail = authFunctions.getUsersDetail;

// Export test function
exports.basicTest = basicTest;