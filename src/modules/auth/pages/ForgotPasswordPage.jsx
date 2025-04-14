import React from 'react';
import { Logo } from '../components/index.js';
import { ContentWrapper, PageLayout, PageSection } from '../components/layout/index.js';
import { ForgotPasswordForm } from '../components/forgot-password/ForgotPasswordForm';
import { LoginImage } from '../components/index.js';

/**
 * Página de recuperación de contraseña para usuarios
 * Utiliza la misma estructura de layout que el login
 */
export const ForgotPasswordPage = () => {
  return (
    // Contenedor principal de la página
    <PageLayout>
      {/* ContentWrapper organiza el layout en una estructura de fila responsive */}
      <ContentWrapper>
        {/* Sección izquierda: Misma imagen que el login (solo visible en pantallas grandes) */}
        <PageSection className="d-none d-md-block p-0 m-0">
          <LoginImage />
        </PageSection>

        {/* Sección derecha: Formulario de recuperación de contraseña */}
        <PageSection>
          {/* Logo */}
          <Logo styles={{ maxWidth: '150px'}} />
          
          {/* Formulario */}
          <ForgotPasswordForm />
        </PageSection>
      </ContentWrapper>
    </PageLayout>
  );
};

export default ForgotPasswordPage; 