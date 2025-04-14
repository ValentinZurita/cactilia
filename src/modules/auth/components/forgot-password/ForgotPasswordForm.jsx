import React from 'react';
import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../hooks/useForgotPassword';
import { EmailField } from './EmailField';
import { StatusMessage } from './StatusMessage';
import { SubmitButton } from './SubmitButton';
import { AuthLinks } from '../../../../shared/components';

/**
 * Formulario de recuperación de contraseña para usuarios
 * Combina los componentes atómicos para crear el formulario completo
 * Siguiendo el estilo de la sección de autenticación
 */
export const ForgotPasswordForm = () => {
  // Hook para validación de formulario
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // Hook personalizado para manejar la lógica de recuperación
  const { sendPasswordReset, state } = useForgotPassword();
  const { loading, error, success } = state;
  
  // Return totalmente limpio sin lógica condicional
  return (
    <form 
      className="container-fluid d-flex flex-column justify-content-center align-items-center px-4 px-md-5"
      style={{ maxWidth: "600px", width: "100%" }}
      onSubmit={handleSubmit(sendPasswordReset)}
    >
      {/* Título */}
      <h2 className="fw-bold text-center my-4 text-muted" style={{ fontSize: "2.5rem" }}>
        Recuperar Contraseña
      </h2>
      
      {/* Descripción */}
      <p className="text-center text-muted mb-4">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      
      {/* Mensajes de estado */}
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
      
      {/* Campo de email */}
      <EmailField register={register} errors={errors} />
      
      {/* Botón de envío */}
      <SubmitButton 
        loading={loading}
        loadingText="Enviando..."
        text="Recuperar Contraseña" 
      />
      
      {/* Enlace para volver al login */}
      <Link to="/auth/login" className="mt-3 text-primary text-decoration-none">
        Volver al inicio de sesión
      </Link>
    </form>
  );
}; 