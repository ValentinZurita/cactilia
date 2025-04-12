import React from 'react';
import PropTypes from 'prop-types';
import ShippingOption from './ShippingOption';

/**
 * Componente que renderiza un grupo de opciones de envío
 * 
 * @param {Object} props - Propiedades del componente 
 * @param {Object} props.group - Datos del grupo de opciones
 * @param {function} props.onOptionSelect - Función para seleccionar una opción
 * @param {string} props.selectedOptionId - ID de la opción seleccionada
 * @param {boolean} props.loading - Indica si está en estado de carga
 * @param {Array} props.cartItems - Items del carrito
 */
const ShippingOptionGroup = ({ 
  group, 
  onOptionSelect, 
  selectedOptionId, 
  loading = false,
  cartItems = []
}) => {
  if (!group || !group.options || group.options.length === 0) return null;
  
  return (
    <div key={group.id} className="shipping-option-group mb-4">
      <div className="shipping-group-header">
        <h5>
          <i className={`bi ${group.icon || 'bi-box'} me-2`}></i>
          {group.title}
        </h5>
        <p className="text-muted">{group.subtitle}</p>
      </div>
      
      <div className="shipping-options-container">
        {group.options.map(option => (
          <ShippingOption
            key={option.id || option.optionId}
            option={option}
            onSelect={onOptionSelect}
            isSelected={selectedOptionId === option.id || selectedOptionId === option.optionId}
            cartItems={cartItems}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

ShippingOptionGroup.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    icon: PropTypes.string,
    options: PropTypes.array.isRequired
  }).isRequired,
  onOptionSelect: PropTypes.func.isRequired,
  selectedOptionId: PropTypes.string,
  loading: PropTypes.bool,
  cartItems: PropTypes.array
};

export default ShippingOptionGroup; 