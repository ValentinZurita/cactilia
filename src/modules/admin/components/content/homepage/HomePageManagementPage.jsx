import { useState } from 'react';
import HomePageEditor from './HomePageEditor.jsx'

/**
 * Página para la gestión de la página de inicio
 * Versión rediseñada con enfoque mobile-first completo
 */
export const HomePageManagementPage = () => {
  return (
    <div className="homepage-management-container py-3">
      <div className="mb-4 px-2">
        <h4 className="fw-bold mb-2">Editor de Página de Inicio</h4>
        <p className="text-muted small d-none d-sm-block">Personaliza el contenido de tu página</p>
      </div>

      <HomePageEditor />
    </div>
  );
};