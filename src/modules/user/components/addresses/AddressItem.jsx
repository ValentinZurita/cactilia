import { ActionItemCard } from '../shared/index.js'

/**
 * Componente refactorizado para mostrar una dirección individual
 * Utiliza el componente genérico ActionItemCard
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.address - Datos de la dirección
 * @param {Function} props.onSetDefault - Función para establecer como predeterminada
 * @param {Function} props.onDelete - Función para eliminar la dirección
 * @param {Function} props.onEdit - Función para editar la dirección
 * @returns {JSX.Element}
 */
export const AddressItem = ({
                              id,
                              name,
                              street,
                              city,
                              state,
                              zip,
                              isDefault,
                              onSetDefault,
                              onDelete,
                              onEdit
                            }) => {
  // El componente ahora es principalmente una configuración de ActionItemCard
  return (
    <ActionItemCard
      title={name}
      subtitle={street}
      isDefault={isDefault}
      defaultBadgeText="Predeterminada"
      actions={[
        {
          icon: "pencil",
          className: "edit",
          label: "Editar dirección",
          onClick: () => onEdit({ id, name, street, city, state, zip, isDefault })
        },
        {
          icon: "star",
          className: "default",
          label: "Establecer como predeterminada",
          onClick: () => onSetDefault(id),
          showIf: !isDefault
        },
        {
          icon: "trash",
          className: "delete",
          label: "Eliminar dirección",
          onClick: () => onDelete(id),
          showIf: !isDefault
        }
      ]}
    >
      {/* Contenido adicional: Detalles completos de la dirección */}
      <div className="address-details">
        {street}<br />
        {city}, {state} {zip}
      </div>
    </ActionItemCard>
  );
};