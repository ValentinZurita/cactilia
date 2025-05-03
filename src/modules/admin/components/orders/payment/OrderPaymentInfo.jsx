import React, { useState } from 'react';
import { InvoiceUploader } from './InvoiceUploader.jsx';
import { capturePayment } from '../services/orderAdminService.js';

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
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState(null);

  // --- LOG para Debug --- 
  console.log('[OrderPaymentInfo] Datos de pago recibidos:', order?.payment);
  console.log('[OrderPaymentInfo] Estado del pago:', order?.payment?.status);
  // ---------------------

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

  // Función para manejar la captura
  const handleCapturePayment = async () => {
    if (!order?.payment?.paymentIntentId) {
      setCaptureError('No se encontró el ID de la transacción para capturar.');
      return;
    }
    setIsCapturing(true);
    setCaptureError(null);
    try {
      const result = await capturePayment(order.payment.paymentIntentId);
      console.log('Capture successful:', result);
      // Opcional: Mostrar mensaje de éxito
      alert('¡Pago capturado exitosamente!');
      // Llamar a onOrderUpdate para refrescar los datos de la orden si es necesario
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    } catch (error) {
      console.error('Capture failed:', error);
      setCaptureError(error.message || 'Ocurrió un error al capturar el pago.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Determinar si el pago se puede capturar
  const canCapture = order.payment.status === 'requires_capture';
  console.log('[OrderPaymentInfo] ¿Se puede capturar? (status === \'requires_capture\'):', canCapture);

  return (
    <div className="row g-4">

      {/* Método de pago */}
      <div className="col-md-6">
        <InfoBlock title="Método de pago">
          <div className="d-flex align-items-center mb-3">
            <IconCircle icon="credit-card" />
            <InfoRow
              label="Forma de pago"
              value={(() => {
                if (order.payment.type === 'oxxo') {
                  return 'Pago en OXXO';
                }
                const brand = order.payment.brand;
                const last4 = order.payment.last4;
                let description = '';
                if (brand) {
                  description += `${brand.toUpperCase()}`;
                }
                if (last4) {
                  description += description ? ` terminada en ${last4}` : `Tarjeta terminada en ${last4}`;
                }
                return description || 'Método de pago estándar';
              })()}
            />
          </div>

          {order.payment.status && (
            <div className="d-flex align-items-center mb-3">
              <IconCircle icon="check-circle" />
              <InfoRow
                label="Estado del pago"
                value={
                  <span className={`badge px-2 py-1 mt-1 bg-${order.payment.status === 'succeeded' ? 'success' : order.payment.status === 'requires_capture' ? 'warning text-dark' : 'secondary'}`}>
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

          {canCapture && (
            <div className="mt-4 border-top pt-3">
              <button 
                className="btn btn-primary w-100" 
                onClick={handleCapturePayment}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Capturando...
                  </>
                ) : (
                  <><i className="bi bi-credit-card-2-front me-2"></i>Capturar Pago</>
                )}
              </button>
              {captureError && (
                <div className="alert alert-danger mt-3 mb-0 p-2 small">{captureError}</div>
              )}
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