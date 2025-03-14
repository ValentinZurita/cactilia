import { ActionItemCard } from '../shared/index.js'

/**
 * Componente mejorado para mostrar una dirección individual
 * Mantiene compatibilidad con la versión anterior pero muestra
 * datos adicionales (colonia, número exterior, etc.)
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID de la dirección
 * @param {string} props.name - Nombre de la dirección
 * @param {string} props.street - Calle completa
 * @param {string} props.numExt - Número exterior (opcional)
 * @param {string} props.numInt - Número interior (opcional)
 * @param {string} props.colonia - Colonia (opcional)
 * @param {string} props.city - Ciudad
 * @param {string} props.state - Estado
 * @param {string} props.zip - Código postal
 * @param {string} props.references - Referencias adicionales (opcional)
 * @param {boolean} props.isDefault - Si es la dirección predeterminada
 * @param {Function} props.onSetDefault - Función para establecer como predeterminada
 * @param {Function} props.onDelete - Función para eliminar la dirección
 * @param {Function} props.onEdit - Función para editar la dirección
 * @returns {JSX.Element}
 */
export const AddressItem = ({
                              id,
                              name,
                              street,
                              numExt,
                              numInt,
                              colonia,
                              city,
                              state,
                              zip,
                              references,
                              isDefault,
                              onSetDefault,
                              onDelete,
                              onEdit
                            }) => {
  // Formatear la dirección completa para mostrar
  const formatAddress = () => {
    // Si tenemos campos separados, usar el formato mexicano
    if (numExt) {
      return (
        <>
          {street} #{numExt}{numInt ? `, Int. ${numInt}` : ''}<br />
          {colonia && <>{colonia}<br /></>}
          {city}, {state} {zip}
          {references && (
            <>
              <br />
              <span className="text-muted small">Referencias: {references}</span>
            </>
          )}
        </>
      );
    }

    // Si no, usar el formato original por compatibilidad
    return (
      <>
        {street}<br />
        {city}, {state} {zip}
      </>
    );
  };

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
          onClick: () => onEdit({
            id, name, street, numExt, numInt, colonia, city, state, zip, references, isDefault
          })
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
        {formatAddress()}
      </div>
    </ActionItemCard>
  );
};