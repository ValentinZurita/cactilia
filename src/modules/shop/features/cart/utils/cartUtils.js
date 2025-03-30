
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