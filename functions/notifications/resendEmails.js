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
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Debes iniciar sesión para reenviar emails'
    );
  }

  // Verificar rol de admin
  const token = request.auth.token;
  const isAdmin = token?.role === 'admin' || token?.role === 'superadmin';

  if (!isAdmin) {
    throw new HttpsError(
      'permission-denied',
      'Necesitas ser administrador para reenviar emails'
    );
  }

  const { orderId } = request.data;

  if (!orderId) {
    throw new HttpsError(
      'invalid-argument',
      'Se requiere el ID del pedido'
    );
  }

  try {
    // Obtener el pedido
    const orderRef = admin.firestore().collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new HttpsError(
        'not-found',
        'Pedido no encontrado'
      );
    }

    const orderData = orderSnap.data();

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
      await orderRef.update({
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
      'internal',
      error.message || 'Error desconocido'
    );
  }
});