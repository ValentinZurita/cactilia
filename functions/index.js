const admin = require("firebase-admin");

// ⚠️ Evitar inicialización duplicada
if (!admin.apps.length) {
  admin.initializeApp();
}

// Importar funciones de pago
const paymentIntents = require('./payment/paymentIntents');
const paymentMethods = require('./payment/paymentMethods');
const orderEmails = require('./notifications/orderEmails');

// Importar la función desde setCustomClaims.js
const { setCustomClaims, deleteUserByUID, getUserDetailsByUID } = require("./auth/setCustomClaims");

// Exportar la función
exports.setCustomClaims = setCustomClaims;
exports.deleteUserByUID = deleteUserByUID;
exports.getUserDetailsByUID = getUserDetailsByUID;

// Exportar funciones de pago
exports.createPaymentIntent = paymentIntents.createPaymentIntent;
exports.confirmOrderPayment = paymentIntents.confirmOrderPayment;

// Exportar funciones de métodos de pago
exports.createSetupIntent = paymentMethods.createSetupIntent;
exports.savePaymentMethod = paymentMethods.savePaymentMethod;
exports.detachPaymentMethod = paymentMethods.detachPaymentMethod;

// Exportar funciones de notificaciones
exports.sendOrderConfirmationEmail = orderEmails.sendOrderConfirmationEmail;
exports.sendOrderStatusUpdateEmail = orderEmails.sendOrderStatusUpdateEmail;
exports.sendInvoiceEmail = orderEmails.sendInvoiceEmail;