/**
 * Utilidades para cálculos
 */

/**
 * Calcula los totales del carrito
 *
 * @param {Array} items - Elementos del carrito
 * @param {Object} options - Opciones de cálculo
 * @returns {Object} - Totales calculados
 */
export const calculateCartTotals = (items, options = {}) => {
  const taxRate = options.taxRate || 0.16; // 16%
  const minFreeShipping = options.minFreeShipping || 500;
  const shippingCost = options.shippingCost || 50;

  // Calcular total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calcular impuestos (ya incluidos en el precio)
  const taxes = total - (total / (1 + taxRate));

  // Calcular subtotal (precio sin impuestos)
  const subtotal = total - taxes;

  // Calcular envío
  const isFreeShipping = total >= minFreeShipping;
  const shipping = isFreeShipping ? 0 : shippingCost;

  // Calcular total final con envío
  const finalTotal = total + shipping;

  return {
    subtotal,
    taxes,
    shipping,
    total,
    finalTotal,
    isFreeShipping
  };
};

/**
 * Verifica si hay productos sin stock
 *
 * @param {Array} items - Elementos a verificar
 * @returns {boolean} - True si hay productos sin stock
 */
export const hasOutOfStockItems = (items) => {
  return items.some(item => item.stock === 0);
};

/**
 * Obtiene los productos sin stock
 *
 * @param {Array} items - Elementos a verificar
 * @returns {Array} - Productos sin stock
 */
export const getOutOfStockItems = (items) => {
  return items.filter(item => item.stock === 0);
};

/**
 * Calcula el precio de un producto con descuento
 *
 * @param {number} price - Precio original
 * @param {number} discountPercent - Porcentaje de descuento
 * @returns {number} - Precio con descuento
 */
export const calculateDiscountedPrice = (price, discountPercent) => {
  if (!discountPercent) return price;
  return price * (1 - (discountPercent / 100));
};