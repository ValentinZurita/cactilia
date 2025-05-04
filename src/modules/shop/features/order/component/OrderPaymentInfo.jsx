// Importar la utilidad de mapeo
import { getFriendlyPaymentStatus } from '../../../../../shared/utils/statusMapping.js';

export const OrderPaymentInfo = ({ payment, billing, invoiceIsRequired }) => {
  // Limpiar logs de depuración
  // console.log('--- [Shop OrderPaymentInfo] RENDERIZANDO --- ');
  // console.log('[Shop OrderPaymentInfo] Prop billing recibida:', billing);
  // console.log('[Shop OrderPaymentInfo] Valor de invoiceIsRequired (nueva prop):', invoiceIsRequired);

  // Determinar si hay URLs de factura disponibles
  const pdfUrl = billing?.invoicePdfUrl || billing?.invoiceUrl; // invoiceUrl es legacy
  const xmlUrl = billing?.invoiceXmlUrl;
  const hasInvoiceLinks = pdfUrl || xmlUrl;

  // Obtener la información del estado amigable para el usuario
  const statusInfo = getFriendlyPaymentStatus(payment?.status, 'user');

  return (
    <section className="order-payment-card">
      {/* Método de pago */}
      <p className="d-flex align-items-center mb-2">
        <i className="bi bi-credit-card-2-front me-2" aria-hidden="true"></i>
        {(() => {
          // Lógica mejorada para mostrar detalles de pago
          if (payment?.type === 'oxxo') {
            return 'Pago en OXXO';
          }
          let description = '';
          if (payment?.brand) {
            description += payment.brand.charAt(0).toUpperCase() + payment.brand.slice(1); // Capitalizar marca
          }
          if (payment?.last4) {
            description += `${description ? ' terminada en' : 'Tarjeta terminada en'} ${payment.last4}`;
          }
          // Si no hay brand ni last4, mostrar texto genérico
          return description || 'Método de pago estándar'; 
        })()}
      </p>

      {/* Estado del pago */}
      <p className="mb-3">
        Estado: <span className={`badge ${statusInfo.badgeClass}`}>{statusInfo.label}</span>
      </p>

      {/* --- SECCIÓN DE FACTURA ELECTRÓNICA ACTUALIZADA --- */}
      {invoiceIsRequired && (
        <div className="invoice-section mt-4 pt-3 border-top">
          <h6 className="text-secondary fw-normal mb-3">
            <i className="bi bi-receipt me-2"></i>Factura Electrónica
          </h6>

          {/* Condicional: Mostrar enlaces o placeholder */}
          {hasInvoiceLinks ? (
            <div className="invoice-downloads d-flex flex-wrap gap-2">
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
              {xmlUrl && (
                <a
                  href={xmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary btn-sm"
                  aria-label="Descargar Factura XML"
                >
                  <i className="bi bi-file-earmark-code me-1"></i> XML
                </a>
              )}
            </div>
          ) : (
            // Placeholder si no hay enlaces aún
            <p className="text-muted small mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Aquí aparecerán los enlaces para descargar tu factura (PDF y XML) cuando esté lista.
            </p>
          )}
        </div>
      )}
      {/* --- FIN SECCIÓN DE FACTURA --- */}
    </section>
  );
};