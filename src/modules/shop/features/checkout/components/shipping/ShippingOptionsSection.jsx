import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ShippingSelector } from './index';
import './styles/shipping.css';
import { EmptyState } from '../common/EmptyState';

/**
 * ShippingOptionsSection component renders the shipping options selection interface
 * 
 * @param {Object} props
 * @param {string} props.selectedOptionId - ID of the currently selected shipping option
 * @param {Function} props.onOptionSelect - Callback when an option is selected
 * @param {boolean} props.loading - Whether shipping options are currently loading
 * @param {Object} props.userAddress - Current user address object
 * @param {Function} props.onCombinationsCalculated - Callback when shipping combinations are calculated
 * @param {Array} props.shippingOptions - Available shipping options
 * @param {string} props.error - Error message to display
 */
const ShippingOptionsSection = ({ 
  selectedOptionId,
  onOptionSelect,
  loading = false,
  userAddress = null,
  onCombinationsCalculated,
  shippingOptions = [],
  error
}) => {
  const [cartItems, setCartItems] = useState([]);
  const [noOptionsAvailable, setNoOptionsAvailable] = useState(false);
  const [shippingError, setShippingError] = useState(error || '');
  const [shippingCombinations, setShippingCombinations] = useState([]);
  const [hasShippableProducts, setHasShippableProducts] = useState(true);
  const [shippingCoversAllProducts, setShippingCoversAllProducts] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Update selectedOption when selectedOptionId changes
  useEffect(() => {
    if (selectedOptionId && shippingOptions.length > 0) {
      const option = shippingOptions.find(opt => opt.id === selectedOptionId);
      setSelectedOption(option || null);
    } else {
      setSelectedOption(null);
    }
  }, [selectedOptionId, shippingOptions]);
  
  // Load cart items
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        // This would be replaced with an actual API call or Redux selector
        const items = JSON.parse(localStorage.getItem('cartItems')) || [];
        setCartItems(items);
      } catch (err) {
        console.error('Failed to load cart items:', err);
        setCartItems([]);
      }
    };
    
    loadCartItems();
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      setShippingError(error);
    }
  }, [error]);

  const handleOptionSelect = (optionId) => {
    if (onOptionSelect) {
      onOptionSelect(optionId);
    }
  };

  const handleCombinationsCalculated = useCallback((combinations) => {
    console.log("Shipping combinations calculated:", combinations);
    setHasShippableProducts(true);
    
    if (combinations && combinations.length > 0) {
      setNoOptionsAvailable(false);
      setShippingCombinations(combinations);
      if (onCombinationsCalculated) {
        onCombinationsCalculated(combinations, []);
      }
    } else {
      console.warn("No shipping options available for this address");
      setNoOptionsAvailable(true);
      setShippingCombinations([]);
      
      // If no options, mark all products as non-shippable
      if (cartItems && cartItems.length > 0) {
        const allNonShippableProducts = [...cartItems];
        console.log("Marking all products as non-shippable:", allNonShippableProducts);
        if (onCombinationsCalculated) {
          onCombinationsCalculated([], allNonShippableProducts);
        }
      }
      
      // Show specific error message
      setShippingError(`No hay opciones de envío disponibles para la dirección seleccionada.
       Por favor, intente con otra dirección o contacte a servicio al cliente.`);
    }
  }, [cartItems, onCombinationsCalculated]);

  return (
    <div className="checkout-section mb-4">
      <div className="checkout-section-header d-flex align-items-center mb-3">
        <h2 className="h5 mb-0">Opciones de envío</h2>
        <div className="ms-auto">
          <i className="bi bi-truck"></i>
        </div>
      </div>
      
      <div className="checkout-section-content p-3 p-md-4 bg-white rounded border">
        {!userAddress ? (
          <EmptyState 
            icon="bi-geo-alt"
            title="Sin dirección seleccionada"
            message="Selecciona una dirección para ver opciones de envío" 
          />
        ) : loading ? (
          <div className="d-flex flex-column align-items-center py-4">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2rem', height: '2rem', borderWidth: '0.2em' }}>
              <span className="visually-hidden">Cargando opciones de envío...</span>
            </div>
            <div className="text-muted">Calculando opciones de envío...</div>
          </div>
        ) : (
          <>
            <ShippingSelector
              cartItems={cartItems}
              selectedOptionId={selectedOptionId}
              onOptionSelect={handleOptionSelect}
              userAddress={userAddress}
              onCombinationsCalculated={handleCombinationsCalculated}
              shippingOptions={shippingOptions}
              isLoading={loading}
              error={error}
            />
            
            {shippingError && !loading && (
              <div className="alert alert-danger mt-3" role="alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>
                    <strong>Error:</strong> {shippingError.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < shippingError.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                    {noOptionsAvailable && (
                      <div className="mt-2">
                        <p className="mb-1">Sugerencias:</p>
                        <ul className="pl-3 mb-0">
                          <li>Verifica que la dirección esté completa y correcta</li>
                          <li>Prueba con otra dirección de envío</li>
                          <li>Contacta a servicio al cliente para asistencia</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedOption && !shippingCoversAllProducts && (
              <div className="alert alert-danger mt-3">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                <strong>No se puede proceder con el pago</strong>: La opción de envío seleccionada no cubre todos los productos.
                Debe seleccionar una opción que incluya todos los productos para continuar.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

ShippingOptionsSection.propTypes = {
  selectedOptionId: PropTypes.string,
  onOptionSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  userAddress: PropTypes.object,
  onCombinationsCalculated: PropTypes.func,
  shippingOptions: PropTypes.array,
  error: PropTypes.string
};

export default ShippingOptionsSection; 