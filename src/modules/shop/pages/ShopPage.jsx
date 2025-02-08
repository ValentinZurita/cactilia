import { HeroSection } from '../../public/components/home-page';
import { SearchBar, FilterBar, ProductList, Pagination, ProductModal, StatusMessage} from '../components/shop-page/index.js';
import { useProducts, useModal, useCart } from '../hooks/index.js';
import { heroImages } from '../../../shared/constants';

export const ShopPage = () => {

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

  return (
    <>
      {/* Hero Banner */}
      <HeroSection
        images={heroImages}
        title="Tienda de Cactilia"
        subtitle="Encuentra productos frescos y naturales"
        showButton={false}
        height="50vh"
        autoRotate={false}
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