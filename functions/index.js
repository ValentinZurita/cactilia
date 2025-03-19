/**
 * Archivo principal para Firebase Functions (2da generación)
 */

const admin = require("firebase-admin");

// ⚠️ Evitar inicialización duplicada
if (!admin.apps.length) {
  admin.initializeApp();
}

// Importar funciones de autenticación
const authFunctions = require("./auth/setCustomClaims");

// Importar función de prueba
const { basicTest } = require("./payment/test-function");

// Importar funciones de pago
const paymentIntents = require('./payment/paymentIntents');
const paymentMethods = require('./payment/paymentMethods');

// Exportar las funciones explícitamente
exports.setCustomClaims = authFunctions.setCustomClaims;
exports.deleteUser = authFunctions.deleteUser;
exports.getUsersDetail = authFunctions.getUsersDetail;

// Exportar función de prueba básica
exports.basicTest = basicTest;

// Exportar funciones de pago
exports.createPaymentIntent = paymentIntents.createPaymentIntent;
exports.confirmOrderPayment = paymentIntents.confirmOrderPayment;

// Exportar funciones de métodos de pago
exports.createSetupIntent = paymentMethods.createSetupIntent;
exports.savePaymentMethod = paymentMethods.savePaymentMethod;
exports.detachPaymentMethod = paymentMethods.detachPaymentMethod;

// Exportar funciones de notificaciones (comentadas por ahora)
// const orderEmails = require('./notifications/orderEmails');
// exports.sendOrderConfirmationEmail = orderEmails.sendOrderConfirmationEmail;
// exports.sendOrderStatusUpdateEmail = orderEmails.sendOrderStatusUpdateEmail;
// exports.sendInvoiceEmail = orderEmails.sendInvoiceEmail;