import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SubmitButton from '../SubmitButton';

describe('SubmitButton Component', () => {
  test('renders correctly with default props', () => {
    // Arrange
    const onClick = jest.fn();
    render(<SubmitButton onClick={onClick} isLoading={false} disabled={false} />);
    
    // Assert
    const button = screen.getByRole('button', { name: /recuperar contraseña/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  test('shows loading state when isLoading is true', () => {
    // Arrange
    const onClick = jest.fn();
    render(<SubmitButton onClick={onClick} isLoading={true} disabled={false} />);
    
    // Assert
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    // Arrange
    const onClick = jest.fn();
    render(<SubmitButton onClick={onClick} isLoading={false} disabled={false} />);
    
    // Act
    const button = screen.getByRole('button', { name: /recuperar contraseña/i });
    fireEvent.click(button);
    
    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disables button when disabled prop is true', () => {
    // Arrange
    const onClick = jest.fn();
    render(<SubmitButton onClick={onClick} isLoading={false} disabled={true} />);
    
    // Assert
    const button = screen.getByRole('button', { name: /recuperar contraseña/i });
    expect(button).toBeDisabled();
    
    // Act - should not trigger onClick
    fireEvent.click(button);
    
    // Assert
    expect(onClick).not.toHaveBeenCalled();
  });

  test('disables button when isLoading is true', () => {
    // Arrange
    const onClick = jest.fn();
    render(<SubmitButton onClick={onClick} isLoading={true} disabled={false} />);
    
    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // Act - should not trigger onClick
    fireEvent.click(button);
    
    // Assert
    expect(onClick).not.toHaveBeenCalled();
  });
}); 