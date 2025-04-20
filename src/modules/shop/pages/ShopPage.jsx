import { useState, useEffect } from 'react';
import { HeroSection } from '../../public/components/home-page';
import { SearchBar, FilterBar, ProductList, Pagination, ProductModal, StatusMessage} from '../features/shop/index.js';

import { heroImages } from '../../../shared/constants';
import { getCollectionImages } from '../../admin/services/collectionsService';
import { getShopPageContent } from '../../admin/components/content/shop/shopPageService.js'
import { useModal, useProducts } from '../hooks/index.js'
import { useCart } from '../features/cart/hooks/useCart.js'

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
        // Guardar los datos completos de la imagen, no solo la URL
        setCollectionImages(result.data);
      }
    } catch (error) {
      console.error('Error cargando imágenes de colección:', error);
    }
  };

  // --- FUNCIÓN AUXILIAR PARA SELECCIONAR URL POR TAMAÑO (copiada de HomePage.jsx) ---
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
  // --- FIN FUNCIÓN AUXILIAR ---

  return (
    <>
      {/* Hero Banner */}
      {(() => {
        // Lógica para determinar las imágenes del banner aquí mismo
        let imagesToShow = heroImages; // Default fallback
        const desiredSize = bannerConfig?.imageSize || 'large'; // Default a 'large'

        if (bannerConfig) {
          if (bannerConfig.useCollection && collectionImages.length > 0) {
            imagesToShow = collectionImages
              .map(imgData => getImageUrlBySize(imgData, desiredSize))
              .filter(Boolean);
          } else if (bannerConfig.backgroundImage) {
            // Para imagen única, no aplicamos resizing, usamos la URL directa
            imagesToShow = [bannerConfig.backgroundImage];
          }
        }

        // Asegurar que siempre haya algo que mostrar
        if (!imagesToShow || imagesToShow.length === 0) {
          imagesToShow = heroImages;
        }

        return (
          <HeroSection
            images={imagesToShow} // Usar las imágenes procesadas
            title={bannerConfig?.title || "Tienda de Cactilia"}
            subtitle={bannerConfig?.subtitle || "Encuentra productos frescos y naturales"}
            showButton={false}
            showLogo={bannerConfig?.showLogo !== false}
            showSubtitle={bannerConfig?.showSubtitle !== false}
            height={bannerConfig?.height || "50vh"}
            autoRotate={bannerConfig?.autoRotate || false}
          />
        );
      })()}

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