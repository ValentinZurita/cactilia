const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { sendEmail, sendgridApiKey, defaultSender } = require("../services/emailService");
const { getOrderShippedTemplate } = require("../templates/orderTemplates");

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Función para enviar email de notificación cuando un pedido es enviado
 * Solo accesible para administradores
 */
exports.sendOrderShippedEmail = onCall({
  region: "us-central1",
  secrets: [sendgridApiKey, defaultSender],
  cors: true
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Debes iniciar sesión para enviar notificaciones'
    );
  }

  // Verificar rol de admin
  const token = request.auth.token;
  const isAdmin = token?.role === 'admin' || token?.role === 'superadmin';

  if (!isAdmin) {
    throw new HttpsError(
      'permission-denied',
      'Necesitas ser administrador para enviar notificaciones'
    );
  }

  const {
    orderId,
    shippingInfo = {}, // transportista, número de guía, URL de seguimiento, etc.
    resendOnly = false, // Nuevo parámetro para indicar que solo es un reenvío
    preserveOrderStatus = false // Parámetro adicional de compatibilidad
  } = request.data;

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

    // Si es reenvío, no modificamos el estado del pedido
    if (!resendOnly && !preserveOrderStatus && orderData.status !== 'shipped') {
      await orderRef.update({
        status: 'shipped',
        'shipping.trackingInfo': shippingInfo,
        'shipping.shippedAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          from: orderData.status,
          to: 'shipped',
          changedAt: new Date(),
          changedBy: request.auth.uid,
          notes: `Enviado con ${shippingInfo.carrier || 'transportista'}, guía: ${shippingInfo.trackingNumber || 'N/A'}`
        })
      });
    } else {
      // Si es un reenvío, solo actualizamos la información de seguimiento si es necesario
      // sin cambiar el estado del pedido
      await orderRef.update({
        'shipping.trackingInfo': shippingInfo,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Generar contenido del email
    const emailContent = getOrderShippedTemplate(orderData, orderId, shippingInfo);

    // Enviar el email
    const emailData = {
      to: userEmail,
      subject: `Tu pedido #${orderId} ha sido enviado`,
      html: emailContent
    };

    const success = await sendEmail(
      emailData,
      sendgridApiKey.value(),
      defaultSender.value()
    );

    if (success) {
      console.log(`Email de envío enviado a: ${userEmail}`);

      // Guardar registro del envío del email
      await orderRef.update({
        'emailHistory': admin.firestore.FieldValue.arrayUnion({
          type: 'shipped',
          sentAt: new Date(),
          sentBy: request.auth.uid,
          success: true,
          resent: resendOnly // Marcar si fue un reenvío
        })
      });

      return {
        success: true,
        message: 'Notificación de envío enviada correctamente'
      };
    } else {
      console.error(`Error al enviar email de envío a: ${userEmail}`);
      throw new HttpsError(
        'internal',
        'Error al enviar email'
      );
    }
  } catch (error) {
    console.error('Error en sendOrderShippedEmail:', error);
    throw new HttpsError(
      'internal',
      error.message || 'Error desconocido'
    );
  }
});