const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

// Configurar cliente de nodemailer
// En producción, usar un servicio como SendGrid, Mailgun o Amazon SES
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

/**
 * Enviar correo de confirmación de orden
 * Se activa al crear un nuevo documento en la colección de órdenes
 */
exports.sendOrderConfirmationEmail = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderData = snap.data();
    const orderId = context.params.orderId;

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

    // Si no hay email, no podemos enviar el correo
    if (!userEmail) {
      console.error(`No hay email para el usuario: ${orderData.userId}`);
      return null;
    }

    try {
      // Crear el contenido del correo
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #28a745;">¡Gracias por tu compra!</h1>
            <p>Tu pedido ha sido recibido y está siendo procesado.</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #333;">Información del pedido</h2>
            <p><strong>Número de pedido:</strong> ${orderId}</p>
            <p><strong>Fecha:</strong> ${new Date(orderData.createdAt.toDate()).toLocaleDateString('es-MX')}</p>
            <p><strong>Estado:</strong> En procesamiento</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333;">Productos</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Producto</th>
                  <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Cantidad</th>
                  <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.items.map(item => `
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                    <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="text-align: right; padding: 8px;"><strong>Subtotal:</strong></td>
                  <td style="text-align: right; padding: 8px;">$${orderData.totals.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="text-align: right; padding: 8px;"><strong>IVA (16%):</strong></td>
                  <td style="text-align: right; padding: 8px;">$${orderData.totals.tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="text-align: right; padding: 8px;"><strong>Envío:</strong></td>
                  <td style="text-align: right; padding: 8px;">
                    ${orderData.totals.shipping > 0 ? `$${orderData.totals.shipping.toFixed(2)}` : 'Gratis'}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="text-align: right; padding: 8px;"><strong>Total:</strong></td>
                  <td style="text-align: right; padding: 8px; font-weight: bold;">$${orderData.totals.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333;">Dirección de envío</h3>
            <p>
              ${orderData.shipping.address.name}<br>
              ${orderData.shipping.address.street} ${orderData.shipping.address.numExt ? `#${orderData.shipping.address.numExt}` : ''}
              ${orderData.shipping.address.numInt ? `, Int. ${orderData.shipping.address.numInt}` : ''}<br>
              ${orderData.shipping.address.colonia ? `${orderData.shipping.address.colonia}<br>` : ''}
              ${orderData.shipping.address.city}, ${orderData.shipping.address.state} ${orderData.shipping.address.zip}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>Si tienes alguna pregunta sobre tu pedido, contáctanos a <a href="mailto:soporte@cactilia.com">soporte@cactilia.com</a></p>
            <p style="font-size: 12px; color: #777;">© 2025 Cactilia. Todos los derechos reservados.</p>
          </div>
        </div>
      `;

      // Enviar el correo
      await transporter.sendMail({
        from: '"Cactilia" <pedidos@cactilia.com>',
        to: userEmail,
        subject: `Confirmación de pedido #${orderId}`,
        html: emailContent
      });

      console.log(`Correo de confirmación enviado a: ${userEmail}`);
      return null;
    } catch (error) {
      console.error('Error enviando correo de confirmación:', error);
      return null;
    }
  });

/**
 * Enviar correo cuando cambia el estado de una orden
 * Se activa al actualizar un documento en la colección de órdenes
 */
