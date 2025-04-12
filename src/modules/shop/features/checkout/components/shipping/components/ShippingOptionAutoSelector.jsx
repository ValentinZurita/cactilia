import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Auto-selecciona una opción de envío basado en preferencias del usuario
 */
const ShippingOptionAutoSelector = ({
  shippingOptions,
  selectedOptionId,
  onOptionSelect,
  enabled = true,
  preference = 'cheapest'
}) => {
  // Auto-seleccionar opción según preferencia
  useEffect(() => {
    // Solo auto-seleccionar si está habilitado y no hay una opción ya seleccionada
    if (!enabled || !shippingOptions || shippingOptions.length === 0 || selectedOptionId) {
      return;
    }

    // Filtrar opciones que cubren todos los productos
    const validOptions = shippingOptions.filter(option => 
      option.coversAllProducts || option.coversAllProducts === undefined
    );
    
    if (validOptions.length === 0) {
      return;
    }

    let selectedOption;

    switch (preference) {
      case 'cheapest':
        // Ordenar por precio ascendente
        selectedOption = [...validOptions].sort((a, b) => 
          (a.price || 0) - (b.price || 0)
        )[0];
        break;
        
      case 'fastest':
        // Ordenar por tiempo de entrega
        selectedOption = [...validOptions].sort((a, b) => {
          const aTime = a.estimatedDeliveryDays?.min || 7;
          const bTime = b.estimatedDeliveryDays?.min || 7;
          return aTime - bTime;
        })[0];
        break;
        
      default:
        // Por defecto, usar la primera opción
        selectedOption = validOptions[0];
    }

    if (selectedOption && onOptionSelect) {
      onOptionSelect(selectedOption);
    }
  }, [shippingOptions, selectedOptionId, onOptionSelect, enabled, preference]);

  // Este componente no renderiza nada visible
  return null;
};

ShippingOptionAutoSelector.propTypes = {
  shippingOptions: PropTypes.array,
  selectedOptionId: PropTypes.string,
  onOptionSelect: PropTypes.func.isRequired,
  enabled: PropTypes.bool,
  preference: PropTypes.oneOf(['cheapest', 'fastest', 'recommended'])
};

export default ShippingOptionAutoSelector; 