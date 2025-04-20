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
import { CheckoutSection } from '../../../shop/features/checkout/components/sections/CheckoutSection';

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
    let allOptionsFree = true;
    
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
      
      // Verificar si esta opción es gratuita
      if (optionCost > 0) {
        allOptionsFree = false;
      }
      
      console.log(`   - ${option.name}: $${optionCost} (gratuito: ${optionCost === 0})`);
      total += optionCost;
    });
    
    console.log(`   = Total: $${total} (todas gratis: ${allOptionsFree})`);
    return { total, allOptionsFree };
  };
  
  // Modificar cómo se manejan las opciones seleccionadas
  const handleSelectOption = (option) => {
    setShowMultipleSelectionInfo(false);
    let newSelectedOptions = [...selectedOptions];
    
    console.log(`🔍 [SECUENCIA DETALLADA] Inicio handleSelectOption para: ${option.name}`);
    
    // Si la opción ya está seleccionada, la quitamos
    if (selectedOptions.some(opt => opt.id === option.id)) {
      console.log(`🔍 [SECUENCIA DETALLADA] Deseleccionando opción: ${option.name}`);
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
      console.log(`🔍 [SECUENCIA DETALLADA] Añadiendo opción: ${option.name}`);
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
    console.log(`🔍 [SECUENCIA DETALLADA] Productos cubiertos actualizados: ${newCoveredProducts.size} productos`);
    
    // Calcular el nuevo costo total
    const { total: newTotalCost, allOptionsFree } = calculateTotalShippingCost(newSelectedOptions);
    setTotalShippingCost(newTotalCost);
    
    console.log(`🔍 [SECUENCIA DETALLADA] Costo total actualizado: $${newTotalCost} (Todas gratis: ${allOptionsFree})`);
    console.log(`🧮 [ShippingOptions] Costos por opción:`, newSelectedOptions.map(opt => ({
      id: opt.id,
      name: opt.name,
      cost: parseFloat(opt.calculatedTotalCost || opt.totalCost || opt.price || 0)
    })));
    
    // Notificar al padre sobre los cambios
    // Considerando que ahora tenemos múltiples opciones
    if (newSelectedOptions.length > 0) {
      // Determinar si el envío es gratuito solo si TODAS las opciones son gratuitas
      const isFreeValue = allOptionsFree;
      
      // Obtener TODOS los IDs de productos disponibles en el carrito
      const allProductIds = cartItems.map(item => (item.product || item).id);
      
      // Calcular productos NO cubiertos por ninguna opción seleccionada
      const unavailableProductIds = allProductIds.filter(id => !newCoveredProducts.has(id));
      
      // Asegurarnos de pasar explícitamente el estado de cobertura parcial
      const hasPartialCoverage = unavailableProductIds.length > 0;
      
      console.log(`🔍 [SECUENCIA DETALLADA] Preparando datos para enviar al padre:`);
      console.log(`🔍 [SECUENCIA DETALLADA] - Total productos en carrito: ${allProductIds.length}`);
      console.log(`🔍 [SECUENCIA DETALLADA] - Productos disponibles: ${newCoveredProducts.size}`);
      console.log(`🔍 [SECUENCIA DETALLADA] - Productos NO disponibles: ${unavailableProductIds.length}`);
      console.log(`🔍 [SECUENCIA DETALLADA] - IDs de productos NO disponibles:`, unavailableProductIds);
      console.log(`🔍 [SECUENCIA DETALLADA] - Cobertura parcial: ${hasPartialCoverage}`);
      console.log(`🔍 [SECUENCIA DETALLADA] - Envío gratuito: ${isFreeValue}`);
      
      // Incluir detalles sobre productos no disponibles para mejor debug
      if (unavailableProductIds.length > 0) {
        const unavailableProducts = cartItems
          .filter(item => unavailableProductIds.includes((item.product || item).id))
          .map(item => (item.product || item).name);
          
        console.log(`❌ [ShippingOptions] Nombres de productos NO disponibles: ${unavailableProducts.join(', ')}`);
      }
      
      // Crear el objeto de datos para notificar al padre
      const notificationData = {
        options: newSelectedOptions,
        totalCost: newTotalCost,
        isPartial: hasPartialCoverage,
        coveredProductIds: Array.from(newCoveredProducts),
        unavailableProductIds: unavailableProductIds,
        isFree: isFreeValue,
        hasPartialCoverage: hasPartialCoverage  // Explícitamente agregar esta bandera
      };
      
      console.log(`🔍 [SECUENCIA DETALLADA] Enviando datos al padre:`, notificationData);
      
      // Notificar al componente padre sobre el cambio en las opciones
      onShippingOptionChange(notificationData);
      
      // Siempre marcar como válido si hay opciones seleccionadas,
      // incluso si hay productos sin cobertura
      onShippingValidityChange(true);
      
      console.log(`🔍 [SECUENCIA DETALLADA] Fin handleSelectOption para: ${option.name}`);
    } else {
      // Si no hay opciones seleccionadas, marcar como inválido y notificar al padre
      console.log(`🔍 [SECUENCIA DETALLADA] No hay opciones seleccionadas, enviando datos vacíos`);
      
      const emptyData = {
        options: [],
        totalCost: 0,
        isPartial: false,
        coveredProductIds: [],
        unavailableProductIds: cartItems.map(item => (item.product || item).id),
        isFree: false,
        hasPartialCoverage: false
      };
      
      onShippingOptionChange(emptyData);
      onShippingValidityChange(false);
      
      console.log(`🔍 [SECUENCIA DETALLADA] Fin handleSelectOption, sin opciones`);
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
      
      // Validar dirección
      if (!address) {
        if (isMounted) {
          setError('No se proporcionó una dirección para calcular envío');
          setLoading(false);
        }
        return;
      }
      
      // Verificar si la dirección tiene código postal
      if (!address.zip && !address.zipcode && !address.postalCode && !address.cp) {
        if (isMounted) {
          setError('No se puede calcular el envío sin un código postal. Por favor, completa tu dirección.');
          setLoading(false);
        }
        return;
      }
      
      // Validar productos
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        if (isMounted) {
          setError('No hay productos en el carrito');
          setLoading(false);
        }
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
        setError(`No se pudieron cargar las opciones de envío: ${err.message || 'Error desconocido'}`);
        setLoading(false);
      }
    };
    
    loadShippingOptions();
    
    return () => {
      isMounted = false; // Limpiar flag cuando el componente se desmonta
    };
  }, [address, cartItems]); // Solo re-ejecutar cuando la dirección o los items cambian

  // Mostrar loading state (envuelto en section-content)
  if (loading) {
    return (
      <div className="section-content">
        <div className="shipping-options-loading">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span className="ms-2">Cargando opciones de envío...</span>
        </div>
      </div>
    );
  }

  // Mostrar error si hay (envuelto en section-content)
  if (error) {
    return (
      <div className="section-content">
        <div className="shipping-options-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay opciones disponibles (envuelto en section-content)
  if (!shippingOptions || shippingOptions.length === 0) {
    return (
      <div className="section-content">
        <div className="shipping-options-empty">
          <p>No hay opciones de envío disponibles para esta dirección.</p>
          <p>Por favor, verifica tu dirección o los productos en tu carrito.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-content">
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
      
      {/* Lista de opciones de envío */}
      <div className="shipping-options-list">
        {shippingOptions.map((option) => (
          <ShippingPackage 
            key={option.id}
            packageData={option}
            selected={selectedOptions.some(opt => opt.id === option.id)}
            cartItems={cartItems} 
            onSelect={handleSelectOption}
          />
        ))}
      </div>
    </div>
  );
}; 