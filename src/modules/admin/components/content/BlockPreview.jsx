import React from 'react';
import { BLOCK_TYPES } from '../../services/contentService';
import { HeroSection, ProductCarousel, HomeSection, HomeCarousel } from '../../../public/components/home-page';

/**
 * Componente que muestra una vista previa de los bloques de contenido
 *
 * @param {Object} props
 * @param {Array} props.blocks - Bloques de contenido a mostrar
 * @param {boolean} props.isPreview - Si es solo vista previa (escala reducida)
 * @returns {JSX.Element}
 */
export const BlockPreview = ({ blocks, isPreview = true }) => {
  // Función para renderizar un bloque específico
  const renderBlock = (block) => {
    switch (block.type) {
      case BLOCK_TYPES.HERO_SLIDER:
        return (
          <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
            <HeroSection
              images={block.images || [block.mainImage || '/public/images/placeholder.jpg']}
              title={block.title || 'Título Principal'}
              subtitle={block.subtitle || 'Subtítulo descriptivo'}
              showButton={block.showButton}
              showLogo={false}
              showSubtitle={true}
              height={block.height || '50vh'}
              autoRotate={block.autoRotate}
              interval={block.interval || 5000}
            />
          </div>
        );

      case BLOCK_TYPES.FEATURED_PRODUCTS:
        // Simulación de productos para la vista previa
        const previewProducts = Array(6).fill({
          id: 'preview',
          name: 'Producto Ejemplo',
          image: '/public/images/placeholder.jpg',
        });

        return (
          <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
            <HomeSection
              title={block.title || 'Productos Destacados'}
              subtitle={block.subtitle || 'Explora nuestra selección especial'}
              icon={block.icon || 'bi-star-fill'}
              showBg={block.showBg}
              spacing="py-6"
              height="min-vh-75"
            >
              <ProductCarousel products={previewProducts} />
            </HomeSection>
          </div>
        );

      case BLOCK_TYPES.IMAGE_CAROUSEL:
        // Simulación de imágenes para la vista previa
        const previewImages = Array(3).fill({
          id: 'preview',
          src: '/public/images/placeholder.jpg',
          alt: 'Imagen de ejemplo'
        });

        return (
          <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
            <HomeSection
              title={block.title || 'Nuestro Huerto'}
              subtitle={block.subtitle || 'Descubre la belleza y frescura de nuestra granja'}
              icon={block.icon || 'bi-tree-fill'}
              showBg={block.showBg}
              spacing="py-6"
              height="min-vh-75"
            >
              <HomeCarousel images={previewImages} />
            </HomeSection>
          </div>
        );

      case BLOCK_TYPES.PRODUCT_CATEGORIES:
        return (
          <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
            <HomeSection
              title={block.title || 'Nuestras Categorías'}
              subtitle={block.subtitle || 'Explora nuestras categorías de productos'}
              icon={block.icon || 'bi-grid-fill'}
              showBg={block.showBg}
              spacing="py-6"
              height="min-vh-75"
            >
              <div className="text-center p-5 bg-light rounded">
                <i className="bi bi-grid-3x3-gap display-1 text-muted"></i>
                <p className="mt-3">Vista previa de categorías</p>
              </div>
            </HomeSection>
          </div>
        );

      case BLOCK_TYPES.TEXT_BLOCK:
        return (
          <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
            <section className={`py-5 ${block.showBg ? 'bg-light' : ''}`}>
              <div className="container">
                <div className={`text-${block.alignment || 'center'}`}>
                  {block.title && <h2 className="mb-4">{block.title}</h2>}
                  <div dangerouslySetInnerHTML={{ __html: block.content || 'Contenido de ejemplo' }} />
                </div>
              </div>
            </section>
          </div>
        );

      case BLOCK_TYPES.CALL_TO_ACTION:
        return (
          <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
            <div className="cta-section py-5" style={{
              backgroundImage: block.backgroundImage ? `url(${block.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: !block.backgroundImage ? '#f8f9fa' : 'transparent'
            }}>
              <div className="container">
                <div className={`text-${block.alignment || 'center'} py-5`}>
                  <h2 className="mb-3">{block.title || 'Título de Llamada a la Acción'}</h2>
                  <p className="lead mb-4">{block.subtitle || 'Subtítulo descriptivo'}</p>
                  <button className="btn btn-primary btn-lg">
                    {block.buttonText || 'Botón de Acción'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Tipo de bloque desconocido: {block.type}
          </div>
        );
    }
  };

  return (
    <div className="block-preview">
      {blocks.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle-fill me-2"></i>
          No hay bloques para mostrar
        </div>
      ) : (
        blocks.map((block) => (
          <div key={block.id} className="mb-4">
            {renderBlock(block)}
          </div>
        ))
      )}
    </div>
  );
};