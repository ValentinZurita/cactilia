import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HeroSection, HomeCarousel, HomeSection, ProductCarousel } from '../components/home-page/index.js'
import { SkeletonHero, SkeletonCarousel } from '../components/skeletons/index.js'
import '../../../styles/global.css'
import './../../public/styles/homepage.css'
import './../../public/styles/skeletons.css'
import { sampleImages, sampleProducts, sampleCategories } from '../data/sampleHomepageData.js'; 
import { 
  fetchHomepageData, 
  selectHomepagePageData,
  selectHomepageFeaturedProducts,
  selectHomepageFeaturedCategories,
  selectHomepageCollectionImages,
  selectHomepageIsLoading,
  selectHomepageError,
  selectHomepageLastFetchTimestamp
} from '../../../store/slices/homepageSlice.js'
import { getImageUrlBySize } from "../../../utils/imageUtils.js";
import { openProductModal } from "../../../store/slices/uiSlice.js"; 

/**
 * HomePage
 *
 * Página principal que muestra diferentes secciones (Hero, Productos Destacados,
 * Carrusel de Granjas, Categorías, etc.) con datos cargados desde Firestore
 *
 * Características:
 * - Carga de productos y categorías destacadas desde la base de datos.
 * - Carga de contenido personalizado para la página (títulos, orden de secciones).
 * - Soporte para usar colecciones de imágenes de Firestore en Hero y Carrusel Granja.
 * - Fallback a datos de muestra cuando no hay datos reales.
 * - Orden y visibilidad de secciones configurables dinámicamente.
 * - Utiliza Redux (`homepageSlice`) para la obtención y gestión del estado.
 */
