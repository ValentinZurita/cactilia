/**
 * CartHeader - Encabezado de la página del carrito
 *
 * Muestra el título, contador de ítems y botón para regresar.
 *
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Encabezado del carrito
 */
export const CartHeader = ({ title, itemCount, onGoBack }) => {

  return (
    <div className="d-flex align-items-center mb-4">

      {/* Botón de regresar */}
      <button
        className="btn-arrow-back me-3"
        onClick={onGoBack}
        aria-label="Regresar"
      >
        <i className="bi bi-arrow-left"></i>
      </button>

      {/* Título y contador de artículos */}
      <div>
        <h2 className="mb-0 fw-bold">{title}</h2>
        <p className="text-muted mb-0">
          {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
        </p>
      </div>

    </div>
  );
};