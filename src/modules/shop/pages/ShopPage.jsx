import { useState, useEffect } from 'react';
import { HeroSection } from '../../public/components/home-page';
import { SearchBar, FilterBar, ProductList, Pagination, ProductModal, StatusMessage} from '../components/shop-page/index.js';
import { useProducts, useModal, useCart } from '../hooks/index.js';
import { heroImages } from '../../../shared/constants';
import { getCollectionImages } from '../../admin/services/collectionsService';
import { getShopPageContent } from '../../admin/components/homepage-editor/shopPageService.js'

export const ShopPage = () => {
  // Estado para el banner personalizado
  const [bannerConfig, setBannerConfig] = useState(null);
  const [collectionImages, setCollectionImages] = useState([]);

  // Data fetching logic
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

  // Modal logic
  const { isOpen, selectedProduct, openModal, closeModal } = useModal();

  // Cart logic
  const { handleAddToCart } = useCart();

  // Cargar la configuración del banner
  useEffect(() => {
    const loadBannerConfig = async () => {
      try {
        const result = await getShopPageContent('published');
        if (result.ok && result.data && result.data.sections && result.data.sections.banner) {
          setBannerConfig(result.data.sections.banner);

          // Cargar imágenes de colección si es necesario
          if (result.data.sections.banner.useCollection && result.data.sections.banner.collectionId) {
            loadCollectionImages(result.data.sections.banner.collectionId);
          }
        }
      } catch (error) {
        console.error('Error cargando configuración del banner:', error);
      }
    };

    loadBannerConfig();
  }, []);

  // Cargar imágenes de colección
  const loadCollectionImages = async (collectionId) => {
    try {
      const result = await getCollectionImages(collectionId);
      if (result.ok && Array.isArray(result.data)) {
        const imageUrls = result.data.map(item => item.url);
        setCollectionImages(imageUrls);
      }
    } catch (error) {
      console.error('Error cargando imágenes de colección:', error);
    }
  };

  // Determinar qué imágenes usar para el banner
  const getBannerImages = () => {
    if (!bannerConfig) return heroImages;

    if (bannerConfig.useCollection && collectionImages.length > 0) {
      return collectionImages;
    }

    if (bannerConfig.backgroundImage) {
      return [bannerConfig.backgroundImage];
    }

    return heroImages;
  };

  return (
    <>
      {/* Hero Banner */}
      <HeroSection
        images={getBannerImages()}
        title={bannerConfig?.title || "Tienda de Cactilia"}
        subtitle={bannerConfig?.subtitle || "Encuentra productos frescos y naturales"}
        showButton={false}
        showLogo={bannerConfig?.showLogo !== false}
        showSubtitle={bannerConfig?.showSubtitle !== false}
        height={bannerConfig?.height || "50vh"}
        autoRotate={bannerConfig?.autoRotate || false}
      />

      {/* Barra de Búsqueda */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Filtros */}
      <FilterBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priceOrder={priceOrder}
        setPriceOrder={setPriceOrder}
        categories={categories}
      />

      {/* Mensajes de Estado (loading / error) */}
      <StatusMessage loading={loading} error={error} />

      {/* Listado de productos y paginación (solo si no hay error y se han cargado los datos) */}
      {!loading && !error && (
        <>
          <ProductList products={products} onProductClick={openModal} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Modal del producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={isOpen}
        onClose={closeModal}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};