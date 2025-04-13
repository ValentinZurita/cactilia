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
 * @param {Function} props.onShippingOptionChange - Callback cuando cambia la opción de envío
 * @param {Function} props.onShippingValidityChange - Callback cuando cambia la validez del envío
 * @param {number} props.forceUpdateKey - Clave para forzar actualización cuando la dirección cambia
 * @returns {JSX.Element} - Componente de opciones de envío
 */
export const ShippingOptions = ({
  address,
  cartItems = [],
  onShippingOptionChange = () => {},
  onShippingValidityChange = () => {},
  forceUpdateKey = 0
}) => {
  // Estado para opciones de envío disponibles
  const [shippingOptions, setShippingOptions] = useState([]);
  
  // Cambiamos de selectedOption a selectedOptions (array)
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  // Estado para productos sin envío disponible
  const [unavailableInfo, setUnavailableInfo] = useState(null);
  
  // Estado para seguimiento de productos cubiertos por las opciones seleccionadas
  const [coveredProducts, setCoveredProducts] = useState(new Set());
  
  // Estado para costo total de envío (suma de todas las opciones seleccionadas)
  const [totalShippingCost, setTotalShippingCost] = useState(0);
  
  // Estado para mostrar/ocultar mensaje de información sobre selección múltiple
  const [showMultipleSelectionInfo, setShowMultipleSelectionInfo] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Obtener reglas de envío para el depurador
  const { rules } = useShippingRules();

  // Verificar si todos los productos tienen una opción de envío asignada
  const allProductsCovered = () => {
    // Obtener todos los IDs de productos en el carrito
    const allProductIds = cartItems.map(item => (item.product || item).id);
    
    // Verificar si todos están en el conjunto de productos cubiertos
    return allProductIds.every(id => coveredProducts.has(id));
  };
  
  // Calcular el costo total de envío de todas las opciones seleccionadas
  const calculateTotalShippingCost = (options) => {
    console.log('🧮 Calculando costo total de envío para:', options);
    
    let total = 0;
    options.forEach(option => {
      // Determinar el costo real de esta opción
      let optionCost = 0;
      
      // Prioridad de costos:
      // 1. Si la opción tiene un campo calculatedTotalCost (suma real de paquetes), usarlo
      if (option.calculatedTotalCost !== undefined && !isNaN(parseFloat(option.calculatedTotalCost))) {
        optionCost = parseFloat(option.calculatedTotalCost);
      }
      // 2. Si hay un valor explícito de price, usarlo
      else if (option.price !== undefined && !isNaN(parseFloat(option.price))) {
        optionCost = parseFloat(option.price);
      } 
      // 3. Si hay un valor de totalCost, usarlo como respaldo
      else if (option.totalCost !== undefined && !isNaN(parseFloat(option.totalCost))) {
        optionCost = parseFloat(option.totalCost);
      }
      // 4. Si hay un precio base explícito, usarlo como último respaldo
      else if (option.precio_base !== undefined && !isNaN(parseFloat(option.precio_base))) {
        optionCost = parseFloat(option.precio_base);
      }
      
      console.log(`   - ${option.name}: $${optionCost}`);
      total += optionCost;
    });
    
    console.log(`   = Total: $${total}`);
    return total;
  };
  
  // Modificar cómo se manejan las opciones seleccionadas
  const handleSelectOption = (option) => {
    setShowMultipleSelectionInfo(false);
    let newSelectedOptions = [...selectedOptions];
    
    // Si la opción ya está seleccionada, la quitamos
    if (selectedOptions.some(opt => opt.id === option.id)) {
      console.log(`🚢 Deseleccionando opción de envío: ${option.name}`);
      newSelectedOptions = selectedOptions.filter(opt => opt.id !== option.id);
    } else {
      // Identificar si hay productos duplicados
      const duplicatedProducts = [];
      const optionProducts = option.products || [];
      
      // Verificar si es una opción de tipo Nacional
      const isNationalOption = option.zoneType === 'nacional' || 
                              option.isNational || 
                              option.name === 'Nacional';
      
      // Para opciones nacionales, permitimos seleccionarla sin restricciones
      if (!isNationalOption) {
        optionProducts.forEach(productId => {
          if (coveredProducts.has(productId)) {
            // Encontrar en qué opción ya seleccionada está este producto
            const existingOption = selectedOptions.find(opt => 
              (opt.products || []).includes(productId)
            );
            
            if (existingOption) {
              duplicatedProducts.push({
                productId,
                optionName: existingOption.name
              });
            }
          }
        });
      }
      
      if (duplicatedProducts.length > 0) {
        // Hay productos duplicados, mostrar advertencia
        console.log(`⚠️ Productos duplicados en opción de envío:`, duplicatedProducts);
        
        // Si es la primera vez, mostrar aviso informativo
        if (!showMultipleSelectionInfo) {
          setShowMultipleSelectionInfo(true);
        }
        
        return; // No seleccionar esta opción
      }
      
      // Si no hay duplicados, añadir la opción
      console.log(`🚢 Seleccionando opción de envío: ${option.name}`);
      // Registrar el costo calculado para diagnóstico
      if (option.calculatedTotalCost !== undefined) {
        console.log(`📊 Costo calculado de paquetes reales: $${option.calculatedTotalCost}`);
      }
      newSelectedOptions.push(option);
    }
    
    // Actualizar las opciones seleccionadas
    setSelectedOptions(newSelectedOptions);
    
    // Recalcular los productos cubiertos
    const newCoveredProducts = new Set();
    newSelectedOptions.forEach(opt => {
      (opt.products || []).forEach(productId => {
        newCoveredProducts.add(productId);
      });
    });
    setCoveredProducts(newCoveredProducts);
    
    // Calcular el nuevo costo total
    const newTotalCost = calculateTotalShippingCost(newSelectedOptions);
    setTotalShippingCost(newTotalCost);
    
    console.log(`💵 [ShippingOptions] Nuevo costo total calculado: $${newTotalCost}`);
    console.log(`🧮 [ShippingOptions] Costos por opción:`, newSelectedOptions.map(opt => ({
      id: opt.id,
      name: opt.name,
      cost: parseFloat(opt.calculatedTotalCost || opt.totalCost || opt.price || 0)
    })));
    
    // Notificar al padre sobre los cambios
    // Considerando que ahora tenemos múltiples opciones
    if (newSelectedOptions.length > 0) {
      const isFreeValue = newTotalCost === 0;
      console.log(`🔖 [ShippingOptions] Enviando datos al padre, isFree=${isFreeValue}, totalCost=${newTotalCost}`);
      
      onShippingOptionChange({
        options: newSelectedOptions,
        totalCost: newTotalCost,
        isPartial: !allProductsCovered(),
        coveredProductIds: Array.from(newCoveredProducts), // Enviar los IDs de productos cubiertos
        unavailableProductIds: cartItems
          .map(item => (item.product || item).id)
          .filter(id => !newCoveredProducts.has(id)), // IDs de productos no cubiertos
        isFree: isFreeValue
      });
      onShippingValidityChange(true);
    } else {
      onShippingOptionChange(null);
      onShippingValidityChange(false);
    }
  };
  
  // Verificar productos que no tienen envío disponible
  const checkUnavailableProducts = (options) => {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return null;
    }
    
    // Obtener todos los productos que pueden ser enviados por todas las opciones disponibles
    const shippableProductIds = new Set();
    options.forEach(option => {
      (option.products || []).forEach(productId => {
        shippableProductIds.add(productId);
      });
    });
    
    // Verificar qué productos no pueden ser enviados
    const unavailableIds = [];
    const unavailableNames = [];
    
    cartItems.forEach(item => {
      const product = item.product || item;
      if (!shippableProductIds.has(product.id)) {
        unavailableIds.push(product.id);
        unavailableNames.push(product.name);
      }
    });
    
    if (unavailableIds.length > 0) {
      return {
        unavailableIds,
        unavailableProducts: unavailableNames.join(', ')
      };
    }
    
    return null;
  };

  // Efecto para cargar opciones de envío cuando cambia la dirección o el carrito
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones si el componente se desmonta
    
    const loadShippingOptions = async () => {
      setLoading(true);
      setError(null);
      setSelectedOptions([]); // Reiniciar selección
      setCoveredProducts(new Set()); // Reiniciar productos cubiertos
      setTotalShippingCost(0); // Reiniciar costo total
      
      console.log('🔄 Reiniciando selección de opciones de envío');
      
      // Notificar al padre que no hay opción seleccionada
      onShippingOptionChange(null);
      onShippingValidityChange(false);
      
      // Validar parámetros
      if (!address || !cartItems || cartItems.length === 0) {
        if (isMounted) setLoading(false);
        return;
      }
      
      try {
        // Obtener opciones de envío
        const options = await checkoutShippingService.getShippingOptions(address, cartItems);
        
        if (!isMounted) return;
        
        console.log(`📦 Opciones de envío cargadas: ${options.length}`, options);
        options.forEach(option => {
          console.log(`- Opción "${option.name}" (ID: ${option.id}):`);
          console.log(`  - Tipo: ${option.zoneType || 'desconocido'}`);
          console.log(`  - Es Nacional: ${option.isNational ? 'Sí' : 'No'}`);
          console.log(`  - Productos: ${(option.products || []).length}`);
          console.log(`  - Costo: ${option.totalCost}`);
        });
        
        setShippingOptions(options);
        
        // Verificar productos sin envío disponible
        const unavailable = checkUnavailableProducts(options);
        setUnavailableInfo(unavailable);
        
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error al obtener opciones de envío:', err);
        setError('No se pudieron cargar las opciones de envío');
        setLoading(false);
      }
    };
    
    loadShippingOptions();
    
    return () => {
      isMounted = false; // Limpiar flag cuando el componente se desmonta
    };
  }, [address, cartItems]); // Solo re-ejecutar cuando la dirección o los items cambian

  // Mostrar loading state
  if (loading) {
    return (
      <div className="shipping-options-container">
        <div className="shipping-options-loading">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span className="ms-2">Cargando opciones de envío...</span>
        </div>
      </div>
    );
  }

  // Mostrar error si hay
  if (error) {
    return (
      <div className="shipping-options-container">
        <div className="shipping-options-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay opciones disponibles
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
      
      {/* Mostrar información de selección múltiple */}
      {showMultipleSelectionInfo && (
        <div className="shipping-selection-info alert alert-info" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle me-2"></i>
            <span>
              No puedes seleccionar esta opción porque contiene productos que ya están cubiertos por otra opción.
              Para seleccionarla, primero deselecciona la otra opción.
            </span>
          </div>
        </div>
      )}
      
      {/* Mostrar advertencia de productos no enviables */}
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
      
      {/* Mostrar resumen de opciones seleccionadas si hay más de una */}
      {selectedOptions.length > 1 && (
        <div className="shipping-selected-summary">
          <div className="alert alert-success" role="alert">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Opciones seleccionadas:</strong> {selectedOptions.length}
                <div className="shipping-selected-cost">
                  Costo total de envío: {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN'
                  }).format(totalShippingCost)}
                </div>
              </div>
              <div>
                {allProductsCovered() ? (
                  <span className="badge bg-success">Todos los productos cubiertos</span>
                ) : (
                  <span className="badge bg-warning text-dark">Envío parcial</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="shipping-options-list">
        {shippingOptions.map((option) => (
          <div 
            key={option.id} 
            className={`shipping-option ${selectedOptions.some(opt => opt.id === option.id) ? 'selected' : ''}`}
            onClick={() => handleSelectOption(option)}
          >
            <div className="shipping-option-radio">
              <input 
                type="checkbox"
                checked={selectedOptions.some(opt => opt.id === option.id)}
                onChange={() => handleSelectOption(option)}
                className="shipping-option-checkbox"
              />
            </div>
            
            <div className="shipping-option-details">
              <ShippingPackage 
                packageData={option}
                selected={selectedOptions.some(opt => opt.id === option.id)}
                cartItems={cartItems} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 