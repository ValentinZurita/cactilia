import React from 'react'
import { render, screen } from '@testing-library/react'
import { EmailField } from '../EmailField'
import { jest } from '@jest/globals'

// El mock de InputField se configura en __mocks__/shared-package.js
// a través del moduleNameMapper en jest.config.mjs

describe('EmailField (Admin)', () => {
  // Mock de register y errors
  const mockRegister = jest.fn().mockReturnValue({
    name: 'email',
    onChange: jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn(),
  })

  const mockErrors = {
    email: { message: 'Error de prueba' },
  }

  test('renderiza correctamente con las props necesarias', () => {
    render(
      <EmailField
        register={mockRegister}
        errors={{}}
      />,
    )

    // Verificar que el InputField se renderizó correctamente
    const inputField = screen.getByTestId('input-field-mock')
    expect(inputField).toBeInTheDocument()

    // Verificar que tiene la etiqueta correcta
    const label = screen.getByText('Correo Electrónico')
    expect(label).toBeInTheDocument()

    // Verificar el tipo y placeholder
    const input = screen.getByTestId('email-input')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'Ingresa tu email de administrador')
  })

  test('muestra mensaje de error cuando hay errores', () => {
    // Simulamos que errors.email existe con un mensaje
    render(
      <EmailField
        register={mockRegister}
        errors={{ email: { message: 'Error de prueba' } }}
      />,
    )

    // Imprimir el HTML renderizado para depuración
    console.log(screen.getByTestId('input-field-mock').outerHTML)

    // Buscar por texto en lugar de por testid
    const errorMessage = screen.getByText('Error de prueba')
    expect(errorMessage).toBeInTheDocument()
  })

  test('pasa las reglas de validación correctas al register', () => {
    render(
      <EmailField
        register={mockRegister}
        errors={{}}
      />,
    )

    // Verificar que register fue llamado con las reglas correctas
    expect(mockRegister).toHaveBeenCalledWith('email', {
      required: 'El correo es obligatorio',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'El formato del correo es inválido',
      },
    })
  })
})