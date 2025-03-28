import React from 'react';
import { InvoiceUploader } from './InvoiceUploader.jsx';

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

// Función auxiliar para formatear fechas
const formatDate = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = timestamp.toDate ? timestamp.toDate() :
      timestamp.seconds ? new Date(timestamp.seconds * 1000) :
        new Date(timestamp);
    return date.toLocaleString('es-MX');
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
};

export const OrderPaymentInfo = ({ order, onOrderUpdate }) => {
  if (!order.payment) {
    return (
      <div className="d-flex align-items-center justify-content-center py-4">
        <div className="text-center">
          <i className="bi bi-credit-card text-secondary opacity-50 fs-1 mb-3"></i>
          <p className="mb-0 text-muted">No hay información de pago disponible</p>
        </div>
      </div>
    );
  }

  // Manejador para cuando se sube una factura
  const handleInvoiceUploaded = (invoiceData) => {
    if (onOrderUpdate) {
      onOrderUpdate();
    }
  };

  // Detectar si hay facturas disponibles para descargar
  const billing = order.billing || {};
  const hasPdf = billing?.invoicePdfUrl || billing?.invoiceUrl;
  const hasXml = billing?.invoiceXmlUrl;
  const hasInvoice = hasPdf || hasXml;
  const invoiceEmailSent = billing?.invoiceEmailSent === true;

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
        {billing?.requiresInvoice && billing.fiscalData ? (
          <InfoBlock title="Datos de facturación">
            <div className="d-flex align-items-start">
              <IconCircle icon="receipt" className="mt-1" />
              <div>
                <InfoRow label="RFC" value={billing.fiscalData.rfc} />
                <div className="mb-2"></div>
                <InfoRow label="Razón Social" value={billing.fiscalData.businessName} />
                <div className="mb-2"></div>
                <InfoRow label="Email" value={billing.fiscalData.email} />
                <div className="mb-2"></div>
                <InfoRow label="Uso CFDI" value={billing.fiscalData.usoCFDI} />
                <div className="mb-2"></div>
                {billing.fiscalData.regimenFiscal && (
                  <>
                    <InfoRow label="Régimen Fiscal" value={billing.fiscalData.regimenFiscal} />
                    <div className="mb-2"></div>
                  </>
                )}
              </div>
            </div>

            {/* Estado de envío de facturas por email */}
            {billing.fiscalData?.email && (
              <div className="mt-3 border-top pt-3">
                <div className="d-flex align-items-center mb-2">
                  <IconCircle icon="envelope" />
                  <div>
                    <InfoRow label="Estado de envío de facturas"
                             value={
                               invoiceEmailSent ? (
                                 <span className="badge bg-success px-2 py-1">
                            Enviadas
                          </span>
                               ) : hasInvoice ? (
                                 <span className="badge bg-warning text-dark px-2 py-1">
                            Pendiente de envío
                          </span>
                               ) : (
                                 <span className="badge bg-secondary px-2 py-1">
                            Sin facturas disponibles
                          </span>
                               )
                             }
                    />
                    {invoiceEmailSent && billing.invoiceEmailSentAt && (
                      <p className="mb-0 small text-muted">
                        Enviadas el {formatDate(billing.invoiceEmailSentAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Componente para subir/gestionar facturas */}
            <div className="mt-4 border-top pt-3">
              <InvoiceUploader
                orderId={order.id}
                billing={billing}
                onInvoiceUploaded={handleInvoiceUploaded}
              />
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