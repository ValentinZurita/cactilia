/**
 * Main Firebase Functions entry point file
 */
const admin = require("firebase-admin");
const functions = require('firebase-functions');

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
// const verificationFunction = require("./auth/markEmailVerified"); // No longer needed
const setupDemoFunction = require("./auth/setupDemoUsers"); // Import the new setup function

// Import test function
const { basicTest } = require("./payment/test-function");

// Import OXXO payment functions
const oxxoFunctions = require('./payment/oxxoPaymentIntent');
const { simulateOxxoPayment } = require('./payment/simulateOxxOPayment');

// Import address functions
const { saveAddress } = require('./address/saveAddress');

// Import contact functions
const contactFunctions = require('./contact/contactFunctions');

// Import storage related functions
const storageFunctions = require('./storage/updateMediaMetadata');

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
// exports.markDemoEmailVerified = verificationFunction.markDemoEmailVerified; // Remove or comment out
exports.setupDemoUsers = setupDemoFunction.setupDemoUsers; // Export the new setup function

// Export test function
exports.basicTest = basicTest;

// Export email functions
exports.resendOrderConfirmationEmail = resendEmails.resendOrderConfirmationEmail;
exports.sendOrderShippedEmail = shippedEmails.sendOrderShippedEmail;
exports.sendInvoiceEmail = invoiceEmails.sendInvoiceEmail;

// Export OXXO payment functions
exports.createOxxoPaymentIntent = oxxoFunctions.createOxxoPaymentIntent;
exports.checkOxxoPaymentStatus = oxxoFunctions.checkOxxoPaymentStatus;
exports.simulateOxxoPayment = simulateOxxoPayment;

// Export address functions
exports.saveAddress = saveAddress;

// Export contact functions
exports.sendContactEmail = contactFunctions.sendContactEmail;

// Export storage functions
exports.updateFirestoreWithThumbnails = storageFunctions.updateFirestoreWithThumbnails;

// Configurar las variables de entorno con:
// firebase functions:config:set email.user="tu-correo@gmail.com" email.password="tu-contraseña"