import React from 'react';
import { useForm } from "react-hook-form";
import { useAdminForgotPassword } from '../../../hooks/useAdminForgotPassword';
import { EmailField } from './EmailField';
import { StatusMessage } from './StatusMessage';
import { SubmitButton } from './SubmitButton';

/**
 * Formulario de recuperación de contraseña para administradores
 * Combina los componentes atómicos para crear el formulario completo
 */
export const ForgotPasswordForm = () => {
  // Hook para validación de formulario
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // Hook personalizado para manejar la lógica de recuperación
  const { sendPasswordReset, state } = useAdminForgotPassword();
  const { loading, error, success } = state;
  
  // Return totalmente limpio sin lógica condicional
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