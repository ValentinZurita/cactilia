import { useState, useCallback } from 'react';

/**
 * Hook ultra simplificado para cálculos del carrito
 */
export const useCartTotals = (items) => {
  const [manualShippingCost, setManualShippingCost] = useState(200); // $200 por defecto (opción más barata)
  
  // Función para actualizar manualmente el costo de envío
  const updateShipping = useCallback((cost) => {
    console.log(`🚚 Costo de envío actualizado a: $${cost}`);
    setManualShippingCost(cost);
  }, []);

  // Validar que items sea un array
  if (!Array.isArray(items) || items.length === 0) {
    return {
      subtotal: 0,
      taxes: 0,
      shipping: 0,
      total: 0,
      finalTotal: 0,
      isFreeShipping: false,
      updateShipping
    };
  }

  // Calcular subtotal
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  // Calcular impuestos (16%)
  const taxes = +(subtotal * 0.16 / 1.16).toFixed(2);
  
  // Usar el costo de envío manual
  const shipping = manualShippingCost;
  
  // Total final
  const finalTotal = +(subtotal + shipping).toFixed(2);

  return {
    subtotal,
    taxes,
    shipping,
    total: subtotal,
    finalTotal,
    isFreeShipping: false,
    updateShipping
  };
};