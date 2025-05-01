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
 */
export const useShopPageLogic = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // --- Selección de Estado desde Redux ---
  const products = useSelector(selectPaginatedProducts);
  const categories = useSelector(selectCategoryFilterOptions);
  const totalPages = useSelector(selectShopTotalPages);
  const isLoading = useSelector(selectShopIsLoading);
  const error = useSelector(selectShopError);
  const filters = useSelector(selectShopFilters);
  const { currentPage } = useSelector(selectShopPagination);
  const bannerConfig = useSelector(selectShopBannerConfig);
  const bannerCollectionImages = useSelector(selectShopBannerCollectionImages);

  // --- Manejadores Memoizados ---
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

  // --- Efectos ---
  useEffect(() => {
    dispatch(fetchInitialShopData());
  }, [dispatch]);

  useEffect(() => {
    const categoryNameToSelect = location.state?.preselectCategoryName;
    if (categoryNameToSelect && filters.selectedCategory !== categoryNameToSelect) {
      dispatch(setSelectedCategory(categoryNameToSelect));
    }
    if (location.state?.preselectCategoryName) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch, filters.selectedCategory]);

  // --- Cálculos Memoizados ---
  const bannerProps = useMemo(() => {
    let imagesToShow = heroImages;
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
          .filter(img => img.src);
      } else if (bannerConfig.backgroundImage) {
         imagesToShow = [{
             id: 'single-banner-img',
             src: bannerConfig.backgroundImage,
             alt: bannerConfig.title || 'Imagen de Banner'
         }];
      }
    }
    if (!imagesToShow || imagesToShow.length === 0) {
      imagesToShow = heroImages;
    }

    return {
      images: imagesToShow, title, subtitle, showLogo, showSubtitle, height, autoRotate,
      showButton: false,
    };
  }, [bannerConfig, bannerCollectionImages]); // heroImages es constante, no necesita ser dependencia

  // --- Retorno del Hook ---
  return {
    // Estado
    products,
    categories,
    totalPages,
    isLoading,
    error,
    filters,
    currentPage,
    bannerProps, // Devuelve las props calculadas
    // Manejadores
    handleSearchSubmit,
    handleCategoryChange,
    handlePriceOrderChange,
    handlePageChange,
  };
}; 