import React from 'react';
import { render, screen } from '@testing-library/react';
import { SubmitButton } from '../SubmitButton';

describe('SubmitButton (Admin)', () => {
  test('renderiza correctamente en estado normal', () => {
    render(<SubmitButton text="Enviar enlace" />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Enviar enlace');
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveClass('spinner-border');
  });

  test('renderiza correctamente en estado de carga', () => {
    render(
      <SubmitButton 
        loading={true} 
        loadingText="Enviando..." 
        text="Enviar enlace" 
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Enviando...');
    expect(button).toBeDisabled();
    
    // Verificar que el spinner se muestra
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  test('utiliza valores por defecto cuando no se proporcionan props opcionales', () => {
    render(<SubmitButton text="Enviar enlace" />);
    
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    
    // No debería haber spinner cuando loading=false
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
}); 