import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusMessage from '../StatusMessage';

describe('StatusMessage Component', () => {
  test('does not render when status is idle', () => {
    // Arrange
    const { container } = render(<StatusMessage status="idle" errorMessage="" />);
    
    // Assert
    expect(container.firstChild).toBeNull();
  });

  test('renders success message when status is success', () => {
    // Arrange
    render(<StatusMessage status="success" errorMessage="" />);
    
    // Assert
    expect(screen.getByText(/se ha enviado un correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/revisa tu bandeja de entrada/i)).toBeInTheDocument();
    
    // Verify success styling
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-success');
  });

  test('renders error message when status is error', () => {
    // Arrange
    const errorMessage = 'No se encontró una cuenta con este correo electrónico';
    render(<StatusMessage status="error" errorMessage={errorMessage} />);
    
    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    // Verify error styling
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-error');
  });

  test('renders loading message when status is loading', () => {
    // Arrange
    render(<StatusMessage status="loading" errorMessage="" />);
    
    // Assert
    expect(screen.getByText(/enviando/i)).toBeInTheDocument();
    
    // Verify loading styling
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-info');
  });

  test('handles empty error message when status is error', () => {
    // Arrange
    render(<StatusMessage status="error" errorMessage="" />);
    
    // Assert
    expect(screen.getByText(/ha ocurrido un error/i)).toBeInTheDocument();
    
    // Verify error styling
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-error');
  });
}); 