import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { prepareShippingOptionsForCheckout } from '../../services/shippingGroupingService';
import './ShippingCalculator.css';

/**
 * Componente para mostrar y seleccionar opciones de envío agrupadas
 * Permite que el usuario seleccione entre múltiples opciones para diferentes grupos de productos
 */
const ShippingGroupsCalculator = ({
  cart,
  userAddress,
  selectedShippingOption,
  onShippingChange,
  onAvailableOptionsChange
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shippingData, setShippingData] = useState({ groups: [], totalOptions: [] });
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Cargar opciones de envío cuando cambia el carrito o la dirección
  useEffect(() => {
    const loadShippingOptions = async () => {
      console.warn('🚚 ShippingGroupsCalculator DEBUG: Iniciando carga');
      console.warn(`🚚 Carrito: ${cart?.items?.length || 0} items, Dirección: ${userAddress?.zipCode || userAddress?.postalCode || 'Sin CP'}`);
      
      // FORZAR EL DIAGNÓSTICO INMEDIATO
      setDebugInfo({
        timestamp: new Date().toISOString(),
        cartItems: cart?.items || [],
        userAddress
      });
      
      if (!cart || !cart.items || cart.items.length === 0) {
        console.warn('🚚 No hay items en el carrito');
        setShippingData({ groups: [], totalOptions: [] });
        setLoading(false);
        return;
      }

      // DIAGNÓSTICO DE DIRECCIÓN DE USUARIO - CRÍTICO
      console.warn('🏠 DIRECCIÓN PARA ENVÍO 🏠', {
        direccionCompleta: userAddress,
        codigoPostal: userAddress?.zipCode || userAddress?.postalCode,
        estado: userAddress?.state,
        ciudad: userAddress?.city,
        existeDireccion: !!userAddress
      });
      
      // DIAGNÓSTICO DE PRODUCTOS - CRÍTICO
      const productsDebug = cart.items.map(item => {
        const product = item.product || item;
        return {
          id: product.id,
          nombre: product.name || 'Sin nombre',
          reglasEnvio: {
            singleRule: product.shippingRuleId,
            multipleRules: product.shippingRuleIds
          },
          tieneReglas: !!(product.shippingRuleId || (product.shippingRuleIds && product.shippingRuleIds.length > 0)),
          peso: product.weight,
          cantidad: item.quantity
        };
      });
      
      console.warn('🛒 PRODUCTOS EN CARRITO 🛒', productsDebug);
      
      // Validar items con reglas de envío (tanto shippingRuleIds como shippingRuleId)
      const itemsWithShippingRules = cart.items.filter(item => {
        const product = item.product || item;
        const hasMultipleRules = product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0;
        const hasSingleRule = !!product.shippingRuleId;
        return hasMultipleRules || hasSingleRule;
      });

      console.warn(`🚚 ${itemsWithShippingRules.length} de ${cart.items.length} items tienen reglas de envío`);
      
      try {
        setLoading(true);
        setError(null);
        
        // Obtener opciones de envío agrupadas
        console.warn('🚚 Calculando opciones de envío...');
        const result = await prepareShippingOptionsForCheckout(cart.items, userAddress);
        console.warn('🚚 Resultado:', {
          grupos: result.groups?.length || 0,
          opciones: result.totalOptions?.length || 0
        });
        
        setDebugInfo({
          shipping: result,
          userAddress,
          cartItems: productsDebug,
          timestamp: new Date().toISOString()
        });
        
        setShippingData(result);
        
        // Notificar al componente padre
        if (onAvailableOptionsChange && result.totalOptions.length > 0) {
          const formattedOptions = result.totalOptions.map(option => ({
            id: option.id,
            carrier: option.carrier,
            label: option.label,
            calculatedCost: option.totalCost
          }));
          
          console.warn('🚚 Enviando opciones al padre:', formattedOptions);
          onAvailableOptionsChange(formattedOptions);
        }
        
        // Seleccionar automáticamente la opción más barata si no hay una seleccionada
        if ((!selectedOptionId || !selectedShippingOption) && result.totalOptions.length > 0) {
          const cheapestOption = result.totalOptions[0];
          console.warn('🚚 Seleccionando opción más barata:', {
            id: cheapestOption.id,
            precio: cheapestOption.totalCost
          });
          setSelectedOptionId(cheapestOption.id);
          
          // Notificar al componente padre
          if (onShippingChange) {
            onShippingChange({
              id: cheapestOption.id,
              carrier: cheapestOption.carrier,
              label: cheapestOption.label,
              calculatedCost: cheapestOption.totalCost,
              groups: cheapestOption.groups
            });
          }
        }
      } catch (err) {
        console.error('Error cargando opciones de envío:', err);
        setError(`Error al calcular opciones de envío: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadShippingOptions();
  }, [cart, userAddress, selectedShippingOption, onShippingChange, onAvailableOptionsChange]);

  // Manejar selección de opción de envío
  const handleSelectOption = (option) => {
    console.warn('🚚 Seleccionando opción:', option);
    setSelectedOptionId(option.id);
    
    // Notificar al componente padre
    if (onShippingChange) {
      onShippingChange({
        id: option.id,
        carrier: option.carrier,
        label: option.label,
        calculatedCost: option.totalCost,
        groups: option.groups
      });
    }
  };
  
  // Agregar un componente de diagnóstico visible
  return (
    <div className="shipping-calculator">
      <div className="border p-3 mb-3">
        <h4 className="mb-3">Diagnóstico de Envío</h4>
        
        {/* Estado de componente */}
        <div className="mb-3">
          <strong>Estado: </strong>
          {loading ? '⏳ Cargando...' : (error ? '❌ Error' : '✅ Listo')}
        </div>
        
        {/* Información de dirección */}
        <div className="mb-3">
          <strong>Dirección: </strong>
          {userAddress ? (
            <span>
              CP: {userAddress.zipCode || userAddress.postalCode || 'No definido'}, 
              {userAddress.city ? ` ${userAddress.city},` : ''} 
              {userAddress.state || 'Estado no definido'}
            </span>
          ) : '❌ No hay dirección definida'}
        </div>
        
        {/* Productos en carrito */}
        <div className="mb-3">
          <strong>Productos: </strong>
          {cart?.items?.length || 0} items en carrito
          {cart?.items?.length > 0 && (
            <div className="small mt-1">
              {cart.items.map((item, idx) => {
                const product = item.product || item;
                return (
                  <div key={idx}>
                    • {product.name || 'Producto sin nombre'} 
                    {product.shippingRuleId ? ` (Regla: ${product.shippingRuleId})` : ' ❌ Sin regla'}
                    {product.shippingRuleIds && product.shippingRuleIds.length > 0 
                      ? ` (Reglas múltiples: ${product.shippingRuleIds.join(', ')})` 
                      : ''}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* DIAGNÓSTICO: Mostrar botón para crear grupos forzados */}
        <div className="mb-3">
          <button
            className="btn btn-warning btn-sm w-100 mb-2"
            onClick={() => {
              // Crear grupos forzados para diagnóstico
              const grupos = [];
              
              // Agrupar productos (máximo 2 por grupo)
              if (cart && cart.items && cart.items.length > 0) {
                let currentGroup = [];
                let groupCount = 1;
                
                cart.items.forEach((item, idx) => {
                  currentGroup.push(item);
                  
                  // Crear nuevo grupo cada 2 productos o al final
                  if (currentGroup.length === 2 || idx === cart.items.length - 1) {
                    grupos.push({
                      id: `debug-group-${groupCount}`,
                      name: `Grupo de diagnóstico ${groupCount}`,
                      items: [...currentGroup],
                      rules: [{
                        id: `debug-rule-${groupCount}`,
                        zona: `Zona de prueba ${groupCount}`
                      }]
                    });
                    
                    groupCount++;
                    currentGroup = [];
                  }
                });
              }
              
              // Crear opciones de envío
              const opciones = [{
                id: 'debug-option-1',
                carrier: 'Envío de Diagnóstico',
                label: 'Envío Estándar (Debug)',
                totalCost: 100,
                groups: grupos.map(grupo => ({
                  groupId: grupo.id,
                  option: {
                    id: `option-${grupo.id}`,
                    carrier: 'Diagnóstico',
                    label: 'Envío Estándar',
                    calculatedCost: 50
                  },
                  items: grupo.items
                }))
              }];
              
              // Actualizar el estado
              setShippingData({
                groups: grupos,
                totalOptions: opciones
              });
              
              // Seleccionar la primera opción
              setSelectedOptionId('debug-option-1');
              
              // Notificar al componente padre
              if (onShippingChange) {
                onShippingChange(opciones[0]);
              }
              
              // Notificar opciones disponibles
              if (onAvailableOptionsChange) {
                onAvailableOptionsChange(opciones);
              }
              
              console.warn('🚨 GRUPOS DE DIAGNÓSTICO CREADOS', {
                grupos,
                opciones
              });
            }}
          >
            Crear Grupos de Diagnóstico
          </button>
        </div>
        
        {/* Resultado de cálculo */}
        <div className="mb-3">
          <strong>Opciones calculadas: </strong>
          {shippingData.totalOptions?.length || 0}
          {shippingData.totalOptions?.length > 0 && (
            <div className="mt-2">
              <div className="list-group">
                {shippingData.totalOptions.map(option => (
                  <button 
                    key={option.id}
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedOptionId === option.id ? 'active' : ''}`}
                    onClick={() => handleSelectOption(option)}
                  >
                    <div>
                      <strong>{option.label}</strong>
                      <div className="small">{option.carrier}</div>
                    </div>
                    <span className="badge bg-primary rounded-pill">${option.totalCost}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Error */}
        {error && (
          <div className="alert alert-danger">
            <strong>Error: </strong> {error}
          </div>
        )}
        
        {/* DIAGNÓSTICO: Mostrar grupos y opciones seleccionadas */}
        <div className="mt-4">
          <h6 className="border-bottom pb-2">Datos internos:</h6>
          <div className="small">
            <div className="mb-2">
              <strong>Grupos creados:</strong> {shippingData.groups?.length || 0}
              <button 
                className="btn btn-sm btn-link ms-2"
                onClick={() => console.warn('🚨 GRUPOS:', shippingData.groups)}
              >
                Ver en consola
              </button>
            </div>
            <div className="mb-2">
              <strong>Grupos en la opción seleccionada:</strong>
              {selectedOptionId && shippingData.totalOptions ? 
                (shippingData.totalOptions.find(opt => opt.id === selectedOptionId)?.groups?.length || 0) : 0}
              <button 
                className="btn btn-sm btn-link ms-2"
                onClick={() => {
                  const selectedOption = shippingData.totalOptions?.find(opt => opt.id === selectedOptionId);
                  console.warn('🚨 OPCIÓN SELECCIONADA:', selectedOption);
                }}
              >
                Ver en consola
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ShippingGroupsCalculator.propTypes = {
  cart: PropTypes.object.isRequired,
  userAddress: PropTypes.object,
  selectedShippingOption: PropTypes.object,
  onShippingChange: PropTypes.func,
  onAvailableOptionsChange: PropTypes.func
};

export default ShippingGroupsCalculator; 