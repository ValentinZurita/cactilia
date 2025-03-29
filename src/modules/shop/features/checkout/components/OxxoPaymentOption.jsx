import React from 'react';
import oxxoLogo from '../../../../../shared/assets/oxxo-logo.svg';
/**
 * Componente que muestra información sobre el pago con OXXO
 * y explica el proceso al usuario
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.selected - Indica si esta opción está seleccionada
 * @param {Function} props.onSelect - Función que se ejecuta al seleccionar esta opción
 * @returns {JSX.Element}
 */
export const OxxoPaymentOption = ({ selected, onSelect }) => {
  return (
    <div className={`payment-method-option ${selected ? 'active-payment-option' : ''}`}>
      <div className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name="paymentMethodSelection"
          id="payment-oxxo"
          checked={selected}
          onChange={onSelect}
        />
        <label
          className="form-check-label d-flex align-items-start"
          htmlFor="payment-oxxo"
          style={{ cursor: 'pointer' }}
        >
          <div className="oxxo-logo-container me-3">
            <img
              src={oxxoLogo}
              alt="OXXO"
              className="oxxo-logo"
              width="40"
              height="40"
              onError={(e) => {
                // Fallback si la imagen no carga
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e10718"/><text x="20" y="25" font-family="Arial" font-size="14" fill="white" text-anchor="middle">OXXO</text></svg>';
              }}
            />
          </div>
          <div className="flex-grow-1">
            <div className="payment-method-name">
              Pago en OXXO
            </div>
            <div className="payment-method-details text-muted small">
              Paga en efectivo en cualquier tienda OXXO
            </div>
          </div>
        </label>
      </div>

      {/* Información adicional que se muestra cuando esta opción está seleccionada */}
      {selected && (
        <div className="oxxo-payment-info mt-3">
          <div className="oxxo-steps">
            <div className="oxxo-step">
              <span className="oxxo-step-number">1</span>
              <span className="oxxo-step-text">Recibirás un voucher al completar tu pedido</span>
            </div>
            <div className="oxxo-step">
              <span className="oxxo-step-number">2</span>
              <span className="oxxo-step-text">Acude a cualquier tienda OXXO y presenta el voucher</span>
            </div>
            <div className="oxxo-step">
              <span className="oxxo-step-number">3</span>
              <span className="oxxo-step-text">Tu pedido será procesado una vez recibamos la confirmación del pago</span>
            </div>
          </div>

          <div className="oxxo-important-info mt-3">
            <p className="mb-0 small text-muted">
              <i className="bi bi-info-circle me-2"></i>
              El voucher tiene una validez de 24 horas. Si no se realiza el pago en ese periodo, el pedido será cancelado.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};