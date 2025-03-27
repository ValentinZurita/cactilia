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

module.exports = {
  getOrderConfirmationTemplate
};