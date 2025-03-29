import React from 'react';
import PropTypes from 'prop-types';
import '../styles/paymentSelector.css';

/**
 * PaymentOption - Componente reutilizable para opciones de pago
 *
 * @param {Object} props
 * @param {boolean} props.isSelected - Si la opción está seleccionada
 * @param {Function} props.onSelect - Función al seleccionar esta opción
 * @param {string} props.icon - Clase del icono (opcional)
 * @param {string} props.name - Nombre del método de pago
 * @param {string} props.description - Descripción/detalles del método
 * @param {boolean} props.isDefault - Si es el método predeterminado (opcional)
 * @param {string} props.id - ID para el input de radio
 * @param {ReactNode} props.children - Contenido adicional (ej: formulario de tarjeta)
 */
export const PaymentOption = ({
                                isSelected,
                                onSelect,
                                icon,
                                name,
                                description,
                                isDefault,
                                id,
                                children
                              }) => {
  return (
    <div className={`payment-method-option ${isSelected ? 'active-payment-option' : ''}`}>
      <div className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name="paymentMethodSelection"
          id={id}
          checked={isSelected}
          onChange={onSelect}
          aria-label={`Seleccionar método de pago: ${name}`}
        />
        <label
          className="form-check-label d-flex align-items-center"
          htmlFor={id}
          style={{ cursor: 'pointer' }}
          onClick={onSelect}
        >
          {icon && <i className={`bi ${icon} me-2 fs-4`} aria-hidden="true"></i>}
          <div>
            <div className="payment-method-name">
              {name}
            </div>
            <div className="payment-method-details text-muted small">
              {description}
            </div>
            {isDefault && (
              <span className="badge bg-secondary bg-opacity-25 text-secondary mt-1">
                <i className="bi bi-check-circle-fill me-1"></i>
                Predeterminada
              </span>
            )}
          </div>
        </label>
      </div>

      {children}
    </div>
  );
};

PaymentOption.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  icon: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isDefault: PropTypes.bool,
  id: PropTypes.string.isRequired,
  children: PropTypes.node
};