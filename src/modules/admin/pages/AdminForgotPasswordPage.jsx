import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../../shared/components/logo/Logo';
import { ForgotPasswordForm } from '../components/login/forgot-password/ForgotPasswordForm';

/**
 * Página de recuperación de contraseña para administradores
 * Muestra el formulario de recuperación dentro de una tarjeta similar al login
 */
export const AdminForgotPasswordPage = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4 rounded text-center col-10 col-sm-8 col-md-6 col-lg-4">
        {/* Logo */}
        <Logo styles={{ maxWidth: "120px", marginBottom: "20px" }} />
        
        {/* Título */}
        <h3 className="card-title mb-3">Recuperar Contraseña</h3>
        
        {/* Descripción */}
        <p className="text-muted mb-4">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {/* Formulario */}
        <ForgotPasswordForm />
        
        {/* Enlace para volver al login */}
        <div className="mt-3">
          <Link to="/admin/login" className="text-primary text-decoration-none">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPasswordPage; 