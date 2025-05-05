import React from 'react';
import { formatCurrency, formatUnixTimestamp } from '../../../../../utils/formatting/formatters';
import { getFriendlyPaymentStatus } from '../../../../../shared/utils/statusMapping.js';

/**
 * Muestra la información de pago de una orden, incluyendo detalles de tarjeta/método,
 * estado del pago y enlaces de descarga de facturas si aplica.
 */
export const OrderPaymentInfo = ({ payment, billing, invoiceIsRequired }) => {
  // Determinar si hay URLs de factura disponibles
  const pdfUrl = billing?.invoicePdfUrl || billing?.invoiceUrl; // invoiceUrl es legacy, mantenido por compatibilidad
  const xmlUrl = billing?.invoiceXmlUrl;
  const hasInvoiceLinks = pdfUrl || xmlUrl;

  // Obtener la información del estado amigable para el usuario
  const statusInfo = getFriendlyPaymentStatus(payment?.status, 'user');

  // Función auxiliar para renderizar info de tarjeta
  const renderCardInfo = () => (
    <div className="border rounded p-3 mt-3">
      <p className="mb-1 small text-muted">Tarjeta utilizada:</p>
      <p className="mb-0 fw-medium">
        {payment.brand || 'Tarjeta'} terminada en **** {payment.last4}
      </p>
    </div>
  );

  // Función auxiliar para renderizar info de facturación (si existe)
  const renderBillingInfo = () => (
    <div className="border rounded p-3 mt-3">
      <h6 className="mb-3">Información de Facturación</h6>
      <p className="mb-1 small text-muted">RFC:</p>
      <p className="mb-2 fw-medium">{billing.fiscalData.rfc}</p>
      <p className="mb-1 small text-muted">Razón Social:</p>
      <p className="mb-2 fw-medium">{billing.fiscalData.razonSocial}</p>
      {/* Añadir más campos si es necesario */}
    </div>
  );

  return (
    <section className="order-payment-card">
      {/* Método de pago */}
      <p className="d-flex align-items-center mb-2">
        <i className="bi bi-credit-card-2-front me-2" aria-hidden="true"></i>
        {(() => {
          if (payment?.type === 'oxxo') return 'Pago en OXXO';
          let description = '';
          if (payment?.brand) {
            description += payment.brand.charAt(0).toUpperCase() + payment.brand.slice(1);
          }
          if (payment?.last4) {
            description += `${description ? ' terminada en' : 'Tarjeta terminada en'} ${payment.last4}`;
          }
          return description || 'Método de pago estándar';
        })()}
      </p>

      {/* Estado del pago */}
      <p className="mb-3">
        Estado: <span className={`badge ${statusInfo.badgeClass}`}>{statusInfo.label}</span>
      </p>

      {/* ---> BOTÓN OXXO DIRECTO (SI APLICA) <--- */}
      {payment?.type === 'oxxo' && payment?.voucherDetails?.hosted_voucher_url && (
        <div className="mt-2 mb-3"> {/* Un div simple para espaciado */}
          <a 
            href={payment.voucherDetails.hosted_voucher_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-danger btn-sm px-3" /* Ajuste de padding si se desea */
            aria-label="Ver o imprimir el voucher de pago OXXO"
          >
            <i className="bi bi-receipt me-2"></i>
            Ver Voucher OXXO
          </a>
        </div>
      )}
      {/* ---> FIN BOTÓN OXXO DIRECTO <--- */}

      {/* --- SECCIÓN DE FACTURA ELECTRÓNICA --- */}
      {invoiceIsRequired && (
        <div className="invoice-section mt-4 pt-3 border-top">
          <h6 className="text-secondary fw-normal mb-3">
            <i className="bi bi-receipt me-2"></i>Factura Electrónica
          </h6>

          {/* Condicional: Mostrar enlaces de descarga o texto placeholder */}
          {hasInvoiceLinks ? (
            <div className="invoice-downloads d-flex flex-wrap gap-2">

              {/* Botón PDF */}
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-danger btn-sm"
                  aria-label="Descargar Factura PDF"
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                </a>
              )}
              
              {/* Botón XML*/}
              {xmlUrl && (
                <a
                  href={xmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-success btn-sm" // Cambiado a success (verde)
                  aria-label="Descargar Factura XML"
                >
                  <i className="bi bi-file-earmark-code me-1"></i> XML
                </a>
              )}
              
            </div>
          ) : (
            // Placeholder si aún no hay enlaces
            <p className="text-muted small mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Aquí aparecerán los enlaces para descargar tu factura (PDF y XML) cuando esté lista.
            </p>
          )}
        </div>
      )}
      {/* --- FIN SECCIÓN DE FACTURA --- */}

      {/* Renderizar info de tarjeta si aplica */}
      {payment?.type === 'card' && payment?.last4 && renderCardInfo()}

      {/* Renderizar info de facturación si aplica */}
      {invoiceIsRequired && billing?.fiscalData && renderBillingInfo()}
    </section>
  );
};