import { useMemo } from 'react';

/**
 * Constantes para cálculos del carrito
 */
const CART_CONFIG = {
  TAX_RATE: 0.16, // 16%
  MIN_FREE_SHIPPING: 500, // Envío gratis a partir de $500
  SHIPPING_COST: 50 // Costo del envío
};

/**
 * Hook especializado en cálculos de totales del carrito
 *
 * Se encarga de:
 * - Cálculo de subtotales
 * - Cálculo de impuestos
 * - Cálculo de envío
 * - Cálculo de total final
 *
 * @param {Array} items - Productos en el carrito
 * @returns {Object} Totales calculados
 */
export const useCartTotals = (items) => {
  /**
   * Calcula todos los totales del carrito
   * Con modelo fiscal mexicano (IVA incluido en el precio)
   */
  const calculatedValues = useMemo(() => {
    // Validar que items sea un array
    if (!Array.isArray(items) || items.length === 0) {
      return {
        subtotal: 0,
        taxes: 0,
        shipping: 0,
        total: 0,
        finalTotal: 0,
        isFreeShipping: true
      };
    }

    // Calcular subtotal (con validación de datos)
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    // Calcular impuestos (IVA incluido en el precio en México)
    const taxes = +(subtotal * CART_CONFIG.TAX_RATE / (1 + CART_CONFIG.TAX_RATE)).toFixed(2);

    // Determinar si el envío es gratuito
    const isFreeShipping = subtotal >= CART_CONFIG.MIN_FREE_SHIPPING;
    const shipping = isFreeShipping ? 0 : CART_CONFIG.SHIPPING_COST;

    // Calcular total sin envío
    const total = subtotal;

    // Calcular total final con envío
    const finalTotal = +(total + shipping).toFixed(2);

    return {
      subtotal,
      taxes,
      shipping,
      total,
      finalTotal,
      isFreeShipping
    };
  }, [items]);

  return calculatedValues;
};