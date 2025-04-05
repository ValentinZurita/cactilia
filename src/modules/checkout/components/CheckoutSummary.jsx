import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ShippingGroupsCalculator } from './shipping';
import { calculateTotalShippingCost } from '../utils/shippingCalculator';

/**
 * Componente de resumen del checkout que incluye selección de envío
 * Utiliza el nuevo sistema de agrupación para reglas de envío múltiples
 */
const CheckoutSummary = ({ cart, userAddress, onCheckout, currentStep }) => {
  // Añadir log para diagnóstico inicial
  console.warn('🚚 CHECKOUT SUMMARY RENDERIZADO 🚚');
  
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [availableShippingOptions, setAvailableShippingOptions] = useState([]);
  const [summary, setSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Verificar si se debe mostrar el modo de depuración (URL con debug=true)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsDebugMode(urlParams.get('debug') === 'true');
    
    // Debug inicial
    console.log('CheckoutSummary: Inicializando con', {
      hasCart: !!cart,
      cartItemsCount: cart?.items?.length || 0,
      hasAddress: !!userAddress,
      addressZipCode: userAddress?.zipCode || userAddress?.postalCode || 'No definido',
      step: currentStep
    });
  }, [cart, userAddress, currentStep]);

  // Limpiar selección de envío si cambia la dirección
  useEffect(() => {
    if (userAddress) {
      console.log('CheckoutSummary: Dirección actualizada, limpiando selección de envío', userAddress);
    }
    setSelectedShipping(null);
  }, [userAddress]);

  // Manejar cambio en opciones de envío disponibles
  const handleAvailableOptionsChange = (options) => {
    console.log('CheckoutSummary: Opciones de envío disponibles actualizadas', options);
    setAvailableShippingOptions(options);
    
    // Si hay opciones disponibles y no hay una seleccionada, seleccionar automáticamente la primera
    if (options && options.length > 0 && !selectedShipping && userAddress) {
      console.log('CheckoutSummary: Seleccionando primera opción automáticamente', options[0]);
      handleShippingChange(options[0]);
    }
  };

  // Calcular el resumen cuando cambia el carrito o la opción de envío
  useEffect(() => {
    if (!cart || !cart.items) {
      console.log('CheckoutSummary: No hay carrito o items');
      return;
    }

    // Calcular subtotal
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    // Calcular impuesto (ejemplo: 16% IVA)
    const taxRate = 0.16;
    const tax = subtotal * taxRate;

    // Calcular envío
    const shipping = selectedShipping ? selectedShipping.calculatedCost || 0 : 0;

    // Calcular total
    const total = subtotal + tax + shipping;

    // Actualizar resumen
    const newSummary = {
      subtotal,
      shipping,
      tax,
      total,
      shippingOption: selectedShipping
    };
    
    console.log('CheckoutSummary: Resumen actualizado', {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2), 
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      hasShippingOption: !!selectedShipping
    });
    
    setSummary(newSummary);
    
    // Si estamos en el paso de confirmación y hay una opción de envío seleccionada, actualizar el resumen en el componente padre
    if (currentStep === 3 && selectedShipping) {
      console.log('CheckoutSummary: Enviando resumen al componente padre');
      onCheckout(newSummary);
    }
  }, [cart, selectedShipping, currentStep, onCheckout]);

  // Manejar cambio en opción de envío
  const handleShippingChange = (option) => {
    console.log('CheckoutSummary: Opción de envío seleccionada:', option);
    setSelectedShipping(option);
  };

  // Manejar checkout
  const handleCheckout = () => {
    if (!selectedShipping) {
      alert('Por favor selecciona una opción de envío');
      return;
    }

    onCheckout({
      ...summary,
      shippingOption: selectedShipping
    });
  };

  // Función para cambiar a modo debug
  const toggleDebugMode = () => {
    const newDebugMode = !isDebugMode;
    setIsDebugMode(newDebugMode);
    
    // Actualizar URL sin recargar
    const url = new URL(window.location);
    if (newDebugMode) {
      url.searchParams.set('debug', 'true');
    } else {
      url.searchParams.delete('debug');
    }
    window.history.pushState({}, '', url);
  };

  // Renderizar resumen de depuración
  const renderDebugInfo = () => {
    if (!isDebugMode) return null;
    
    return (
      <div className="card border-warning mt-3">
        <div className="card-header bg-warning-subtle">
          <h6 className="mb-0">Información de depuración</h6>
        </div>
        <div className="card-body">
          <div className="mb-2">
            <strong>Carrito:</strong> {cart?.items?.length || 0} productos
          </div>
          <div className="mb-2">
            <strong>Dirección:</strong> {userAddress ? 'Definida' : 'No definida'}
            {userAddress && (
              <div className="small text-muted">
                CP: {userAddress.zipCode || userAddress.postalCode}<br />
                {userAddress.city}, {userAddress.state}
              </div>
            )}
          </div>
          <div className="mb-2">
            <strong>Opciones disponibles:</strong> {availableShippingOptions?.length || 0}
            {availableShippingOptions?.length > 0 && (
              <ul className="small mt-1 mb-0">
                {availableShippingOptions.map(opt => (
                  <li key={opt.id}>{opt.label}: ${opt.calculatedCost}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-2">
            <strong>Opción seleccionada:</strong> {selectedShipping ? selectedShipping.label : 'Ninguna'}
            {selectedShipping && (
              <div className="small text-muted">
                ID: {selectedShipping.id}<br />
                Costo: ${selectedShipping.calculatedCost}
              </div>
            )}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary mt-2"
            onClick={() => console.log({
              cart,
              userAddress,
              availableShippingOptions,
              selectedShipping,
              summary
            })}
          >
            Log datos en consola
          </button>
        </div>
      </div>
    );
  };

  // Verificar la estructura del carrito para debugging
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      console.log("CheckoutSummary: Verificando estructura del carrito");
      
      const cartInfo = {
        itemCount: cart.items.length,
        itemsWithShippingRuleId: 0,
        itemsWithShippingRuleIds: 0,
        itemsWithBoth: 0,
        itemsWithNeither: 0,
        items: []
      };
      
      // Analizar cada item del carrito
      cart.items.forEach((item, index) => {
        const product = item.product || item;
        const hasRuleId = !!product.shippingRuleId;
        const hasRuleIds = !!(product.shippingRuleIds && Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0);
        
        if (hasRuleId && hasRuleIds) cartInfo.itemsWithBoth++;
        else if (hasRuleId) cartInfo.itemsWithShippingRuleId++;
        else if (hasRuleIds) cartInfo.itemsWithShippingRuleIds++;
        else cartInfo.itemsWithNeither++;
        
        cartInfo.items.push({
          index,
          id: product.id,
          name: product.name,
          shippingRuleId: product.shippingRuleId,
          shippingRuleIds: product.shippingRuleIds
        });
      });
      
      console.log("CheckoutSummary: Info del carrito", cartInfo);
      
      // Si ningún producto tiene reglas de envío, mostrar advertencia
      if (cartInfo.itemsWithBoth + cartInfo.itemsWithShippingRuleId + cartInfo.itemsWithShippingRuleIds === 0) {
        console.warn("ADVERTENCIA: Ningún producto tiene reglas de envío asignadas. Configurar shippingRuleId o shippingRuleIds en los productos.");
      }
    }
  }, [cart]);

  // Añadir al useEffect que verifica la dirección
  useEffect(() => {
    if (userAddress) {
      // Log específico para datos de dirección
      console.log('=== DATOS DE ENVÍO ===', {
        codigoPostal: userAddress.zipCode || userAddress.postalCode || 'No definido',
        estado: userAddress.state || 'No definido',
        ciudad: userAddress.city || 'No definida',
        direccionCompleta: userAddress
      });
    }
  }, [userAddress]);

  // Añadir un useEffect específico para mostrar productos y sus reglas
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      const productosConReglas = cart.items.map(item => {
        const product = item.product || item;
        return {
          id: product.id,
          nombre: product.name,
          reglasDeEnvio: {
            shippingRuleId: product.shippingRuleId || 'No definido',
            shippingRuleIds: product.shippingRuleIds || [],
            tieneReglaIndividual: !!product.shippingRuleId,
            tieneReglasMultiples: !!(product.shippingRuleIds && product.shippingRuleIds.length > 0)
          }
        };
      });

      console.log('=== PRODUCTOS DEL CHECKOUT ===', {
        totalProductos: cart.items.length,
        productos: productosConReglas
      });
    }
  }, [cart]);

  // Si no hay carrito, mostrar mensaje
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="alert alert-info">
        Tu carrito está vacío
      </div>
    );
  }

  return (
    <div className="checkout-summary">
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Resumen del pedido</h5>
          <button
            className="btn btn-sm btn-link p-0 text-muted"
            onClick={toggleDebugMode}
            title={isDebugMode ? "Ocultar debug" : "Mostrar debug"}
          >
            <i className={`bi bi-${isDebugMode ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        <div className="card-body">
          {/* Resumen de productos */}
          <div className="mb-4">
            <h6 className="text-uppercase mb-3">Productos ({cart.items.length})</h6>
            <div className="list-group mb-3">
              {cart.items.map(item => (
                <div key={item.product.id} className="list-group-item border-0 d-flex justify-content-between lh-sm py-2">
                  <div>
                    <h6 className="my-0">{item.product.name}</h6>
                    <small className="text-muted">
                      {item.quantity} x ${item.product.price.toFixed(2)}
                    </small>
                  </div>
                  <span className="text-muted">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calculador de envío con grupos */}
          <ShippingGroupsCalculator
            cart={cart}
            userAddress={userAddress}
            selectedShippingOption={selectedShipping}
            onShippingChange={handleShippingChange}
            onAvailableOptionsChange={handleAvailableOptionsChange}
          />

          {/* Resumen de costos */}
          <div className="border-top pt-3 mt-4">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <span>${summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>IVA (16%)</span>
              <span>${summary.tax.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Envío</span>
              <span>${summary.shipping.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold fs-5 mt-3">
              <span>Total</span>
              <span>${summary.total.toFixed(2)} MXN</span>
            </div>
          </div>
        </div>
        {currentStep !== 3 && (
          <div className="card-footer bg-white py-3">
            <button 
              className="btn btn-dark w-100 fw-medium"
              onClick={handleCheckout}
              disabled={!selectedShipping}
            >
              Continuar al pago
            </button>
            <div className="text-center mt-3 small text-muted">
              <i className="bi bi-lock-fill me-1"></i>
              Pago 100% seguro
            </div>
          </div>
        )}
      </div>
      
      {/* Información de depuración */}
      {renderDebugInfo()}
    </div>
  );
};

CheckoutSummary.propTypes = {
  cart: PropTypes.object.isRequired,
  userAddress: PropTypes.object,
  onCheckout: PropTypes.func.isRequired,
  currentStep: PropTypes.number
};

export default CheckoutSummary; 