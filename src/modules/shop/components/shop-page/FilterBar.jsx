import '../../../../styles/pages/shop.css';
import { Dropdown } from '../../../../styles/components/Dropdown.jsx';

export const FilterBar = ({
                            selectedCategory, setSelectedCategory,
                            selectedPrice, setSelectedPrice,
                            categories = [], setProducts, products,
                            originalProducts  // 🔥 Recibimos la lista original de productos
                          }) => {

  // 🔥 Aplicar filtrado por precio
  const handlePriceFilter = (order) => {
    if (order === "Ninguno") {
      setSelectedPrice(""); // 🔥 Resetear selección
      setProducts(originalProducts); // 🔥 Restaurar TODOS los productos
      return;
    }

    if (order === "Destacados") {
      setSelectedPrice(order);
      const featuredProducts = originalProducts.filter(prod => prod.featured); // 🔥 Filtramos desde la lista original
      setProducts(featuredProducts);
      return;
    }

    setSelectedPrice(order);

    const sortedProducts = [...originalProducts].sort((a, b) =>
      order === "Menor a Mayor" ? a.price - b.price : b.price - a.price
    );

    setProducts(sortedProducts);
  };

  return (
    <div className="filter-bar d-flex justify-content-center">

      {/* Dropdown de Categoría */}
      <Dropdown
        label="Categoría"
        options={["Todas", ...categories]}
        selectedOption={selectedCategory}
        onSelect={(option) => setSelectedCategory(option === "Todas" ? "" : option)}
        className={`filter-button-left ${selectedCategory ? 'active' : ''}`}
      />

      {/* Dropdown de Precio con opción "Quitar filtro" */}
      <Dropdown
        label="Ordenar Por"
        options={["Ninguno", "Destacados", "Menor a Mayor", "Mayor a Menor"]} // 🔥 Nueva opción
        selectedOption={selectedPrice || "Ordenar Por"} // 🔥 Si no hay selección, muestra "Precio"
        onSelect={handlePriceFilter}
        className={`filter-button-right ${selectedPrice ? 'active' : ''}`}
      />
    </div>
  );
};