import { AddressItem } from './AddressItem';
import { GenericItemList } from '../shared/index.js'

/**
 * Componente refactorizado para la lista de direcciones
 * Utiliza el componente genérico GenericItemList
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.addresses - Lista de direcciones
 * @param {Function} props.onSetDefault - Función para establecer como predeterminada
 * @param {Function} props.onDelete - Función para eliminar
 * @param {Function} props.onEdit - Función para editar
 * @param {boolean} props.loading - Indica si está cargando
 * @returns {JSX.Element}
 */
export const AddressesList = ({
                                addresses = [],
                                onSetDefault,
                                onDelete,
                                onEdit,
                                loading = false
                              }) => {
  // Configuración para el estado vacío
  const emptyStateConfig = {
    icon: "geo-alt",
    title: "No hay direcciones",
    message: "Aún no has agregado ninguna dirección de envío"
  };

  // Propiedades para los elementos de dirección
  const addressItemProps = {
    onSetDefault,
    onDelete,
    onEdit
  };

  // Usar el componente genérico con la configuración específica para direcciones
  return (
    <GenericItemList
      items={addresses}
      itemComponent={AddressItem}
      itemProps={addressItemProps}
      emptyState={emptyStateConfig}
      className="address-list"
      loading={loading}
    />
  );
};