import React, { Suspense, lazy } from 'react';
import { HomeSection } from '../index.js'; // Asumiendo que HomeSection se exporta desde el archivo barril
import { SkeletonCarousel } from '../../../components/skeletons/index.js'; // Ruta ajustada

// Carga diferida (Lazy load) del componente ProductCarousel
const LazyProductCarousel = lazy(() => import('../ProductCarousel.jsx')); // Ruta ajustada

// Componente renderizador específico para la sección de Productos Destacados
export const FeaturedProductsSectionRenderer = ({ sectionConfig, products, handleProductCardClick }) => {
    // Props por defecto para fallback
    const defaultTitle = 'Productos destacados';
    const defaultSubtitle = 'Descubre nuestra selección';
    const defaultBgColor = 'var(--bg-light)';
    const defaultLink = '/shop';
    const defaultLinkText = 'Ver todos los productos';

    // Asegurar que products sea un array
    const productsToDisplay = Array.isArray(products) ? products : [];

    return (
        <HomeSection
            // Pasar props de configuración, usando defaults si es necesario
            title={sectionConfig?.title || defaultTitle}
            subtitle={sectionConfig?.subtitle || defaultSubtitle}
            bgColor={sectionConfig?.bgColor || defaultBgColor}
            link={sectionConfig?.link || defaultLink}
            linkText={sectionConfig?.linkText || defaultLinkText}
        >
            {/* Límite de Suspense para el carrusel cargado con lazy loading */}
            <Suspense fallback={<SkeletonCarousel />}>
                <LazyProductCarousel 
                    products={productsToDisplay} 
                    onProductClick={handleProductCardClick} 
                />
            </Suspense>
        </HomeSection>
    );
};

FeaturedProductsSectionRenderer.displayName = 'FeaturedProductsSectionRenderer';

// Exportar componente por defecto
export default FeaturedProductsSectionRenderer; 