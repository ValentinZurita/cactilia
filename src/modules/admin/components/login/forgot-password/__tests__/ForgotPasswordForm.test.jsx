import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '../ForgotPasswordForm';
import { useAdminForgotPassword } from '../../../../hooks/useAdminForgotPassword';

// Mock del hook personalizado
jest.mock('../../../../hooks/useAdminForgotPassword');

// Mock de componentes hijos para simplificar las pruebas
jest.mock('../EmailField', () => ({
  EmailField: ({ register, errors }) => (
    <div data-testid="email-field-mock">
      <input 
        data-testid="email-input" 
        {...register('email')} 
      />
      {errors?.email && <span data-testid="email-error">{errors.email.message}</span>}
    </div>
  )
}));

jest.mock('../StatusMessage', () => ({
  StatusMessage: ({ type, icon, message }) => (
    <div data-testid={`status-${type}`}>{message}</div>
  )
}));

jest.mock('../SubmitButton', () => ({
  SubmitButton: ({ loading, loadingText, text }) => (
    <button 
      data-testid="submit-button" 
      disabled={loading}
      type="submit"
    >
      {loading ? loadingText : text}
    </button>
  )
}));

describe('ForgotPasswordForm (Admin)', () => {
  // Setup de mocks básicos
  const mockSendPasswordReset = jest.fn();
  
  beforeEach(() => {
    // Restablecer todos los mocks
    jest.clearAllMocks();
    
    // Mock por defecto en estado inicial
    useAdminForgotPassword.mockReturnValue({
      sendPasswordReset: mockSendPasswordReset,
      state: {
        loading: false,
        error: null,
        success: false
      }
    });
  });

  test('renderiza el formulario en estado inicial', () => {
    render(<ForgotPasswordForm />);
    
    // Verificar que el campo de email está presente
    expect(screen.getByTestId('email-field-mock')).toBeInTheDocument();
    
    // Verificar que el botón de envío está presente
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    
    // Verificar que no hay mensajes de estado inicialmente
    expect(screen.queryByTestId('status-success')).not.toBeInTheDocument();
    expect(screen.queryByTestId('status-danger')).not.toBeInTheDocument();
  });

  test('muestra mensaje de éxito cuando la operación es exitosa', () => {
    // Mock del hook en estado de éxito
    useAdminForgotPassword.mockReturnValue({
      sendPasswordReset: mockSendPasswordReset,
      state: {
        loading: false,
        error: null,
        success: true
      }
    });
    
    render(<ForgotPasswordForm />);
    
    // Verificar que el mensaje de éxito está presente
    expect(screen.getByTestId('status-success')).toBeInTheDocument();
  });

  test('muestra mensaje de error cuando hay un error', () => {
    // Mock del hook en estado de error
    useAdminForgotPassword.mockReturnValue({
      sendPasswordReset: mockSendPasswordReset,
      state: {
        loading: false,
        error: 'Correo no encontrado',
        success: false
      }
    });
    
    render(<ForgotPasswordForm />);
    
    // Verificar que el mensaje de error está presente
    expect(screen.getByTestId('status-danger')).toBeInTheDocument();
    expect(screen.getByTestId('status-danger')).toHaveTextContent('Correo no encontrado');
  });

  test('llama a sendPasswordReset al enviar el formulario', async () => {
    render(<ForgotPasswordForm />);
    
    // Simular envío del formulario usando el botón de enviar
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    // Verificar que la función se llamó
    await waitFor(() => {
      expect(mockSendPasswordReset).toHaveBeenCalled();
    });
  });
}); 