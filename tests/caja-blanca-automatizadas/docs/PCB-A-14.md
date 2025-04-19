# PCB-A-14: VERIFICACIÓN DE DISPONIBILIDAD DE STOCK

## Información General

| Campo | Valor |
|-------|-------|
| No | PCB-A-14 |
| Nombre de la prueba | PCB-A-14 - Verificación de disponibilidad de stock |
| Módulo | Shop/Inventory |
| Descripción | Prueba automatizada para evaluar la lógica que determina si un producto está disponible para compra según su stock |
| Caso de prueba relacionado | HU-S04: Indicador de stock |
| Realizado por | Valentin Alejandro Perez Zurita |
| Fecha | 17 de Abril del 2025 |

## Código Fuente a Probar

```javascript
// Ubicación: src/modules/shop/utils/inventoryUtils.js

/**
 * Verifica si un producto está disponible para compra
 * @param {Object} product - Producto a verificar
 * @param {Number} requestedQuantity - Cantidad solicitada (por defecto 1)
 * @returns {boolean} true si el producto está disponible, false en caso contrario
 */
export const isProductAvailable = (product, requestedQuantity = 1) => {
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
};
```

## Diagrama de Flujo

![Diagrama de Flujo](../diagramas/exports/PCB-A-14.png)

## Cálculo de la Complejidad Ciclomática

### Nodos Predicado

| Nodo | Descripción |
|------|-------------|
| 2 | ¿product existe? |
| 4 | ¿requestedQuantity > 0 y es entero? |
| 6 | ¿product.active es true? |
| 8 | ¿product.stock existe? |
| 10 | ¿product.stock >= requestedQuantity? |

### Cálculo

| Método | Resultado |
|--------|-----------|
| Número de Regiones | 6 (5 caminos independientes + 1 región externa) |
| Aristas - Nodos + 2 | 16 - 12 + 2 = 6 |
| Nodos Predicado + 1 | 5 + 1 = 6 |
| Conclusión | La complejidad ciclomática es 6, lo que implica que se deben identificar 6 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción | Secuencia de nodos |
|----|-------------|-------------------|
| 1 | Producto no existe | 1 → 2(No) → 3 → Fin |
| 2 | Cantidad solicitada inválida | 1 → 2(Sí) → 4(No) → 5 → Fin |
| 3 | Producto no activo | 1 → 2(Sí) → 4(Sí) → 6(No) → 7 → Fin |
| 4 | Stock no definido | 1 → 2(Sí) → 4(Sí) → 6(Sí) → 8(No) → 9 → Fin |
| 5 | Stock insuficiente | 1 → 2(Sí) → 4(Sí) → 6(Sí) → 8(Sí) → 10(No) → 11 → Fin |
| 6 | Producto disponible | 1 → 2(Sí) → 4(Sí) → 6(Sí) → 8(Sí) → 10(Sí) → 12 → Fin |

## Casos de Prueba Derivados

| Caso | Descripción | Entrada | Resultado Esperado |
|------|-------------|---------|-------------------|
| 1 | Producto no existe | product = null, requestedQuantity = 1 | false |
| 2a | Cantidad solicitada negativa | product = { active: true, stock: 10 }, requestedQuantity = -1 | false |
| 2b | Cantidad solicitada no entera | product = { active: true, stock: 10 }, requestedQuantity = 1.5 | false |
| 3 | Producto no activo | product = { active: false, stock: 10 }, requestedQuantity = 1 | false |
| 4 | Stock no definido | product = { active: true }, requestedQuantity = 1 | false |
| 5 | Stock insuficiente | product = { active: true, stock: 5 }, requestedQuantity = 10 | false |
| 6 | Producto disponible | product = { active: true, stock: 10 }, requestedQuantity = 5 | true |

## Tabla de Resultados

| Caso | Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|------|---------|-------------------|-------------------|--------|
| 1 | product = null | false | false | ✅ Pasó |
| 2a | requestedQuantity = -1 | false | false | ✅ Pasó |
| 2b | requestedQuantity = 1.5 | false | false | ✅ Pasó |
| 3 | active = false | false | false | ✅ Pasó |
| 4 | stock = undefined | false | false | ✅ Pasó |
| 5 | stock < requestedQuantity | false | false | ✅ Pasó |
| 6 | stock >= requestedQuantity | true | true | ✅ Pasó |

## Herramienta Usada

- Jest

## Script de Prueba Automatizada

```javascript
// Ubicación: pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-14.test.js

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
``` 