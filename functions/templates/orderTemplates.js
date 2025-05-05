/**
 * Plantilla para el email de confirmación de pedido
 *
 * @param {Object} orderData - Datos del pedido
 * @param {string} orderId - ID del pedido
 * @returns {string} - Contenido HTML del email
 */
const getOrderConfirmationTemplate = (orderData, orderId) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #28a745;">¡Gracias por tu compra!</h1>
        <p>Tu pedido ha sido recibido y está siendo procesado.</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #333;">Información del pedido</h2>
        <p><strong>Número de pedido:</strong> ${orderId}</p>
        <p><strong>Fecha:</strong> ${formatDate(orderData.createdAt)}</p>
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
            ${(orderData.items || []).map(item => {
              const price = Number(item?.price) || 0;
              const quantity = Number(item?.quantity) || 0;
              const totalItemPrice = (price * quantity).toFixed(2);
              
              return `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${item?.name || 'Producto sin nombre'}</td>
                  <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">${quantity}</td>
                  <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">$${totalItemPrice}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align: right; padding: 8px;"><strong>Subtotal:</strong></td>
              <td style="text-align: right; padding: 8px;">$${(orderData.totals?.subtotal ?? 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: right; padding: 8px;"><strong>IVA (16%):</strong></td>
              <td style="text-align: right; padding: 8px;">$${(orderData.totals?.tax ?? 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: right; padding: 8px;"><strong>Envío:</strong></td>
              <td style="text-align: right; padding: 8px;">
                ${(orderData.totals?.shipping ?? 0) > 0 ? `$${(orderData.totals?.shipping ?? 0).toFixed(2)}` : 'Gratis'}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="text-align: right; padding: 8px;"><strong>Total:</strong></td>
              <td style="text-align: right; padding: 8px; font-weight: bold;">$${(orderData.totals?.total ?? 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333;">Dirección de envío</h3>
        <p>
          ${orderData.shippingAddress?.name ?? 'Nombre no disponible'}<br>
          ${orderData.shippingAddress?.street ?? ''} ${orderData.shippingAddress?.numExt ? `#${orderData.shippingAddress.numExt}` : ''}
          ${orderData.shippingAddress?.numInt ? `, Int. ${orderData.shippingAddress.numInt}` : ''}<br>
          ${orderData.shippingAddress?.colonia ? `${orderData.shippingAddress.colonia}<br>` : ''}
          ${orderData.shippingAddress?.city ?? ''}, ${orderData.shippingAddress?.state ?? ''} ${orderData.shippingAddress?.zip ?? ''}
        </p>
      </div>

      <!-- === INICIO SECCIÓN DE PAGO CONDICIONAL === -->
      ${orderData.payment?.type === 'oxxo' && orderData.payment.voucherDetails ? `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; background-color: #f8f9fa;">
          <h3 style="color: #e10718; margin-top: 0;">Instrucciones para tu Pago en OXXO</h3>
          <p><strong>Monto a pagar:</strong> $${(orderData.payment.voucherDetails.amount / 100).toFixed(2)} MXN</p>
          <p><strong>Número de referencia:</strong> ${orderData.payment.voucherDetails.number || 'N/A'}</p>
          <p><strong>Fecha límite de pago:</strong> ${formatUnixTimestamp(orderData.payment.voucherDetails.expires_after)}</p>
          <p style="margin-top: 15px; text-align: center;">
            <a href="${orderData.payment.voucherDetails.hosted_voucher_url}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #e10718; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Ver / Imprimir Voucher de Pago
            </a>
          </p>
          <p style="font-size: 12px; color: #6c757d; margin-top: 10px;">Acude a cualquier tienda OXXO con este voucher para realizar tu pago. Tu pedido se procesará una vez confirmado.</p>
        </div>
      ` : orderData.payment?.type === 'card' ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Información de Pago</h3>
          <p>Pago realizado con ${orderData.payment.brand || 'tarjeta'} terminada en **** ${orderData.payment.last4 || '????'}</p>
        </div>
      ` : ''}
      <!-- === FIN SECCIÓN DE PAGO CONDICIONAL === -->
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p>Si tienes alguna pregunta sobre tu pedido, contáctanos a <a href="mailto:soporte@cactilia.com">soporte@cactilia.com</a></p>
        <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Cactilia. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
};


/**
 * Plantilla para el email de pedido enviado con información de seguimiento
 *
 * @param {Object} orderData - Datos del pedido
 * @param {string} orderId - ID del pedido
 * @param {Object} shippingInfo - Información de envío (transportista, número de guía, etc.)
 * @returns {string} - Contenido HTML del email
 */
const getOrderShippedTemplate = (orderData, orderId, shippingInfo) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0d6efd;">¡Tu pedido ha sido enviado!</h1>
        <p>Tu pedido está en camino y pronto llegará a tu dirección.</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #333;">Información del envío</h2>
        <p><strong>Número de pedido:</strong> ${orderId}</p>
        <p><strong>Fecha de envío:</strong> ${formatDate(new Date())}</p>
        
        ${shippingInfo.carrier ? `<p><strong>Transportista:</strong> ${shippingInfo.carrier}</p>` : ''}
        ${shippingInfo.trackingNumber ? `
          <p><strong>Número de guía:</strong> ${shippingInfo.trackingNumber}</p>
        ` : ''}
        ${shippingInfo.trackingUrl ? `
          <p><strong>Seguimiento:</strong> <a href="${shippingInfo.trackingUrl}" target="_blank">Ver estado del envío</a></p>
        ` : ''}
        
        <p><strong>Entrega estimada:</strong> ${shippingInfo.estimatedDelivery || 'Próximamente'}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333;">Resumen del pedido</h3>
        <p><strong>Total del pedido:</strong> $${(Number(orderData?.totals?.finalTotal) || 0).toFixed(2)}</p>
        <p><strong>Cantidad de productos:</strong> ${orderData.items.length} ${orderData.items.length === 1 ? 'producto' : 'productos'}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333;">Dirección de entrega</h3>
        <p>
          ${orderData?.shipping?.address?.name ?? 'Nombre no disponible'}<br>
          ${orderData?.shipping?.address?.street ?? 'Calle no disponible'} ${orderData?.shipping?.address?.numExt ? `#${orderData.shipping.address.numExt}` : ''}
          ${orderData?.shipping?.address?.numInt ? `, Int. ${orderData.shipping.address.numInt}` : ''}<br>
          ${orderData?.shipping?.address?.colonia ? `${orderData.shipping.address.colonia}<br>` : ''}
          ${orderData?.shipping?.address?.city ?? 'Ciudad no disponible'}, ${orderData?.shipping?.address?.state ?? 'Estado no disponible'} ${orderData?.shipping?.address?.zip ?? ''}
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p>Para ver los detalles completos de tu pedido, <a href="https://cactilia.com/profile/orders/${orderId}" style="color: #0d6efd;">haz clic aquí</a>.</p>
        <p>Si tienes alguna pregunta sobre tu envío, contáctanos a <a href="mailto:soporte@cactilia.com">soporte@cactilia.com</a></p>
        <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} Cactilia. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
};

/**
 * Formatea una fecha de Firebase a un formato legible
 *
 * @param {Object} timestamp - Timestamp de Firebase
 * @returns {string} - Fecha formateada
 */
const formatDate = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
};

// --- NUEVA FUNCIÓN AUXILIAR ---
/**
 * Formatea un timestamp Unix (segundos) a un formato de fecha y hora local.
 *
 * @param {number} unixTimestamp - Timestamp en segundos.
 * @returns {string} - Fecha y hora formateada (ej. '7 de mayo de 2025, 11:59 p.m.') o 'Fecha no disponible'.
 */
const formatUnixTimestamp = (unixTimestamp) => {
  if (unixTimestamp === undefined || unixTimestamp === null || isNaN(unixTimestamp)) {
    return 'Fecha no disponible';
  }
  try {
    const date = new Date(unixTimestamp * 1000); // Convertir segundos a milisegundos
    if (isNaN(date.getTime())) {
      console.error('Timestamp Unix inválido para formatear:', unixTimestamp);
      return 'Fecha inválida';
    }
    // Devolver formato completo con hora
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true // Usar formato AM/PM
    });
  } catch (error) {
    console.error('Error formateando timestamp Unix:', error);
    return 'Fecha no disponible';
  }
};
// --- FIN NUEVA FUNCIÓN ---

// Exporta las plantillas y funciones auxiliares si es necesario
module.exports = {
  getOrderConfirmationTemplate,
  getOrderShippedTemplate
  // No necesitamos exportar formatDate y formatUnixTimestamp si solo se usan aquí
};