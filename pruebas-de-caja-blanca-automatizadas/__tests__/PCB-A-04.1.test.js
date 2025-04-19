// Ubicación: pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-04.1.test.js

// Implementación de la función a probar
const calculateCartTotals = (
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
  const total = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
    return sum + (price * quantity);
  }, 0);

  // Calcular el impuesto (ya incluido en el precio)
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

describe('Cart Totals Calculation (Improved Version)', () => {
  // Camino 1: Carrito vacío
  test('debería manejar correctamente un carrito vacío', () => {
    const result = calculateCartTotals([]);
    expect(result).toEqual({
      subtotal: 0,
      taxes: 0,
      shipping: 0,
      total: 0,
      finalTotal: 0,
      isFreeShipping: true
    });
  });

  // Camino 2: Carrito con items inválidos
  test('debería manejar correctamente items con valores no numéricos', () => {
    const items = [{ price: "no-número", quantity: 2 }];
    const result = calculateCartTotals(items, 0.16, 500, 50);
  
    expect(result.subtotal).toBe(0);
    expect(result.taxes).toBe(0);
    expect(result.shipping).toBe(50);
    expect(result.total).toBe(0);
    expect(result.finalTotal).toBe(50);
    expect(result.isFreeShipping).toBe(false);
  });

  // Camino 3: Carrito con envío gratuito
  test('debería calcular correctamente con envío gratuito', () => {
    const items = [{ price: 300, quantity: 2 }];
    const result = calculateCartTotals(items, 0.16, 500, 50);
  
    expect(result.subtotal).toBeCloseTo(517.24, 2);
    expect(result.taxes).toBeCloseTo(82.76, 2);
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(600);
    expect(result.finalTotal).toBe(600);
    expect(result.isFreeShipping).toBe(true);
  });

  // Camino 4: Carrito sin envío gratuito
  test('debería calcular correctamente sin envío gratuito', () => {
    const items = [{ price: 100, quantity: 3 }];
    const result = calculateCartTotals(items, 0.16, 500, 50);
  
    expect(result.subtotal).toBeCloseTo(258.62, 2);
    expect(result.taxes).toBeCloseTo(41.38, 2);
    expect(result.shipping).toBe(50);
    expect(result.total).toBe(300);
    expect(result.finalTotal).toBe(350);
    expect(result.isFreeShipping).toBe(false);
  });
}); 