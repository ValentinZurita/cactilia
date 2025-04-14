import React from 'react';

// Mock del componente InputField
export const InputField = ({ label, type, placeholder, errors, ...props }) => (
  <div data-testid="input-field-mock">
    <label>{label}</label>
    <input type={type} placeholder={placeholder} data-testid="email-input" {...props} />
    {errors && <span data-testid="error-message">{errors.message}</span>}
  </div>
); 