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

// Import resend email functions
const resendEmails = require('./notifications/resendEmails');
const shippedEmails = require('./notifications/shippedEmails');
const invoiceEmails = require('./notifications/invoiceEmails');


// Import auth functions
const authFunctions = require("./auth/setCustomClaims");

// Import test function
const { basicTest } = require("./payment/test-function");

// Import OXXO payment functions
const oxxoFunctions = require('./payment/oxxoPaymentIntent');

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

// Export email functions
exports.resendOrderConfirmationEmail = resendEmails.resendOrderConfirmationEmail;
exports.sendOrderShippedEmail = shippedEmails.sendOrderShippedEmail;
exports.sendInvoiceEmail = invoiceEmails.sendInvoiceEmail;

// Export OXXO payment functions
exports.createOxxoPaymentIntent = oxxoFunctions.createOxxoPaymentIntent;
exports.checkOxxoPaymentStatus = oxxoFunctions.checkOxxoPaymentStatus;