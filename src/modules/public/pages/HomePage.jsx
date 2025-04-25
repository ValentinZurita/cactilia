import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HeroSection, HomeCarousel, HomeSection, ProductCarousel } from '../components/home-page/index.js'
import { SkeletonHero, SkeletonCarousel } from '../components/skeletons/index.js'
import '../../../styles/global.css'
import './../../public/styles/homepage.css'
import './../../public/styles/skeletons.css'
import { heroImages } from '../../../shared/constants/images.js'
import { 
  fetchHomepageData, 
  selectHomepagePageData,
  selectHomepageFeaturedProducts,
  selectHomepageFeaturedCategories,
  selectHomepageCollectionImages,
  selectHomepageIsLoading,
  selectHomepageError
} from '../../../store/slices/homepageSlice.js'

/**
 * HomePage
 *
 * Página principal que muestra diferentes secciones (Hero, Productos Destacados,
 * Carrusel de Granjas, Categorías, etc.) con datos cargados desde Firestore
 * (o datos de muestra como fallback).
 *
 * Características:
 * - Carga de productos destacados desde la base de datos.
 * - Carga de categorías destacadas desde la base de datos.
 * - Soporte para navegación al hacer clic en productos y categorías.
 * - Carga de contenido personalizado para la página 'home'.
 * - Soporte para colecciones de imágenes en hero y carrusel de granja.
 * - Fallback a datos de muestra cuando no hay datos en Firestore.
 * - Orden dinámico de las secciones, según configuración almacenada o por defecto.
 * Now uses Redux store (homepageSlice) for data fetching and state management.
 */
