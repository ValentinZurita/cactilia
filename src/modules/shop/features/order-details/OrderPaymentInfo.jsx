export const OrderPaymentInfo = ({ payment, billing }) => {
  // Detectar si hay facturas disponibles para descargar
  const hasPdf = billing?.invoicePdfUrl || billing?.invoiceUrl;
  const hasXml = billing?.invoiceXmlUrl;
  const hasInvoice = hasPdf || hasXml;

  return (
    <section className="order-payment-card">
      {/* Método de pago */}
      <p className="d-flex align-items-center mb-2">
        <i className="bi bi-credit-card-2-front me-2" aria-hidden="true"></i>
        {payment?.method?.brand
          ? `${payment.method.brand.toUpperCase()} terminada en ${payment.method.last4}`
          : 'Método de pago estándar'}
      </p>

      {/* Estado del pago */}
      <p className="mb-3">
        Estado: <span className="status-badge">{payment?.status || 'Procesado'}</span>
      </p>

      {/* Facturas - Solo se muestra si el pedido requiere factura */}
      {billing?.requiresInvoice && (
        hasInvoice ? (
          // Botones de descarga de factura
          <nav className="invoice-downloads d-flex gap-2 mt-3" aria-label="Descargas de factura">
            {hasPdf && (
              <a
                href={billing.invoicePdfUrl || billing.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-danger"
                title="Descargar factura en PDF"
              >
                <i className="bi bi-file-earmark-pdf me-1" aria-hidden="true"></i>
                PDF
              </a>
            )}

            {hasXml && (
              <a
                href={billing.invoiceXmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-success"
                title="Descargar factura en XML"
              >
                <i className="bi bi-file-earmark-code me-1" aria-hidden="true"></i>
                XML
              </a>
            )}
          </nav>
        ) : (
          // Mensaje cuando la factura está en proceso
          <p className="text-muted small mt-3">
            <i className="bi bi-clock-history me-2" aria-hidden="true"></i>
            Factura en proceso de generación
          </p>
        )
      )}
    </section>
  );
};