# Prueba de Caja Blanca: PCB-A-15

## 1. Información General

| Atributo           | Detalle                                                |
| ------------------ | ------------------------------------------------------ |
| **Identificador**: | PCB-A-15                                               |
| **Módulo**:        | Carrito de Compras                                     |
| **Descripción**:   | Verificación del cálculo de descuentos basado en subtotal |
| **Caso de prueba relacionado**: | HU-S06                                    |
| **Autor**:         | Valentina Pérez                                        |
| **Fecha**:         | 2024-08-08                                             |

## 2. Código Fuente

```javascript
/**
 * Calcula el descuento aplicable a un carrito de compras basado en el subtotal
 * @param {Object} cart - El carrito de compras con items
 * @returns {number} - El monto de descuento calculado
 */
function calculateCartDiscount(cart) {
  // Verificar si el carrito existe
  if (!cart) {
    return 0;
  }
  
  // Verificar si hay items en el carrito
  if (!cart.items || cart.items.length === 0) {
    return 0;
  }
  
  // Calcular el subtotal sumando el precio de cada item multiplicado por su cantidad
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Determinar la tasa de descuento basada en el subtotal
  let discountRate = 0;
  
  if (subtotal >= 15000) {
    discountRate = 0.10; // 10% de descuento
  } else if (subtotal >= 10000) {
    discountRate = 0.07; // 7% de descuento
  } else if (subtotal >= 5000) {
    discountRate = 0.05; // 5% de descuento
  }
  
  // Calcular el monto del descuento
  const discountAmount = subtotal * discountRate;
  
  // Redondear a 2 decimales y retornar
  return Math.round(discountAmount * 100) / 100;
}
```

## 3. Diagrama de Flujo

![Diagrama de Flujo PCB-A-15](../diagramas/PCB-A-15.png)

## 4. Complejidad Ciclomática

### 4.1 Cálculo

**Nodos Predicado (P):**
- P1: `if (!cart)`
- P2: `if (!cart.items || cart.items.length === 0)`
- P3: `if (subtotal >= 15000)`
- P4: `else if (subtotal >= 10000)`
- P5: `else if (subtotal >= 5000)`

Complejidad ciclomática (CC) = P + 1 = 5 + 1 = 6

Se han identificado 6 caminos independientes.

## 5. Determinación de Caminos Independientes

| Camino | Descripción | Secuencia de Nodos |
|--------|-------------|-------------------|
| 1 | Carrito no existe | Inicio → P1(true) → Retornar 0 → Fin |
| 2 | Carrito sin items | Inicio → P1(false) → P2(true) → Retornar 0 → Fin |
| 3 | Subtotal ≥ 15000 | Inicio → P1(false) → P2(false) → Calcular subtotal → P3(true) → Establecer tasa 10% → Calcular descuento → Redondear → Retornar → Fin |
| 4 | Subtotal ≥ 10000 y < 15000 | Inicio → P1(false) → P2(false) → Calcular subtotal → P3(false) → P4(true) → Establecer tasa 7% → Calcular descuento → Redondear → Retornar → Fin |
| 5 | Subtotal ≥ 5000 y < 10000 | Inicio → P1(false) → P2(false) → Calcular subtotal → P3(false) → P4(false) → P5(true) → Establecer tasa 5% → Calcular descuento → Redondear → Retornar → Fin |
| 6 | Subtotal < 5000 | Inicio → P1(false) → P2(false) → Calcular subtotal → P3(false) → P4(false) → P5(false) → Establecer tasa 0% → Calcular descuento → Redondear → Retornar → Fin |

## 6. Casos de Prueba Derivados

| ID | Descripción | Entradas | Resultado Esperado |
|----|-------------|----------|-------------------|
| CP-1 | Carrito nulo | `cart = null` | 0 |
| CP-2 | Carrito sin items | `cart = { items: [] }` | 0 |
| CP-3 | Subtotal ≥ 15000 | `cart = { items: [{ price: 10000, quantity: 2 }] }` | 2000 (10% de 20000) |
| CP-4 | Subtotal ≥ 10000 y < 15000 | `cart = { items: [{ price: 5000, quantity: 2 }] }` | 700 (7% de 10000) |
| CP-5 | Subtotal ≥ 5000 y < 10000 | `cart = { items: [{ price: 3000, quantity: 2 }] }` | 300 (5% de 6000) |
| CP-6 | Subtotal < 5000 | `cart = { items: [{ price: 1000, quantity: 3 }] }` | 0 (0% de 3000) |
| CP-7 | Múltiples items en carrito | `cart = { items: [{ price: 5000, quantity: 2 }, { price: 3000, quantity: 1 }] }` | 650 (5% de 13000) |

## 7. Resultados

| ID | Resultado | Observaciones |
|----|-----------|--------------|
| CP-1 | ✅ Pasó | Se devolvió 0 cuando el carrito es nulo |
| CP-2 | ✅ Pasó | Se devolvió 0 cuando el carrito no tiene items |
| CP-3 | ✅ Pasó | Se aplicó correctamente el 10% de descuento (2000) |
| CP-4 | ✅ Pasó | Se aplicó correctamente el 7% de descuento (700) |
| CP-5 | ✅ Pasó | Se aplicó correctamente el 5% de descuento (300) |
| CP-6 | ✅ Pasó | No se aplicó descuento (0) |
| CP-7 | ✅ Pasó | Se calculó correctamente el descuento con múltiples items |

## 8. Herramienta de Prueba

La herramienta utilizada para la prueba automatizada es Jest.

## 9. Script de Prueba Automatizada

```javascript
const { calculateCartDiscount } = require('../src/checkout/discounts');

describe('calculateCartDiscount', () => {
  // Caso 1: Carrito nulo
  test('debería retornar 0 para un carrito nulo', () => {
    expect(calculateCartDiscount(null)).toBe(0);
  });

  // Caso 2: Carrito sin items
  test('debería retornar 0 para un carrito sin items', () => {
    expect(calculateCartDiscount({ items: [] })).toBe(0);
  });

  // Caso 3: Subtotal ≥ 15000
  test('debería aplicar 10% de descuento para subtotal ≥ 15000', () => {
    const cart = {
      items: [{ price: 10000, quantity: 2 }]
    };
    expect(calculateCartDiscount(cart)).toBe(2000);
  });

  // Caso 4: Subtotal ≥ 10000 y < 15000
  test('debería aplicar 7% de descuento para subtotal ≥ 10000 y < 15000', () => {
    const cart = {
      items: [{ price: 5000, quantity: 2 }]
    };
    expect(calculateCartDiscount(cart)).toBe(700);
  });

  // Caso 5: Subtotal ≥ 5000 y < 10000
  test('debería aplicar 5% de descuento para subtotal ≥ 5000 y < 10000', () => {
    const cart = {
      items: [{ price: 3000, quantity: 2 }]
    };
    expect(calculateCartDiscount(cart)).toBe(300);
  });

  // Caso 6: Subtotal < 5000
  test('no debería aplicar descuento para subtotal < 5000', () => {
    const cart = {
      items: [{ price: 1000, quantity: 3 }]
    };
    expect(calculateCartDiscount(cart)).toBe(0);
  });

  // Caso 7: Múltiples items en carrito
  test('debería calcular el descuento correctamente con múltiples items', () => {
    const cart = {
      items: [
        { price: 5000, quantity: 2 },
        { price: 3000, quantity: 1 }
      ]
    };
    expect(calculateCartDiscount(cart)).toBe(650);
  });
});
```
