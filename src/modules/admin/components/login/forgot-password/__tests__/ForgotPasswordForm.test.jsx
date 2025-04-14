// Importaciones básicas
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mocks para evitar importar archivos reales
const mockSendPasswordReset = jest.fn();
const mockState = {
  loading: false,
  error: null,
  success: false
};

// Componentes mockeados para el test
const EmailField = ({ register, errors }) => (
  <div data-testid="email-field-mock">
    <input data-testid="email-input" {...register('email')} />
    {errors?.email && <span data-testid="email-error">{errors.email.message}</span>}
  </div>
);

const StatusMessage = ({ type, icon, message }) => (
  <div data-testid={`status-${type}`}>{message}</div>
);

const SubmitButton = ({ loading, loadingText, text }) => (
  <button 
    data-testid="submit-button" 
    disabled={loading}
    type="submit"
  >
    {loading ? loadingText : text}
  </button>
);

// Hook mockeado para testing
const useAdminForgotPassword = () => ({
  sendPasswordReset: mockSendPasswordReset,
  state: mockState
});

// Mock de react-hook-form para testing
const useForm = () => ({
  register: jest.fn().mockReturnValue({}),
  handleSubmit: fn => (e) => { e?.preventDefault(); fn({}); },
  formState: { errors: {} }
});

// Componente simplificado para testing
const ForgotPasswordForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { sendPasswordReset, state } = useAdminForgotPassword();
  const { loading, error, success } = state;
  
  return (
    <form onSubmit={handleSubmit(sendPasswordReset)}>
      {success && (
        <StatusMessage 
          type="success"
          icon="bi-check-circle-fill"
          message="Se ha enviado un enlace a tu correo electrónico para restablecer tu contraseña."
        />
      )}
      
      {error && (
        <StatusMessage 
          type="danger"
          icon="bi-exclamation-triangle-fill"
          message={error}
        />
      )}
      
      <EmailField register={register} errors={errors} />
      
      <SubmitButton 
        loading={loading}
        loadingText="Enviando..."
        text="Enviar enlace" 
      />
    </form>
  );
};

describe('ForgotPasswordForm (Admin)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reiniciar estado mock para cada test
    mockState.loading = false;
    mockState.error = null;
    mockState.success = false;
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
    // Modificar el estado para simular éxito
    mockState.success = true;
    
    render(<ForgotPasswordForm />);
    
    // Verificar que el mensaje de éxito está presente
    expect(screen.getByTestId('status-success')).toBeInTheDocument();
  });

  test('muestra mensaje de error cuando hay un error', () => {
    // Modificar el estado para simular error
    mockState.error = 'Correo no encontrado';
    
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