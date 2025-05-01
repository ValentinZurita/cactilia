import React, { useEffect, useCallback, lazy, Suspense } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HomeCarousel, HomeSection } from '../components/home-page/index.js'
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

// --- Importar los nuevos Componentes Renderizadores de Sección ---
import HeroSectionRenderer from '../components/home-page/sections/HeroSectionRenderer.jsx';
import FeaturedProductsSectionRenderer from '../components/home-page/sections/FeaturedProductsSectionRenderer.jsx';
import FarmCarouselSectionRenderer from '../components/home-page/sections/FarmCarouselSectionRenderer.jsx';
import FeaturedCategoriesSectionRenderer from '../components/home-page/sections/FeaturedCategoriesSectionRenderer.jsx';

// --- Componente Principal --- 
export const HomePage = () => {
  const dispatch = useDispatch()

  // Selección de datos desde el store de Redux
  const pageData = useSelector(selectHomepagePageData)
  const featuredProducts = useSelector(selectHomepageFeaturedProducts)
  const featuredCategories = useSelector(selectHomepageFeaturedCategories)
  const collectionImages = useSelector(selectHomepageCollectionImages)
  const isLoading = useSelector(selectHomepageIsLoading)
  const error = useSelector(selectHomepageError)

  // ---------------------- EFECTOS ----------------------
  // Carga los datos al montar el componente. El thunk decidirá si usar caché o buscar
  useEffect(() => {
    // 'fetchHomepageData' contiene la lógica para verificar el caché TTL y decidir si realmente necesita buscar datos frescos
    dispatch(fetchHomepageData());
    
  }, [dispatch]); // Ejecutar solo una vez al montar

  // --- Función para manejar clic en tarjeta de producto/categoría ---
  const handleProductCardClick = useCallback((productData) => {
    if (productData && productData.id) {
        dispatch(openProductModal(productData)); 
    } else {
        console.error("[HomePage] No se pudo abrir el modal: faltan datos del producto.");
    }
  }, [dispatch]);

  // ---------------------- FUNCIONES AUXILIARES DE RENDERIZADO DE SECCIONES ----------------------

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

  // --- Renderizado del Contenido Principal ---
   
  // Usar datos del store de Redux, o los datos de muestra como fallback.
  const productsToShow = featuredProducts?.length > 0 ? featuredProducts : sampleProducts;
  const categoriesToShow = featuredCategories?.length > 0 ? featuredCategories : sampleCategories;

  // Determinar orden de secciones (usando pageData o un orden por defecto)
  const sectionOrder = pageData?.blockOrder || ['hero', 'featuredProducts', 'farmCarousel', 'productCategories']; 

  // --- Mapeo de Claves de Sección a COMPONENTES --- 
  // Ahora todos los renderers son componentes importados
  const sectionRenderersMap = {
    hero: HeroSectionRenderer,
    featuredProducts: FeaturedProductsSectionRenderer, 
    farmCarousel: FarmCarouselSectionRenderer,
    productCategories: FeaturedCategoriesSectionRenderer, // Usamos el componente importado
  };

  // --- Renderizado del Componente --- 
  return (
    <div className="homepage-container">
      {sectionOrder.map(sectionKey => {
        const sectionConfig = pageData?.sections?.[sectionKey];
        if (!sectionConfig || sectionConfig.visible === false) {
          return null;
        }

        // Obtener el Componente del mapeo
        const SectionRendererComponent = sectionRenderersMap[sectionKey];

        if (SectionRendererComponent) {
          // Determinar las props para este componente renderer específico
          let componentProps = { sectionConfig }; 
          if (sectionKey === 'hero' || sectionKey === 'farmCarousel') {
            componentProps.collectionImages = collectionImages;
          }
          if (sectionKey === 'featuredProducts') {
            componentProps.products = productsToShow;
            componentProps.handleProductCardClick = handleProductCardClick;
          }
          if (sectionKey === 'productCategories') {
             componentProps.categories = categoriesToShow;
          }
          
          // Renderizar el componente directamente
          return <SectionRendererComponent key={sectionKey} {...componentProps} />;
          
        } else {
          console.warn(`HomePage: No renderer component found for section key: ${sectionKey}`);
          return null;
        }
      })}
      {/* El Footer será renderizado por el layout principal (PublicLayout) */}
    </div>
  );
};