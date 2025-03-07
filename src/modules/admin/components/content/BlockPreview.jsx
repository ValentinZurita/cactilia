import React, { useState, useEffect } from 'react';
import { BLOCK_TYPES } from '../../services/contentService';
import { HeroSection, ProductCarousel, HomeSection, HomeCarousel } from '../../../public/components/home-page';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { getMediaByCollection } from '../../services/collectionsService';

/**
 * Componente mejorado que muestra una vista previa de los bloques de contenido
 * con integración de datos reales y soporte para visualización de versiones
 *
 * @param {Object} props
 * @param {Array} props.blocks - Bloques de contenido a mostrar
 * @param {boolean} props.isPreview - Si es solo vista previa (escala reducida)
 * @param {string} props.viewMode - Modo de visualización ('draft' o 'published')
 * @returns {JSX.Element}
 */
export const BlockPreview = ({ blocks, isPreview = true, viewMode = 'draft' }) => {
  // Estados para datos
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mediaCollections, setMediaCollections] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos necesarios para la previsualización
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Cargar productos destacados si hay un bloque que los use
        if (blocks.some(b => b.type === BLOCK_TYPES.FEATURED_PRODUCTS && b.filterByFeatured)) {
          const { ok, data } = await getProducts();
          if (ok) {
            // Filtrar solo los productos destacados y activos
            const featured = data.filter(p => p.featured && p.active).slice(0, 6);
            setFeaturedProducts(featured);
          }
        }

        // Cargar categorías si hay un bloque que las use
        if (blocks.some(b => b.type === BLOCK_TYPES.PRODUCT_CATEGORIES)) {
          const { ok, data } = await getCategories();
          if (ok) {
            // Solo categorías activas
            const activeCategories = data.filter(c => c.active);
            setCategories(activeCategories);
          }
        }

        // Cargar colecciones de medios que se usan en los bloques
        const collectionsToLoad = new Set();
        blocks.forEach(block => {
          if (block.collectionId) {
            collectionsToLoad.add(block.collectionId);
          }
        });

        // Si hay colecciones para cargar
        if (collectionsToLoad.size > 0) {
          const collectionsData = {};
          for (const collectionId of collectionsToLoad) {
            const result = await getMediaByCollection(collectionId);
            if (result.ok) {
              collectionsData[collectionId] = result.data.map(item => item.url);
            }
          }
          setMediaCollections(collectionsData);
        }
      } catch (error) {
        console.error("Error cargando datos para previsualización:", error);
      } finally {
        setLoading(false);
      }
    };

    // Solo cargar datos si hay bloques para mostrar
    if (blocks.length > 0) {
      loadData();
    }
  }, [blocks]);

  // Si no hay bloques, mostrar esqueleto de previsualización
  const blocksToRender = blocks.length === 0 ? getSkeletonBlocks() : blocks;

  // Función para crear bloques de esqueleto para previsualización
  function getSkeletonBlocks() {
    return [
      {
        id: 'skeleton_hero',
        type: BLOCK_TYPES.HERO_SLIDER,
        title: 'Bienvenido a Cactilia',
        subtitle: 'Productos frescos y naturales para una vida mejor',
        showButton: true,
        buttonText: 'Conoce Más',
        buttonLink: '#',
        height: '50vh',
        autoRotate: true,
        interval: 5000,
        mainImage: '/public/images/placeholder.jpg',
        showLogo: true,
        showSubtitle: true
      },
      {
        id: 'skeleton_featured',
        type: BLOCK_TYPES.FEATURED_PRODUCTS,
        title: 'Productos Destacados',
        subtitle: 'Explora nuestra selección especial.',
        icon: 'bi-star-fill',
        showBg: false,
        maxProducts: 6,
        filterByFeatured: true
      },
      {
        id: 'skeleton_farm',
        type: BLOCK_TYPES.IMAGE_CAROUSEL,
        title: 'Nuestro Huerto',
        subtitle: 'Descubre la belleza y frescura de nuestra granja.',
        icon: 'bi-tree-fill',
        showBg: true
      },
      {
        id: 'skeleton_categories',
        type: BLOCK_TYPES.PRODUCT_CATEGORIES,
        title: 'Descubre Nuestros Productos',
        subtitle: 'Productos orgánicos de alta calidad para una vida mejor.',
        icon: 'bi-box-seam',
        showBg: false
      }
    ];
  }

  // Función para renderizar un bloque específico
  const renderBlock = (block) => {
    switch (block.type) {
      case BLOCK_TYPES.HERO_SLIDER: {
        // Determinar qué imágenes usar (colección, imagen principal o placeholder)
        let images = ['/public/images/placeholder.jpg'];

        if (block.collectionId && mediaCollections[block.collectionId]?.length > 0) {
          images = mediaCollections[block.collectionId];
        } else if (block.mainImage) {
          images = [block.mainImage];
        } else if (block.images && block.images.length > 0) {
          images = block.images;
        }

        return (
          <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
            <HeroSection
              images={images}
              title={block.title || 'Título Principal'}
              subtitle={block.subtitle || 'Subtítulo descriptivo'}
              showButton={block.showButton ?? true}
              showLogo={block.showLogo ?? true}
              showSubtitle={block.showSubtitle ?? true}
              height={block.height || '50vh'}
              autoRotate={block.autoRotate ?? true}
              interval={block.interval || 5000}
              buttonText={block.buttonText || 'Conoce Más'}
              buttonLink={block.buttonLink || '#'}
            />
          </div>
        );
      }

      case BLOCK_TYPES.FEATURED_PRODUCTS: {
        // Determinar qué productos mostrar
        let productsToShow = [];

        // Si usa colección personalizada de imágenes
        if (block.useCollection && block.collectionId && mediaCollections[block.collectionId]) {
          productsToShow = mediaCollections[block.collectionId].map((url, index) => ({
            id: `preview-${index}`,
            name: `Producto ${index + 1}`,
            image: url
          }));
        }
        // Si usa productos destacados reales
        else if (block.filterByFeatured && featuredProducts.length > 0) {
          productsToShow = featuredProducts.map(product => ({
            id: product.id,
            name: product.name,
            image: product.mainImage || '/public/images/placeholder.jpg'
          }));
        }
        // Fallback a productos de ejemplo (con IDs únicos)
        else {
          productsToShow = Array(6).fill(null).map((_, index) => ({
            id: `preview-product-${index}`,
            name: `Producto Ejemplo ${index + 1}`,
            image: '/public/images/placeholder.jpg',
          }));
        }

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
              <ProductCarousel products={productsToShow} />
            </HomeSection>
          </div>
        );
      }

      case BLOCK_TYPES.IMAGE_CAROUSEL: {
        // Determinar qué imágenes mostrar
        let carouselImages;

        if (block.collectionId && mediaCollections[block.collectionId]?.length > 0) {
          carouselImages = mediaCollections[block.collectionId].map((url, index) => ({
            id: `carousel-${index}`,
            src: url,
            alt: `Imagen ${index + 1}`
          }));
        } else {
          // Imágenes de ejemplo
          carouselImages = Array(3).fill({
            id: 'preview',
            src: '/public/images/placeholder.jpg',
            alt: 'Imagen de ejemplo'
          });
        }

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
              <HomeCarousel images={carouselImages} />
            </HomeSection>
          </div>
        );
      }

      case BLOCK_TYPES.PRODUCT_CATEGORIES: {
        // Determinar qué categorías mostrar
        let categoriesToShow;

        // Si usa colección personalizada
        if (block.useCollection && block.collectionId && mediaCollections[block.collectionId]) {
          categoriesToShow = mediaCollections[block.collectionId].map((url, index) => ({
            id: `cat-${index}`,
            name: `Categoría ${index + 1}`,
            image: url
          }));
        }
        // Si usa categorías reales
        else if (categories.length > 0) {
          categoriesToShow = categories.map(category => ({
            id: category.id,
            name: category.name,
            image: category.mainImage || '/public/images/placeholder.jpg'
          }));
        }
        // Fallback a categorías de ejemplo
        else {
          categoriesToShow = Array(4).fill({
            id: 'preview',
            name: 'Categoría Ejemplo',
            image: '/public/images/placeholder.jpg',
          });
        }

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
              <ProductCarousel products={categoriesToShow} />
            </HomeSection>
          </div>
        );
      }

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
      {blocksToRender.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle-fill me-2"></i>
          No hay bloques para mostrar
        </div>
      ) : (
        blocksToRender.map((block) => (
          <div key={block.id} className="mb-4">
            {renderBlock(block)}
          </div>
        ))
      )}
    </div>
  );
};