// Función de prueba básica para verificar que la comunicación funciona
const { onCall, HttpsError } = require("firebase-functions/v2/https");

/**
 * Cloud Function de prueba que no depende de ningún servicio externo
 */
exports.basicTest = onCall({
  region: "us-central1"
}, async (request) => {
  try {
    // Verificar autenticación (opcional)
    if (request.auth) {
      return {
        success: true,
        message: "La función de prueba funciona correctamente",
        userId: request.auth.uid,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: true,
        message: "La función de prueba funciona correctamente (sin autenticación)",
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error("Error en la función de prueba:", error);
    throw new HttpsError("internal", error.message);
  }
});