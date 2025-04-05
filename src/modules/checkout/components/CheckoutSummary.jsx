import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ShippingCalculator } from './shipping';
import { calculateTotalShippingCost } from '../utils/shippingCalculator';

/**
 * Componente de resumen del checkout que incluye selección de envío
 */
const CheckoutSummary = ({ cart, userAddress, onCheckout, currentStep }) => {
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [availableShippingOptions, setAvailableShippingOptions] = useState([]);
  const [summary, setSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });

  // Limpiar selección de envío si cambia la dirección
  useEffect(() => {
    setSelectedShipping(null);
  }, [userAddress]);

  // Manejar cambio en opciones de envío disponibles
  const handleAvailableOptionsChange = (options) => {
    setAvailableShippingOptions(options);
    
    // Si hay opciones disponibles y no hay una seleccionada, seleccionar automáticamente la primera
    if (options.length > 0 && !selectedShipping && userAddress) {
      handleShippingChange(options[0]);
    }
  };

  // Calcular el resumen cuando cambia el carrito o la opción de envío
  useEffect(() => {
    if (!cart || !cart.items) return;

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
    
    setSummary(newSummary);
    
    // Si estamos en el paso de confirmación y hay una opción de envío seleccionada, actualizar el resumen en el componente padre
    if (currentStep === 3 && selectedShipping) {
      onCheckout(newSummary);
    }
  }, [cart, selectedShipping, currentStep, onCheckout]);

  // Manejar cambio en opción de envío
  const handleShippingChange = (option) => {
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
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Resumen del pedido</h5>
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

          {/* Calculador de envío */}
          <ShippingCalculator
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