import React from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../../../../shared/components';

/**
 * Componente atómico para el campo de correo electrónico
 * Utilizado en el formulario de recuperación de contraseña
 * Versión adaptada para el área de clientes
 */
export const EmailField = ({ register, errors }) => {
  // Reglas de validación para el campo de email
  const validationRules = {
    required: "El correo es obligatorio",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "El formato del correo es inválido"
    }
  };

  return (
    <InputField
      label="Email"
      type="email"
      placeholder="tucorreo@ejemplo.com"
      {...register("email", validationRules)}
      errors={errors.email}
    />
  );
};

EmailField.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object
}; 