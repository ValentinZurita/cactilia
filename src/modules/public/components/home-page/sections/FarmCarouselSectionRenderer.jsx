import React from 'react';
import { HomeSection, HomeCarousel } from '../index.js'; // Asumiendo que los componentes se exportan desde el archivo barril
import { sampleImages } from '../../../data/sampleHomepageData.js'; // Ruta ajustada
import { getImageUrlBySize } from "../../../../../utils/imageUtils.js"; // Ruta ajustada

// Componente renderizador específico para la sección del Carrusel de Granja
export const FarmCarouselSectionRenderer = ({ sectionConfig, collectionImages }) => {
    // Lógica para determinar y procesar imágenes (movida desde HomePage.jsx)
    // Usar sampleImages importado estáticamente como fallback
    const farmImagesData = (sectionConfig?.useCollection && collectionImages?.[sectionConfig.collectionId]?.length > 0)
        ? collectionImages[sectionConfig.collectionId]
        : (sectionConfig?.images || sampleImages);

    // Usar getImageUrlBySize importado estáticamente
    const farmImagesProcessed = Array.isArray(farmImagesData)
        ? farmImagesData.map(img => ({
            id: img.id || Math.random(),
            src: getImageUrlBySize(img, 'medium'),
            alt: img.alt || 'Farm image'
        }))
        : [];

    // Props por defecto para fallback
    const defaultTitle = 'Nuestra Granja';
    const defaultSubtitle = 'Conoce de dónde vienen nuestros productos';

    return (
        <HomeSection
            // Pasar props de configuración, usando defaults si es necesario
            title={sectionConfig?.title || defaultTitle}
            subtitle={sectionConfig?.subtitle || defaultSubtitle}
            bgColor={sectionConfig?.bgColor} // ¿No se necesita default? ¿O quizás 'transparent'?
        >
            {/* Usar HomeCarousel importado estáticamente */}
            <HomeCarousel images={farmImagesProcessed.length > 0 ? farmImagesProcessed : sampleImages} /> 
        </HomeSection>
    );
};

FarmCarouselSectionRenderer.displayName = 'FarmCarouselSectionRenderer';

// Exportar componente por defecto
export default FarmCarouselSectionRenderer; 