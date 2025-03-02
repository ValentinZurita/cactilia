/**
 * Botón genérico para agregar un nuevo elemento
 * Utilizado en las secciones de direcciones, métodos de pago, etc.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClick - Función a ejecutar al hacer clic
 * @param {string} props.label - Texto descriptivo del botón
 * @param {string} props.icon - Clase de icono Bootstrap (sin el prefijo bi-)
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element}
 */
export const AddItemButton = ({
                                onClick,
                                label = "Agregar elemento",
                                icon = "plus",
                                className = ""
                              }) => {
  return (
    <div className={`add-item-container ${className}`}>
      <button
        className="add-item-btn"
        title={label}
        onClick={onClick}
        aria-label={label}
      >
        <i className={`bi bi-${icon}`}></i>
      </button>
      {label && <small className="text-muted mt-2">{label}</small>}
    </div>
  );
};