import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ForgotPasswordPage } from '../ForgotPasswordPage';

// Mock de componentes necesarios
jest.mock('../../../components/index.js', () => ({
  Logo: () => <div data-testid="logo-mock">Logo</div>
}));

jest.mock('../../../components/layout/index.js', () => ({
  ContentWrapper: ({ children }) => <div data-testid="content-wrapper-mock">{children}</div>,
  PageLayout: ({ children }) => <div data-testid="page-layout-mock">{children}</div>,
  PageSection: ({ children, className }) => <div data-testid="page-section-mock" className={className}>{children}</div>
}));

jest.mock('../../../components/forgot-password/ForgotPasswordForm', () => ({
  ForgotPasswordForm: () => <div data-testid="forgot-password-form-mock">Formulario de recuperación</div>
}));

jest.mock('../../../components', () => ({
  LoginImage: () => <div data-testid="login-image-mock">Imagen de login</div>
}));

describe('ForgotPasswordPage', () => {
  test('renderiza correctamente todos los componentes', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );
    
    // Verificar estructura general de la página
    expect(screen.getByTestId('page-layout-mock')).toBeInTheDocument();
    expect(screen.getByTestId('content-wrapper-mock')).toBeInTheDocument();
    
    // Verificar que se renderiza la imagen, el logo y el formulario
    expect(screen.getByTestId('login-image-mock')).toBeInTheDocument();
    expect(screen.getByTestId('logo-mock')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-form-mock')).toBeInTheDocument();
    
    // Verificar secciones de la página
    const sections = screen.getAllByTestId('page-section-mock');
    expect(sections.length).toBe(2); // Sección izquierda y derecha
    
    // Verificar sección izquierda (imagen)
    const leftSection = sections[0];
    expect(leftSection).toHaveClass('d-none d-md-block p-0 m-0');
    expect(leftSection).toContainElement(screen.getByTestId('login-image-mock'));
    
    // Verificar sección derecha (logo y formulario)
    const rightSection = sections[1];
    expect(rightSection).toContainElement(screen.getByTestId('logo-mock'));
    expect(rightSection).toContainElement(screen.getByTestId('forgot-password-form-mock'));
  });
  
  test('la estructura sigue el patrón de la página de login', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );
    
    // Verificar que la estructura es similar al login:
    // 1. PageLayout como contenedor general
    expect(screen.getByTestId('page-layout-mock')).toBeInTheDocument();
    
    // 2. ContentWrapper como organizador del layout
    const contentWrapper = screen.getByTestId('content-wrapper-mock');
    expect(contentWrapper).toBeInTheDocument();
    
    // 3. Dos secciones: una para imagen (izquierda) y otra para contenido (derecha)
    const sections = screen.getAllByTestId('page-section-mock');
    expect(sections.length).toBe(2);
    
    // 4. Sección izquierda oculta en móviles
    expect(sections[0]).toHaveClass('d-none d-md-block');
  });
}); 