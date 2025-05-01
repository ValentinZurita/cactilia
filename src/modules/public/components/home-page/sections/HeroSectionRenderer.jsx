import React, { Suspense, lazy } from 'react';
import { SkeletonHero } from '../../../components/skeletons/index.js'; // Ruta ajustada
import { getImageUrlBySize } from "../../../../../utils/imageUtils.js"; // Ruta ajustada

// Carga diferida (Lazy load) del componente HeroSection real
const LazyHeroSection = lazy(() => import('../HeroSection.jsx')); // Ruta ajustada

// Componente renderizador específico para la sección Hero
export const HeroSectionRenderer = ({ sectionConfig, collectionImages }) => {
    // Lógica para determinar y procesar imágenes (movida desde HomePage.jsx)
    const heroImagesData = (sectionConfig.useCollection && collectionImages?.[sectionConfig.collectionId]?.length > 0)
        ? collectionImages[sectionConfig.collectionId]
        : sectionConfig.images;

    const heroImagesProcessed = Array.isArray(heroImagesData)
        ? heroImagesData.map(img => ({
            id: img.id || Math.random(), // Asegurar que la key sea estable si es posible, o usar index
            src: getImageUrlBySize(img, 'large'),
            alt: img.alt || 'Hero image'
        }))
        : [];

    // Props por defecto para fallback
    const defaultTitle = 'Bienvenido a Cactilia';
    const defaultSubtitle = 'Descubre nuestros productos naturales';
    const defaultCtaText = 'Ver productos';
    const defaultCtaLink = '/shop';
    const fallbackImage = { id: 'fallback', src: '/images/placeholder.jpg', alt: 'Placeholder' }; // Ruta ajustada para la carpeta public

    return (
        // Límite de Suspense para el componente cargado con lazy loading
        <Suspense fallback={<SkeletonHero />}>
            <LazyHeroSection
                // Pasar props de configuración, usando defaults si es necesario
                title={sectionConfig?.title || defaultTitle}
                subtitle={sectionConfig?.subtitle || defaultSubtitle}
                ctaText={sectionConfig?.ctaText || defaultCtaText}
                ctaLink={sectionConfig?.ctaLink || defaultCtaLink}
                // Pasar imágenes procesadas, asegurando que siempre haya al menos un fallback
                images={heroImagesProcessed.length > 0 ? heroImagesProcessed : [fallbackImage]}
                // Incluir otras props relevantes de HeroSection si es necesario (ej. height, autoRotate)
                // height={sectionConfig?.height} // Ejemplo si height fuera configurable
            />
        </Suspense>
    );
};

HeroSectionRenderer.displayName = 'HeroSectionRenderer';

// Exportar componente por defecto
export default HeroSectionRenderer; 