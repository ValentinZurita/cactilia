import React, { Suspense, lazy, useMemo } from 'react';
import { HomeSection } from '../index.js'; // Asumiendo que HomeSection se exporta desde el archivo barril
import { SkeletonCarousel } from '../../../components/skeletons/index.js'; // Ruta ajustada
import { sampleCategories } from '../../../data/sampleHomepageData.js'; // Ruta ajustada

// Carga diferida (Lazy load) del componente ProductCarousel
const LazyProductCarousel = lazy(() => import('../ProductCarousel.jsx')); // Ruta ajustada

// Componente renderizador específico para la sección de Categorías Destacadas
export const FeaturedCategoriesSectionRenderer = ({ sectionConfig, categories }) => {
    // Props por defecto para fallback
    const defaultTitle = 'Explora categorías';
    const defaultSubtitle = 'Encuentra lo que buscas';
    const defaultLink = '/shop';
    const defaultLinkText = 'Ver todas las categorías';

    // Lógica para determinar categorías a mostrar y aplicar límite (usando useMemo para optimización)
    const categoriesToDisplay = useMemo(() => {
        const categoriesSource = Array.isArray(categories) && categories.length > 0 
            ? categories 
            : sampleCategories;
            
        const categoryLimit = sectionConfig?.limit;
        const isValidLimit = typeof categoryLimit === 'number' && categoryLimit > 0;
        
        return isValidLimit 
            ? categoriesSource.slice(0, categoryLimit) 
            : categoriesSource;
    }, [categories, sectionConfig?.limit]); // Recalcular solo si categories o limit cambian

    return (
        <HomeSection
            // Pasar props de configuración, usando defaults si es necesario
            title={sectionConfig?.title || defaultTitle}
            subtitle={sectionConfig?.subtitle || defaultSubtitle}
            bgColor={sectionConfig?.bgColor}
            link={sectionConfig?.link || defaultLink}
            linkText={sectionConfig?.linkText || defaultLinkText}
        >
            {/* Límite de Suspense para el carrusel cargado con lazy loading */}
            <Suspense fallback={<SkeletonCarousel />}>
                <LazyProductCarousel 
                    products={categoriesToDisplay} // Pasar las categorías procesadas
                    isCategory={true} // Indicar que son categorías
                    // No se necesita onProductClick para categorías, la navegación se maneja internamente en ProductCarousel
                />
            </Suspense>
        </HomeSection>
    );
};

FeaturedCategoriesSectionRenderer.displayName = 'FeaturedCategoriesSectionRenderer';

// Exportar componente por defecto
export default FeaturedCategoriesSectionRenderer; 