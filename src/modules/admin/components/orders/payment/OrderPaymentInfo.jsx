import React, { useState } from 'react';
import { InvoiceUploader } from './InvoiceUploader.jsx';
import { capturePayment } from '../services/orderAdminService.js';
import { getFriendlyPaymentStatus } from '../../../../../shared/utils/statusMapping.js';
// Importar componentes auxiliares reutilizables
import { IconCircle } from '../common/IconCircle.jsx';
import { InfoBlock } from '../common/InfoBlock.jsx';
import { InfoRow } from '../common/InfoRow.jsx';

// --- Componentes auxiliares locales ELIMINADOS ---
/*
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
*/
// --- Fin Componentes Eliminados ---

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
  // console.log('[OrderPaymentInfo] Datos de pago recibidos:', order?.payment);
  // console.log('[OrderPaymentInfo] Estado del pago:', order?.payment?.status);
  // Ya no necesitamos los logs específicos aquí
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

  // --- Usar la función de mapeo para el estado del pago ---
  const paymentStatusInfo = getFriendlyPaymentStatus(order.payment.status, 'admin');
  // -----------------------------------------------------

  // Determinar si el pago se puede capturar (usando el estado técnico original)
  const canCapture = order.payment.status === 'requires_capture';
  // console.log('[OrderPaymentInfo] ¿Se puede capturar? ...'); // Ya no es necesario

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
                  // Usar los valores de la función de mapeo
                  <span className={`badge px-2 py-1 mt-1 ${paymentStatusInfo.badgeClass}`}>
                    {paymentStatusInfo.label}
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

          {/* --- Botón de Captura --- */}
          {canCapture && (
            <div className="mt-4 border-top pt-3">
              <button 
                className="btn btn-dark w-100"
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
          {/* --- Fin Botón de Captura --- */}
        </InfoBlock>
      </div>

      {/* Datos fiscales y Subida de Factura - CORREGIDO */}
      <div className="col-md-6">
        <InfoBlock title="Datos de facturación">
          {/* Mostrar datos solo si se requiere y existen */}
          {order?.requiresInvoice && order.fiscalData && Object.keys(order.fiscalData).length > 0 ? (
            <div className="d-flex align-items-start mb-3">
              <IconCircle icon="receipt" className="mt-1" />
              <div>
                {/* Asegúrate que los nombres de campo coincidan con tu objeto fiscalData */}
                {order.fiscalData.rfc && <InfoRow label="RFC" value={order.fiscalData.rfc} />} 
                {order.fiscalData.rfc && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.businessName && <InfoRow label="Razón Social" value={order.fiscalData.businessName} />}
                {order.fiscalData.businessName && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.regimenFiscal && <InfoRow label="Régimen Fiscal" value={order.fiscalData.regimenFiscal} />}
                 {order.fiscalData.regimenFiscal && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.usoCFDI && <InfoRow label="Uso CFDI" value={order.fiscalData.usoCFDI} />}
                 {order.fiscalData.usoCFDI && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.email && <InfoRow label="Email Facturación" value={order.fiscalData.email} />}
                {order.fiscalData.email && <div className="mb-2"></div>} {/* Espacio */} 
                {/* --- Display Fiscal Address --- */}
                {order.fiscalData.postalCode && <InfoRow label="Código Postal" value={order.fiscalData.postalCode} />}
                {order.fiscalData.postalCode && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.street && <InfoRow label="Calle" value={order.fiscalData.street} />}
                {order.fiscalData.street && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.extNumber && <InfoRow label="Num. Exterior" value={order.fiscalData.extNumber} />}
                {order.fiscalData.extNumber && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.intNumber && <InfoRow label="Num. Interior" value={order.fiscalData.intNumber} />}
                {order.fiscalData.intNumber && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.neighborhood && <InfoRow label="Colonia" value={order.fiscalData.neighborhood} />}
                {order.fiscalData.neighborhood && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.city && <InfoRow label="Ciudad/Municipio" value={order.fiscalData.city} />}
                {order.fiscalData.city && <div className="mb-2"></div>} {/* Espacio */} 
                {order.fiscalData.state && <InfoRow label="Estado" value={order.fiscalData.state} />}
                 {order.fiscalData.state && <div className="mb-2"></div>} {/* Espacio */} 
                {/* --- End Fiscal Address --- */}
                {/* REMOVED: order.fiscalData.fiscalAddress - Replaced by individual fields above */}
                {/* Añade aquí más campos si es necesario, ej: order.fiscalData.email */} 
              </div>
            </div>
          ) : order?.requiresInvoice ? (
             <p className="text-muted fst-italic">(Datos fiscales requeridos pero no encontrados en la orden)</p>
          ) : (
            <p className="text-muted">No se solicitó factura.</p>
          )}

          {/* Mostrar uploader SIEMPRE que se requiera factura */}
          {order?.requiresInvoice && (
            <div className="mt-4 pt-3 border-top">
              <InvoiceUploader
                orderId={order.id}
                billing={order.billing || {}}
                onInvoiceUploaded={handleInvoiceUploaded}
              />
            </div>
          )}
        </InfoBlock>
      </div>
    </div>
  );
};