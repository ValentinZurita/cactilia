/**
 * SkeletonHero Component
 *
 * Muestra un placeholder visual para la HeroSection mientras carga.
 */
import React from 'react';
import '../../styles/skeletons.css'; // Importaremos los estilos comunes de skeletons

export const SkeletonHero = () => {
  return (
    <div
      className="skeleton skeleton-hero"
      style={{ height: '80vh' }} // Altura similar al Hero real, ajustable
      aria-label="Cargando sección principal..."
      aria-busy="true"
    >
      {/* Puedes añadir elementos internos si quieres imitar más la estructura */}
      {/* <div className="skeleton skeleton-text skeleton-title"></div>
      <div className="skeleton skeleton-text skeleton-subtitle"></div>
      <div className="skeleton skeleton-button"></div> */}
    </div>
  );
}; 