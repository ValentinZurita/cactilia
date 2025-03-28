const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { sendEmail, sendgridApiKey, defaultSender } = require("../services/emailService");

/**
 * Función para enviar facturas por email al cliente
 * Solo accesible para administradores
 */
exports.sendInvoiceEmail = onCall({
  region: "us-central1",
  secrets: [sendgridApiKey, defaultSender]
}, async (request) => {
  // Verificar autenticación
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Debes iniciar sesión para enviar facturas'
    );
  }

  // Verificar rol de admin
  const token = request.auth.token;
  const isAdmin = token?.role === 'admin' || token?.role === 'superadmin';

  if (!isAdmin) {
    throw new HttpsError(
      'permission-denied',
      'Necesitas ser administrador para enviar facturas'
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
    const billing = orderData.billing || {};

    // Verificar que existan las facturas
    if (!billing.invoicePdfUrl && !billing.invoiceUrl && !billing.invoiceXmlUrl) {
      throw new HttpsError(
        'failed-precondition',
        'No hay facturas disponibles para enviar'
      );
    }

    // Verificar que existe un email de facturación
    const invoiceEmail = billing.fiscalData?.email;

    if (!invoiceEmail) {
      throw new HttpsError(
        'failed-precondition',
        'No hay email de facturación disponible'
      );
    }

    // Preparar los enlaces a las facturas
    const pdfUrl = billing.invoicePdfUrl || billing.invoiceUrl || null;
    const xmlUrl = billing.invoiceXmlUrl || null;

    if (!pdfUrl && !xmlUrl) {
      throw new HttpsError(
        'failed-precondition',
        'No hay facturas disponibles para enviar'
      );
    }

    // Generar el contenido del email con enlaces a las facturas
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #28a745;">Factura Electrónica</h1>
          <p>Adjuntamos los enlaces para descargar tu factura del pedido #${orderId}.</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #333;">Enlaces de descarga</h2>
          ${pdfUrl ? `<p><strong>Factura PDF:</strong> <a href="${pdfUrl}" target="_blank">Descargar PDF</a></p>` : ''}
          ${xmlUrl ? `<p><strong>Archivo XML (CFDI):</strong> <a href="${xmlUrl}" target="_blank">Descargar XML</a></p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>Si tienes alguna pregunta sobre tu factura, no dudes en contactarnos a <a href="mailto:soporte@cactilia.com">soporte@cactilia.com</a>.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Cactilia. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    // Enviar el email
    const emailData = {
      to: invoiceEmail,
      subject: `Factura Electrónica - Pedido #${orderId}`,
      html: emailContent
    };

    const success = await sendEmail(
      emailData,
      sendgridApiKey.value(),
      defaultSender.value()
    );

    if (success) {
      console.log(`Email de factura enviado a: ${invoiceEmail}`);

      // Guardar registro del envío del email
      await orderRef.update({
        'billing.invoiceEmailSent': true,
        'billing.invoiceEmailSentAt': admin.firestore.FieldValue.serverTimestamp(),
        'billing.invoiceEmailSentBy': request.auth.uid,
        'emailHistory': admin.firestore.FieldValue.arrayUnion({
          type: 'invoice',
          sentAt: new Date(),
          sentBy: request.auth.uid,
          success: true,
          email: invoiceEmail
        })
      });

      return {
        success: true,
        message: 'Facturas enviadas correctamente'
      };
    } else {
      console.error(`Error al enviar email de factura a: ${invoiceEmail}`);
      throw new HttpsError(
        'internal',
        'Error al enviar email'
      );
    }
  } catch (error) {
    console.error('Error en sendInvoiceEmail:', error);
    throw new HttpsError(
      'internal',
      error.message || 'Error desconocido'
    );
  }
});