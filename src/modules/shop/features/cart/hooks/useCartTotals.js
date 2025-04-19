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
      total: 0, // Sin productos, el total base es 0
      finalTotal: manualShippingCost, // Solo el envío si no hay productos
      isFreeShipping: manualShippingCost === 0,
      updateShipping
    };
  }

  // Calcular total con IVA incluido (antes llamado subtotal)
  const totalPriceWithVAT = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  // Calcular impuestos como 16% del total con IVA
  const taxRate = 0.16; // Explicit tax rate constant
  const taxes = +(totalPriceWithVAT * taxRate).toFixed(2);

  // Calcular subtotal (base imponible) restando los impuestos del total con IVA
  const subtotal = +(totalPriceWithVAT - taxes).toFixed(2);

  // Usar el costo de envío manual
  const shipping = manualShippingCost;
  
  // Determinar si el envío es gratuito basado únicamente en el costo, no en mínimos
  const isFreeShipping = shipping === 0;
  
  // Actualizar log para claridad
  console.log(`💰 [useCartTotals] Total(inc VAT): ${totalPriceWithVAT.toFixed(2)}, Subtotal(base): ${subtotal.toFixed(2)}, Taxes: ${taxes.toFixed(2)}, Shipping: ${shipping.toFixed(2)}, isFreeShipping: ${isFreeShipping}`);
  
  // Total final incluyendo envío (usar el total con IVA)
  const finalTotal = +(totalPriceWithVAT + shipping).toFixed(2);

  return {
    subtotal, // Base imponible (precio sin IVA)
    taxes,    // IVA calculado (16% del total con IVA)
    shipping,
    total: totalPriceWithVAT, // Precio total con IVA incluido
    finalTotal, // Total con IVA + envío
    isFreeShipping,
    updateShipping
  };
};