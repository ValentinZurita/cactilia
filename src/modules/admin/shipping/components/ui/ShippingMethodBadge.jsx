import React from 'react';
import PropTypes from 'prop-types';
import { formatPrice } from '../../utils';

/**
 * Componente para mostrar información de un método de envío
 * @param {Object} option - Opción de envío
 * @param {boolean} showPrice - Si se debe mostrar el precio
 * @param {boolean} showCarrier - Si se debe mostrar la mensajería
 */
const ShippingMethodBadge = ({ 
  option, 
  showPrice = true, 
  showCarrier = false 
}) => {
  if (!option || !option.nombre) {
    return null;
  }
  
  // Construir texto para tooltip
  const tooltipText = [
    option.tiempo && `Tiempo: ${option.tiempo}`,
    showPrice && option.precio !== undefined && `Precio: ${formatPrice(option.precio)}`,
    showCarrier && option.mensajeria && `Mensajería: ${option.mensajeria}`
  ].filter(Boolean).join(' • ');
  
  // Texto principal a mostrar
  let displayText = option.nombre;
  
  // Agregar precio si se solicita
  if (showPrice && option.precio !== undefined) {
    displayText += ` - ${formatPrice(option.precio)}`;
  }
  
  // Agregar mensajería si se solicita
  if (showCarrier && option.mensajeria) {
    displayText += ` (${option.mensajeria})`;
  }
  
  return (
    <span
      className="badge bg-light text-dark border d-inline-flex align-items-center"
      title={tooltipText}
    >
      <i className="bi bi-box me-1 small text-secondary"></i>
      {displayText}
    </span>
  );
};

ShippingMethodBadge.propTypes = {
  /** Opción de envío */
  option: PropTypes.shape({
    nombre: PropTypes.string.isRequired,
    tiempo: PropTypes.string,
    precio: PropTypes.number,
    mensajeria: PropTypes.string
  }).isRequired,
  /** Si se debe mostrar el precio */
  showPrice: PropTypes.bool,
  /** Si se debe mostrar la mensajería */
  showCarrier: PropTypes.bool
};

export default ShippingMethodBadge; 