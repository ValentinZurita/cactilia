import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '../ForgotPasswordForm';
import { useForgotPassword } from '../../../hooks/useForgotPassword';
import { BrowserRouter } from 'react-router-dom';

// Mock del hook useForgotPassword
jest.mock('../../../hooks/useForgotPassword');

// Mock de componentes hijos
jest.mock('../EmailField', () => ({
  EmailField: ({ register, errors }) => (
    <div data-testid="email-field-mock">
      <input
        data-testid="email-input"
        {...register('email')}
      />
      {errors && errors.message && <span>{errors.message}</span>}
    </div>
  )
}));

jest.mock('../StatusMessage', () => ({
  StatusMessage: ({ type, icon, message }) => (
    <div data-testid={`status-message-${type}`}>
      {message}
    </div>
  )
}));

jest.mock('../SubmitButton', () => ({
  SubmitButton: ({ loading, text }) => (
    <button data-testid="submit-button" disabled={loading}>
      {loading ? 'Enviando...' : text}
    </button>
  )
}));

// Envolver el componente con Router por el uso de Link
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ForgotPasswordForm', () => {
  // Estado por defecto para el mock del hook
  const defaultState = {
    loading: false,
    error: null,
    success: false
  };

  // Reset de mocks antes de cada prueba
  beforeEach(() => {
    useForgotPassword.mockReset();
    
    // Mock por defecto
    const mockSendPasswordReset = jest.fn();
    useForgotPassword.mockReturnValue({
      sendPasswordReset: mockSendPasswordReset,
      state: defaultState
    });
  });

  test('debe renderizar el formulario correctamente en estado inicial', () => {
    renderWithRouter(<ForgotPasswordForm />);
    
    // Verificar elementos básicos del formulario
    expect(screen.getByTestId('email-field-mock')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
    
    // No debería mostrar mensajes de estado al inicio
    expect(screen.queryByTestId('status-message-success')).not.toBeInTheDocument();
    expect(screen.queryByTestId('status-message-danger')).not.toBeInTheDocument();
  });

  test('debe mostrar mensaje de éxito cuando el envío es exitoso', () => {
    // Mock de estado de éxito
    useForgotPassword.mockReturnValue({
      sendPasswordReset: jest.fn(),
      state: {
        loading: false,
        error: null,
        success: true
      }
    });
    
    renderWithRouter(<ForgotPasswordForm />);
    
    // Verificar mensaje de éxito visible
    expect(screen.getByTestId('status-message-success')).toBeInTheDocument();
  });

  test('debe mostrar mensaje de error cuando hay un error', () => {
    // Mock de estado de error
    useForgotPassword.mockReturnValue({
      sendPasswordReset: jest.fn(),
      state: {
        loading: false,
        error: 'Error de prueba',
        success: false
      }
    });
    
    renderWithRouter(<ForgotPasswordForm />);
    
    // Verificar mensaje de error visible
    expect(screen.getByTestId('status-message-danger')).toBeInTheDocument();
    expect(screen.getByText('Error de prueba')).toBeInTheDocument();
  });

  test('debe llamar a sendPasswordReset al enviar el formulario', async () => {
    const mockSendPasswordReset = jest.fn();
    useForgotPassword.mockReturnValue({
      sendPasswordReset: mockSendPasswordReset,
      state: defaultState
    });
    
    renderWithRouter(<ForgotPasswordForm />);
    
    // Simular envío del formulario
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    // Verificar que se llamó a la función
    await waitFor(() => {
      expect(mockSendPasswordReset).toHaveBeenCalled();
    });
  });

  test('debe deshabilitar el botón durante el estado de carga', () => {
    // Mock de estado de carga
    useForgotPassword.mockReturnValue({
      sendPasswordReset: jest.fn(),
      state: {
        loading: true,
        error: null,
        success: false
      }
    });
    
    renderWithRouter(<ForgotPasswordForm />);
    
    // Verificar botón deshabilitado
    const button = screen.getByTestId('submit-button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Enviando...');
  });

  test('debe mostrar el enlace para volver al login', () => {
    renderWithRouter(<ForgotPasswordForm />);
    
    const backLink = screen.getByText('Volver al inicio de sesión');
    expect(backLink).toBeInTheDocument();
    expect(backLink.getAttribute('href')).toBe('/auth/login');
  });
}); 