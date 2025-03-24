import React from 'react';
import { AdminCard } from './AdminCard';

const IconCircle = ({ icon, className = '', ...props }) => (
  <div
    className={`rounded-circle bg-light p-2 d-flex align-items-center justify-content-center me-3 ${className}`}
    style={{ width: '42px', height: '42px', minWidth: '42px' }}
    {...props}
  >
    <i className={`bi bi-${icon} text-secondary`}></i>
  </div>
);

const InfoBlock = ({ title, children }) => (
  <div className="mb-4">
    <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">{title}</h6>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div>
    <p className="mb-0 small text-secondary">{label}</p>
    <p className="mb-0 user-select-all">{value}</p>
  </div>
);

export const OrderPaymentInfo = ({ order }) => {
  if (!order.payment) {
    return (
      <AdminCard
        icon="credit-card"
        title="Información de pago"
      >
        <div className="d-flex align-items-center justify-content-center py-4">
          <div className="text-center">
            <i className="bi bi-credit-card text-secondary opacity-50 fs-1 mb-3"></i>
            <p className="mb-0 text-muted">No hay información de pago disponible</p>
          </div>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="row g-4">
      {/* Método de pago */}
      <div className="col-md-6">
        <InfoBlock title="Método de pago">
          <div className="d-flex align-items-center mb-3">
            <IconCircle icon="credit-card" />
            <InfoRow
              label="Forma de pago"
              value={order.payment.method?.brand
                ? `${order.payment.method.brand} terminada en ${order.payment.method.last4}`
                : 'Método de pago estándar'
              }
            />
          </div>

          {order.payment.status && (
            <div className="d-flex align-items-center mb-3">
              <IconCircle icon="check-circle" />
              <InfoRow
                label="Estado del pago"
                value={
                  <span className="badge bg-success px-2 py-1 mt-1">
                    {order.payment.status}
                  </span>
                }
              />
            </div>
          )}

          {order.payment.paymentIntentId && (
            <div className="d-flex align-items-center">
              <IconCircle icon="key" />
              <InfoRow
                label="ID de transacción"
                value={order.payment.paymentIntentId}
              />
            </div>
          )}
        </InfoBlock>
      </div>

      {/* Datos fiscales */}
      <div className="col-md-6">
        {order.billing?.requiresInvoice && order.billing.fiscalData ? (
          <InfoBlock title="Datos de facturación">
            <div className="d-flex align-items-start">
              <IconCircle icon="receipt" className="mt-1" />
              <div>
                <InfoRow label="RFC" value={order.billing.fiscalData.rfc} />
                <div className="mb-2"></div>
                <InfoRow label="Razón Social" value={order.billing.fiscalData.businessName} />
                <div className="mb-2"></div>
                <InfoRow label="Email" value={order.billing.fiscalData.email} />
                <div className="mb-2"></div>
                <InfoRow label="Uso CFDI" value={order.billing.fiscalData.usoCFDI} />
              </div>
            </div>
          </InfoBlock>
        ) : (
          <InfoBlock title="Datos de facturación">
            <div className="d-flex align-items-center text-muted">
              <IconCircle icon="receipt" />
              <p className="mb-0 small">No se solicitó factura para este pedido</p>
            </div>
          </InfoBlock>
        )}
      </div>
    </div>
  );
};