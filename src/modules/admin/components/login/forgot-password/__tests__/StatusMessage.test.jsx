import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusMessage } from '../StatusMessage';

describe('StatusMessage (Admin)', () => {
  test('renderiza mensaje de éxito correctamente', () => {
    const mockProps = {
      type: 'success',
      icon: 'bi-check-circle-fill',
      message: 'Operación completada con éxito'
    };
    
    render(<StatusMessage {...mockProps} />);
    
    const alert = screen.getByText('Operación completada con éxito');
    expect(alert).toBeInTheDocument();
    expect(alert.parentElement).toHaveClass('alert-success');
    
    // Verificar que el ícono está presente
    const icon = document.querySelector('.bi-check-circle-fill');
    expect(icon).toBeInTheDocument();
  });

  test('renderiza mensaje de error correctamente', () => {
    const mockProps = {
      type: 'danger',
      icon: 'bi-exclamation-triangle-fill',
      message: 'Ha ocurrido un error'
    };
    
    render(<StatusMessage {...mockProps} />);
    
    const alert = screen.getByText('Ha ocurrido un error');
    expect(alert).toBeInTheDocument();
    expect(alert.parentElement).toHaveClass('alert-danger');
    
    // Verificar que el ícono está presente
    const icon = document.querySelector('.bi-exclamation-triangle-fill');
    expect(icon).toBeInTheDocument();
  });

  test('renderiza mensaje de advertencia correctamente', () => {
    const mockProps = {
      type: 'warning',
      icon: 'bi-exclamation-circle-fill',
      message: 'Advertencia importante'
    };
    
    render(<StatusMessage {...mockProps} />);
    
    const alert = screen.getByText('Advertencia importante');
    expect(alert).toBeInTheDocument();
    expect(alert.parentElement).toHaveClass('alert-warning');
  });

  test('renderiza mensaje informativo correctamente', () => {
    const mockProps = {
      type: 'info',
      icon: 'bi-info-circle-fill',
      message: 'Información relevante'
    };
    
    render(<StatusMessage {...mockProps} />);
    
    const alert = screen.getByText('Información relevante');
    expect(alert).toBeInTheDocument();
    expect(alert.parentElement).toHaveClass('alert-info');
  });
}); 