exports.sendOrderStatusUpdateEmail = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const orderId = context.params.orderId;

    // Solo enviar correo si el estado ha cambiado
    if (newData.status === previousData.status) {
      return null;
    }

    // Obtener información del usuario
    const userSnap = await admin.firestore()
      .collection('users')
      .doc(newData.userId)
      .get();

    if (!userSnap.exists) {
      console.error(`Usuario no encontrado: ${newData.userId}`);
      return null;
    }

    const userData = userSnap.data();
    const userEmail = userData.email;

    // Si no hay email, no podemos enviar el correo
    if (!userEmail) {
      console.error(`No hay email para el usuario: ${newData.userId}`);
      return null;
    }

    try {
      // Determinar mensaje según el nuevo estado
      let statusMessage = '';
      let statusTitle = '';

      switch (newData.status) {
        case 'processing':
          statusTitle = 'Tu pedido está siendo procesado';
          statusMessage = 'Hemos recibido tu pago y estamos preparando tu pedido para envío.';
          break;
        case 'shipped':
          statusTitle = 'Tu pedido ha sido enviado';
          statusMessage = 'Tu pedido está en camino. Te informaremos cuando sea entregado.';
          break;
        case 'delivered':
          statusTitle = 'Tu pedido ha sido entregado';
          statusMessage = '¡Tu pedido ha sido entregado con éxito! Esperamos que disfrutes de tus productos.';
          break;
        case 'cancelled':
          statusTitle = 'Tu pedido ha sido cancelado';
          statusMessage = 'Tu pedido ha sido cancelado. Si tienes alguna pregunta, por favor contáctanos.';
          break;
        default:
          statusTitle = 'Actualización de tu pedido';
          statusMessage = `El estado de tu pedido ha cambiado a: ${newData.status}`;
      }

      // Crear el contenido del correo
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #28a745;">${statusTitle}</h1>
            <p>${statusMessage}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #333;">Información del pedido</h2>
            <p><strong>Número de pedido:</strong> ${orderId}</p>
            <p><strong>Fecha:</strong> ${new Date(newData.createdAt.toDate()).toLocaleDateString('es-MX')}</p>
            <p><strong>Estado:</strong> ${newData.status}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://cactilia.com/profile/orders/${orderId}" style="display: inline-block; background-color: #28a745; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Ver detalles del pedido</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>Si tienes alguna pregunta sobre tu pedido, contáctanos a <a href="mailto:soporte@cactilia.com">soporte@cactilia.com</a></p>
            <p style="font-size: 12px; color: #777;">© 2025 Cactilia. Todos los derechos reservados.</p>
          </div>
        </div>
      `;

      // Enviar el correo
      await transporter.sendMail({
        from: '"Cactilia" <pedidos@cactilia.com>',
        to: userEmail,
        subject: `Actualización de pedido #${orderId}`,
        html: emailContent
      });

      console.log(`Correo de actualización enviado a: ${userEmail}`);
      return null;
    } catch (error) {
      console.error('Error enviando correo de actualización:', error);
      return null;
    }
  });

/**
 * Enviar comprobante fiscal (factura) cuando se genera
 */
exports.sendInvoiceEmail = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const orderId = context.params.orderId;

    // Verificar si se ha generado una factura
    if (
      (!previousData.billing?.invoiceId && newData.billing?.invoiceId) ||
      (previousData.billing?.invoiceId !== newData.billing?.invoiceId)
    ) {
      // Se ha generado una factura nueva o ha cambiado

      // Obtener información del usuario
      const userSnap = await admin.firestore()
        .collection('users')
        .doc(newData.userId)
        .get();

      if (!userSnap.exists) {
        console.error(`Usuario no encontrado: ${newData.userId}`);
        return null;
      }

      const userData = userSnap.data();

      // Usar el email especificado para facturación o el email del usuario
      const userEmail = newData.billing?.fiscalData?.email || userData.email;

      // Si no hay email, no podemos enviar el correo
      if (!userEmail) {
        console.error(`No hay email para facturación: ${newData.userId}`);
        return null;
      }

      try {
        // Crear el contenido del correo
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #28a745;">Factura Electrónica (CFDI)</h1>
              <p>Se ha generado tu factura electrónica para el pedido #${orderId}.</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #333;">Información fiscal</h2>
              <p><strong>RFC:</strong> ${newData.billing.fiscalData.rfc}</p>
              <p><strong>Razón Social:</strong> ${newData.billing.fiscalData.businessName}</p>
              <p><strong>Régimen Fiscal:</strong> ${newData.billing.fiscalData.regimenFiscal}</p>
              <p><strong>Uso de CFDI:</strong> ${newData.billing.fiscalData.usoCFDI}</p>
              <p><strong>Folio Fiscal:</strong> ${newData.billing.invoiceId}</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; margin-bottom: 20px;">
              <p>Puedes descargar tu factura desde el siguiente enlace:</p>
              <a href="https://cactilia.com/invoice/${newData.billing.invoiceId}" style="display: inline-block; background-color: #28a745; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Descargar Factura</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Si tienes alguna pregunta sobre tu factura, contáctanos a <a href="mailto:facturacion@cactilia.com">facturacion@cactilia.com</a></p>
              <p style="font-size: 12px; color: #777;">© 2025 Cactilia. Todos los derechos reservados.</p>
            </div>
          </div>
        `;

        // Enviar el correo
        await transporter.sendMail({
          from: '"Cactilia Facturación" <facturacion@cactilia.com>',
          to: userEmail,
          subject: `Factura electrónica pedido #${orderId}`,
          html: emailContent
        });

        console.log(`Correo de factura enviado a: ${userEmail}`);
        return null;
      } catch (error) {
        console.error('Error enviando correo de factura:', error);
        return null;
      }
    }

    return null;
  });