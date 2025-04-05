import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/shippingSelector.css';

/**
 * Componente para seleccionar opciones de envío en el checkout
 * Permite al usuario elegir entre las diferentes opciones disponibles para el envío
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.shippingOptions - Lista de opciones de envío disponibles
 * @param {string} props.selectedOptionId - ID de la opción seleccionada
 * @param {Function} props.onOptionSelect - Función para seleccionar una opción
 * @param {boolean} props.loading - Indica si están cargando las opciones
 */
export const ShippingOptionSelector = ({
  shippingOptions = [],
  selectedOptionId,
  onOptionSelect,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="shipping-method-selector p-3 border rounded mb-3">
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm text-secondary me-2" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span>Calculando opciones de envío...</span>
        </div>
      </div>
    );
  }

  if (!shippingOptions || shippingOptions.length === 0) {
    return (
      <div className="shipping-method-selector p-3 border rounded mb-3">
        <div className="alert alert-warning mb-0">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No hay opciones de envío disponibles para esta dirección.
        </div>
      </div>
    );
  }

  return (
    <div className="shipping-method-selector">
      <h6 className="mb-3">Selecciona una opción de envío</h6>
      <div className="shipping-method-list">
        {shippingOptions.map((option) => (
          <ShippingOption
            key={option.id}
            isSelected={selectedOptionId === option.id}
            onSelect={() => onOptionSelect(option)}
            name={option.label || 'Envío estándar'}
            description={`${option.carrier || 'Servicio'}${option.minDays && option.maxDays ? ` · ${option.minDays}-${option.maxDays} días` : ''}`}
            price={option.calculatedCost || option.totalCost}
            id={`shipping-option-${option.id}`}
            details={option.details}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Componente para una opción individual de envío
 */
const ShippingOption = ({
  isSelected,
  onSelect,
  name,
  description,
  price,
  id,
  details
}) => {
  return (
    <div className={`shipping-method-option ${isSelected ? 'active-shipping-option' : ''}`}>
      <div className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name="shippingOptionSelection"
          id={id}
          checked={isSelected}
          onChange={onSelect}
          aria-label={`Seleccionar opción de envío: ${name}`}
        />
        <label
          className="form-check-label d-flex align-items-center justify-content-between w-100"
          htmlFor={id}
          style={{ cursor: 'pointer' }}
          onClick={onSelect}
        >
          <div>
            <div className="shipping-method-name">
              {name}
            </div>
            <div className="shipping-method-details text-muted small">
              {description}
            </div>
            {details && (
              <div className="shipping-method-extra-details text-muted small fst-italic mt-1">
                {details}
              </div>
            )}
          </div>
          <div className="shipping-method-price fw-bold">
            {price === 0 ? 'Gratis' : `$${price.toFixed(2)}`}
          </div>
        </label>
      </div>
    </div>
  );
};

ShippingOption.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  details: PropTypes.string
};

ShippingOptionSelector.propTypes = {
  shippingOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      carrier: PropTypes.string,
      calculatedCost: PropTypes.number,
      totalCost: PropTypes.number,
      minDays: PropTypes.number,
      maxDays: PropTypes.number,
      details: PropTypes.string
    })
  ),
  selectedOptionId: PropTypes.string,
  onOptionSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ShippingOptionSelector; 