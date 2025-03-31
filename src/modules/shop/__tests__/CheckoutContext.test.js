import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutProvider, useCheckoutContext } from '../context/CheckoutContext.jsx';
import { configureStore } from '@reduxjs/toolkit';
import { processPayment } from '../features/checkout/services/index.js';
import { cartReducer } from '../features/cart/store/index.js'
import { authSlice } from '../../../store/auth/authSlice.js'

// Mock de Stripe para pruebas
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    elements: jest.fn(() => ({})),
    createPaymentMethod: jest.fn(() => Promise.resolve({ paymentMethod: { id: 'pm_test' } }))
  }))
}));

// Mock de servicios
jest.mock('../../user/services/addressService', () => ({
  getUserAddresses: jest.fn(() => Promise.resolve({
    ok: true,
    data: [
      { id: 'addr1', name: 'Casa', street: 'Calle 1', city: 'Ciudad', state: 'Estado', zip: '12345', isDefault: true }
    ]
  }))
}));

jest.mock('../../user/services/paymentService', () => ({
  getUserPaymentMethods: jest.fn(() => Promise.resolve({
    ok: true,
    data: [
      { id: 'pay1', type: 'visa', cardNumber: '4242', stripePaymentMethodId: 'pm_123', isDefault: true }
    ]
  }))
}));

// Mock de servicios adicionales
jest.mock('../features/checkout/services/index.js', () => ({
  processPayment: jest.fn(() => Promise.resolve({
    ok: true,
    orderId: 'order123'
  }))
}));

jest.mock('../services/productServices.js', () => ({
  validateItemsStock: jest.fn(() => Promise.resolve({
    valid: true,
    outOfStockItems: []
  }))
}));

// Mock de hooks del carrito
jest.mock('../features/cart/hooks/useCart.js', () => ({
  useCart: jest.fn(() => ({
    items: [
      { id: 'prod1', name: 'Producto 1', price: 100, quantity: 2, stock: 10 }
    ],
    subtotal: 100,
    taxes: 16,
    shipping: 50,
    finalTotal: 166,
    validateCheckout: jest.fn(() => ({ valid: true })),
    forceStockValidation: jest.fn(() => Promise.resolve({ valid: true }))
  }))
}));

// Componente de prueba que usa el contexto
const CheckoutTest = () => {
  const checkout = useCheckoutContext();

  return (
    <div>
      <h2>Checkout Test</h2>

      <div data-testid="step">Step: {checkout.step}</div>

      <div data-testid="addresses">
        Addresses: {checkout.addresses.length}
      </div>

      <div data-testid="payment-methods">
        Payment Methods: {checkout.paymentMethods.length}
      </div>

      <div data-testid="selected-address">
        Selected Address: {checkout.selectedAddressType}
        {checkout.selectedAddress ? ` - ${checkout.selectedAddress.name}` : ''}
      </div>

      <div data-testid="selected-payment">
        Selected Payment: {checkout.selectedPaymentType}
        {checkout.selectedPayment ? ` - ${checkout.selectedPayment.type}` : ''}
      </div>

      <div data-testid="requires-invoice">
        Requires Invoice: {checkout.requiresInvoice ? 'Yes' : 'No'}
      </div>

      <button
        data-testid="invoice-toggle"
        onClick={() => checkout.handleInvoiceChange(!checkout.requiresInvoice)}
      >
        Toggle Invoice
      </button>

      <button
        data-testid="select-new-address"
        onClick={checkout.handleNewAddressSelect}
      >
        Use New Address
      </button>

      <button
        data-testid="select-oxxo"
        onClick={checkout.handleOxxoSelect}
      >
        Pay with OXXO
      </button>

      <button
        data-testid="process-order"
        onClick={checkout.handleProcessOrder}
      >
        Process Order
      </button>

      {checkout.error && (
        <div data-testid="error">Error: {checkout.error}</div>
      )}
    </div>
  );
};

// Tests del contexto
describe('CheckoutContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load addresses and payment methods on mount', async () => {
    render(<CheckoutTest />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('addresses').textContent).toBe('Addresses: 1');
      expect(screen.getByTestId('payment-methods').textContent).toBe('Payment Methods: 1');
    });
  });

  test('should handle invoice toggle', async () => {
    render(<CheckoutTest />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('requires-invoice').textContent).toBe('Requires Invoice: No');
    });

    fireEvent.click(screen.getByTestId('invoice-toggle'));

    expect(screen.getByTestId('requires-invoice').textContent).toBe('Requires Invoice: Yes');
  });

  test('should change to new address when selected', async () => {
    render(<CheckoutTest />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('selected-address').textContent).toContain('saved');
    });

    fireEvent.click(screen.getByTestId('select-new-address'));

    expect(screen.getByTestId('selected-address').textContent).toBe('Selected Address: new');
  });

  test('should change to OXXO payment when selected', async () => {
    render(<CheckoutTest />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('selected-payment').textContent).toContain('card');
    });

    fireEvent.click(screen.getByTestId('select-oxxo'));

    expect(screen.getByTestId('selected-payment').textContent).toBe('Selected Address: oxxo');
  });

  test('should process order successfully', async () => {
    render(<CheckoutTest />, { wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('step').textContent).toBe('Step: 1');
    });

    fireEvent.click(screen.getByTestId('process-order'));

    await waitFor(() => {
      expect(screen.getByTestId('step').textContent).toBe('Step: 2');
      expect(processPayment).toHaveBeenCalled();
    });
  });
});

// Configurar el store para las pruebas
const createTestStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authSlice.reducer
    },
    preloadedState: {
      auth: {
        status: 'authenticated',
        uid: 'user123'
      },
      cart: {
        items: [
          { id: 'prod1', name: 'Producto 1', price: 100, quantity: 2, stock: 10 }
        ]
      }
    }
  });
};

// Wrapper para el contexto
const wrapper = ({ children }) => {
  const store = createTestStore();
  const stripePromise = loadStripe('fake_key');

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Elements stripe={stripePromise}>
          <CheckoutProvider>
            {children}
          </CheckoutProvider>
        </Elements>
      </BrowserRouter>
    </Provider>
  );
};