export const HomePage = () => {
  const dispatch = useDispatch()

  // Selección de datos desde el store de Redux
  const pageData = useSelector(selectHomepagePageData)
  const featuredProducts = useSelector(selectHomepageFeaturedProducts)
  const featuredCategories = useSelector(selectHomepageFeaturedCategories)
  const collectionImages = useSelector(selectHomepageCollectionImages)
  const isLoading = useSelector(selectHomepageIsLoading)
  const error = useSelector(selectHomepageError)
  const lastFetchTimestamp = useSelector(selectHomepageLastFetchTimestamp);

  // ---------------------- EFECTOS ----------------------
  // Carga los datos al montar el componente O si los datos rehidratados son obsoletos
  useEffect(() => {
    const now = Date.now();
    const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas (mismo valor que en slice)
    const isDataStale = !lastFetchTimestamp || (now - lastFetchTimestamp > CACHE_TTL);

    // Despachar si está cargando, si faltan datos, si hay error, o si los datos son obsoletos
    if (!isLoading && (!pageData || error || isDataStale)) {
      console.log(`>>> HomePage useEffect: Dispatching fetchHomepageData (Initial: ${!pageData}, Error: ${!!error}, Stale: ${isDataStale})`);
      dispatch(fetchHomepageData())
    }
    // Código original comentado:
    // if (!isLoading && !pageData && !error) { 
    //   console.log(\'>>> HomePage useEffect: Dispatching fetchHomepageData (data missing or error)...\');
    //   dispatch(fetchHomepageData())
    // }

  }, [dispatch, isLoading, pageData, error, lastFetchTimestamp]); // <-- Añadir lastFetchTimestamp a dependencias

  // --- Función para manejar clic en tarjeta de producto/categoría ---
  const handleProductCardClick = useCallback((productData) => {
    if (productData && productData.id) {
        dispatch(openProductModal(productData)); 
    } else {
        console.error("[HomePage] No se pudo abrir el modal: faltan datos del producto.");
    }
  }, [dispatch]);

  // ---------------------- FUNCIONES AUXILIARES DE RENDERIZADO DE SECCIONES ----------------------

  const _renderHeroSection = (sectionConfig) => {
    const heroImagesData = (sectionConfig.useCollection && collectionImages?.[sectionConfig.collectionId]?.length > 0)
        ? collectionImages[sectionConfig.collectionId]
        : sectionConfig.images;

    const heroImagesProcessed = Array.isArray(heroImagesData)
        ? heroImagesData.map(img => ({
            id: img.id || Math.random(),
            src: getImageUrlBySize(img, 'large'),
            alt: img.alt || 'Hero image'
        }))
        : [];

    return (
        <HeroSection
            key="hero"
            title={sectionConfig.title || 'Bienvenido a Cactilia'}
            subtitle={sectionConfig.subtitle || 'Descubre nuestros productos naturales'}
            ctaText={sectionConfig.ctaText || 'Ver productos'}
            ctaLink={sectionConfig.ctaLink || '/shop'}
            images={heroImagesProcessed.length > 0 ? heroImagesProcessed : [{ id: 'fallback', src: '/public/images/placeholder.jpg', alt: 'Placeholder' }]}
        />
    );
  };

  const _renderFeaturedProductsSection = (sectionConfig, products) => {
    return (
        <HomeSection
            key="featuredProducts"
            title={sectionConfig.title || 'Productos destacados'}
            subtitle={sectionConfig.subtitle || 'Descubre nuestra selección'}
            bgColor={sectionConfig.bgColor || 'var(--bg-light)'}
            link={sectionConfig.link || '/shop'}
            linkText={sectionConfig.linkText || 'Ver todos los productos'}
        >
            <ProductCarousel 
              products={products} 
              onProductClick={handleProductCardClick} 
            />
        </HomeSection>
    );
  };

  const _renderFarmCarouselSection = (sectionConfig) => {
    const farmImagesData = (sectionConfig.useCollection && collectionImages?.[sectionConfig.collectionId]?.length > 0)
        ? collectionImages[sectionConfig.collectionId]
        : (sectionConfig.images || sampleImages); // Fallback a sampleImages

    const farmImagesProcessed = Array.isArray(farmImagesData)
        ? farmImagesData.map(img => ({
            id: img.id || Math.random(),
            src: getImageUrlBySize(img, 'medium'),
            alt: img.alt || 'Farm image'
        }))
        : [];

    return (
        <HomeSection
            key="farmCarousel"
            title={sectionConfig.title || 'Nuestra Granja'}
            subtitle={sectionConfig.subtitle || 'Conoce de dónde vienen nuestros productos'}
            bgColor={sectionConfig.bgColor}
        >
            <HomeCarousel images={farmImagesProcessed.length > 0 ? farmImagesProcessed : sampleImages} />
        </HomeSection>
    );
  };

  const _renderFeaturedCategoriesSection = (sectionConfig, categories) => {
    return (
        <HomeSection
            key="featuredCategories"
            title={sectionConfig.title || 'Explora categorías'}
            subtitle={sectionConfig.subtitle || 'Encuentra lo que buscas'}
            bgColor={sectionConfig.bgColor}
            link={sectionConfig.link || '/shop'}
            linkText={sectionConfig.linkText || 'Ver todas las categorías'}
        >
            <ProductCarousel 
              products={categories} 
              isCategory={true}
            />
        </HomeSection>
    );
  };

  // ---------------------- LÓGICA PRINCIPAL DE RENDERIZADO ----------------------
  
  // --- Renderizado de Skeletons ---
  // Muestra skeletons solo durante la carga inicial (cuando pageData aún no existe)
  if (isLoading && !pageData) { 
    return (
      <>
        <SkeletonHero />
        <SkeletonCarousel />
        <SkeletonCarousel />
      </>
    );
  }

  // --- Renderizado del Estado de Error ---
  if (error) {
    return (
      <div className="container text-center py-5">
        <h2 className="text-danger">Error al cargar la página</h2>
        <p>{typeof error === 'string' ? error : 'Ocurrió un problema inesperado.'}</p>
      </div>
    );
  }

  // --- Renderizado del Contenido Principal (Solo si pageData está listo y no hay error) ---
   
  // Usar datos del store de Redux, o los datos de muestra como fallback.
  const productsToShow = featuredProducts?.length > 0 ? featuredProducts : sampleProducts;
  const categoriesToShow = featuredCategories?.length > 0 ? featuredCategories : sampleCategories;

  // Determinar orden de secciones (usando pageData o un orden por defecto)
  const sectionOrder = pageData?.blockOrder || ['hero', 'featuredProducts', 'farmCarousel', 'productCategories']; 

  // Función principal para renderizar secciones
  const renderSections = () => {
    return sectionOrder.map(sectionKey => {
      const sectionConfig = pageData?.sections?.[sectionKey] || {};
      
      if (sectionConfig.visible === false) return null;

      switch (sectionKey) {
        case 'hero':
          // Llama a la función auxiliar correspondiente
          return _renderHeroSection(sectionConfig);
        case 'featuredProducts':
          // Llama a la función auxiliar correspondiente
          return _renderFeaturedProductsSection(sectionConfig, productsToShow);
        case 'farmCarousel':
          // Llama a la función auxiliar correspondiente
          return _renderFarmCarouselSection(sectionConfig);
        case 'productCategories': {
          // Obtener la configuración específica y las categorías
          const categoriesSource = featuredCategories?.length > 0 ? featuredCategories : sampleCategories;
          
          // Obtener el límite y asegurarse de que es un número válido
          const categoryLimit = sectionConfig?.limit;
          const isValidLimit = typeof categoryLimit === 'number' && categoryLimit > 0;
          
          // Aplicar el límite SOLO si es válido
          const limitedCategories = isValidLimit 
              ? categoriesSource.slice(0, categoryLimit) 
              : categoriesSource; // Usar la fuente completa si el límite no es válido

          // --- DEBUGGING: Verificar el limit leído por el componente ---
          console.log(`>>> HomePage render - Read config limit: ${categoryLimit}, Is Valid: ${isValidLimit}, Passed Count: ${limitedCategories.length}`);
          // --- FIN DEBUGGING ---

          // Renderizar la sección con las categorías (limitadas o no)
          return _renderFeaturedCategoriesSection(sectionConfig, limitedCategories);
        }
        default:
          console.warn(`HomePage: Tipo de sección desconocido encontrado en sectionOrder: ${sectionKey}`);
          return null;
      }
    });
  };

  // --- Renderizado del Componente --- 
  return (
    <div className="homepage-container">
      {renderSections()} 
      {/* El Footer será renderizado por el layout principal (PublicLayout) */}
    </div>
  );
};