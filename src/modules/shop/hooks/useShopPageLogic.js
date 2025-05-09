import { useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { heroImages } from '../../../shared/constants'; // Necesitamos las imágenes fallback
import { getImageUrlBySize } from '../../../utils/imageUtils'; // Corregir ruta de importación
import {
  fetchInitialShopData,
  setSearchTerm,
  setSelectedCategory,
  setPriceOrder,
  setCurrentPage,
  selectPaginatedProducts,
  selectCategoryFilterOptions,
  selectShopTotalPages,
  selectShopIsLoading,
  selectShopError,
  selectShopFilters,
  selectShopPagination,
  selectShopBannerConfig,
  selectShopBannerCollectionImages,
} from '../../../store/slices/shopPageSlice';

/**
 * Hook personalizado para encapsular la lógica de la página de la tienda.
 * Maneja la obtención de datos de Redux, efectos secundarios y callbacks.
 */
export const useShopPageLogic = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // ===========================================================================
  // Selección de Estado (Redux)
  // ===========================================================================
  const products = useSelector(selectPaginatedProducts);
  const categories = useSelector(selectCategoryFilterOptions);
  const totalPages = useSelector(selectShopTotalPages);
  const isLoading = useSelector(selectShopIsLoading);
  const error = useSelector(selectShopError);
  const filters = useSelector(selectShopFilters);
  const { currentPage } = useSelector(selectShopPagination);
  const bannerConfig = useSelector(selectShopBannerConfig);
  const bannerCollectionImages = useSelector(selectShopBannerCollectionImages);

  // ===========================================================================
  // Manejadores de Eventos (Callbacks Memoizados)
  // ===========================================================================
  const handleSearchSubmit = useCallback((term) => {
    dispatch(setSearchTerm(term));
    dispatch(setSelectedCategory(""));
    dispatch(setPriceOrder(""));
  }, [dispatch]);

  const handleCategoryChange = useCallback((categoryName) => {
    dispatch(setSelectedCategory(categoryName));
    dispatch(setSearchTerm(""));
  }, [dispatch]);

  const handlePriceOrderChange = useCallback((order) => {
    dispatch(setPriceOrder(order));
    if (order === "") {
      dispatch(setSearchTerm(""));
      dispatch(setSelectedCategory(""));
    } else {
      dispatch(setSearchTerm(""));
    }
  }, [dispatch]);

  const handlePageChange = useCallback((page) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  // ===========================================================================
  // Efectos Secundarios (useEffect)
  // ===========================================================================
  
  // Cargar datos iniciales al montar
  useEffect(() => {
    dispatch(fetchInitialShopData());
  }, [dispatch]);

  // Preseleccionar categoría desde el estado de navegación (SOLO AL MONTAR)
  useEffect(() => {
    const categoryNameToSelect = location.state?.preselectCategoryName;
    if (categoryNameToSelect) {
      // Solo despachar si es realmente necesario (el estado podría ya estar bien por caché)
      // Es importante comprobar contra el estado ACTUAL al momento de montar.
      // NOTA: Acceder a getState() dentro de useEffect no es lo ideal,
      // pero para una acción de montaje única es una solución pragmática.
      // Si filters ya estuviera en el estado inicial correcto por otra razón, esto lo evita.
      // Aunque en este flujo, probablemente siempre será diferente al montar.
      const currentSelectedCategory = filters.selectedCategory; // Leer el valor actual
      if (currentSelectedCategory !== categoryNameToSelect) {
           console.log(`[useShopPageLogic Mount Effect] Preselecting category: ${categoryNameToSelect}`);
           dispatch(setSelectedCategory(categoryNameToSelect));
      }
      // Limpiar estado de navegación DESPUÉS de intentar despachar
      console.log("[useShopPageLogic Mount Effect] Cleaning location.state");
      window.history.replaceState({}, document.title); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [dispatch]); // <-- Dependencias: Solo dispatch (estable), se ejecuta solo al montar
   // Se deshabilita la regla eslint para exhaustive-deps aquí intencionalmente.
   // Queremos que esto se ejecute UNA SOLA VEZ para leer el estado inicial de navegación.
   // location.state y filters.selectedCategory NO deben estar aquí.

  // ===========================================================================
  // Cálculos Derivados (Memoizados)
  // ===========================================================================
  const bannerProps = useMemo(() => {
    let imagesToShow = heroImages; // Fallback por defecto
    const title = bannerConfig?.title || "Tienda de Cactilia";
    const subtitle = bannerConfig?.subtitle || "Encuentra productos frescos y naturales";
    const showLogo = bannerConfig?.showLogo !== false;
    const showSubtitle = bannerConfig?.showSubtitle !== false;
    const height = bannerConfig?.height || "50vh";
    const autoRotate = bannerConfig?.autoRotate || false;
    const desiredSize = bannerConfig?.imageSize || 'large';

    if (bannerConfig) {
      if (bannerConfig.useCollection && bannerCollectionImages.length > 0) {
         imagesToShow = bannerCollectionImages
          .map(imgData => ({
              id: imgData.id || `banner-img-${Math.random()}`,
              src: getImageUrlBySize(imgData, desiredSize),
              alt: imgData.alt || bannerConfig.title || 'Imagen de Banner'
          }))
          .filter(img => img.src); // Filtrar si la URL no se generó
      } else if (bannerConfig.backgroundImage) {
         // Usar imagen única de fondo
         imagesToShow = [{
             id: 'single-banner-img',
             src: bannerConfig.backgroundImage,
             alt: bannerConfig.title || 'Imagen de Banner'
         }];
      }
    }
    // Asegurar siempre un fallback
    if (!imagesToShow || imagesToShow.length === 0) {
      imagesToShow = heroImages;
    }

    return {
      images: imagesToShow, title, subtitle, showLogo, showSubtitle, height, autoRotate,
      showButton: false, // Botón no necesario en banner de tienda
    };
  }, [bannerConfig, bannerCollectionImages]); // heroImages es constante

  // ===========================================================================
  // Retorno del Hook
  // ===========================================================================
  return {
    // Estado y datos derivados
    products,
    categories,
    totalPages,
    isLoading,
    error,
    filters,
    currentPage,
    bannerProps, 
    // Manejadores
    handleSearchSubmit,
    handleCategoryChange,
    handlePriceOrderChange,
    handlePageChange,
  };
}; 