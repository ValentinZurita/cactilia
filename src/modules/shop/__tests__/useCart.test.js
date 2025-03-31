import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { cartReducer } from '../features/cart/store/index.js'
import { authSlice } from '../../../store/auth/authSlice.js'
import { useCart } from '../features/cart/hooks/index.js'


// Mock de los hooks internos
jest.mock('../useCartOperations', () => ({
  useCartOperations: jest.fn(() => ({
    addToCart: jest.fn(async (product) => ({ success: true })),
    removeFromCart: jest.fn((id) => {}),
    increaseQuantity: jest.fn(async (id) => ({ success: true })),
    decreaseQuantity: jest.fn((id) => ({ success: true })),
    isInCart: jest.fn((id) => true),
    getItem: jest.fn((id) => ({ id, name: 'Test Product', price: 100, quantity: 2 }))
  }))
}));

jest.mock('../useCartValidation', () => ({
  useCartValidation: jest.fn(() => ({
    outOfStockItems: [],
    insufficientStockItems: [],
    hasOutOfStockItems: false,
    hasStockIssues: false,
    isValidatingStock: false,
    forceStockValidation: jest.fn(async () => ({ valid: true })),
    validateCheckout: jest.fn(async () => ({ valid: true }))
  }))
}));

jest.mock('../useCartTotals', () => ({
  useCartTotals: jest.fn(() => ({
    subtotal: 200,
    taxes: 32,
    shipping: 50,
    total: 200,
    finalTotal: 250,
    isFreeShipping: false
  }))
}));

// Funciones helper para tests
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authSlice.reducer
    },
    preloadedState: {
      cart: {
        items: [
          { id: '1', name: 'Product 1', price: 100, quantity: 2, stock: 10 }
        ],
        ...initialState.cart
      },
      auth: {
        uid: 'test-user',
        ...initialState.auth
      }
    }
  });
};

const wrapper = ({ children }) => (
  <Provider store={createTestStore()}>
    {children}
  </Provider>
);

describe('useCart Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return cart items and operations', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.itemsCount).toBe(2);
    expect(result.current.subtotal).toBe(200);
    expect(result.current.taxes).toBe(32);
    expect(result.current.shipping).toBe(50);
    expect(result.current.finalTotal).toBe(250);
    expect(result.current.isFreeShipping).toBe(false);

    // Verificar que existan todas las operaciones
    expect(typeof result.current.addToCart).toBe('function');
    expect(typeof result.current.removeFromCart).toBe('function');
    expect(typeof result.current.increaseQuantity).toBe('function');
    expect(typeof result.current.decreaseQuantity).toBe('function');
    expect(typeof result.current.clearCart).toBe('function');
    expect(typeof result.current.isInCart).toBe('function');
    expect(typeof result.current.getItem).toBe('function');

    // Verificar funciones de validación
    expect(typeof result.current.validateCheckout).toBe('function');
    expect(typeof result.current.forceStockValidation).toBe('function');
    expect(result.current.hasStockIssues).toBe(false);
  });

  test('should be able to interact with cart', async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    // Añadir al carrito
    let response;
    await act(async () => {
      response = await result.current.addToCart({ id: '2', name: 'New Product', price: 50 });
    });
    expect(response.success).toBe(true);

    // Verificar si un producto está en el carrito
    const inCart = result.current.isInCart('1');
    expect(inCart).toBe(true);

    // Obtener un producto del carrito
    const item = result.current.getItem('1');
    expect(item.name).toBe('Test Product');

    // Incrementar cantidad
    await act(async () => {
      response = await result.current.increaseQuantity('1');
    });
    expect(response.success).toBe(true);

    // Validar checkout
    await act(async () => {
      response = await result.current.validateCheckout();
    });
    expect(response.valid).toBe(true);
  });
});