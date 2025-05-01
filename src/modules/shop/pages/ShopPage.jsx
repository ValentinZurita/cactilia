import React, { useEffect, Suspense, lazy, useCallback, useMemo } from 'react'; // useState ya no es necesario
import { useLocation } from 'react-router-dom'; 
import { useDispatch, useSelector } from 'react-redux'; 
import { HeroSection } from '../../public/components/home-page';
import { SearchBar, FilterBar, ProductList, Pagination, StatusMessage} from '../features/shop/index.js'; 
import { heroImages } from '../../../shared/constants';
import { useModal } from '../hooks/index.js' 
import { useCart } from '../features/cart/hooks/useCart.js'

// Acciones y Selectores del Slice
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
} from '../../../store/slices/shopPageSlice.js';

// Carga diferida del Modal
const ProductModal = lazy(() => 
  import('../features/shop/ProductModal.jsx')
    .then(module => ({ default: module.ProductModal }))
);

// Helper para obtener URL de imagen por tamaño
const getImageUrlBySize = (imgData, desiredSize = 'medium') => {
  if (!imgData) return null;
  const resized = imgData.resizedUrls;
  const originalUrl = imgData.url || imgData.src;
  const largeKey = '1200x1200';
  const mediumKey = '600x600';
  const smallKey = '200x200';

  switch (desiredSize) {
    case 'original': return originalUrl;
    case 'large': return (resized && resized[largeKey]) || originalUrl;
    case 'medium': return (resized && resized[mediumKey]) || (resized && resized[largeKey]) || originalUrl;
    case 'small': return (resized && resized[smallKey]) || (resized && resized[mediumKey]) || originalUrl;
    default: return (resized && resized[mediumKey]) || (resized && resized[largeKey]) || originalUrl;
  }
};

export const ShopPage = () => {
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

  // Lógica del Modal
  const { isOpen, selectedProduct, openModal, closeModal } = useModal();
  // Lógica del Carrito
  const { handleAddToCart } = useCart();

  // --- Manejadores Memoizados ---
  const handleProductClick = useCallback((product) => {
    openModal(product);
  }, [openModal]); 
  
  // Manejador para envío explícito de búsqueda
  const handleSearchSubmit = useCallback((term) => {
      // Establecer el nuevo término de búsqueda
      dispatch(setSearchTerm(term));
      // LIMPIAR TAMBIÉN OTROS FILTROS para asegurar una búsqueda fresca
      dispatch(setSelectedCategory(""));
      dispatch(setPriceOrder(""));
  }, [dispatch]);

  // Manejadores de Eventos usando Acciones de Redux
  const handleCategoryChange = useCallback((categoryName) => {
    dispatch(setSelectedCategory(categoryName)); 
    // Limpiar término de búsqueda al seleccionar categoría explícitamente
    dispatch(setSearchTerm("")); 
  }, [dispatch]);

  const handlePriceOrderChange = useCallback((order) => {
    dispatch(setPriceOrder(order));
    // Si se limpia el orden (ej: "Sin filtros" resulta en order === ""), 
    // limpiar también búsqueda y categoría
    if (order === "") { 
        dispatch(setSearchTerm(""));
        dispatch(setSelectedCategory("")); 
    } else {
        // Si se aplica orden específico, solo limpiar búsqueda previa
        dispatch(setSearchTerm(""));
    }
  }, [dispatch]);

  const handlePageChange = useCallback((page) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  // --- Efectos ---

  // Cargar datos iniciales al montar
  useEffect(() => {
    dispatch(fetchInitialShopData());
  }, [dispatch]);

  // Efecto para preseleccionar categoría desde estado de navegación
  useEffect(() => {
    const categoryNameToSelect = location.state?.preselectCategoryName;
    if (categoryNameToSelect && filters.selectedCategory !== categoryNameToSelect) {
      dispatch(setSelectedCategory(categoryNameToSelect));
    }
    // Limpiar el estado de navegación para evitar re-aplicación
    if (location.state?.preselectCategoryName) {
        window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch, filters.selectedCategory]); 

  // --- Lógica de Renderizado ---
  
  // Calcular props del banner dinámicamente y memoizar
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
              alt: imgData.alt || bannerConfig.title || 'Imagen de Banner' // Traducido
          }))
          .filter(img => img.src);
      } else if (bannerConfig.backgroundImage) {
         imagesToShow = [{
             id: 'single-banner-img',
             src: bannerConfig.backgroundImage,
             alt: bannerConfig.title || 'Imagen de Banner' // Traducido
         }];
      }
    }
    if (!imagesToShow || imagesToShow.length === 0) {
      imagesToShow = heroImages; // Fallback
    }

    return {
      images: imagesToShow,
      title,
      subtitle,
      showLogo,
      showSubtitle,
      height,
      autoRotate,
      showButton: false, // El banner de la tienda usualmente no lleva botón principal
    };
  }, [bannerConfig, bannerCollectionImages, heroImages]); 

  return (
    <>
      {/* Banner Hero - Dinámico basado en estado Redux */}
      <HeroSection {...bannerProps} />
      
      {/* Barra de Búsqueda - Props actualizadas para búsqueda explícita */}
      <SearchBar onSearchSubmit={handleSearchSubmit} />

      {/* Barra de Filtros - Pasar valores y manejadores */}
      <FilterBar
        selectedCategory={filters.selectedCategory} 
        setSelectedCategory={handleCategoryChange} 
        priceOrder={filters.priceOrder}
        setPriceOrder={handlePriceOrderChange} 
        categories={categories} 
      />

      {/* Mensaje de Estado - Usa estado Redux */}
      <StatusMessage loading={isLoading} error={error} />

      {/* Lista de Productos y Paginación - Usa estado Redux */}
      {!isLoading && !error && (
        <>
          <ProductList products={products} onProductClick={handleProductClick} />
          {totalPages > 1 && (
             <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange} 
             />
          )}
        </>
      )}

      {/* Modal de Producto - Usa Suspense para carga diferida */}
      <Suspense fallback={<div className="text-center my-4">Cargando detalles del producto...</div>}> 
        <ProductModal
          product={selectedProduct}
          isOpen={isOpen}
          onClose={closeModal}
          onAddToCart={handleAddToCart} 
        />
      </Suspense>
    </>
  );
};