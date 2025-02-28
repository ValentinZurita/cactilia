/**
 * Utility functions for cart operations
 */

/**
 * Format price as currency
 * @param {number} price - Price to format
 * @param {string} locale - Locale for formatting
 * @param {string} currency - Currency code
 * @returns {string} - Formatted price
 */
export const formatPrice = (price, locale = 'es-MX', currency = 'MXN') => {
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

  // Calculate total with tax included (mexican model)
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);


  // Calculate the tax amount (already included in the price)
  // Formula: tax = total - (total / (1 + taxRate))
  const taxes = total - (total / (1 + taxRate));


  // Calculate subtotal (price without tax)
  const subtotal = total - taxes;


  // Calculate shipping (free if total >= minFreeShipping)
  const shipping = total >= minFreeShipping ? 0 : shippingCost;


  // Calculate final total including shipping
  const finalTotal = total + shipping;


  return {
    subtotal,
    taxes,
    shipping,
    total,
    finalTotal,
    isFreeShipping: total >= minFreeShipping
  };
};



/**
 * Check if all items in cart are in stock
 * @param {Array} items - Cart items
 * @returns {boolean} - True if all items are in stock
 */
export const allItemsInStock = (items) => {
  return items.every(item => item.stock > 0);
};



/**
 * Check if any item in cart is out of stock
 * @param {Array} items - Cart items
 * @returns {Array} - Array of items that are out of stock
 */
export const getOutOfStockItems = (items) => {
  return items.filter(item => item.stock === 0);
};



/**
 * Get unique categories in cart
 * @param {Array} items - Cart items
 * @returns {Array} - Array of unique categories
 */
export const getUniqueCategories = (items) => {
  const categories = items.map(item => item.category).filter(Boolean);
  return [...new Set(categories)];
};