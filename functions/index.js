const admin = require("firebase-admin");

// ⚠️ Evitar inicialización duplicada
if (!admin.apps.length) {
  admin.initializeApp();
}

// Importar la función desde setCustomClaims.js
const { setCustomClaims, deleteUserByUID, getUserDetailsByUID } = require("./setCustomClaims");
const { createSetupIntent, savePaymentMethod, detachPaymentMethod } = require('./stripePayment')

// Exportar la función
exports.setCustomClaims = setCustomClaims;
exports.deleteUserByUID = deleteUserByUID;
exports.getUserDetailsByUID = getUserDetailsByUID;

// Exportar las funciones de Stripe
exports.createSetupIntent = createSetupIntent;
exports.savePaymentMethod = savePaymentMethod;
exports.detachPaymentMethod = detachPaymentMethod;