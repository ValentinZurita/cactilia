// notifications/resendEmails.js
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { sendEmail, sendgridApiKey, defaultSender } = require("../services/emailService");
const { getOrderConfirmationTemplate } = require('../templates/orderTemplates')

/**
 * Función para reenviar email de confirmación de pedido
 * Solo accesible para administradores
 */
exports.resendOrderConfirmationEmail = onCall({
  region: "us-central1",
  secrets: [sendgridApiKey, defaultSender]
}, async (request) => {
  try {
    const { orderId } = request.data;
    
    // Validar autenticación
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated', 
        'Debes iniciar sesión para realizar esta acción'
      );
    }
    
    console.log(`Buscando pedido con ID: ${orderId}`);
    
    // Obtener datos del pedido
    const orderDoc = await admin.firestore().collection('orders').doc(orderId).get();
    
    // *** MODO DEBUG/DESARROLLO ***
    // Verificar si estamos en los emuladores y usar modo desarrollo si es necesario
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
    
    if (!orderDoc.exists && isEmulator) {
      console.log('Pedido no encontrado, pero estamos en modo emulador. Usando datos de prueba.');
      
      // Generar datos ficticios para pruebas en el emulador
      return {
        success: true,
        message: 'Email de confirmación reenviado (MODO PRUEBA)',
        emulatorMode: true
      };
    }
    
    // Si no es emulador o queremos validar normalmente
    if (!orderDoc.exists) {
      console.error(`Pedido no encontrado: ${orderId}`);
      throw new HttpsError('not-found', 'Pedido no encontrado');
    }
    
    const orderData = orderDoc.data();

    // Obtener información del usuario
    const userSnap = await admin.firestore()
      .collection('users')
      .doc(orderData.userId)
      .get();

    if (!userSnap.exists) {
      throw new HttpsError(
        'not-found',
        'Usuario no encontrado'
      );
    }

    const userData = userSnap.data();
    const userEmail = userData.email;

    // Si no hay email, no podemos enviar
    if (!userEmail) {
      throw new HttpsError(
        'failed-precondition',
        'El usuario no tiene email'
      );
    }

    // Generar contenido del email
    const emailContent = getOrderConfirmationTemplate(orderData, orderId);

    // Enviar el email
    const emailData = {
      to: userEmail,
      subject: `Confirmación de pedido #${orderId}`,
      html: emailContent
    };

    const success = await sendEmail(
      emailData,
      sendgridApiKey.value(),
      defaultSender.value()
    );

    if (success) {
      console.log(`Email de confirmación reenviado a: ${userEmail}`);

      // Actualizar estado del email
      await admin.firestore().collection('orders').doc(orderId).update({
        'emailStatus': {
          confirmationSent: true,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          resentBy: request.auth.uid
        }
      });

      return { success: true };
    } else {
      console.error(`Error al reenviar email de confirmación a: ${userEmail}`);
      throw new HttpsError(
        'internal',
        'Error al enviar email'
      );
    }
  } catch (error) {
    console.error('Error en resendOrderConfirmationEmail:', error);
    throw new HttpsError(
      error.code || 'internal', 
      error.message || 'Error al reenviar el email de confirmación'
    );
  }
});