import { HeroSection } from '../../public/components/home-page';
import { SearchBar } from '../components/shop-page/SearchBar';
import { FilterBar } from '../components/shop-page/FilterBar';
import { ProductList } from '../components/shop-page/ProductList';
import { Pagination } from '../components/shop-page/Pagination';
import { useShopData } from '../hooks/useShopData';
import { heroImages } from '../../../shared/constants';

export const ShopPage = () => {
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
  } = useShopData(); // <-- Custom Hook

  // Función para manejar mensajes de error o carga
  const renderStatusMessage = () => {
    if (loading) {
      return (
        <div className="text-center my-4">
          <p>Cargando productos...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center my-4 text-danger">
          <p>Error al cargar productos: {error}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Sección de Hero */}
      <HeroSection
        images={heroImages}
        title="Tienda de Cactilia"
        subtitle="Encuentra productos frescos y naturales"
        showButton={false}
        height="50vh"
        autoRotate={false}
      />

      {/* Barra de búsqueda */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Filtros */}
      <FilterBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priceOrder={priceOrder}
        setPriceOrder={setPriceOrder}
        categories={categories}
      />

      {/* Mensajes de carga / error */}
      {renderStatusMessage()}

      {/* Paginación */}
      {!loading && !error && (
        <>
          <ProductList products={products} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
};