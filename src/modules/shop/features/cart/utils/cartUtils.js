/**
 * Format price as currency
 * @param {number} price - Price to format
 * @param {string} locale - Locale for formatting
 * @param {string} currency - Currency code
 * @returns {string} - Formatted price
 */
export const formatPrice = (price, locale = 'es-MX', currency = 'MXN') => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

/**
 * Calculate cart totals with Mexican tax model (IVA included in price)
 *
 * @param {Array} items - Cart items
 * @param {number} taxRate - Tax rate (default: 0.16 = 16%)
 * @param {number} minFreeShipping - Minimum amount for free shipping
 * @param {number} shippingCost - Standard shipping cost
 * @returns {Object} - Cart totals
 */
export const calculateCartTotals = (
  items,
  taxRate = 0.16,
  minFreeShipping = 500,
  shippingCost = 50
) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      subtotal: 0,
      taxes: 0,
      shipping: 0,
      total: 0,
      finalTotal: 0,
      isFreeShipping: true
    };
  }

  // Calculate total with tax included (mexican model)
  const total = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Calculate the tax amount (already included in the price)
  // Formula: tax = total - (total / (1 + taxRate))
  const taxes = total - (total / (1 + taxRate));

  // Calculate subtotal (price without tax)
  const subtotal = total - taxes;

  // Calculate shipping (free if total >= minFreeShipping)
  const isFreeShipping = total >= minFreeShipping;
  const shipping = isFreeShipping ? 0 : shippingCost;

  // Calculate final total including shipping
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