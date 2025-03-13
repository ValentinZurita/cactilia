import { useEffect, useRef, useState } from 'react';
import { heroImages } from '../../../../../shared/constants/images.js';
import { HeroSection, HomeCarousel, HomeSection, ProductCarousel } from '../../../../public/components/home-page/index.js';

// Constantes para datos de ejemplo
const sampleProducts = Array(6).fill(null).map((_, i) => ({
  id: i+1,
  name: `Producto ${i+1}`,
  image: '/public/images/placeholder.jpg'
}));

const sampleImages = [
  { id: 1, src: "/public/images/placeholder.jpg", alt: "Farm 1" },
  { id: 2, src: "/public/images/placeholder.jpg", alt: "Farm 2" },
  { id: 3, src: "/public/images/placeholder.jpg", alt: "Farm 3" }
];

// Imágenes de muestra para colecciones
const sampleCollectionImages = heroImages;

/**
 * Panel de vista previa que muestra la página de inicio tal como se verá
 * Versión actualizada con soporte para colecciones
 */
export const PreviewPanel = ({ config }) => {
  const containerRef = useRef(null);

  // Ajustar scrolling al cambiar la configuración
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [config]);

  // Preparar imágenes para el hero section
  const getHeroImages = () => {
    const heroConfig = config.sections.hero;

    // Si usa colección, mostrar imágenes de prueba para la colección
    if (heroConfig.useCollection && heroConfig.collectionId) {
      return sampleCollectionImages;
    }

    if (heroConfig.backgroundImage) {
      return [heroConfig.backgroundImage];
    }

    return heroImages;
  };

  return (
    <div
      className="preview-panel position-relative bg-white rounded border"
      ref={containerRef}
      style={{
        height: '700px',
        overflow: 'auto',
        transformOrigin: 'top center'
      }}
    >
      <div className="border-bottom border-top border-light p-2">
        {/* Hero Section */}
        {config.sections.hero && (
          <HeroSection
            images={getHeroImages()}
            title={config.sections.hero.title || 'Bienvenido a Cactilia'}
            subtitle={config.sections.hero.subtitle || 'Productos frescos y naturales para una vida mejor'}
            showButton={config.sections.hero.showButton !== false}
            buttonText={config.sections.hero.buttonText || 'Conoce Más'}
            buttonLink={config.sections.hero.buttonLink || '#'}
            showLogo={config.sections.hero.showLogo !== false}
            showSubtitle={config.sections.hero.showSubtitle !== false}
            height={config.sections.hero.height || '100vh'}
            autoRotate={config.sections.hero.autoRotate !== false}
            interval={config.sections.hero.interval || 5000}
            useCollection={config.sections.hero.useCollection === true}
            collectionId={config.sections.hero.collectionId || null}
          />
        )}

        {/* Featured Products Section */}
        {config.sections.featuredProducts && (
          <HomeSection
            title={config.sections.featuredProducts.title || 'Productos Destacados'}
            subtitle={config.sections.featuredProducts.subtitle || 'Explora nuestra selección especial.'}
            icon={config.sections.featuredProducts.icon || 'bi-star-fill'}
            showBg={config.sections.featuredProducts.showBg === true}
            spacing="py-6"
            height="min-vh-75"
          >
            <ProductCarousel products={sampleProducts} />
          </HomeSection>
        )}

        {/* Farm Carousel Section */}
        {config.sections.farmCarousel && (
          <HomeSection
            title={config.sections.farmCarousel.title || 'Nuestro Huerto'}
            subtitle={config.sections.farmCarousel.subtitle || 'Descubre la belleza y frescura de nuestra granja.'}
            icon={config.sections.farmCarousel.icon || 'bi-tree-fill'}
            showBg={config.sections.farmCarousel.showBg !== false}
            spacing="py-6"
            height="min-vh-75"
          >
            <HomeCarousel images={sampleImages} />
          </HomeSection>
        )}

        {/* Product Categories Section */}
        {config.sections.productCategories && (
          <HomeSection
            title={config.sections.productCategories.title || 'Descubre Nuestros Productos'}
            subtitle={config.sections.productCategories.subtitle || 'Productos orgánicos de alta calidad para una vida mejor.'}
            icon={config.sections.productCategories.icon || 'bi-box-seam'}
            showBg={config.sections.productCategories.showBg === true}
            spacing="py-6"
            height="min-vh-75"
          >
            <ProductCarousel products={sampleProducts} />
          </HomeSection>
        )}
      </div>
    </div>
  );
};