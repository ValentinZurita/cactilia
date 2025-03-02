import { AddressItem } from './AddressItem';
import { EmptyState } from '../../components/shared/EmptyState';

/**
 * Componente que muestra la lista de direcciones
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.addresses - Lista de direcciones
 * @param {Function} props.onSetDefault - Función para establecer como predeterminada
 * @param {Function} props.onDelete - Función para eliminar
 * @param {Function} props.onEdit - Función para editar
 * @returns {JSX.Element}
 */
export const AddressesList = ({ addresses, onSetDefault, onDelete, onEdit }) => {
  if (addresses.length === 0) {
    return (
      <EmptyState
        icon="geo-alt"
        title="No hay direcciones"
        message="Aún no has agregado ninguna dirección de envío"
      />
    );
  }

  return (
    <ul className="address-list">
      {addresses.map(address => (
        <AddressItem
          key={address.id}
          address={address}
          onSetDefault={onSetDefault}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
};