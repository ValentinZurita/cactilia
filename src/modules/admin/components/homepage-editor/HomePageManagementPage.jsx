import { useState } from 'react';
import HomePageEditor from './HomePageEditor.jsx'

/**
 * Página para la gestión de la página de inicio
 * Versión rediseñada con enfoque mobile-first
 */
export const HomePageManagementPage = () => {
  return (
    <div className="homepage-management-container py-3">
      <div className="mb-4">
        <h4 className="fw-bold mb-2">Editor de Página de Inicio</h4>
        <p className="text-muted small">Personaliza el contenido de tu página</p>
      </div>

      <HomePageEditor />
    </div>
  );
};