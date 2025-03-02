/**
 * Barra de filtros para los pedidos
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.activeFilter - Filtro actualmente seleccionado
 * @param {Function} props.onFilterChange - Función para cambiar el filtro
 * @returns {JSX.Element}
 */
export const OrderFilterBar = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'Todos', icon: 'bi-grid-fill' },
    { id: 'processing', label: 'En proceso', icon: 'bi-clock-fill' },
    { id: 'delivered', label: 'Entregados', icon: 'bi-check-circle-fill' },
    { id: 'cancelled', label: 'Cancelados', icon: 'bi-x-circle-fill' }
  ];

  return (
    // Filtros tipo chip
    <div className="order-filter-bar">

      {/* Filtros */}
      {filters.map(filter => (
        <button
          key={filter.id}
          className={`filter-chip ${activeFilter === filter.id ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.id)}
        >
          <i className={`bi ${filter.icon}`}></i> {/* Icono y etiqueta */}
          {filter.label}
        </button>
      ))}

    </div>
  );
};