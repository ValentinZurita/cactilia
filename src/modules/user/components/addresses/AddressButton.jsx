/**
 * Botón para agregar una nueva dirección
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClick - Función a ejecutar al hacer clic
 * @returns {JSX.Element}
 */
export const AddAddressButton = ({ onClick }) => {
  return (
    <div className="add-address-container">
      <button
        className="add-address-btn"
        title="Agregar dirección"
        onClick={onClick}
      >
        <i className="bi bi-plus"></i>
      </button>
      <small className="text-muted mt-2">Agregar dirección</small>
    </div>
  );
};