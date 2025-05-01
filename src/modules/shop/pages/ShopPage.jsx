import React, { Suspense, lazy, useCallback } from 'react'; // No más useEffect, useMemo, etc. aquí
import { HeroSection } from '../../public/components/home-page';
import { SearchBar, FilterBar, ProductList, Pagination, StatusMessage} from '../features/shop/index.js'; 
import { useModal } from '../hooks/index.js' 
import { useCart } from '../features/cart/hooks/useCart.js'
import { useShopPageLogic } from '../hooks/useShopPageLogic'; // Importar el nuevo hook


// Carga diferida del Modal
const ProductModal = lazy(() => 
  import('../features/shop/ProductModal.jsx')
    .then(module => ({ default: module.ProductModal }))
);

// =============================================================================
// Componente Principal: ShopPage
// =============================================================================
export const ShopPage = () => {

  // --- Hooks Personalizados ---
  const {
    products,
    categories,
    totalPages,
    isLoading,
    error,
    filters,
    currentPage,
    bannerProps,
    handleSearchSubmit,
    handleCategoryChange,
    handlePriceOrderChange,
    handlePageChange,
  } = useShopPageLogic();

  // Lógica local para interacción con Modal y Carrito
  const { isOpen, selectedProduct, openModal, closeModal } = useModal();
  const { handleAddToCart } = useCart();

  // --- Manejadores Locales ---
  // Callback para manejar clic en tarjeta de producto (usa `openModal` local)
  const handleProductClick = useCallback((product) => {
    openModal(product);
  }, [openModal]); 
  
  // --- Renderizado --- 
  return (
    <>
      {/* Sección Hero (Banner) */}
      <HeroSection {...bannerProps} />
      
      {/* Barra de Búsqueda */}
      <SearchBar onSearchSubmit={handleSearchSubmit} />

      {/* Barra de Filtros */}
      <FilterBar
        selectedCategory={filters.selectedCategory} 
        setSelectedCategory={handleCategoryChange} 
        priceOrder={filters.priceOrder}
        setPriceOrder={handlePriceOrderChange} 
        categories={categories} 
      />

      {/* Mensaje de Estado (Carga/Error) */}
      <StatusMessage loading={isLoading} error={error} />

      {/* Contenido Principal (Lista y Paginación) */}
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

      {/* Modal de Producto (Cargado con Suspense) */}
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