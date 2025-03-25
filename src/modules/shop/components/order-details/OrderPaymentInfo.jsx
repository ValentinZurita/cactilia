export const OrderPaymentInfo = ({ payment, billing }) => {
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
          {billing.invoiceUrl ? (
            <div className="invoice-details">
              <div className="mb-2">
                <a
                  href={billing.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary"
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Descargar Factura
                </a>
              </div>
              {billing.invoiceFileName && (
                <div className="invoice-filename text-muted small">
                  {billing.invoiceFileName}
                </div>
              )}
              {billing.fiscalData && (
                <div className="mt-2">
                  <div>RFC: {billing.fiscalData.rfc}</div>
                  <div>Razón social: {billing.fiscalData.businessName}</div>
                </div>
              )}
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