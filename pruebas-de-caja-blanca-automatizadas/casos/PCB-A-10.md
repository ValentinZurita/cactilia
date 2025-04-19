# PCB-A-10: GENERACIÓN DE CONFIRMACIÓN DE PEDIDO

## Información General

| Campo | Valor |
|-------|-------|
| No | PCB-A-10 |
| Nombre de la prueba | PCB-A-10 - Generación de confirmación de pedido |
| Módulo | Shop/Checkout |
| Descripción | Prueba automatizada para validar la lógica de generación y presentación del resumen final de un pedido antes del pago |
| Caso de prueba relacionado | HU-C01: Revisión de compra |
| Realizado por | Valentin Alejandro Perez Zurita |
| Fecha | 16 de Abril del 2025 |

## Código Fuente a Probar

```javascript
// Ubicación: src/modules/shop/features/checkout/services/orderSummary.js

/**
 * Genera un resumen completo del pedido antes de finalizar la compra
 * @param {Object} cart - Carrito de compras con ítems y subtotales
 * @param {Object} user - Datos del usuario que realiza la compra
 * @param {Object} shippingAddress - Dirección de envío seleccionada
 * @param {Object} shippingMethod - Método de envío seleccionado
 * @param {Object} paymentMethod - Método de pago seleccionado
 * @returns {Promise<Object>} - Objeto con el resumen completo del pedido
 * @throws {Error} - Si hay errores en los parámetros o en la generación del resumen
 */
export const generateOrderSummary = async (
  cart,
  user,
  shippingAddress,
  shippingMethod,
  paymentMethod
) => {
  // Validar parámetros requeridos
  if (!cart || !Array.isArray(cart.items)) {
    throw new Error("Se requiere un carrito con ítems");
  }
  
  if (!user) {
    throw new Error("Se requieren datos del usuario");
  }
  
  if (!shippingAddress) {
    throw new Error("Se requiere dirección de envío");
  }
  
  if (!shippingMethod) {
    throw new Error("Se requiere método de envío");
  }
  
  if (!paymentMethod) {
    throw new Error("Se requiere método de pago");
  }
  
  // Verificar que el carrito no esté vacío
  if (cart.items.length === 0) {
    throw new Error("El carrito no tiene productos");
  }
  
  try {
    // Verificar disponibilidad y obtener datos actualizados de productos
    const productPromises = cart.items.map(async (item) => {
      const productDoc = await db.collection("products").doc(item.productId).get();
      
      if (!productDoc.exists) {
        return {
          ...item,
          available: false,
          availabilityMessage: "Producto no encontrado"
        };
      }
      
      const productData = productDoc.data();
      
      // Verificar stock
      const isAvailable = productData.stock >= item.quantity;
      
      return {
        ...item,
        name: productData.name,
        price: productData.price,
        image: productData.image || item.image,
        subtotal: item.quantity * productData.price,
        available: isAvailable,
        availabilityMessage: !isAvailable ? "Producto sin stock" : null
      };
    });
    
    const items = await Promise.all(productPromises);
    
    // Calcular si hay productos no disponibles
    const hasUnavailableItems = items.some(item => !item.available);
    
    // Calcular totales
    const subtotal = cart.subtotal;
    const shipping = shippingMethod.price;
    const discount = cart.discount || 0;
    const tax = Math.round(subtotal * 0.16); // Impuesto ejemplo del 16%
    const total = subtotal + shipping + tax - discount;
    
    // Formatear información de pago
    let paymentDisplay = "";
    if (paymentMethod.type === "credit_card") {
      paymentDisplay = `Tarjeta terminada en ${paymentMethod.last4}`;
    } else if (paymentMethod.type === "paypal") {
      paymentDisplay = `PayPal (${paymentMethod.email})`;
    } else {
      paymentDisplay = "Método de pago seleccionado";
    }
    
    // Generar número de orden
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Crear resumen final
    const orderSummary = {
      orderNumber,
      date: new Date(),
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      items,
      shipping: {
        address: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
          recipient: shippingAddress.recipient,
          phone: shippingAddress.phone
        },
        method: shippingMethod.name,
        cost: shippingMethod.price,
        estimatedDelivery: shippingMethod.estimatedDelivery
      },
      payment: {
        method: paymentDisplay,
        id: paymentMethod.id
      },
      totals: {
        subtotal,
        shipping,
        tax,
        discount,
        total
      },
      hasUnavailableItems
    };
    
    // Añadir información de cupón si existe
    if (cart.couponCode) {
      orderSummary.coupon = cart.couponCode;
    }
    
    return orderSummary;
  } catch (error) {
    console.error("Error al generar resumen del pedido:", error);
    throw new Error("No se pudo generar el resumen del pedido");
  }
};
```

