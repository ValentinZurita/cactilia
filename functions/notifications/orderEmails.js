// notifications/orderEmails.js
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { sendEmail, sendgridApiKey, defaultSender } = require("../services/emailService");
const { getOrderConfirmationTemplate } = require('../templates/orderTemplates')

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Envía un email de confirmación cuando se crea un nuevo pedido
 */
exports.sendOrderConfirmationEmail = onDocumentCreated({
  document: 'orders/{orderId}',
  region: 'us-central1',
  secrets: [sendgridApiKey, defaultSender]
}, async (event) => {
  const orderData = event.data.data();
  const orderId = event.data.id;

  // Obtener información del usuario
  const userSnap = await admin.firestore()
    .collection('users')
    .doc(orderData.userId)
    .get();

  if (!userSnap.exists) {
    console.error(`Usuario no encontrado: ${orderData.userId}`);
    return null;
  }

  const userData = userSnap.data();
  const userEmail = userData.email;

  // Si no hay email, no podemos enviar
  if (!userEmail) {
    console.error(`No hay email para el usuario: ${orderData.userId}`);
    return null;
  }

  try {
    // Generar contenido del email usando la plantilla
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

    // Guardar estado del envío en Firestore
    await event.data.ref.update({
      'emailStatus': {
        confirmationSent: success,
        sentAt: success ? admin.firestore.FieldValue.serverTimestamp() : null,
        error: success ? null : 'Error al enviar email'
      }
    });

    if (success) {
      console.log(`Email de confirmación enviado a: ${userEmail}`);
    } else {
      console.error(`Error al enviar email de confirmación a: ${userEmail}`);
    }

    return null;
  } catch (error) {
    console.error('Error enviando email de confirmación:', error);
    return null;
  }
});