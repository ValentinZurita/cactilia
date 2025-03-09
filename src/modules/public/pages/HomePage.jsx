// src/modules/public/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { HeroSection, ProductCarousel, HomeSection, HomeCarousel } from '../components/home-page/index.js'
import '../../../styles/global.css'
import { heroImages } from '../../../shared/constants/images.js';
import { ContentService } from '../../admin/index.js'

export const HomePage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Datos de muestra para cuando no hay datos guardados
  const sampleImages = [
    { id: 1, src: "/public/images/placeholder.jpg", alt: "Farm 1" },
    { id: 2, src: "/public/images/placeholder.jpg", alt: "Farm 2" },
    { id: 3, src: "/public/images/placeholder.jpg", alt: "Farm 3" }
  ];

  const sampleProducts = [
    { id: 1, name: 'Vegetables', image: '/public/images/placeholder.jpg' },
    { id: 2, name: 'Edible Flowers', image: '/public/images/placeholder.jpg' },
    { id: 3, name: 'Product 3', image: '/public/images/placeholder.jpg' },
    { id: 4, name: 'Product 4', image: '/public/images/placeholder.jpg' },
    { id: 5, name: 'Product 5', image: '/public/images/placeholder.jpg' },
    { id: 6, name: 'Product 6', image: '/public/images/placeholder.jpg' },
  ];

  // Cargar datos desde Firestore
  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        // Verificar si ContentService está disponible
        if (typeof ContentService?.getPageContent !== 'function') {
          console.warn('ContentService no está disponible o no tiene el método getPageContent');
          setPageData(null);
          return;
        }

        const result = await ContentService.getPageContent('home', 'published');

        if (result?.ok && result?.data) {
          setPageData(result.data);
        } else {
          console.log('No se encontraron datos publicados, usando valores predeterminados');
          setPageData(null);
        }
      } catch (error) {
        console.error("Error cargando página:", error);
        setPageData(null);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  // Versión original de la página si no hay datos personalizados
  const renderDefaultPage = () => (
    <div className="home-section">
      {/* HeroSection */}
      <HeroSection
        images={heroImages}
        title="Bienvenido a Cactilia"
        subtitle="Productos frescos y naturales para una vida mejor"
        showButton={true}
        height="100vh"
        autoRotate={true}
        interval={5000}
      />

      {/* Categorias */}
      <HomeSection
        title="Productos Destacados"
        subtitle="Explora nuestra selección especial."
        icon="bi-star-fill"
        showBg={false}
        spacing="py-6"
        height="min-vh-75"
      >
        <ProductCarousel products={sampleProducts} />
      </HomeSection>

      {/* OurFarmSection */}
      <HomeSection
        title="Nuestro Huerto"
        subtitle="Descubre la belleza y frescura de nuestra granja."
        icon="bi-tree-fill"
        showBg={true}
        spacing="py-6"
        height="min-vh-75"
      >
        <HomeCarousel images={sampleImages} />
      </HomeSection>

      {/* Productos Destacados */}
      <HomeSection
        title="Descubre Nuestros Productos"
        subtitle="Productos orgánicos de alta calidad para una vida mejor."
        icon="bi-box-seam"
        showBg={false}
        spacing="py-6"
        height="min-vh-75"
      >
        <ProductCarousel products={sampleProducts}/>
      </HomeSection>
    </div>
  );

  // Si no hay datos personalizados o están cargando, mostrar la implementación original
  if (!pageData || loading || !pageData.sections) {
    return renderDefaultPage();
  }

  // Con datos personalizados, usar la configuración guardada
  const { sections, blockOrder } = pageData;

  // Verificar que sections exista
  if (!sections) {
    console.warn('La estructura de datos no es correcta, usando la versión predeterminada');
    return renderDefaultPage();
  }

  // Determinar el orden de renderización
  const renderOrder = blockOrder && Array.isArray(blockOrder) && blockOrder.length > 0
    ? blockOrder
    : Object.keys(sections);

  // Renderizar las secciones en el orden especificado
  return (
    <div className="home-section">
      {/* Renderizar todas las secciones según el orden especificado */}
      {renderOrder.map((sectionId) => {
        // Verificar que la sección existe
        if (!sections[sectionId]) return null;

        const sectionData = sections[sectionId];

        switch (sectionId) {
          case 'hero':
            return (
              <HeroSection
                key={sectionId}
                images={sectionData.backgroundImage ? [sectionData.backgroundImage] : heroImages}
                title={sectionData.title || "Bienvenido a Cactilia"}
                subtitle={sectionData.subtitle || "Productos frescos y naturales para una vida mejor"}
                showButton={sectionData.showButton !== false}
                buttonText={sectionData.buttonText || "Conoce Más"}
                buttonLink={sectionData.buttonLink || "#"}
                showLogo={sectionData.showLogo !== false}
                showSubtitle={sectionData.showSubtitle !== false}
                height={sectionData.height || "100vh"}
                autoRotate={sectionData.autoRotate !== false}
                interval={sectionData.interval || 5000}
              />
            );

          case 'featuredProducts':
            return (
              <HomeSection
                key={sectionId}
                title={sectionData.title || "Productos Destacados"}
                subtitle={sectionData.subtitle || "Explora nuestra selección especial."}
                icon={sectionData.icon || "bi-star-fill"}
                showBg={sectionData.showBg === true}
                spacing="py-6"
                height="min-vh-75"
              >
                <ProductCarousel products={sampleProducts} />
              </HomeSection>
            );

          case 'farmCarousel':
            return (
              <HomeSection
                key={sectionId}
                title={sectionData.title || "Nuestro Huerto"}
                subtitle={sectionData.subtitle || "Descubre la belleza y frescura de nuestra granja."}
                icon={sectionData.icon || "bi-tree-fill"}
                showBg={sectionData.showBg !== false}
                spacing="py-6"
                height="min-vh-75"
              >
                <HomeCarousel images={sampleImages} />
              </HomeSection>
            );

          case 'productCategories':
            return (
              <HomeSection
                key={sectionId}
                title={sectionData.title || "Descubre Nuestros Productos"}
                subtitle={sectionData.subtitle || "Productos orgánicos de alta calidad para una vida mejor."}
                icon={sectionData.icon || "bi-box-seam"}
                showBg={sectionData.showBg === true}
                spacing="py-6"
                height="min-vh-75"
              >
                <ProductCarousel products={sampleProducts}/>
              </HomeSection>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};