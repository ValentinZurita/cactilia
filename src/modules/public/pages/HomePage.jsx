import { useState, useEffect } from 'react';
import { HeroSection, ProductCarousel, HomeSection, HomeCarousel } from '../components/home-page/index.js';
import '../../../styles/global.css';
import { heroImages } from '../../../shared/constants/images.js';
import { ContentService } from '../../admin/services/contentService';

// Contenido predeterminado para las imágenes del carrusel
const defaultImages = [
  { id: 1, src: "/public/images/placeholder.jpg", alt: "Farm 1" },
  { id: 2, src: "/public/images/placeholder.jpg", alt: "Farm 2" },
  { id: 3, src: "/public/images/placeholder.jpg", alt: "Farm 3" }
];

// Contenido predeterminado para los productos
const defaultProducts = [
  { id: 1, name: 'Vegetables', image: '/public/images/placeholder.jpg' },
  { id: 2, name: 'Edible Flowers', image: '/public/images/placeholder.jpg' },
  { id: 3, name: 'Product 3', image: '/public/images/placeholder.jpg' },
  { id: 4, name: 'Product 4', image: '/public/images/placeholder.jpg' },
  { id: 5, name: 'Product 5', image: '/public/images/placeholder.jpg' },
  { id: 6, name: 'Product 6', image: '/public/images/placeholder.jpg' },
];

export const HomePage = () => {
  // Estado para almacenar el contenido personalizado
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar el contenido publicado cuando el componente se monta
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        // Importante: Cargar contenido "published" en lugar de draft
        const result = await ContentService.getPageContent('home', 'published');
        if (result.ok && result.data && result.data.blocks) {
          setPageContent(result.data);
        }
      } catch (error) {
        console.error("Error cargando contenido publicado:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Función que ayuda a obtener contenido de un bloque específico o usar valor predeterminado
  const getBlockContent = (blockType, propertyName, defaultValue) => {
    if (!pageContent || !pageContent.blocks) return defaultValue;

    // Buscar el bloque por tipo
    const block = pageContent.blocks.find(b => b.type === blockType);

    // Si existe el bloque y tiene la propiedad, retornarla; de lo contrario, usar el valor predeterminado
    return block && block[propertyName] !== undefined
      ? block[propertyName]
      : defaultValue;
  };

  // Mientras se carga, mostrar un indicador o el contenido predeterminado
  if (loading) {
    return (
      <div className="home-section">
        {/* Contenido predeterminado mientras carga */}
        <HeroSection
          images={heroImages}
          title="Bienvenido a Cactilia"
          subtitle="Productos frescos y naturales para una vida mejor"
          showButton={true}
          height="100vh"
          autoRotate={true}
          interval={5000}
        />
        {/* Más secciones predeterminadas si lo deseas */}
      </div>
    );
  }

  // Renderizar la página con contenido personalizado o valores predeterminados
  return (
    <div className="home-section">
      {/* HeroSection - Hero principal */}
      <HeroSection
        images={getBlockContent('hero-slider', 'images', heroImages)}
        title={getBlockContent('hero-slider', 'title', "Bienvenido a Cactilia")}
        subtitle={getBlockContent('hero-slider', 'subtitle', "Productos frescos y naturales para una vida mejor")}
        showButton={getBlockContent('hero-slider', 'showButton', true)}
        buttonText={getBlockContent('hero-slider', 'buttonText', "Conoce Más")}
        buttonLink={getBlockContent('hero-slider', 'buttonLink', "#")}
        showLogo={getBlockContent('hero-slider', 'showLogo', true)}
        showSubtitle={getBlockContent('hero-slider', 'showSubtitle', true)}
        height={getBlockContent('hero-slider', 'height', "100vh")}
        autoRotate={getBlockContent('hero-slider', 'autoRotate', true)}
        interval={getBlockContent('hero-slider', 'interval', 5000)}
      />

      {/* Productos Destacados */}
      <HomeSection
        title={getBlockContent('featured-products', 'title', "Productos Destacados")}
        subtitle={getBlockContent('featured-products', 'subtitle', "Explora nuestra selección especial.")}
        icon={getBlockContent('featured-products', 'icon', "bi-star-fill")}
        showBg={getBlockContent('featured-products', 'showBg', false)}
        spacing="py-6"
        height="min-vh-75"
      >
        <ProductCarousel products={defaultProducts} />
      </HomeSection>

      {/* Sección Nuestro Huerto */}
      <HomeSection
        title={getBlockContent('image-carousel', 'title', "Nuestro Huerto")}
        subtitle={getBlockContent('image-carousel', 'subtitle', "Descubre la belleza y frescura de nuestra granja.")}
        icon={getBlockContent('image-carousel', 'icon', "bi-tree-fill")}
        showBg={getBlockContent('image-carousel', 'showBg', true)}
        spacing="py-6"
        height="min-vh-75"
      >
        <HomeCarousel images={defaultImages} />
      </HomeSection>

      {/* Sección Descubre Nuestros Productos */}
      <HomeSection
        title={getBlockContent('product-categories', 'title', "Descubre Nuestros Productos")}
        subtitle={getBlockContent('product-categories', 'subtitle', "Productos orgánicos de alta calidad para una vida mejor.")}
        icon={getBlockContent('product-categories', 'icon', "bi-box-seam")}
        showBg={getBlockContent('product-categories', 'showBg', false)}
        spacing="py-6"
        height="min-vh-75"
      >
        <ProductCarousel products={defaultProducts}/>
      </HomeSection>

      {/* Si hay un bloque de tipo 'text-block', renderizarlo */}
      {pageContent && pageContent.blocks && pageContent.blocks.some(block => block.type === 'text-block') && (
        <section className={`py-5 ${getBlockContent('text-block', 'showBg', false) ? 'bg-light' : ''}`}>
          <div className="container">
            <div className={`text-${getBlockContent('text-block', 'alignment', 'center')}`}>
              {getBlockContent('text-block', 'title', '') && (
                <h2 className="mb-4">{getBlockContent('text-block', 'title', '')}</h2>
              )}
              <div dangerouslySetInnerHTML={{
                __html: getBlockContent('text-block', 'content', '')
              }} />
            </div>
          </div>
        </section>
      )}

      {/* Si hay un bloque de tipo 'call-to-action', renderizarlo */}
      {pageContent && pageContent.blocks && pageContent.blocks.some(block => block.type === 'call-to-action') && (
        <div className="cta-section py-5" style={{
          backgroundImage: getBlockContent('call-to-action', 'backgroundImage', '')
            ? `url(${getBlockContent('call-to-action', 'backgroundImage', '')})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: !getBlockContent('call-to-action', 'backgroundImage', '') ? '#f8f9fa' : 'transparent'
        }}>
          <div className="container">
            <div className={`text-${getBlockContent('call-to-action', 'alignment', 'center')} py-5`}>
              <h2 className="mb-3">{getBlockContent('call-to-action', 'title', 'Llámado a la Acción')}</h2>
              <p className="lead mb-4">{getBlockContent('call-to-action', 'subtitle', 'Subtítulo descriptivo')}</p>
              <a
                href={getBlockContent('call-to-action', 'buttonLink', '#')}
                className="btn btn-primary btn-lg"
              >
                {getBlockContent('call-to-action', 'buttonText', 'Botón de Acción')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};