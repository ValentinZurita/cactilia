/**
 * Componente para mostrar una dirección individual
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.address - Datos de la dirección
 * @param {Function} props.onSetDefault - Función para establecer como predeterminada
 * @param {Function} props.onDelete - Función para eliminar la dirección
 * @param {Function} props.onEdit - Función para editar la dirección
 * @returns {JSX.Element}
 */
export const AddressItem = ({ address, onSetDefault, onDelete, onEdit }) => {
  return (
    <li className="address-item">
      <div className="address-item-header">
        <h5 className="address-name">{address.name}</h5>
        {address.isDefault && (
          <span className="address-default-tag">
            <i className="bi bi-check-circle-fill"></i>
            Predeterminada
          </span>
        )}
      </div>

      <div className="address-details">
        {address.street}<br />
        {address.city}, {address.state} {address.zip}
      </div>

      <div className="address-actions">
        {/* Botón Editar */}
        <button
          className="address-action-btn edit"
          title="Editar dirección"
          onClick={() => onEdit(address)}
        >
          <i className="bi bi-pencil"></i>
        </button>

        {/* Botón Predeterminada (solo si no es la predeterminada) */}
        {!address.isDefault && (
          <button
            className="address-action-btn default"
            title="Establecer como predeterminada"
            onClick={() => onSetDefault(address.id)}
          >
            <i className="bi bi-star"></i>
          </button>
        )}

        {/* Botón Eliminar (solo si no es la predeterminada) */}
        {!address.isDefault && (
          <button
            className="address-action-btn delete"
            title="Eliminar dirección"
            onClick={() => onDelete(address.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        )}
      </div>
    </li>
  );
};