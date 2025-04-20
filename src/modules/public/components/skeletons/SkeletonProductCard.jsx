/**
 * SkeletonProductCard Component
 *
 * Muestra un placeholder visual para un ProductCard mientras carga.
 */
import React from 'react';
import '../../styles/skeletons.css';

export const SkeletonProductCard = () => {
  return (
    <div className="skeleton-product-card" aria-hidden="true">
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton skeleton-text"></div>
    </div>
  );
}; 