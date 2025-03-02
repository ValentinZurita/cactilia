/**
 * Botón para agregar un nuevo método de pago
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClick - Función a ejecutar al hacer clic
 * @returns {JSX.Element}
 */
export const AddPaymentButton = ({ onClick }) => {
  return (

    <div className="add-payment-container">

      {/** Botón para agregar metodo de pago */}
      <button
        className="add-payment-btn"
        title="Agregar método de pago"
        onClick={onClick}
      >
        <i className="bi bi-plus"></i>
      </button>

      {/** Etiqueta */}
      <small className="text-muted mt-2">Agregar método de pago</small>

    </div>
  );
};