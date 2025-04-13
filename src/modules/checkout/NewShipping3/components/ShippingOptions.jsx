/**
 * Componente principal de opciones de envío
 * Muestra paquetes y productos no enviables
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ShippingPackage } from './ShippingPackage';
import { UnshippableProducts } from './UnshippableProducts';
import { useShippingOptions } from '../hooks/useShippingOptions';
import { checkoutShippingService } from '../services/checkoutShippingService';
import debugShipping from '../utils/ShippingDebugger';
import { useShippingRules } from '../hooks/useShippingRules';
import '../styles/ShippingOptions.css';

/**
 * Componente principal para mostrar opciones de envío en el checkout
 * @param {Object} props - Propiedades
 * @param {Object} props.address - Dirección seleccionada para envío
 * @param {Array} props.cartItems - Ítems del carrito
 * @param {Function} props.onShippingCostChange - Callback cuando cambia el costo de envío
 * @param {Function} props.onShippingValidChange - Callback cuando cambia la validez del envío
 * @param {number} props.forceUpdateKey - Clave para forzar actualización cuando la dirección cambia
 * @returns {JSX.Element} - Componente de opciones de envío
 */
export const ShippingOptions = ({
  address,
  cartItems = [],
  onShippingCostChange = () => {},
  onShippingValidChange = () => {},
  forceUpdateKey = 0
}) => {
  // Estados del componente
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Obtener reglas de envío para el depurador
  const { rules } = useShippingRules();

  // Obtener opciones de envío
  const fetchShippingOptions = useCallback(async () => {
    if (!address || !cartItems.length) {
      setShippingOptions([]);
      setSelectedOption(null);
      onShippingCostChange(0);
      onShippingValidChange(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Activar el depurador para diagnosticar problemas
      debugShipping(address, cartItems, rules);
      
      const options = await checkoutShippingService.getShippingOptions(address, cartItems);
      
      setShippingOptions(options);
      
      // Si hay opciones, seleccionar la primera por defecto
      if (options && options.length > 0) {
        setSelectedOption(options[0]);
        onShippingCostChange(options[0].totalCost || 0);
        onShippingValidChange(true);
      } else {
        setSelectedOption(null);
        onShippingCostChange(0);
        onShippingValidChange(false);
      }
    } catch (err) {
      console.error('Error al obtener opciones de envío:', err);
      setError('No pudimos calcular opciones de envío. Por favor, intenta de nuevo.');
      setShippingOptions([]);
      setSelectedOption(null);
      onShippingCostChange(0);
      onShippingValidChange(false);
    } finally {
      setLoading(false);
    }
  }, [address, cartItems, onShippingCostChange, onShippingValidChange, rules]);

  // Efecto para cargar opciones de envío cuando cambia la dirección o items del carrito
  useEffect(() => {
    fetchShippingOptions();
  }, [fetchShippingOptions, forceUpdateKey]);

  // Manejar selección de opción de envío
  const handleSelectOption = (option) => {
    setSelectedOption(option);
    onShippingCostChange(option.totalCost || 0);
    onShippingValidChange(true);
  };

  /**
   * Verifica si hay productos que no pueden ser enviados a la dirección seleccionada
   * @returns {Object|null} Información sobre productos no enviables o null si todos son enviables
   */
  const checkUnavailableProducts = () => {
    if (!shippingOptions || !shippingOptions.length) return null;
    
    // Verificar si hay productos que no pueden ser enviados
    if (shippingOptions.some(option => !option.is_shippable)) {
      const unavailableProducts = shippingOptions.filter(option => !option.is_shippable).map(option => option.name).join(', ');
      const unavailableIds = shippingOptions.filter(option => !option.is_shippable).map(option => option.id);
      return {
        partial: true,
        unavailableProducts,
        unavailableIds
      };
    }
    
    return null;
  };

  // Verificar si hay productos no enviables
  const unavailableInfo = checkUnavailableProducts();

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="shipping-options-container">
        <div className="shipping-options-loading">
          <p>Calculando opciones de envío...</p>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="shipping-options-container">
        <div className="shipping-options-error">
          <p>{error}</p>
          <button 
            className="shipping-options-retry-btn"
            onClick={fetchShippingOptions}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay opciones de envío disponibles
  if (!shippingOptions || shippingOptions.length === 0) {
    return (
      <div className="shipping-options-container">
        <div className="shipping-options-empty">
          <p>No hay opciones de envío disponibles para esta dirección.</p>
          <p>Por favor, verifica tu dirección o los productos en tu carrito.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shipping-options-container">
      <h3 className="shipping-options-title">Selecciona un método de envío</h3>
      
      {unavailableInfo && (
        <div className="shipping-unavailable-warning">
          <div className="alert alert-warning" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <span>
                <strong>Envío parcial:</strong> {unavailableInfo.unavailableProducts} no {unavailableInfo.unavailableIds?.length === 1 ? 'puede' : 'pueden'} enviarse a esta dirección. 
                Puedes continuar con el resto de productos o cambiar tu dirección de envío.
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="shipping-options-list">
        {shippingOptions.map((option) => (
          <div 
            key={option.id} 
            className={`shipping-option ${selectedOption && selectedOption.id === option.id ? 'selected' : ''}`}
            onClick={() => handleSelectOption(option)}
          >
            <div className="shipping-option-radio">
              <input 
                type="radio" 
                checked={selectedOption && selectedOption.id === option.id}
                onChange={() => handleSelectOption(option)}
              />
            </div>
            
            <div className="shipping-option-details">
              <ShippingPackage 
                packageData={option}
                selected={selectedOption && selectedOption.id === option.id}
                cartItems={cartItems} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 