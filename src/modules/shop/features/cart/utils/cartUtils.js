/**
 * Formatear precio como moneda
 * @param {number} price - Precio a formatear
 * @param {string} locale - Configuración regional para formateo
 * @param {string} currency - Código de moneda
 * @returns {string} - Precio formateado
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
 * Calcula todos los totales del carrito según el modelo fiscal mexicano (IVA incluido en el precio)
 *
 * @param {Array} items - Items del carrito
 * @param {number} taxRate - Tasa de impuesto (por defecto: 0.16 = 16%)
 * @param {number} minFreeShipping - Monto mínimo para envío gratuito
 * @param {number} shippingCost - Costo estándar de envío
 * @returns {Object} - Totales del carrito
 */
export const calculateCartTotals = (
  items,
  taxRate = 0.16,
  minFreeShipping = 500,
  shippingCost = 50
) => {
  // Validar items
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

  // Calcular total con impuestos incluidos (modelo mexicano)
  // Validamos cada item y nos aseguramos que tengan precio y cantidad válidos
  const total = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
    return sum + (price * quantity);
  }, 0);

  // Calcular el impuesto (ya incluido en el precio)
  // Fórmula: impuesto = total - (total / (1 + tasaImpuesto))
  const taxes = +(total - (total / (1 + taxRate))).toFixed(2);

  // Calcular subtotal (precio sin impuesto)
  const subtotal = +(total - taxes).toFixed(2);

  // Determinar si el envío es gratuito
  const isFreeShipping = total >= minFreeShipping;
  const shipping = isFreeShipping ? 0 : shippingCost;

  // Calcular total final incluyendo envío
  const finalTotal = +(total + shipping).toFixed(2);

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
 * Actualiza la cantidad de un producto en el carrito
 * @param {Array} cartItems - Array de productos en el carrito
 * @param {string} productId - ID del producto a actualizar
 * @param {string} variantId - ID de la variante (opcional)
 * @param {number} newQuantity - Nueva cantidad a establecer
 * @param {number} maxStock - Stock máximo disponible
 * @returns {Array} - Nuevo array de productos del carrito
 */
export const updateItemQuantity = (cartItems, productId, variantId, newQuantity, maxStock) => {
  // Validación de parámetros
  if (!cartItems || !Array.isArray(cartItems)) {
    return [];
  }
  
  if (!productId) {
    return cartItems;
  }
  
  // Validación de nueva cantidad
  if (typeof newQuantity !== 'number' || newQuantity < 0) {
    return cartItems;
  }
  
  // Buscar índice del producto en el carrito
  const itemIndex = cartItems.findIndex(item => {
    // Si existe variantId, verificar tanto producto como variante
    if (variantId) {
      return item.productId === productId && item.variantId === variantId;
    }
    // Si no hay variantId, solo verificar el producto
    return item.productId === productId && !item.variantId;
  });
  
  // Si no se encuentra el producto, devolver el carrito sin cambios
  if (itemIndex === -1) {
    return cartItems;
  }
  
  // Si la cantidad es 0, eliminar el producto del carrito
  if (newQuantity === 0) {
    return [
      ...cartItems.slice(0, itemIndex),
      ...cartItems.slice(itemIndex + 1)
    ];
  }
  
  // Si hay stock máximo definido, limitar la cantidad
  const quantity = maxStock ? Math.min(newQuantity, maxStock) : newQuantity;
  
  // Actualizar la cantidad del producto
  return [
    ...cartItems.slice(0, itemIndex),
    {
      ...cartItems[itemIndex],
      quantity
    },
    ...cartItems.slice(itemIndex + 1)
  ];
};