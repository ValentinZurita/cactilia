/**
 * SkeletonCarousel Component
 *
 * Muestra un placeholder visual para un ProductCarousel mientras carga.
 */
import React from 'react';
import { SkeletonProductCard } from './SkeletonProductCard';
import '../../styles/skeletons.css';

export const SkeletonCarousel = ({ count = 4 }) => {
  // Crea un array para mapear y renderizar N tarjetas skeleton
  const skeletonCards = Array.from({ length: count });

  return (
    <div className="skeleton-carousel-container" aria-label="Cargando carrusel..." aria-busy="true">
      <div className="skeleton-carousel-title-container">
        <div className="skeleton skeleton-text skeleton-section-title"></div>
        <div className="skeleton skeleton-text skeleton-section-subtitle"></div>
      </div>
      <div className="skeleton-carousel-track">
        {skeletonCards.map((_, index) => (
          <SkeletonProductCard key={index} />
        ))}
      </div>
    </div>
  );
}; 