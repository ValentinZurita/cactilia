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

    // >>> INICIO: Obtener remitente desde Firestore <<<
    let senderEmail = null;
    try {
      const settingsDoc = await admin.firestore().collection('settings').doc('company_info').get();
      if (settingsDoc.exists) {
        senderEmail = settingsDoc.data()?.contact?.email;
        console.log(`[ResendConfirm] Sender email fetched from Firestore: ${senderEmail}`);
      }
      if (!senderEmail) { // Fallback si no existe doc o campo
        console.warn(`[ResendConfirm] Sender email not found in settings/company_info. Falling back to default sender secret.`);
        senderEmail = defaultSender.value(); // Usa el secreto como fallback
      }
      if (!senderEmail) { // Doble fallback si el secreto tampoco existe
         console.error('[ResendConfirm] CRITICAL: Sender email could not be determined from Firestore or Secret!');
         senderEmail = 'error@cactilia.com'; // Fallback extremo
      }
    } catch (dbError) {
      console.error(`[ResendConfirm] Error fetching sender email from Firestore:`, dbError);
      senderEmail = defaultSender.value() || 'error@cactilia.com'; // Fallback en caso de error DB
    }
    // >>> FIN: Obtener remitente desde Firestore <<<

    // Generar contenido del email
    const emailContent = getOrderConfirmationTemplate(orderData, orderId);

    // Enviar el email
    const emailData = {
      to: userEmail,
      subject: `Confirmación de pedido #${orderId}`,
      html: emailContent
    };

    console.log(`[ResendConfirm] Attempting to resend confirmation email to ${userEmail} FROM ${senderEmail}`);
    const success = await sendEmail(
      emailData,
      sendgridApiKey.value(),
      senderEmail // <--- Usar el email obtenido de Firestore (o fallback)
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