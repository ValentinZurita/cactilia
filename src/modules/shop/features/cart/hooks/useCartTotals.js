import { useState, useEffect, useCallback } from 'react';

/**
 * Hook ultra simplificado para cálculos del carrito
 */
export const useCartTotals = (items) => {
  const [manualShippingCost, setManualShippingCost] = useState(0);
  
  // Función para actualizar manualmente el costo de envío
  const updateShipping = useCallback((cost) => {
    const validatedCost = typeof cost === 'number' && !isNaN(cost) ? cost : 0;
    console.log(`🚚 [useCartTotals] Costo de envío actualizado a: $${validatedCost.toFixed(2)}`);
    
    // Forzar actualización inmediata del costo de envío
    setManualShippingCost(validatedCost);
  }, []);

  // Validar que items sea un array
  if (!Array.isArray(items) || items.length === 0) {
    const isEmpty = !Array.isArray(items) || items.length === 0;
    console.log(`📦 [useCartTotals] Carrito vacío: ${isEmpty}, shipping: ${manualShippingCost}, isFreeShipping: ${manualShippingCost === 0}`);
    
    return {
      subtotal: 0,
      taxes: 0,
      shipping: manualShippingCost, // Usar el valor manual
      total: 0,
      finalTotal: manualShippingCost, // Solo el envío si no hay productos
      isFreeShipping: manualShippingCost === 0,
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
  
  // Determinar si el envío es gratuito basado únicamente en el costo, no en mínimos
  const isFreeShipping = shipping === 0;
  
  console.log(`💰 [useCartTotals] Subtotal: $${subtotal}, Shipping: $${shipping}, isFreeShipping: ${isFreeShipping}`);
  
  // Total final incluyendo envío
  const finalTotal = +(subtotal + shipping).toFixed(2);

  return {
    subtotal,
    taxes,
    shipping,
    total: subtotal,
    finalTotal,
    isFreeShipping,
    updateShipping
  };
};