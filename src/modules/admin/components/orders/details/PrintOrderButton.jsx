import React from 'react';

/**
 * Componente para imprimir la información del pedido
 * @param {Object} order - Objeto con los datos del pedido
 * @param {Function} formatPrice - Función para formatear precios
 * @param {Function} formatDate - Función para formatear fechas
 * @param {Object} userData - Datos del usuario (opcional, parece ser el admin)
 * @param {string} customerDisplayName - Nombre del cliente (obtenido del padre idealmente)
 * @param {string} customerFullName - Nombre COMPLETO del cliente (preferido, desde el padre)
 */
export const PrintOrderButton = ({ order, formatPrice, formatDate, userData, customerDisplayName, customerFullName }) => {
  // Función para generar el contenido a imprimir
  const handlePrint = () => {
    if (!order) return;

    // --- Lógica Cliente y Direcciones ---
    // Determinar el nombre del cliente (Prioridad: FullName Prop > DisplayName Prop > ShippingAddr.FullName > Default)
    let finalCustomerName = customerFullName || customerDisplayName || order.shippingAddress?.fullName || 'Cliente';

    // Formatear dirección de envío en una línea
    const formatShippingAddressLine = (addr) => {
      if (!addr) return '';
      const parts = [
        addr.street,
        addr.numExt ? `#${addr.numExt}` : '',
        addr.numInt ? `Int. ${addr.numInt}` : '',
        addr.colonia,
        addr.city,
        addr.state,
        addr.zip
      ];
      return parts.filter(Boolean).join(', '); // Une partes existentes con comas
    };
    const shippingAddressLine = formatShippingAddressLine(order.shippingAddress);

    // Determinar email y teléfono
    const customerEmail = order.customer?.email || order.shipping?.contact?.email || '';
    const customerPhone = order.shippingAddress?.phone || order.customer?.phone || '';
    // --- Fin: Lógica Cliente y Direcciones ---

    // Crear el contenido a imprimir
    const printContent = `
      <html>
      <head>
        <title>Pedido #${order.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: normal;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .order-info-item {
            flex: 1;
          }
          .order-info-label {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 5px;
            color: #666;
          }
          .order-info-value {
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          th {
            font-weight: bold;
            color: #666;
          }
          .text-right {
            text-align: right;
          }
          .total-row {
            font-weight: bold;
          }
          .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-processing { background: #cce5ff; color: #004085; }
          .status-shipped { background: #d1ecf1; color: #0c5460; }
          .status-delivered { background: #d4edda; color: #155724; }
          .status-cancelled { background: #f8d7da; color: #721c24; }
          .notes {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            font-style: italic;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            @page { margin: 0.5cm; }
            body { font-size: 12pt; }
            h1 { font-size: 18pt; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Detalles del Pedido</h1>
          <p>Pedido #${order.id}</p>
          <p>Fecha: ${formatDate(order.createdAt)}</p>
        </div>
        
        ${/* -- Inicio: Nueva Sección Info Cliente -- */''}
        <div class="section">
          <div class="section-title">Información del Cliente</div>
          <p><strong>Nombre:</strong> ${finalCustomerName}</p>
          ${shippingAddressLine ? `<p><strong>Dirección Envío:</strong> ${shippingAddressLine}</p>` : ''}
          ${/* -- Inicio: Contacto en líneas separadas -- */''}
          ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
          ${customerPhone ? `<p><strong>Teléfono:</strong> ${customerPhone}</p>` : ''}
          ${customerPhone ? '<hr style="border-top: 1px solid #eee; margin: 10px 0;">' : ''}
          ${/* -- Fin: Contacto en líneas separadas -- */''}
        </div>
        ${/* -- Fin: Nueva Sección Info Cliente -- */''}

        <div class="section">
          <div class="order-info">
            <div class="order-info-item">
              <div class="order-info-label">Estado:</div>
              <div class="status status-${order.status}">${getStatusText(order.status)}</div>
            </div>
            
            <div class="order-info-item">
              <div class="order-info-label">Total:</div>
              <div class="order-info-value">${formatPrice(order.totals.finalTotal)}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Productos</div>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${formatPrice(item.price)}</td>
                  <td>${item.quantity}</td>
                  <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right">Subtotal:</td>
                <td class="text-right">${formatPrice(order.totals.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right">Impuestos:</td>
                <td class="text-right">${formatPrice(order.totals.tax)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right">Envío:</td>
                <td class="text-right">${order.totals.shipping > 0
      ? formatPrice(order.totals.shipping)
      : 'Gratis'}</td>
              </tr>
              ${order.totals.discount > 0 ? `
                <tr>
                  <td colspan="3" class="text-right">Descuento:</td>
                  <td class="text-right">-${formatPrice(order.totals.discount)}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="3" class="text-right">Total:</td>
                <td class="text-right">${formatPrice(order.totals.finalTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        ${order.shipping && order.shipping.address ? `
          <div class="section">
            <div class="section-title">Dirección de Envío</div>
            <p>${order.shipping.address.name}</p>
            <p>${order.shipping.address.street}
               ${order.shipping.address.numExt ? ` #${order.shipping.address.numExt}` : ''}
               ${order.shipping.address.numInt ? `, Int. ${order.shipping.address.numInt}` : ''}
            </p>
            ${order.shipping.address.colonia ? `<p>${order.shipping.address.colonia}</p>` : ''}
            <p>${order.shipping.address.city}, ${order.shipping.address.state} ${order.shipping.address.zip}</p>
            ${order.shipping.address.references ? `
              <p><strong>Referencias:</strong> ${order.shipping.address.references}</p>
            ` : ''}

            ${/* -- Inicio: Usar selectedShippingOption.name como fuente principal -- */''}
            ${(order.selectedShippingOption?.name || order.shipping?.name) ? `<p><strong>Método de Envío:</strong> ${order.selectedShippingOption.name || order.shipping.name}</p>` : ''}
            ${/* -- Fin: Usar selectedShippingOption.name como fuente principal -- */''}
            ${order.shipping?.trackingNumber ? `<p><strong>Seguimiento:</strong> ${order.shipping.trackingNumber}</p>` : ''}

            ${order.shipping?.estimatedDelivery ? `
              <p><strong>Entrega estimada:</strong> ${formatDate(order.shipping.estimatedDelivery)}</p>
            ` : ''}
          </div>
        ` : ''}
        
        ${order.shipping && order.shipping.contact ? `
          <div class="section">
            <div class="section-title">Información de Contacto</div>
            ${order.shipping.contact.email ? `<p><strong>Email:</strong> ${order.shipping.contact.email}</p>` : ''}
            ${order.shipping.contact.phone ? `<p><strong>Teléfono:</strong> ${order.shipping.contact.phone}</p>` : ''}
          </div>
        ` : ''}
        
        ${order.notes ? `
          <div class="section">
            <div class="section-title">Notas del Cliente</div>
            <div class="notes">${order.notes}</div>
          </div>
        ` : ''}
        
        ${/* -- Sección Pago Condicional -- */''}
        ${order.payment?.type || order.payment?.status ? `
          <div class="section">
            <div class="section-title">Detalles del Pago</div>
            ${order.payment.type ? `<p><strong>Método:</strong> ${order.payment.type}</p>` : ''}
            ${order.payment.status ? `<p><strong>Estado:</strong> ${order.payment.status}</p>` : ''}
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Este documento no es una factura. Para facturación, por favor contactar a soporte.</p>
          <p>Impreso el ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // Abrir una nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Esperar a que se cargue el contenido y luego imprimir
    printWindow.onload = function() {
      printWindow.print();
      // No cerramos la ventana automáticamente para dar tiempo a cancelar la impresión si se desea
      // printWindow.close();
    };
  };

  // Mapear estados a textos en español
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  return (
    <button
      onClick={handlePrint}
      className="btn btn-outline-dark btn-sm"
      title="Imprimir detalles del pedido"
    >
      <i className="bi bi-printer"></i>
    </button>
  );
};