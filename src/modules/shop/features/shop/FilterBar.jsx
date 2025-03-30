import { Dropdown } from '../../../../shared/components/Dropdown.jsx';

/**
  * FilterBar Component
  *  - Dropdown de Categoría
  *  - Dropdown de Precio / Destacados / Ninguno
  * @param {string} selectedCategory - Categoría seleccionada
  * @param {Function} setSelectedCategory - Función para cambiar la categoría seleccionada
  * @param {string} priceOrder - Orden seleccionada
  * @param {Function} setPriceOrder - Función para cambiar la orden seleccionada
  * @param {string[]} categories - Categorías disponibles
  * @returns {JSX.Element}
  * @constructor
  * @example
  * <FilterBar
  *  selectedCategory={selectedCategory}
  * setSelectedCategory={setSelectedCategory}
  * priceOrder={priceOrder}
  * setPriceOrder={setPriceOrder}
  * categories={categories}
  * />
**/

export const FilterBar = ({
                            selectedCategory,
                            setSelectedCategory,
                            priceOrder,
                            setPriceOrder,
                            categories = []
                          }) => {
  return (
    <div className="filter-bar d-flex justify-content-center">

      {/* Dropdown de Categoría */}
      <Dropdown
        label="Categoría"
        options={["Todas", ...categories]}
        selectedOption={selectedCategory || "Todas"}
        onSelect={(option) =>
          setSelectedCategory(option === "Todas" ? "" : option)
        }
        className={`filter-button-left ${selectedCategory ? 'active' : ''}`}
      />

      {/* Dropdown de Precio / Destacados / Ninguno */}
      <Dropdown
        label="Ordenar Por"
        options={["Ninguno", "Destacados", "Menor a Mayor", "Mayor a Menor"]}
        selectedOption={priceOrder || "Ordenar Por"}
        onSelect={(option) => setPriceOrder(option)}
        className={`filter-button-right ${priceOrder ? 'active' : ''}`}
      />

    </div>
  );
};