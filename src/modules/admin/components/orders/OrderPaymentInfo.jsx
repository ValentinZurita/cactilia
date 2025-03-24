export const OrderPaymentInfo = ({ order }) => (
  <div className="card border-0 shadow-sm rounded-4">
    <div className="card-header bg-white border-0 py-3">
      <h5 className="mb-0 fw-normal d-flex align-items-center">
        <i className="bi bi-credit-card me-2 text-secondary"></i>
        Información de pago
      </h5>
    </div>
    <div className="card-body">
      {order.payment ? (
        <div className="row g-4">
          <div className="col-md-6">
            <h6 className="text-secondary mb-3">Método de pago</h6>
            <div className="bg-light p-3 rounded-3">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-credit-card me-2 text-secondary"></i>
                <span>
                  {order.payment.method?.brand
                    ? `${order.payment.method.brand} terminada en ${order.payment.method.last4}`
                    : 'Método de pago estándar'}
                </span>
              </div>
              <div className="d-flex align-items-center">
                <span className="badge bg-success px-3 py-1">
                  {order.payment.status || "Procesado"}
                </span>
              </div>
            </div>

            {order.payment.paymentIntentId && (
              <div className="mt-4">
                <h6 className="text-secondary mb-3">ID de transacción</h6>
                <div className="bg-light p-3 rounded-3">
                  <code className="user-select-all">{order.payment.paymentIntentId}</code>
                </div>
              </div>
            )}
          </div>

          {/* Información de facturación */}
          {order.billing?.requiresInvoice && order.billing.fiscalData && (
            <div className="col-md-6">
              <h6 className="text-secondary mb-3">Datos de facturación</h6>
              <div className="bg-light p-3 rounded-3">
                <div className="mb-2">
                  <span className="text-secondary">RFC:</span>
                  <span className="ms-2">{order.billing.fiscalData.rfc}</span>
                </div>
                <div className="mb-2">
                  <span className="text-secondary">Razón Social:</span>
                  <span className="ms-2">{order.billing.fiscalData.businessName}</span>
                </div>
                <div className="mb-2">
                  <span className="text-secondary">Email:</span>
                  <span className="ms-2">{order.billing.fiscalData.email}</span>
                </div>
                <div>
                  <span className="text-secondary">Uso CFDI:</span>
                  <span className="ms-2">{order.billing.fiscalData.usoCFDI}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <i className="bi bi-credit-card d-block mb-2 text-secondary opacity-50 fs-4"></i>
          <p className="mb-0 text-muted">No hay información de pago disponible</p>
        </div>
      )}
    </div>
  </div>
);