import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmailField from '../EmailField';

describe('EmailField Component', () => {
  test('renders correctly with default props', () => {
    // Arrange
    const onChange = jest.fn();
    render(<EmailField value="" onChange={onChange} disabled={false} />);
    
    // Assert
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).not.toBeDisabled();
    expect(emailInput).toHaveValue('');
  });

  test('displays the correct value', () => {
    // Arrange
    const testEmail = 'test@example.com';
    const onChange = jest.fn();
    render(<EmailField value={testEmail} onChange={onChange} disabled={false} />);
    
    // Assert
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue(testEmail);
  });

  test('calls onChange handler when input changes', () => {
    // Arrange
    const onChange = jest.fn();
    render(<EmailField value="" onChange={onChange} disabled={false} />);
    
    // Act
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    
    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'new@example.com'
      })
    }));
  });

  test('disables input when disabled prop is true', () => {
    // Arrange
    const onChange = jest.fn();
    render(<EmailField value="" onChange={onChange} disabled={true} />);
    
    // Assert
    expect(screen.getByLabelText(/correo electrónico/i)).toBeDisabled();
  });

  test('has required attribute', () => {
    // Arrange
    const onChange = jest.fn();
    render(<EmailField value="" onChange={onChange} disabled={false} />);
    
    // Assert
    expect(screen.getByLabelText(/correo electrónico/i)).toBeRequired();
  });
}); 