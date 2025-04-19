# PCB-A-16: GESTIÓN DE CANTIDADES EN CARRITO

## Información General

| Campo | Valor |
|-------|-------|
| No | PCB-A-16 |
| Nombre de la prueba | PCB-A-16 - Actualización de cantidades en carrito |
| Módulo | Shop/Cart |
| Descripción | Prueba automatizada para validar la lógica de actualización de cantidades de productos en el carrito |
| Caso de prueba relacionado | HU-S06: Gestión de cantidades |
| Realizado por | Valentin Alejandro Perez Zurita |
| Fecha | 18 de Abril del 2025 |

## Código Fuente a Probar

```javascript
// Ubicación: src/modules/shop/features/cart/utils/cartUtils.js

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
```

## Diagrama de Flujo

![Diagrama de Flujo](../diagramas/exports/PCB-A-16.png)

## Cálculo de la Complejidad Ciclomática

### Nodos Predicado

| Nodo | Descripción |
|------|-------------|
| 2 | ¿cartItems es válido y es un array? |
| 4 | ¿productId existe? |
| 6 | ¿newQuantity es válida? |
| 8 | ¿variantId existe? |
| 12 | ¿Se encontró el producto? |
| 14 | ¿newQuantity es 0? |
| 17 | ¿maxStock existe? |

### Cálculo

| Método | Resultado |
|--------|-----------|
| Número de Regiones | 8 |
| Aristas - Nodos + 2 | 19 - 13 + 2 = 8 |
| Nodos Predicado + 1 | 7 + 1 = 8 |
| Conclusión | La complejidad ciclomática es 8, lo que implica que se deben identificar 8 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción | Secuencia de nodos |
|----|-------------|-------------------|
| 1 | cartItems no válido | 1 → 2(No) → 3 → Fin |
| 2 | productId no válido | 1 → 2(Sí) → 4(No) → 5 → Fin |
| 3 | newQuantity no válida | 1 → 2(Sí) → 4(Sí) → 6(No) → 7 → Fin |
| 4 | Producto con variante | 1 → 2(Sí) → 4(Sí) → 6(Sí) → 8(Sí) → 9 → 12(No) → 13 → Fin |
| 5 | Producto sin variante | 1 → 2(Sí) → 4(Sí) → 6(Sí) → 8(No) → 10 → 12(No) → 13 → Fin |
| 6 | Eliminar producto (cantidad = 0) | 1 → 2(Sí) → 4(Sí) → 6(Sí) → 8(No) → 10 → 12(Sí) → 14(Sí) → 15 → Fin |
| 7 | Actualizar cantidad con maxStock | 1 → 2(Sí) → 4(Sí) → 6(Sí) → 8(No) → 10 → 12(Sí) → 14(No) → 17(Sí) → 18 → 19 → Fin |
| 8 | Actualizar cantidad sin límite | 1 → 2(Sí) → 4(Sí) → 6(Sí) → 8(No) → 10 → 12(Sí) → 14(No) → 17(No) → 18 → 19 → Fin |

## Casos de Prueba Derivados

| Caso | Descripción | Entrada | Resultado Esperado |
|------|-------------|---------|-------------------|
| 1 | Carrito no válido | cartItems=null, productId="p1", newQuantity=2 | [] |
| 2 | ID de producto no válido | cartItems=[{productId:"p1", quantity:1}], productId=null, newQuantity=2 | Carrito sin cambios |
| 3 | Cantidad no válida | cartItems=[{productId:"p1", quantity:1}], productId="p1", newQuantity=-1 | Carrito sin cambios |
| 4 | Producto no encontrado | cartItems=[{productId:"p1", quantity:1}], productId="p2", newQuantity=2 | Carrito sin cambios |
| 5 | Actualizar producto con variante | cartItems=[{productId:"p1", variantId:"v1", quantity:1}], productId="p1", variantId="v1", newQuantity=2 | Producto actualizado a cantidad 2 |
| 6 | Actualizar producto sin variante | cartItems=[{productId:"p1", quantity:1}], productId="p1", newQuantity=3 | Producto actualizado a cantidad 3 |
| 7 | Eliminar producto (cantidad 0) | cartItems=[{productId:"p1", quantity:1}], productId="p1", newQuantity=0 | Producto eliminado del carrito |
| 8 | Limitar por stock máximo | cartItems=[{productId:"p1", quantity:1}], productId="p1", newQuantity=10, maxStock=5 | Producto actualizado a cantidad 5 |

## Tabla de Resultados

| Caso | Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|------|---------|-------------------|-------------------|--------|
| 1 | cartItems=null, productId="p1", newQuantity=2 | [] | [] | ✅ Pasó |
| 2 | cartItems=[{productId:"p1", quantity:1}], productId=null, newQuantity=2 | Carrito sin cambios | Carrito sin cambios | ✅ Pasó |
| 3 | cartItems=[{productId:"p1", quantity:1}], productId="p1", newQuantity=-1 | Carrito sin cambios | Carrito sin cambios | ✅ Pasó |
| 4 | cartItems=[{productId:"p1", quantity:1}], productId="p2", newQuantity=2 | Carrito sin cambios | Carrito sin cambios | ✅ Pasó |
| 5 | cartItems=[{productId:"p1", variantId:"v1", quantity:1}], productId="p1", variantId="v1", newQuantity=2 | Producto actualizado a cantidad 2 | Producto actualizado a cantidad 2 | ✅ Pasó |
| 6 | cartItems=[{productId:"p1", quantity:1}], productId="p1", newQuantity=3 | Producto actualizado a cantidad 3 | Producto actualizado a cantidad 3 | ✅ Pasó |
| 7 | cartItems=[{productId:"p1", quantity:1}], productId="p1", newQuantity=0 | Producto eliminado del carrito | Producto eliminado del carrito | ✅ Pasó |
| 8 | cartItems=[{productId:"p1", quantity:1}], productId="p1", newQuantity=10, maxStock=5 | Producto actualizado a cantidad 5 | Producto actualizado a cantidad 5 | ✅ Pasó |

## Herramienta Usada
- Jest

## Script de Prueba Automatizada

```javascript
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
``` 