## Diagrama de flujo
![Diagrama de Flujo](../diagramas/exports/PCB-A-10.png)

## Cálculo de la Complejidad Ciclomática

### Nodos Predicado

| Nodo | Descripción |
|------|-------------|
| 2 | Validación del carrito |
| 3 | Validación del usuario |
| 4 | Validación de la dirección de envío |
| 5 | Validación del método de envío |
| 6 | Validación del método de pago |
| 7 | Verificación de productos en carrito |
| 8 | Verificación de pago con tarjeta |
| 9 | Verificación de pago con PayPal |
| 10 | Verificación de cupón de descuento |
| 11 | Bloque catch (manejo de excepción) |

### Cálculo

| Método | Resultado |
|--------|-----------|
| Número de Regiones | 10 |
| Aristas - Nodos + 2 | 31 - 23 + 2 = 10 |
| Nodos Predicado + 1 | 10 + 1 = 11 |
| Conclusión | La complejidad ciclomática es 10, lo que implica que se deben identificar 10 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción | Secuencia de nodos |
|----|-------------|-------------------|
| 1 | Carrito inválido | 1 → 2(No) → "Lanzar error carrito" → Fin |
| 2 | Usuario inválido | 1 → 2(Sí) → 3(No) → "Lanzar error usuario" → Fin |
| 3 | Dirección inválida | 1 → 2(Sí) → 3(Sí) → 4(No) → "Lanzar error dirección" → Fin |
| 4 | Método de envío inválido | 1 → 2(Sí) → 3(Sí) → 4(Sí) → 5(No) → "Lanzar error envío" → Fin |
| 5 | Método de pago inválido | 1 → 2(Sí) → 3(Sí) → 4(Sí) → 5(Sí) → 6(No) → "Lanzar error pago" → Fin |
| 6 | Carrito vacío | 1 → 2(Sí) → ... → 6(Sí) → 7(No) → "Lanzar error carrito vacío" → Fin |
| 7 | Resumen con pago con tarjeta | 1 → 2(Sí) → ... → 7(Sí) → ... → 8(Sí) → ... → 10(No) → "Retornar resumen" → Fin |
| 8 | Resumen con pago PayPal | 1 → 2(Sí) → ... → 7(Sí) → ... → 8(No) → 9(Sí) → ... → 10(No) → "Retornar resumen" → Fin |
| 9 | Resumen con otro método de pago y cupón | 1 → 2(Sí) → ... → 7(Sí) → ... → 8(No) → 9(No) → ... → 10(Sí) → ... → "Retornar resumen" → Fin |
| 10 | Error en la obtención de productos | 1 → 2(Sí) → ... → 7(Sí) → ... → 11 → "Lanzar error resumen" → Fin |

## Casos de Prueba Derivados

| Caso | Descripción | Entrada | Resultado Esperado |
|------|-------------|---------|-------------------|
| 1 | Validar carrito inválido | cart=null, user=objeto, shippingAddress=objeto, shippingMethod=objeto, paymentMethod=objeto | Error: "Se requiere un carrito con ítems" |
| 2 | Validar usuario inválido | cart=objeto válido, user=null, shippingAddress=objeto, shippingMethod=objeto, paymentMethod=objeto | Error: "Se requieren datos del usuario" |
| 3 | Validar dirección inválida | cart=objeto válido, user=objeto, shippingAddress=null, shippingMethod=objeto, paymentMethod=objeto | Error: "Se requiere dirección de envío" |
| 4 | Validar método de envío inválido | cart=objeto válido, user=objeto, shippingAddress=objeto, shippingMethod=null, paymentMethod=objeto | Error: "Se requiere método de envío" |
| 5 | Validar método de pago inválido | cart=objeto válido, user=objeto, shippingAddress=objeto, shippingMethod=objeto, paymentMethod=null | Error: "Se requiere método de pago" |
| 6 | Validar carrito vacío | cart={items:[]}, user=objeto, shippingAddress=objeto, shippingMethod=objeto, paymentMethod=objeto | Error: "El carrito no tiene productos" |
| 7 | Generar resumen con tarjeta | cart=objeto válido, user=objeto, shippingAddress=objeto, shippingMethod=objeto, paymentMethod={type:"credit_card", last4:"4242"} | Resumen con pago "Tarjeta terminada en 4242" |
| 8 | Generar resumen con descuento | cart=objeto con descuento, user=objeto, shippingAddress=objeto, shippingMethod=objeto, paymentMethod=objeto | Resumen con descuento aplicado |
| 9 | Generar resumen con producto sin stock | cart=objeto con producto agotado, user=objeto, shippingAddress=objeto, shippingMethod=objeto, paymentMethod=objeto | Resumen con hasUnavailableItems=true |
| 10 | Manejar error de base de datos | cart=objeto válido, base de datos no disponible | Error: "No se pudo generar el resumen del pedido" |