export const HomePage = () => {
  // Get Redux dispatch function
  const dispatch = useDispatch()

  // Select data from Redux store
  const pageData = useSelector(selectHomepagePageData)
  const featuredProducts = useSelector(selectHomepageFeaturedProducts)
  const featuredCategories = useSelector(selectHomepageFeaturedCategories)
  const collectionImages = useSelector(selectHomepageCollectionImages)
  const isLoading = useSelector(selectHomepageIsLoading)
  const error = useSelector(selectHomepageError)

  // ---------------------- FALLBACK DATA ----------------------
  // Imágenes de muestra para secciones de carrusel (OurFarmSection).
  const sampleImages = [
    { id: 1, src: '/public/images/placeholder.jpg', alt: 'Farm 1' },
    { id: 2, src: '/public/images/placeholder.jpg', alt: 'Farm 2' },
    { id: 3, src: '/public/images/placeholder.jpg', alt: 'Farm 3' },
  ]

  // Productos de muestra por si no hay productos reales.
  const sampleProducts = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: `sample-product-${i + 1}`,
      name: `Producto ${i + 1}`,
      image: '/public/images/placeholder.jpg',
      price: 25 + i,
      category: 'Muestra',
    }))

  // Categorías de muestra por si no hay categorías reales.
  const sampleCategories = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: `sample-category-${i + 1}`,
      name: `Categoría ${i + 1}`,
      image: '/public/images/placeholder.jpg',
    }))

  // ---------------------- EFFECTS ----------------------
  // Fetch data on component mount if not already loading or loaded
  useEffect(() => {
    // Check isLoading status from Redux store before dispatching
    if (!isLoading && !pageData && !error) { // Fetch only if idle and no data/error
      dispatch(fetchHomepageData())
    }
  }, [dispatch, isLoading, pageData, error]) // Dependencies ensure fetch only happens once needed

  // ---------------------- HELPERS ----------------------
  /**
   * Renderiza la página por defecto cuando no hay datos personalizados
   * o para usuarios no autenticados que no pueden acceder a los datos
   */
  const renderDefaultPage = () => (
    <>
      {/* Hero section como fallback cuando no hay datos de la API */}
      <HeroSection
        title="Bienvenido a Cactilia"
        subtitle="Descubre nuestros productos naturales"
        ctaText="Ver productos"
        ctaLink="/shop"
        images={heroImages}
      />

      {/* Products section como fallback */}
      <HomeSection
        title="Productos destacados"
        subtitle="Descubre nuestra selección de productos destacados"
        bgColor="var(--bg-light)"
      >
        <ProductCarousel
          products={featuredProducts.length > 0 ? featuredProducts : sampleProducts}
          link="/shop"
          linkText="Ver todos los productos"
        />
      </HomeSection>

      {/* Categories section como fallback */}
      <HomeSection
        title="Explora nuestras categorías"
        subtitle="Encuentra lo que buscas en nuestras categorías principales"
      >
        <ProductCarousel
          products={featuredCategories.length > 0 ? featuredCategories : sampleCategories}
          link="/shop"
          linkText="Ver todas las categorías"
          isCategories={true}
        />
      </HomeSection>
    </>
  )

  // --- FUNCIÓN AUXILIAR PARA SELECCIONAR URL POR TAMAÑO ---
  const getImageUrlBySize = (imgData, desiredSize = 'medium') => {
    if (!imgData) return null;

    const resized = imgData.resizedUrls; // Mapa { '1200x1200': '...', '600x600': '...', ... }
    // Intentar obtener la URL original de .url o .src
    const originalUrl = imgData.url || imgData.src; 

    // Asegurar que las claves coincidan con las generadas (_WxH.ext -> WxH)
    const largeKey = '1200x1200';
    const mediumKey = '600x600';
    const smallKey = '200x200';

    switch (desiredSize) {
      case 'original':
        return originalUrl;
      case 'large': 
        return (resized && resized[largeKey]) || originalUrl;
      case 'medium': 
        return (resized && resized[mediumKey]) || (resized && resized[largeKey]) || originalUrl;
      case 'small': 
        return (resized && resized[smallKey]) || (resized && resized[mediumKey]) || originalUrl;
      default: // Default a mediano si el tamaño no es válido o no se especifica
        console.warn(`Tamaño de imagen no reconocido o no especificado: '${desiredSize}'. Usando tamaño mediano por defecto.`);
        return (resized && resized[mediumKey]) || (resized && resized[largeKey]) || originalUrl;
    }
  };
  // --- FIN FUNCIÓN AUXILIAR ---

  // ---------------------- RENDER LOGIC ----------------------
  
  // --- Render Skeletons --- 
  if (isLoading && !pageData) { // Show skeleton only on initial load
    return (
      <>
        <SkeletonHero />
        <SkeletonCarousel />
        <SkeletonCarousel />
      </>
    );
  }

  // --- Render Error State --- (Optional but good practice)
  if (error) {
    return (
      <div className="container text-center py-5">
        <h2 className="text-danger">Error al cargar la página</h2>
        <p>{typeof error === 'string' ? error : 'Ocurrió un problema inesperado.'}</p>
        {/* Optionally add a retry button */}
      </div>
    );
  }

  // --- Render Content (Using Redux state or Fallbacks) ---
  
  // Use data from Redux store, fallback to sample data if needed
  const productsToShow = featuredProducts?.length > 0 ? featuredProducts : sampleProducts;
  const categoriesToShow = featuredCategories?.length > 0 ? featuredCategories : sampleCategories;

  // Determine section order (using pageData from Redux)
  const sectionOrder = pageData?.sectionOrder || ['hero', 'featuredProducts', 'farmCarousel', 'featuredCategories']; 

  // Helper to render sections based on order and configuration
  const renderSections = () => {
    return sectionOrder.map(sectionKey => {
      const sectionConfig = pageData?.sections?.[sectionKey] || {};
      if (sectionConfig.visible === false) return null; // Skip hidden sections

      switch (sectionKey) {
        case 'hero':
          console.log("DEBUG: Hero sectionConfig:", sectionConfig); // LOG 1
          console.log("DEBUG: Collection Images from store:", collectionImages); // LOG 2
          const heroImagesData = sectionConfig.useCollection
            ? (collectionImages[sectionConfig.collectionId] || [])
            : sectionConfig.images || [];
          console.log("DEBUG: Raw heroImagesData:", heroImagesData); // LOG 3

          const formattedHeroImages = heroImagesData.map((img, idx) => {
              if (!img) {
                  console.error("DEBUG: Found null/undefined image data in heroImagesData at index", idx);
                  return null; // Skip null/undefined entries
              }
              const url = getImageUrlBySize(img, 'large') || '/public/images/placeholder.jpg';
              console.log("DEBUG: Formatting image:", img, "-> Result URL:", url); // LOG 4
              return {
                  id: img.id || `hero-${idx}`,
                  src: url,
                  alt: img.alt || sectionConfig.title || 'Hero Image'
              }
          }).filter(Boolean); // Remove any null entries if errors occurred

          console.log("DEBUG: Final formattedHeroImages:", formattedHeroImages); // LOG 5

          return (
            <HeroSection
              key={sectionKey}
              title={sectionConfig.title || 'Bienvenido a Cactilia'}
              subtitle={sectionConfig.subtitle || 'Descubre nuestros productos naturales'}
              ctaText={sectionConfig.ctaText || 'Ver productos'}
              ctaLink={sectionConfig.ctaLink || '/shop'}
              images={formattedHeroImages.length > 0 ? formattedHeroImages : [{ id: 'fallback', src: '/public/images/placeholder.jpg', alt: 'Placeholder' }]}
            />
          );

        case 'featuredProducts':
          return (
            <HomeSection
              key={sectionKey}
              title={sectionConfig.title || 'Productos destacados'}
              subtitle={sectionConfig.subtitle || 'Descubre nuestra selección'}
              bgColor={sectionConfig.bgColor || 'var(--bg-light)'}
              link={sectionConfig.link || '/shop'}
              linkText={sectionConfig.linkText || 'Ver todos los productos'}
            >
              <ProductCarousel products={productsToShow} />
            </HomeSection>
          );

        case 'farmCarousel': // Assuming 'farmCarousel' uses HomeCarousel
          const farmImagesData = sectionConfig.useCollection
            ? (collectionImages[sectionConfig.collectionId] || [])
            : sectionConfig.images || [];
           const formattedFarmImages = farmImagesData.map((img, idx) => ({
            id: img.id || `farm-${idx}`,
            src: getImageUrlBySize(img, 'medium') || '/public/images/placeholder.jpg', 
            alt: img.alt || 'Imagen de la granja'
          }));  
          return (
            <HomeSection
              key={sectionKey}
              title={sectionConfig.title || 'Nuestra Granja'}
              subtitle={sectionConfig.subtitle || 'Conoce de dónde vienen nuestros productos'}
              bgColor={sectionConfig.bgColor}
              // No link/linkText by default for this type
            >
              <HomeCarousel images={formattedFarmImages.length > 0 ? formattedFarmImages : sampleImages} />
            </HomeSection>
          );

        case 'featuredCategories':
          return (
            <HomeSection
              key={sectionKey}
              title={sectionConfig.title || 'Explora categorías'}
              subtitle={sectionConfig.subtitle || 'Encuentra lo que buscas'}
              bgColor={sectionConfig.bgColor}
              link={sectionConfig.link || '/shop'}
              linkText={sectionConfig.linkText || 'Ver todas las categorías'}
            >
              <ProductCarousel products={categoriesToShow} isCategories={true} />
            </HomeSection>
          );
        
        default:
          return null;
      }
    });
  };

  // --- Component Return --- 
  return (
    <div className="homepage-container">
      {renderSections()} 
      {/* Footer will be rendered by the main layout */}
    </div>
  );
};