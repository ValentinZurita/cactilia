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