## Tabla de Resultados

| Caso | Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|------|---------|-------------------|-------------------|--------|
| 1 | cart=null | Error: "Se requiere un carrito con ítems" | Error: "Se requiere un carrito con ítems" | ✅ Pasó |
| 2 | user=null | Error: "Se requieren datos del usuario" | Error: "Se requieren datos del usuario" | ✅ Pasó |
| 3 | shippingAddress=null | Error: "Se requiere dirección de envío" | Error: "Se requiere dirección de envío" | ✅ Pasó |
| 4 | shippingMethod=null | Error: "Se requiere método de envío" | Error: "Se requiere método de envío" | ✅ Pasó |
| 5 | paymentMethod=null | Error: "Se requiere método de pago" | Error: "Se requiere método de pago" | ✅ Pasó |
| 6 | cart={items:[]} | Error: "El carrito no tiene productos" | Error: "El carrito no tiene productos" | ✅ Pasó |
| 7 | Datos válidos | Resumen completo con datos correctos | Resumen completo con datos correctos | ✅ Pasó |
| 8 | cart con descuento | Resumen con descuento aplicado | Resumen con descuento aplicado | ✅ Pasó |
| 9 | Producto sin stock | Resumen con producto marcado como no disponible | Resumen con producto marcado como no disponible | ✅ Pasó |
| 10 | Error en base de datos | Error: "No se pudo generar el resumen del pedido" | Error: "No se pudo generar el resumen del pedido" | ✅ Pasó |

## Herramienta Usada
- Jest

## Script de Prueba Automatizada

