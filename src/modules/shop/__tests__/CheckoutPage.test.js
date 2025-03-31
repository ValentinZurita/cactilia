import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../../../store/auth/authSlice.js'
import { cartReducer } from '../features/cart/store/index.js'
import { CheckoutPage } from '../pages/index.js'


// Mock de useStripeLoader
jest.mock('../../hooks/useStripeLoader', () => ({
  useStripeLoader: jest.fn(() => ({
    stripePromise: {},
    isLoading: false,
    error: null
  }))
}));

// Mock de useCart
jest.mock('../../features/cart/hooks/useCart', () => ({
  useCart: jest.fn(() => ({
    items: [{ id: 'test-product', name: 'Test Product', price: 100, quantity: 1 }],
    subtotal: 100,
    taxes: 16,
    shipping: 50,
    finalTotal: 166,
    isFreeShipping: false,
    hasStockIssues: false,
    isLoading: false
  }))
}));

// Mock de Elements y CheckoutProvider
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div data-testid="stripe-elements">{children}</div>,
  useStripe: () => ({}),
  useElements: () => ({})
}));

jest.mock('../../context/CheckoutContext', () => ({
  CheckoutProvider: ({ children }) => <div data-testid="checkout-provider">{children}</div>
}));

// Mock del componente principal de contenido
jest.mock('../../features/checkout/components/CheckoutContent', () => ({
  CheckoutContent: () => <div data-testid="checkout-content">Checkout Content</div>
}));

// Configurar store de Redux para pruebas
const createTestStore = (authStatus = 'authenticated') => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      cart: cartReducer
    },
    preloadedState: {
      auth: {
        status: authStatus,
        uid: authStatus === 'authenticated' ? 'test-user' : null
      },
      cart: {
        items: [
          { id: 'test-product', name: 'Test Product', price: 100, quantity: 1 }
        ]
      }
    }
  });
};

// Componente wrapper para pruebas
const renderWithProviders = (ui, { authStatus = 'authenticated' } = {}) => {
  const store = createTestStore(authStatus);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
};

describe('CheckoutPage', () => {
  test('redirige al login cuando el usuario no está autenticado', () => {
    const { container } = renderWithProviders(<CheckoutPage />, {
      authStatus: 'not-authenticated'
    });

    // No hay forma directa de probar la redirección en el entorno de pruebas
    // pero podemos verificar que el contenido no se renderizó
    expect(container.innerHTML).not.toContain('checkout-content');
  });

  test('muestra mensaje de carga cuando auth está en checking', () => {
    renderWithProviders(<CheckoutPage />, {
      authStatus: 'checking'
    });

    expect(screen.getByText(/verificando sesión/i)).toBeInTheDocument();
  });

  test('renderiza el contenido de checkout para usuarios autenticados', async () => {
    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('checkout-content')).toBeInTheDocument();
    });
  });

  test('renderiza los proveedores necesarios', async () => {
    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByTestId('app-elements')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-provider')).toBeInTheDocument();
    });
  });
});