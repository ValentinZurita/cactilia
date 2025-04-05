import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { prepareShippingOptionsForCheckout } from '../../services/shippingGroupingService';
import './ShippingCalculator.css';

/**
 * Componente para calcular y mostrar opciones de envío en el checkout
 * ADAPTADO para la estructura específica de Cactilia
 */
const ShippingCalculator = ({
                              cart,
                              userAddress,
                              selectedShippingOption,
                              onShippingChange,
                              onAvailableOptionsChange
                            }) => {
  const [loading, setLoading] = useState(true);
  const [shippingData, setShippingData] = useState({ groups: [], totalOptions: [] });
  const [error, setError] = useState(null);

  // Cargar opciones de envío cuando cambia el carrito o la dirección
  useEffect(() => {
    const loadShippingOptions = async () => {
      if (!cart || !cart.items || cart.items.length === 0) {
        setShippingData({ groups: [], totalOptions: [] });
        setLoading(false);
        return;
      }

      if (!userAddress || !userAddress.zipCode) {
        setError('Se requiere la dirección para calcular opciones de envío');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Obtener opciones de envío basadas en estructura de Cactilia
        const result = await prepareShippingOptionsForCheckout(cart.items, userAddress);

        setShippingData(result);

        // Notificar al componente padre sobre las opciones disponibles
        if (onAvailableOptionsChange && result.totalOptions.length > 0) {
          // Adaptar las opciones al formato esperado
          const formattedOptions = result.totalOptions.map(option => ({
            id: option.id,
            label: option.label,
            carrier: option.carrier,
            calculatedCost: option.totalCost,
            deliveryTime: option.deliveryTime,
            isFreeShipping: option.isFreeShipping
          }));

          onAvailableOptionsChange(formattedOptions);
        }

        // Seleccionar automáticamente la opción más barata si no hay selección
        if (!selectedShippingOption && result.totalOptions.length > 0) {
          // También adaptar esta opción al formato esperado
          const defaultOption = {
            id: result.totalOptions[0].id,
            label: result.totalOptions[0].label,
            carrier: result.totalOptions[0].carrier,
            calculatedCost: result.totalOptions[0].totalCost,
            deliveryTime: result.totalOptions[0].deliveryTime,
            isFreeShipping: result.totalOptions[0].isFreeShipping
          };

          onShippingChange(defaultOption);
        }
      } catch (err) {
        console.error('Error al cargar opciones de envío:', err);
        setError('No se pudieron calcular las opciones de envío');
      } finally {
        setLoading(false);
      }
    };

    loadShippingOptions();
  }, [cart, userAddress, selectedShippingOption, onShippingChange, onAvailableOptionsChange]);

  // Renderizar mensajes de carga o error
  if (loading) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border spinner-border-sm text-secondary me-2" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span>Calculando opciones de envío...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle-fill me-2"></i>
        Por favor completa tu dirección para ver las opciones de envío disponibles.
      </div>
    );
  }

  if (shippingData.totalOptions.length === 0) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        No hay opciones de envío disponibles para tu ubicación.
      </div>
    );
  }

  // Renderizar opciones de envío adaptadas a la estructura de Cactilia
  return (
    <div className="shipping-calculator">
      <h6 className="text-dark mb-3">Opciones de envío</h6>

      <div className="shipping-options">
        {shippingData.totalOptions.map((option) => {
          const isSelected = selectedShippingOption && selectedShippingOption.id === option.id;
          const formattedPrice = option.totalCost === 0
            ? 'Gratis'
            : `$${option.totalCost.toFixed(2)}`;

          return (
            <div
              key={option.id}
              className={`shipping-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onShippingChange({
                id: option.id,
                label: option.label,
                carrier: option.carrier,
                calculatedCost: option.totalCost,
                deliveryTime: option.deliveryTime,
                isFreeShipping: option.isFreeShipping
              })}
            >
              <div className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id={`shipping-option-${option.id}`}
                  checked={isSelected}
                  onChange={() => onShippingChange({
                    id: option.id,
                    label: option.label,
                    carrier: option.carrier,
                    calculatedCost: option.totalCost,
                    deliveryTime: option.deliveryTime,
                    isFreeShipping: option.isFreeShipping
                  })}
                />
                <label className="form-check-label" htmlFor={`shipping-option-${option.id}`}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-medium">{option.label}</div>
                      <div className="text-muted small">
                        <span className="me-2">{option.carrier}</span>
                        <span>{option.deliveryTime}</span>
                      </div>
                    </div>
                    <div className="shipping-price">
                      {option.isFreeShipping ? (
                        <span className="text-success">{formattedPrice}</span>
                      ) : (
                        <span>{formattedPrice}</span>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mostrar detalles si es necesario */}
      {selectedShippingOption && shippingData.groups && shippingData.groups.length > 0 && (
        <div className="mt-3 small text-muted">
          Tiempo estimado de entrega: {selectedShippingOption.deliveryTime || "3-5 días"}
        </div>
      )}
    </div>
  );
};

ShippingCalculator.propTypes = {
  cart: PropTypes.object.isRequired,
  userAddress: PropTypes.object,
  selectedShippingOption: PropTypes.object,
  onShippingChange: PropTypes.func.isRequired,
  onAvailableOptionsChange: PropTypes.func
};

export default ShippingCalculator;