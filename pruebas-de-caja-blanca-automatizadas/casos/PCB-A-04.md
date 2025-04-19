# PCB-A-04: CÁLCULO DE SUBTOTALES

## Información General

| Campo | Valor |
|-------|-------|
| No | PCB-A-04 |
| Nombre de la prueba | PCB-A-04 - Cálculo de subtotales |
| Módulo | Shop/Cart |
| Descripción | Prueba automatizada para verificar los cálculos de precios y cantidades en el carrito |
| Caso de prueba relacionado | HU-S07: Resumen de carrito |
| Realizado por | Valentin Alejandro Perez Zurita |
| Fecha | 17 de Abril del 2025 |

## Código Fuente a Probar

```javascript
// Ubicación: src/modules/shop/features/cart/utils/cartUtils.js
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
```

## Diagrama de Flujo

```plantuml
@startuml
!theme plain
skinparam backgroundColor white
skinparam defaultFontName Arial
skinparam defaultFontColor black
skinparam arrowColor black
skinparam shadowing false

title Diagrama de Flujo - Cálculo de Subtotales (PCB-A-04)
start
if (items válidos?) then (no)
  :Retornar valores por defecto;
  note right: subtotal: 0, taxes: 0, shipping: 0, etc.
  stop
else (sí)
  :Calcular total con impuestos incluidos;
  note right: Suma de price * quantity
  :Calcular impuestos;
  note right: taxes = total - (total / (1 + taxRate))
  :Calcular subtotal;
  note right: subtotal = total - taxes
  if (total >= minFreeShipping?) then (sí)
    :Establecer shipping = 0;
    :Establecer isFreeShipping = true;
  else (no)
    :Establecer shipping = shippingCost;
    :Establecer isFreeShipping = false;
  endif
  :Calcular finalTotal;
  note right: finalTotal = total + shipping
  :Retornar objeto con subtotal, taxes, shipping, etc.;
  stop
endif
@enduml
```

## Cálculo de la Complejidad Ciclomática

| Nodo | Descripción |
|------|-------------|
| 1 | Inicio |
| 2 | ¿Items válidos? |
| 3 | Retornar valores por defecto |
| 4 | Calcular total con impuestos incluidos |
| 5 | Calcular impuestos y subtotal |
| 6 | ¿Total >= minFreeShipping? |
| 7 | Establecer shipping = 0, isFreeShipping = true |
| 8 | Establecer shipping = shippingCost, isFreeShipping = false |
| 9 | Calcular finalTotal |
| 10 | Retornar objeto con resultados |

| Método | Resultado |
|--------|-----------|
| Número de Regiones | 3 |
| Aristas - Nodos + 2 | 12 - 10 + 2 = 4 |
| Nodos Predicado + 1 | 2 + 1 = 3 |
| Conclusión | La complejidad ciclomática es 3, lo que implica que se deben identificar 3 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción | Secuencia de nodos |
|----|-------------|-------------------|
| 1 | Items no válidos | 1 → 2(no) → 3 → Fin |
| 2 | Items válidos con envío gratuito | 1 → 2(sí) → 4 → 5 → 6(sí) → 7 → 9 → 10 → Fin |
| 3 | Items válidos sin envío gratuito | 1 → 2(sí) → 4 → 5 → 6(no) → 8 → 9 → 10 → Fin |

## Casos de Prueba Derivados

| Caso | Descripción | Entrada | Resultado Esperado |
|------|-------------|---------|-------------------|
| 1 | Carrito vacío | items = [] | { subtotal: 0, taxes: 0, shipping: 0, total: 0, finalTotal: 0, isFreeShipping: true } |
| 2 | Carrito con items y envío gratuito | items = [{ price: 300, quantity: 2 }], taxRate = 0.16, minFreeShipping = 500, shippingCost = 50 | { subtotal: 517.24, taxes: 82.76, shipping: 0, total: 600, finalTotal: 600, isFreeShipping: true } |
| 3 | Carrito con items sin envío gratuito | items = [{ price: 100, quantity: 3 }], taxRate = 0.16, minFreeShipping = 500, shippingCost = 50 | { subtotal: 258.62, taxes: 41.38, shipping: 50, total: 300, finalTotal: 350, isFreeShipping: false } |

## Tabla de Resultados

| Caso | Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|------|---------|-------------------|-------------------|--------|
| 1 | items = [] | { subtotal: 0, taxes: 0, shipping: 0, total: 0, finalTotal: 0, isFreeShipping: true } | { subtotal: 0, taxes: 0, shipping: 0, total: 0, finalTotal: 0, isFreeShipping: true } | ✅ Pasó |
| 2 | items = [{ price: 300, quantity: 2 }], taxRate = 0.16, minFreeShipping = 500, shippingCost = 50 | { subtotal: 517.24, taxes: 82.76, shipping: 0, total: 600, finalTotal: 600, isFreeShipping: true } | { subtotal: 517.24, taxes: 82.76, shipping: 0, total: 600, finalTotal: 600, isFreeShipping: true } | ✅ Pasó |
| 3 | items = [{ price: 100, quantity: 3 }], taxRate = 0.16, minFreeShipping = 500, shippingCost = 50 | { subtotal: 258.62, taxes: 41.38, shipping: 50, total: 300, finalTotal: 350, isFreeShipping: false } | { subtotal: 258.62, taxes: 41.38, shipping: 50, total: 300, finalTotal: 350, isFreeShipping: false } | ✅ Pasó |

## Herramienta Usada
- Jest + React Testing Library

## Script de Prueba Automatizada

```javascript
// Ubicación: src/modules/shop/features/cart/utils/__tests__/cartUtils.test.js

import { calculateCartTotals } from '../cartUtils';

describe('Cart Totals Calculation', () => {
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

  // Camino 2: Carrito con envío gratuito
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

  // Camino 3: Carrito sin envío gratuito
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
```