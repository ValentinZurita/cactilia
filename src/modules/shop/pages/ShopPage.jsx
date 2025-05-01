import React, { useEffect, Suspense, lazy, useCallback, useMemo } from 'react'; // Import React, Suspense, lazy, useCallback, useMemo
import { useLocation } from 'react-router-dom'; // Import useLocation
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { HeroSection } from '../../public/components/home-page';
import { SearchBar, FilterBar, ProductList, Pagination, StatusMessage} from '../features/shop/index.js'; // Import other components
import { heroImages } from '../../../shared/constants';
import { useModal } from '../hooks/index.js' 
import { useCart } from '../features/cart/hooks/useCart.js'

// Import actions and selectors from shopPageSlice
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
  // Import banner selectors
  selectShopBannerConfig,
  selectShopBannerCollectionImages,
} from '../../../store/slices/shopPageSlice.js';

// Lazy load ProductModal, selecting the named export
const ProductModal = lazy(() => 
  import('../features/shop/ProductModal.jsx')
    .then(module => ({ default: module.ProductModal }))
);

// Re-introduce or import the helper function
const getImageUrlBySize = (imgData, desiredSize = 'medium') => {
  if (!imgData) return null;
  const resized = imgData.resizedUrls;
  const originalUrl = imgData.url || imgData.src;
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
    default:
      console.warn(`Tamaño de imagen no reconocido o no especificado: '${desiredSize}'. Usando tamaño mediano por defecto.`);
      return (resized && resized[mediumKey]) || (resized && resized[largeKey]) || originalUrl;
  }
};

export const ShopPage = () => {
  const dispatch = useDispatch();
  const location = useLocation(); // Obtener objeto location

  // --- Select state from Redux store ---
  const products = useSelector(selectPaginatedProducts);
  const categories = useSelector(selectCategoryFilterOptions); // Use selector for filter options
  const totalPages = useSelector(selectShopTotalPages);
  const isLoading = useSelector(selectShopIsLoading);
  const error = useSelector(selectShopError);
  const filters = useSelector(selectShopFilters);
  const { currentPage } = useSelector(selectShopPagination);
  // Select banner data
  const bannerConfig = useSelector(selectShopBannerConfig);
  const bannerCollectionImages = useSelector(selectShopBannerCollectionImages);

  // Remove local state for banner and products
  // const [bannerConfig, setBannerConfig] = useState(null);
  // const [collectionImages, setCollectionImages] = useState([]);
  /* 
  const {
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    priceOrder,
    setPriceOrder,
    products,
    totalPages,
    currentPage,
    setCurrentPage,
    categories,
  } = useProducts();
  */

  // Modal logic (remains the same)
  const { isOpen, selectedProduct, openModal, closeModal } = useModal();

  // Cart logic (remains the same)
  const { handleAddToCart } = useCart();

  // --- Memoized Handlers ---
  const handleProductClick = useCallback((product) => {
    openModal(product);
  }, [openModal]); // Dependency: openModal from useModal

  // --- Event Handlers using Redux Actions --- (using useCallback for consistency, though maybe less critical here)
  const handleSearchChange = useCallback((term) => {
    dispatch(setSearchTerm(term));
  }, [dispatch]);

  const handleCategoryChange = useCallback((categoryName) => {
    dispatch(setSelectedCategory(categoryName)); 
  }, [dispatch]);

  const handlePriceOrderChange = useCallback((order) => {
    dispatch(setPriceOrder(order));
  }, [dispatch]);

  const handlePageChange = useCallback((page) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  // Fetch initial data on component mount
  useEffect(() => {
    dispatch(fetchInitialShopData());
  }, [dispatch]);

  // Efecto para preseleccionar categoría desde el estado de navegación (sin logs)
  useEffect(() => {
    const categoryNameToSelect = location.state?.preselectCategoryName;
    if (categoryNameToSelect && filters.selectedCategory !== categoryNameToSelect) {
      dispatch(setSelectedCategory(categoryNameToSelect));
    }
    if (location.state?.preselectCategoryName) {
        window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch, filters.selectedCategory]); // Added filters.selectedCategory dependency if used inside

  // --- Render Logic --- 
  
  // Function to prepare banner props dynamically
  // Let's memoize the result of getBannerProps
  const bannerProps = useMemo(() => {
    let imagesToShow = heroImages; // Default fallback
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
              alt: imgData.alt || bannerConfig.title || 'Banner Image'
          }))
          .filter(img => img.src);
      } else if (bannerConfig.backgroundImage) {
         imagesToShow = [{
             id: 'single-banner-img',
             src: bannerConfig.backgroundImage,
             alt: bannerConfig.title || 'Banner Image' 
         }];
      }
    }
    if (!imagesToShow || imagesToShow.length === 0) {
      imagesToShow = heroImages;
    }

    return {
      images: imagesToShow,
      title,
      subtitle,
      showLogo,
      showSubtitle,
      height,
      autoRotate,
      showButton: false,
    };
    // Dependencies for banner props calculation
  }, [bannerConfig, bannerCollectionImages, heroImages]); 

  return (
    <>
      {/* Hero Banner - Dynamic based on Redux state */}
      <HeroSection {...bannerProps} />
      
      {/* SearchBar - Pass current filter value and handler */}
      <SearchBar 
        searchTerm={filters.searchTerm} 
        setSearchTerm={handleSearchChange} // Pass memoized handler
      />

      {/* FilterBar - Pass current filter values and handlers */}
      <FilterBar
        selectedCategory={filters.selectedCategory} 
        setSelectedCategory={handleCategoryChange} // Pass memoized handler
        priceOrder={filters.priceOrder}
        setPriceOrder={handlePriceOrderChange} // Pass memoized handler
        categories={categories} 
      />

      {/* StatusMessage - Uses Redux state */}
      <StatusMessage loading={isLoading} error={error} />

      {/* ProductList & Pagination - Use Redux state */}
      {!isLoading && !error && (
        <>
          {/* Pass the memoized handleProductClick callback */}
          <ProductList products={products} onProductClick={handleProductClick} /> 
          {totalPages > 1 && (
             <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange} // Pass memoized handler
             />
          )}
        </>
      )}

      {/* ProductModal - Use Suspense for lazy loading */}
      <Suspense fallback={<div className="text-center my-4">Cargando detalles del producto...</div>}> 
        <ProductModal
          product={selectedProduct}
          isOpen={isOpen}
          onClose={closeModal}
          onAddToCart={handleAddToCart} // Pass the function from useCart
        />
      </Suspense>
    </>
  );
};