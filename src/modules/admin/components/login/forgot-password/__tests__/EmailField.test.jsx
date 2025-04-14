import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmailField } from '../EmailField';

// Mock de InputField para simplificar la prueba
jest.mock('../../../../../shared/components', () => ({
  InputField: ({ label, type, placeholder, errors, ...props }) => (
    <div data-testid="input-field-mock">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} data-testid="email-input" {...props} />
      {errors && <span data-testid="error-message">{errors.message}</span>}
    </div>
  )
}));

describe('EmailField (Admin)', () => {
  // Mock de register y errors
  const mockRegister = jest.fn().mockReturnValue({
    name: 'email',
    onChange: jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn()
  });
  
  const mockErrors = {
    email: { message: 'Error de prueba' }
  };

  test('renderiza correctamente con las props necesarias', () => {
    render(
      <EmailField 
        register={mockRegister} 
        errors={{}} 
      />
    );
    
    // Verificar que el InputField se renderizó correctamente
    const inputField = screen.getByTestId('input-field-mock');
    expect(inputField).toBeInTheDocument();
    
    // Verificar que tiene la etiqueta correcta
    const label = screen.getByText('Correo Electrónico');
    expect(label).toBeInTheDocument();
    
    // Verificar el tipo y placeholder
    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Ingresa tu email de administrador');
  });

  test('muestra mensaje de error cuando hay errores', () => {
    render(
      <EmailField 
        register={mockRegister} 
        errors={mockErrors.email} 
      />
    );
    
    // Verificar que se muestra el mensaje de error
    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Error de prueba');
  });

  test('pasa las reglas de validación correctas al register', () => {
    render(
      <EmailField 
        register={mockRegister} 
        errors={{}} 
      />
    );
    
    // Verificar que register fue llamado con las reglas correctas
    expect(mockRegister).toHaveBeenCalledWith('email', {
      required: 'El correo es obligatorio',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'El formato del correo es inválido'
      }
    });
  });
}); 