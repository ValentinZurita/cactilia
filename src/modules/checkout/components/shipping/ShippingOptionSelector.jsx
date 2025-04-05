import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ShippingCalculator from './ShippingCalculator';

/**
 * Componente simplificado para seleccionar opciones de envío en el checkout
 * ADAPTADO para la estructura específica de Cactilia
 */
const ShippingOptionSelector = ({
                                  cart,
                                  userAddress,
                                  onOptionSelected,
                                  initialOption = null
                                }) => {
  const [selectedOption, setSelectedOption] = useState(initialOption);
  const [availableOptions, setAvailableOptions] = useState([]);

  // Manejar selección de opción
  const handleOptionChange = (option) => {
    setSelectedOption(option);

    if (onOptionSelected) {
      onOptionSelected(option);
    }
  };

  // Manejar cambio en opciones disponibles
  const handleAvailableOptionsChange = (options) => {
    setAvailableOptions(options);

    // Seleccionar automáticamente la primera opción si no hay selección
    if (!selectedOption && options.length > 0) {
      handleOptionChange(options[0]);
    }
  };

  // Render del componente
  return (
    <div className="shipping-option-selector">
      <ShippingCalculator
        cart={cart}
        userAddress={userAddress}
        selectedShippingOption={selectedOption}
        onShippingChange={handleOptionChange}
        onAvailableOptionsChange={handleAvailableOptionsChange}
      />

      {/* Resumen de opción seleccionada */}
      {selectedOption && (
        <div className="selected-option-summary">
          <div className="card bg-light border-0 rounded-3 mb-3">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1">Opción seleccionada</h6>
                  <div className="text-muted small">
                    {selectedOption.label} - {selectedOption.carrier}
                  </div>
                  <div className="text-muted small mt-1">
                    Tiempo estimado: {selectedOption.deliveryTime}
                  </div>
                </div>
                <div className="fw-medium">
                  {selectedOption.calculatedCost === 0 ? (
                    <span className="text-success">Gratis</span>
                  ) : (
                    <span>${selectedOption.calculatedCost.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje si no hay opciones disponibles */}
      {availableOptions.length === 0 && !selectedOption && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          No hay opciones de envío disponibles para tu ubicación.
          {userAddress ? (
            <div className="mt-2 small">
              Por favor verifica tu dirección o contacta con soporte.
            </div>
          ) : (
            <div className="mt-2 small">
              Por favor completa tu dirección para ver opciones de envío.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ShippingOptionSelector.propTypes = {
  cart: PropTypes.object.isRequired,
  userAddress: PropTypes.object,
  onOptionSelected: PropTypes.func,
  initialOption: PropTypes.object
};

export default ShippingOptionSelector;