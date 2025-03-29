import React from 'react';
import oxxoLogo from '../../../../../shared/assets/oxxo-logo.svg';


/**
 * Componente que muestra información del voucher de OXXO
 * y las instrucciones para completar el pago
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.orderData - Datos de la orden
 * @param {string} props.voucherUrl - URL del voucher para descargar o imprimir
 * @param {string} props.expiresAt - Fecha de expiración del voucher
 * @returns {JSX.Element}
 */
export const OxxoVoucher = ({ orderData, voucherUrl, expiresAt }) => {
  // Formatear fecha de expiración
  const formatExpiryDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return 'Fecha no disponible';
    }
  };

  // Formatear el total a pagar
  const formatAmount = () => {
    if (!orderData?.totals?.total) return 'No disponible';

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(orderData.totals.total);
  };

  return (
    <div className="oxxo-voucher-container p-4 border rounded bg-white">
      <div className="oxxo-voucher-header text-center mb-4">
        <div className="oxxo-logo-wrapper mb-3">
          <img
            src={oxxoLogo}
            alt="OXXO"
            className="oxxo-logo"
            style={{ maxHeight: '60px', maxWidth: '100%' }}
            onError={(e) => {
              // Fallback si la imagen no carga
              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"><rect width="120" height="60" fill="%23e10718"/><text x="60" y="35" font-family="Arial" font-size="24" fill="white" text-anchor="middle">OXXO</text></svg>';
            }}
          />
        </div>
        <h3 className="voucher-title mb-1">Comprobante de Pago</h3>
        <p className="text-muted mb-0">Presenta este voucher en cualquier tienda OXXO</p>
      </div>

      <div className="oxxo-voucher-details mb-4">
        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="detail-group">
              <div className="detail-label">Orden #:</div>
              <div className="detail-value">{orderData?.id || 'No disponible'}</div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="detail-group">
              <div className="detail-label">Monto a pagar:</div>
              <div className="detail-value fw-bold text-danger">{formatAmount()}</div>
            </div>
          </div>
          <div className="col-12">
            <div className="detail-group">
              <div className="detail-label">Fecha límite de pago:</div>
              <div className="detail-value">{formatExpiryDate(expiresAt)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="oxxo-voucher-instructions bg-light p-3 rounded mb-4">
        <h5 className="instructions-title mb-3">Instrucciones para el pago</h5>
        <ol className="instructions-list">
          <li>Acude a la tienda OXXO más cercana. <a href="https://www.oxxo.com/ubicacion-de-tiendas" target="_blank" rel="noopener noreferrer" className="small">Buscar tienda</a></li>
          <li>Indica en caja que quieres realizar un pago de <strong>OXXOPay</strong>.</li>
          <li>Muestra al cajero el código de barras o proporciona el código de referencia.</li>
          <li>Realiza el pago en efectivo por el monto exacto.</li>
          <li>Guarda tu comprobante de pago.</li>
        </ol>
        <div className="mt-3 small">
          <strong>Nota importante:</strong> El pago se reflejará en tu pedido en un lapso aproximado de 2 a 24 horas.
        </div>
      </div>

      {voucherUrl && (
        <div className="voucher-actions text-center">
          <a
            href={voucherUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success"
          >
            <i className="bi bi-printer me-2"></i>
            Imprimir Voucher
          </a>
          <div className="mt-2">
            <small className="text-muted">
              También te hemos enviado este voucher a tu correo electrónico.
            </small>
          </div>
        </div>
      )}
    </div>
  );
};