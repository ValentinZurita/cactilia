import React, { useEffect } from 'react';
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
  // Agregar log para diagnóstico
  useEffect(() => {
    // Usar un log más limitado para evitar múltiples renderizaciones
    if (shippingOptions.length > 0) {
      // Solo mostrar una vez cuando hay opciones disponibles o cuando cambia la opción seleccionada
      const logInfo = {
        opciones: shippingOptions.length,
        seleccionada: selectedOptionId
      };
      console.log("🚚 RENDERIZANDO SHIPPING OPTION SELECTOR", logInfo);
    }
    
    // Si hay opciones disponibles pero no hay opción seleccionada, seleccionar automáticamente la primera
    if (shippingOptions && shippingOptions.length > 0 && !selectedOptionId && onOptionSelect) {
      console.log('⚠️ No hay opción seleccionada, seleccionando la primera automáticamente');
      onOptionSelect(shippingOptions[0]);
    }
  }, [shippingOptions, selectedOptionId, onOptionSelect]);

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
            option={option}
            id={`shipping-option-${option.id}`}
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
  option,
  id
}) => {
  const name = option.label || 'Envío estándar';
  const price = option.calculatedCost || option.totalCost || 0;
  const description = `${option.carrier || 'Servicio'}${option.tiempo_entrega ? ` · ${option.tiempo_entrega}` : option.minDays && option.maxDays ? ` · ${option.minDays}-${option.maxDays} días` : ''}`;
  const details = option.details;
  
  return (
    <div className={`shipping-method-option ${isSelected ? 'active-shipping-option' : ''}`} onClick={onSelect}>
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
            ${price.toFixed(2)}
          </div>
        </label>
      </div>
    </div>
  );
};

ShippingOption.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  option: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired
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