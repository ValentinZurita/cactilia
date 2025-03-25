export const OrderPaymentInfo = ({ payment, billing }) => {
  // Comprobar si hay facturas disponibles
  const hasPdf = billing?.invoicePdfUrl || billing?.invoiceUrl;
  const hasXml = billing?.invoiceXmlUrl;
  const hasInvoice = hasPdf || hasXml;

  return (
    <div className="order-payment-card">
      <div className="payment-method">
        <i className={`bi bi-credit-card-2-front me-2`}></i>
        {payment?.method?.brand
          ? `${payment.method.brand.toUpperCase()} terminada en ${payment.method.last4}`
          : 'Método de pago estándar'}
      </div>
      <div className="payment-status">
        Estado: <span className="status-badge">{payment?.status || 'Procesado'}</span>
      </div>

      {/* Información de facturación si aplica */}
      {billing?.requiresInvoice && (
        <div className="invoice-info mt-3">
          <h6>
            <i className="bi bi-receipt me-2"></i>
            Factura
          </h6>

          {hasInvoice ? (
            <div className="invoice-details">
              {/* Datos fiscales */}
              {billing.fiscalData && (
                <div className="fiscal-data mb-3">
                  <div>RFC: {billing.fiscalData.rfc}</div>
                  <div>Razón social: {billing.fiscalData.businessName}</div>
                  {billing.fiscalData.regimenFiscal && (
                    <div>Régimen fiscal: {billing.fiscalData.regimenFiscal}</div>
                  )}
                </div>
              )}

              {/* Botones para descargar archivos */}
              <div className="invoice-downloads">
                {/* PDF */}
                {hasPdf && (
                  <div className="mb-2">
                    <a
                      href={billing.invoicePdfUrl || billing.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-danger"
                    >
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      PDF Factura
                    </a>
                    {(billing.invoicePdfName || billing.invoiceFileName) && (
                      <span className="invoice-filename text-muted small ms-2">
                        {billing.invoicePdfName || billing.invoiceFileName}
                      </span>
                    )}
                  </div>
                )}

                {/* XML */}
                {hasXml && (
                  <div>
                    <a
                      href={billing.invoiceXmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-file-earmark-code me-2"></i>
                      XML Factura
                    </a>
                    {billing.invoiceXmlName && (
                      <span className="invoice-filename text-muted small ms-2">
                        {billing.invoiceXmlName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="pending-invoice">
              <i className="bi bi-clock-history me-1"></i>
              Factura en proceso de generación
            </div>
          )}
        </div>
      )}
    </div>
  );
};