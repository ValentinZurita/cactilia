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
        options={["Todas las categorías", ...categories]}
        selectedOption={selectedCategory || "Todas las categorías"}
        onSelect={(option) =>
          setSelectedCategory(option === "Todas las categorías" ? "" : option)
        }
        className={`filter-button-left ${selectedCategory ? 'active' : ''}`}
      />

      {/* Dropdown de Precio / Destacados / Ninguno */}
      <Dropdown
        label="Filtros"
        options={["Sin filtros", "Productos destacados", "Precio menor a mayor", "Precio mayor a menor"]}
        selectedOption={priceOrder || "Filtros"}
        onSelect={(option) => {
          if (option === "Sin filtros") {
            // Limpiar el filtro de ordenación
            setPriceOrder("");
          } else {
            // Mapear los nuevos nombres a los nombres usados en la lógica interna
            const optionMap = {
              "Productos destacados": "Destacados",
              "Precio menor a mayor": "Menor a Mayor",
              "Precio mayor a menor": "Mayor a Menor"
            };
            setPriceOrder(optionMap[option] || option);
          }
        }}
        className={`filter-button-right ${priceOrder ? 'active' : ''}`}
      />

    </div>
  );
};