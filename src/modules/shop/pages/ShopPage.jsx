import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { HeroSection } from '../../public/components/home-page';
import { SearchBar, FilterBar, ProductList, Pagination, ProductModal, StatusMessage} from '../features/shop/index.js';
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

  // Fetch initial data on component mount
  useEffect(() => {
    dispatch(fetchInitialShopData());
  }, [dispatch]);

  // Remove banner loading logic
  /*
  useEffect(() => {
    const loadBannerConfig = async () => { ... };
    loadBannerConfig();
  }, []);

  const loadCollectionImages = async (collectionId) => { ... };
  */

  // --- Event Handlers using Redux Actions ---
  const handleSearchChange = (term) => {
    dispatch(setSearchTerm(term));
  };

  const handleCategoryChange = (categoryId) => {
    // categoryId will be null for 'All Categories'
    dispatch(setSelectedCategory(categoryId)); 
  };

  const handlePriceOrderChange = (order) => {
    dispatch(setPriceOrder(order));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  // --- Render Logic ---
  
  // Function to prepare banner props dynamically
  const getBannerProps = () => {
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
         // Use collection images, prepare array of objects { id, src, alt }
         imagesToShow = bannerCollectionImages
          .map(imgData => ({
              id: imgData.id || `banner-img-${Math.random()}`,
              src: getImageUrlBySize(imgData, desiredSize),
              alt: imgData.alt || bannerConfig.title || 'Banner Image'
          }))
          .filter(img => img.src); // Filter out entries where URL generation failed
      } else if (bannerConfig.backgroundImage) {
         // Use single background image (no resizing needed here)
         // Create an object structure even for single image
         imagesToShow = [{
             id: 'single-banner-img',
             src: bannerConfig.backgroundImage,
             alt: bannerConfig.title || 'Banner Image' 
         }];
      }
    }
    // Ensure there's always at least a fallback image
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
      showButton: false, // Shop banner typically doesn't have a main CTA button
    };
  };

  const bannerProps = getBannerProps();

  return (
    <>
      {/* Hero Banner - Dynamic based on Redux state */}
      <HeroSection {...bannerProps} />
      
      {/* SearchBar - Pass current filter value and handler */}
      <SearchBar 
        searchTerm={filters.searchTerm} 
        setSearchTerm={handleSearchChange} 
      />

      {/* FilterBar - Pass current filter values and handlers */}
      <FilterBar
        selectedCategory={filters.selectedCategory} 
        setSelectedCategory={handleCategoryChange} 
        priceOrder={filters.priceOrder}
        setPriceOrder={handlePriceOrderChange} 
        categories={categories} // Pass formatted categories from selector
      />

      {/* StatusMessage - Uses Redux state */}
      <StatusMessage loading={isLoading} error={error} />

      {/* ProductList & Pagination - Use Redux state */}
      {!isLoading && !error && (
        <>
          <ProductList products={products} onProductClick={openModal} />
          {totalPages > 1 && (
             <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange} 
             />
          )}
        </>
      )}

      {/* ProductModal - No changes needed */}
      <ProductModal
        product={selectedProduct}
        isOpen={isOpen}
        onClose={closeModal}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};