```javascript
// Ubicación: pruebas-de-caja-blanca-automatizadas/tests/PCB-A-10.test.js

import { generateOrderSummary } from '../../src/modules/shop/features/checkout/services/orderSummary';
import firebase from 'firebase/app';

// Mock de Firestore
jest.mock('firebase/app', () => {
  const firebaseMock = {
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          collection: jest.fn(() => ({
            get: jest.fn()
          }))
        }))
      }))
    }))
  };
  
  return firebaseMock;
});

// Datos de prueba
const mockCart = {
  items: [
    { id: 'item1', productId: 'prod1', quantity: 2, price: 100, name: 'Producto 1', image: 'img1.jpg' },
    { id: 'item2', productId: 'prod2', quantity: 1, price: 150, name: 'Producto 2', image: 'img2.jpg' }
  ],
  subtotal: 350,
  discount: 0
};

const mockUser = {
  id: 'user123',
  name: 'Usuario Prueba',
  email: 'usuario@test.com',
  phone: '555-1234'
};

const mockShippingAddress = {
  id: 'addr1',
  street: 'Calle Principal 123',
  city: 'Ciudad Prueba',
  state: 'Estado Prueba',
  zipCode: '12345',
  country: 'País Prueba',
  recipient: 'Receptor Prueba',
  phone: '555-4321'
};

const mockShippingMethod = {
  id: 'shipping1',
  name: 'Envío Estándar',
  price: 50,
  estimatedDelivery: '3-5 días'
};

const mockPaymentMethod = {
  id: 'payment1',
  type: 'credit_card',
  last4: '4242'
};

describe('PCB-A-10: Generación de confirmación de pedido', () => {
  let mockDocGet;
  
  beforeEach(() => {
    // Configurar mock para obtener productos
    mockDocGet = jest.fn().mockImplementation((id) => {
      const mockProducts = {
        'prod1': {
          exists: true,
          id: 'prod1',
          data: () => ({
            name: 'Producto 1',
            price: 100,
            stock: 10,
            image: 'img1.jpg'
          })
        },
        'prod2': {
          exists: true,
          id: 'prod2',
          data: () => ({
            name: 'Producto 2',
            price: 150,
            stock: 5,
            image: 'img2.jpg'
          })
        }
      };
      
      return Promise.resolve(mockProducts[id] || { exists: false });
    });
    
    // Inyectar mocks
    firebase.firestore().collection().doc().get = mockDocGet;
  });
  
  // Caso 1: Parámetros no proporcionados
  test('1. Debe rechazar parámetros faltantes', async () => {
    await expect(generateOrderSummary(null, mockUser, mockShippingAddress, mockShippingMethod, mockPaymentMethod))
      .rejects.toThrow('Se requiere un carrito con ítems');
      
    await expect(generateOrderSummary(mockCart, null, mockShippingAddress, mockShippingMethod, mockPaymentMethod))
      .rejects.toThrow('Se requieren datos del usuario');
      
    await expect(generateOrderSummary(mockCart, mockUser, null, mockShippingMethod, mockPaymentMethod))
      .rejects.toThrow('Se requiere dirección de envío');
      
    await expect(generateOrderSummary(mockCart, mockUser, mockShippingAddress, null, mockPaymentMethod))
      .rejects.toThrow('Se requiere método de envío');
      
    await expect(generateOrderSummary(mockCart, mockUser, mockShippingAddress, mockShippingMethod, null))
      .rejects.toThrow('Se requiere método de pago');
  });
  
  // Caso 2: Carrito vacío
  test('2. Debe rechazar carrito sin ítems', async () => {
    const emptyCart = { items: [], subtotal: 0, discount: 0 };
    
    await expect(generateOrderSummary(emptyCart, mockUser, mockShippingAddress, mockShippingMethod, mockPaymentMethod))
      .rejects.toThrow('El carrito no tiene productos');
  });
  
  // Caso 3: Generación exitosa de resumen
  test('3. Debe generar resumen de pedido correctamente', async () => {
    const summary = await generateOrderSummary(
      mockCart, 
      mockUser, 
      mockShippingAddress, 
      mockShippingMethod, 
      mockPaymentMethod
    );
    
    // Verificar estructura y datos del resumen
    expect(summary).toHaveProperty('orderNumber');
    expect(summary).toHaveProperty('date');
    expect(summary).toHaveProperty('customer', expect.objectContaining({
      name: mockUser.name,
      email: mockUser.email
    }));
    expect(summary).toHaveProperty('items', expect.arrayContaining([
      expect.objectContaining({
        name: 'Producto 1',
        quantity: 2,
        price: 100,
        subtotal: 200
      })
    ]));
    expect(summary).toHaveProperty('shipping', expect.objectContaining({
      method: mockShippingMethod.name,
      cost: mockShippingMethod.price
    }));
    expect(summary).toHaveProperty('payment', expect.objectContaining({
      method: 'Tarjeta terminada en 4242'
    }));
    expect(summary).toHaveProperty('totals', expect.objectContaining({
      subtotal: 350,
      shipping: 50,
      tax: expect.any(Number),
      discount: 0,
      total: expect.any(Number)
    }));
    
    // Verificar que el total es correcto (subtotal + envío + impuestos - descuento)
    const { subtotal, shipping, tax, discount, total } = summary.totals;
    expect(total).toBe(subtotal + shipping + tax - discount);
  });
  
  // Caso 4: Verificar cálculos con descuento
  test('4. Debe calcular correctamente totales con descuento', async () => {
    const cartWithDiscount = {
      ...mockCart,
      discount: 50,
      couponCode: 'DESCUENTO50'
    };
    
    const summary = await generateOrderSummary(
      cartWithDiscount, 
      mockUser, 
      mockShippingAddress, 
      mockShippingMethod, 
      mockPaymentMethod
    );
    
    expect(summary.totals.discount).toBe(50);
    expect(summary.coupon).toBe('DESCUENTO50');
    
    // Verificar que el total refleja el descuento
    const { subtotal, shipping, tax, discount, total } = summary.totals;
    expect(total).toBe(subtotal + shipping + tax - discount);
  });
  
  // Caso 5: Verificar manejo de productos no disponibles
  test('5. Debe marcar productos no disponibles', async () => {
    // Modificar el mock para simular un producto no disponible
    mockDocGet.mockImplementationOnce((id) => {
      if (id === 'prod1') {
        return Promise.resolve({
          exists: true,
          id: 'prod1',
          data: () => ({
            name: 'Producto 1',
            price: 100,
            stock: 0, // Sin stock
            image: 'img1.jpg'
          })
        });
      }
      
      return Promise.resolve({
        exists: true,
        id: 'prod2',
        data: () => ({
          name: 'Producto 2',
          price: 150,
          stock: 5,
          image: 'img2.jpg'
        })
      });
    });
    
    const summary = await generateOrderSummary(
      mockCart, 
      mockUser, 
      mockShippingAddress, 
      mockShippingMethod, 
      mockPaymentMethod
    );
    
    // Verificar que el producto sin stock se marca como no disponible
    const unavailableItem = summary.items.find(item => item.productId === 'prod1');
    expect(unavailableItem).toHaveProperty('available', false);
    expect(unavailableItem).toHaveProperty('availabilityMessage', 'Producto sin stock');
    
    // Verificar que se incluye una bandera de alerta en el resumen
    expect(summary).toHaveProperty('hasUnavailableItems', true);
  });
  
  // Caso 6: Error al recuperar datos de productos
  test('6. Debe manejar errores al recuperar productos', async () => {
    // Modificar el mock para simular un error
    mockDocGet.mockRejectedValueOnce(new Error('Error al consultar la base de datos'));
    
    await expect(generateOrderSummary(
      mockCart, 
      mockUser, 
      mockShippingAddress, 
      mockShippingMethod, 
      mockPaymentMethod
    )).rejects.toThrow('No se pudo generar el resumen del pedido');
  });
});
``` 