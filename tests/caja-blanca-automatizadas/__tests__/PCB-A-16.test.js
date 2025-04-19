// Ubicación: pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-16.test.js

// Importar la función a probar
const { updateItemQuantity } = require('../../src/modules/shop/features/cart/utils/cartUtils');

describe('PCB-A-16: Actualización de cantidades en carrito', () => {
  // Caso 1: Carrito no válido
  test('1. Debe manejar correctamente un carrito no válido', () => {
    expect(updateItemQuantity(null, 'p1', null, 2)).toEqual([]);
    expect(updateItemQuantity(undefined, 'p1', null, 2)).toEqual([]);
    expect(updateItemQuantity('no-array', 'p1', null, 2)).toEqual([]);
  });

  // Caso 2: ID de producto no válido
  test('2. Debe devolver el carrito sin cambios cuando productId no es válido', () => {
    const cartItems = [{ productId: 'p1', quantity: 1 }];
    expect(updateItemQuantity(cartItems, null, null, 2)).toEqual(cartItems);
    expect(updateItemQuantity(cartItems, '', null, 2)).toEqual(cartItems);
  });

  // Caso 3: Cantidad no válida
  test('3. Debe devolver el carrito sin cambios cuando newQuantity no es válida', () => {
    const cartItems = [{ productId: 'p1', quantity: 1 }];
    expect(updateItemQuantity(cartItems, 'p1', null, -1)).toEqual(cartItems);
    expect(updateItemQuantity(cartItems, 'p1', null, 'no-number')).toEqual(cartItems);
  });

  // Caso 4: Producto no encontrado
  test('4. Debe devolver el carrito sin cambios cuando el producto no existe', () => {
    const cartItems = [{ productId: 'p1', quantity: 1 }];
    expect(updateItemQuantity(cartItems, 'p2', null, 2)).toEqual(cartItems);
  });

  // Caso 5: Actualizar producto con variante
  test('5. Debe actualizar correctamente un producto con variante', () => {
    const cartItems = [
      { productId: 'p1', variantId: 'v1', quantity: 1 },
      { productId: 'p2', quantity: 1 }
    ];
    const expected = [
      { productId: 'p1', variantId: 'v1', quantity: 2 },
      { productId: 'p2', quantity: 1 }
    ];
    expect(updateItemQuantity(cartItems, 'p1', 'v1', 2)).toEqual(expected);
  });

  // Caso 6: Actualizar producto sin variante
  test('6. Debe actualizar correctamente un producto sin variante', () => {
    const cartItems = [
      { productId: 'p1', variantId: 'v1', quantity: 1 },
      { productId: 'p2', quantity: 1 }
    ];
    const expected = [
      { productId: 'p1', variantId: 'v1', quantity: 1 },
      { productId: 'p2', quantity: 3 }
    ];
    expect(updateItemQuantity(cartItems, 'p2', null, 3)).toEqual(expected);
  });

  // Caso 7: Eliminar producto (cantidad 0)
  test('7. Debe eliminar el producto cuando la cantidad es 0', () => {
    const cartItems = [
      { productId: 'p1', quantity: 1 },
      { productId: 'p2', quantity: 1 }
    ];
    const expected = [
      { productId: 'p2', quantity: 1 }
    ];
    expect(updateItemQuantity(cartItems, 'p1', null, 0)).toEqual(expected);
  });

  // Caso 8: Limitar por stock máximo
  test('8. Debe limitar la cantidad según el stock máximo', () => {
    const cartItems = [{ productId: 'p1', quantity: 1 }];
    const expected = [{ productId: 'p1', quantity: 5 }];
    expect(updateItemQuantity(cartItems, 'p1', null, 10, 5)).toEqual(expected);
  });
}); 