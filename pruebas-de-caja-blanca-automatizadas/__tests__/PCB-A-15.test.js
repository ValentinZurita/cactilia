/**
 * Test automatizado para la función isProductOnSale
 * Caso de prueba: PCB-A-15
 */

/**
 * Verifica si un producto está en oferta actualmente
 * @param {Object} product - Producto a verificar
 * @returns {boolean} true si el producto está en oferta, false en caso contrario
 */
function isProductOnSale(product) {
  // Validar si el producto existe
  if (!product) {
    return false;
  }
  
  // Verificar si tiene un descuento activo
  if (!product.discount || product.discount <= 0) {
    return false;
  }
  
  return true;
}

describe('PCB-A-15: Verificación de productos en oferta', () => {
  // Caso 1: Producto no existe
  test('debería retornar false cuando el producto no existe', () => {
    expect(isProductOnSale(null)).toBe(false);
    expect(isProductOnSale(undefined)).toBe(false);
  });

  // Caso 2: Producto sin descuento
  test('debería retornar false cuando el producto no tiene descuento', () => {
    const productWithoutDiscount = { name: 'Test Product' };
    const productWithZeroDiscount = { name: 'Test Product', discount: 0 };
    const productWithNegativeDiscount = { name: 'Test Product', discount: -5 };
    
    expect(isProductOnSale(productWithoutDiscount)).toBe(false);
    expect(isProductOnSale(productWithZeroDiscount)).toBe(false);
    expect(isProductOnSale(productWithNegativeDiscount)).toBe(false);
  });

  // Caso 3: Producto con descuento (en oferta)
  test('debería retornar true cuando el producto tiene descuento activo', () => {
    const productOnSale = { name: 'Test Product', discount: 10 };
    const productWithMinimalDiscount = { name: 'Test Product', discount: 0.1 };
    
    expect(isProductOnSale(productOnSale)).toBe(true);
    expect(isProductOnSale(productWithMinimalDiscount)).toBe(true);
  });
}); 