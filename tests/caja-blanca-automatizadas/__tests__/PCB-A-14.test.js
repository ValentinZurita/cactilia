/**
 * Test automatizado para la función isProductAvailable
 * Caso de prueba: PCB-A-14
 */

/**
 * Verifica si un producto está disponible para compra
 * @param {Object} product - Producto a verificar
 * @param {Number} requestedQuantity - Cantidad solicitada (por defecto 1)
 * @returns {boolean} true si el producto está disponible, false en caso contrario
 */
function isProductAvailable(product, requestedQuantity = 1) {
  // Validar si el producto existe
  if (!product) {
    return false;
  }
  
  // Validar que la cantidad solicitada sea válida
  if (requestedQuantity <= 0 || !Number.isInteger(requestedQuantity)) {
    return false;
  }
  
  // Validar si el producto está activo
  if (!product.active) {
    return false;
  }
  
  // Verificar disponibilidad de stock
  if (product.stock === undefined || product.stock === null) {
    return false;
  }
  
  return product.stock >= requestedQuantity;
}

describe('PCB-A-14: Verificación de disponibilidad de stock', () => {
  // Caso 1: Producto no existe
  test('debería retornar false cuando el producto no existe', () => {
    expect(isProductAvailable(null)).toBe(false);
    expect(isProductAvailable(undefined)).toBe(false);
  });

  // Caso 2: Cantidad solicitada inválida
  test('debería retornar false cuando la cantidad solicitada es inválida', () => {
    const product = { active: true, stock: 10 };
    
    // Caso 2a: Cantidad negativa
    expect(isProductAvailable(product, -1)).toBe(false);
    expect(isProductAvailable(product, 0)).toBe(false);
    
    // Caso 2b: Cantidad no entera
    expect(isProductAvailable(product, 1.5)).toBe(false);
    expect(isProductAvailable(product, NaN)).toBe(false);
  });

  // Caso 3: Producto no activo
  test('debería retornar false cuando el producto no está activo', () => {
    const product = { active: false, stock: 10 };
    expect(isProductAvailable(product, 1)).toBe(false);
  });

  // Caso 4: Stock no definido
  test('debería retornar false cuando el stock no está definido', () => {
    const productWithoutStock = { active: true };
    const productNullStock = { active: true, stock: null };
    
    expect(isProductAvailable(productWithoutStock, 1)).toBe(false);
    expect(isProductAvailable(productNullStock, 1)).toBe(false);
  });

  // Caso 5: Stock insuficiente
  test('debería retornar false cuando el stock es insuficiente', () => {
    const product = { active: true, stock: 5 };
    expect(isProductAvailable(product, 10)).toBe(false);
  });

  // Caso 6: Producto disponible
  test('debería retornar true cuando el producto está disponible', () => {
    const product = { active: true, stock: 10 };
    
    // Exactamente igual al stock
    expect(isProductAvailable(product, 10)).toBe(true);
    
    // Menor que el stock
    expect(isProductAvailable(product, 5)).toBe(true);
    
    // Valor por defecto (1)
    expect(isProductAvailable(product)).toBe(true);
  });
}); 