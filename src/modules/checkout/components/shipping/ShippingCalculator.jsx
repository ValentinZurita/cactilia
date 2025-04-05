import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { prepareShippingOptionsForCheckout } from '../../services/shippingGroupingService';
import './ShippingCalculator.css';

/**
 * Componente para calcular y mostrar las opciones de envío en el checkout
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

      try {
        setLoading(true);
        setError(null);
        
        // Obtener opciones de envío agrupadas
        const result = await prepareShippingOptionsForCheckout(cart.items, userAddress);
        
        setShippingData(result);
        
        // Notificar al componente padre sobre las opciones disponibles
        if (onAvailableOptionsChange && result.totalOptions.length > 0) {
          onAvailableOptionsChange(result.totalOptions);
        }
        
        // Seleccionar automáticamente la opción más barata si no hay una seleccionada
        if (!selectedShippingOption && result.totalOptions.length > 0) {
          onShippingChange(result.totalOptions[0]);
        }
      } catch (err) {
        console.error('Error al cargar opciones de envío:', err);
        setError('No se pudieron cargar las opciones de envío');
      } finally {
        setLoading(false);
      }
    };

    loadShippingOptions();
  }, [cart, userAddress, selectedShippingOption, onShippingChange, onAvailableOptionsChange]);

  // Renderizar las opciones de envío
  const renderShippingOptions = () => {
    if (loading) {
      return (
        <div className="text-center p-3">
          <div className="spinner-border spinner-border-sm text-dark me-2" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span>Calculando opciones de envío...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      );
    }

    if (!userAddress) {
      return (
        <div className="alert alert-warning">
          Por favor completa tu dirección para ver las opciones de envío disponibles.
        </div>
      );
    }

    if (shippingData.totalOptions.length === 0) {
      return (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No hay opciones de envío disponibles para tu ubicación.
          <div className="mt-2 small">
            Código postal: {userAddress.zipCode}<br />
            Ciudad: {userAddress.city}<br />
            Estado: {userAddress.state}
          </div>
        </div>
      );
    }

    return (
      <div className="list-group mb-3">
        {shippingData.totalOptions.map((option) => {
          const isSelected = selectedShippingOption && selectedShippingOption.id === option.id;
          const formattedPrice = option.totalCost === 0 
            ? 'Gratis' 
            : `$${option.totalCost.toFixed(2)}`;
          
          return (
            <div
              key={option.id}
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                isSelected ? 'active' : ''
              }`}
              onClick={() => onShippingChange(option)}
              role="button"
            >
              <div>
                <div className="fw-bold">{option.label}</div>
                <div className="small">{option.carrier} - {option.deliveryTime || '3-5 días'}</div>
              </div>
              <span className="ms-auto fw-bold">{formattedPrice}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar detalles de envío
  const renderShippingDetails = () => {
    if (!selectedShippingOption || shippingData.groups.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h6 className="text-dark mb-3">Detalles del envío</h6>
        
        {shippingData.groups.map((group) => (
          <div key={group.id} className="card mb-3">
            <div className="card-header d-flex justify-content-between">
              <span>{group.name}</span>
              <span>{group.items.length} productos</span>
            </div>
            <div className="card-body p-2">
              <div className="small text-muted mb-2">
                Peso total: {group.totalWeight.toFixed(2)} kg | 
                Cantidad: {group.totalQuantity} unidades
              </div>
              
              {group.items.map((item, index) => {
                const product = item.product || item;
                return (
                  <div key={index} className="mb-1 small">
                    • {product.name} x{item.quantity}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="shipping-calculator">
      <h5 className="text-dark mb-3">Opciones de envío</h5>
      
      {renderShippingOptions()}
      
      {renderShippingDetails()}
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