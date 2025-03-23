import React from 'react';
import { ActionItemCard } from '../shared/index.js';

/**
 * Construye la representación JSX de la dirección completa,
 * permitiendo el formato con calle, número exterior, interior, etc.
 *
 * @param {Object} props - Propiedades usadas para componer la dirección
 * @param {string} props.street - Calle completa
 * @param {string} [props.numExt] - Número exterior (opcional)
 * @param {string} [props.numInt] - Número interior (opcional)
 * @param {string} [props.colonia] - Colonia (opcional)
 * @param {string} props.city - Ciudad
 * @param {string} props.state - Estado
 * @param {string} props.zip - Código postal
 * @param {string} [props.references] - Referencias adicionales (opcional)
 * @returns {JSX.Element} Dirección formateada
 */
function formatAddress({ street, numExt, numInt, colonia, city, state, zip, references }) {
  // Caso cuando tenemos campos separados (numExt, numInt, etc.)
  if (numExt) {
    return (
      <>
        {street} #{numExt}
        {numInt ? `, Int. ${numInt}` : ''}
        <br />
        {colonia && (
          <>
            {colonia}
            <br />
          </>
        )}
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

  // Caso de compatibilidad con la versión anterior (sin numExt, numInt, etc.)
  return (
    <>
      {street}
      <br />
      {city}, {state} {zip}
    </>
  );
}

/**
 * Genera el arreglo de acciones (editar, establecer predeterminada, eliminar)
 * según el estado (isDefault) de la dirección.
 *
 * @param {Object} params - Parámetros para crear las acciones
 * @param {string} params.id - ID de la dirección
 * @param {boolean} params.isDefault - Si la dirección es predeterminada
 * @param {Function} params.onEdit - Función para editar la dirección
 * @param {Function} params.onSetDefault - Función para establecerla como predeterminada
 * @param {Function} params.onDelete - Función para eliminar la dirección
 * @param {Object} params.addressData - Objeto con los datos completos de la dirección
 * @returns {Array} Arreglo de objetos de acción compatible con ActionItemCard
 */
function createActionItems({ id, isDefault, onEdit, onSetDefault, onDelete, addressData }) {
  return [
    {
      icon: 'pencil',
      className: 'edit',
      label: 'Editar dirección',
      onClick: () => onEdit(addressData),
    },
    {
      icon: 'star',
      className: 'default',
      label: 'Establecer como predeterminada',
      onClick: () => onSetDefault(id),
      showIf: !isDefault, // Solo se muestra si NO es predeterminada
    },
    {
      icon: 'trash',
      className: 'delete',
      label: 'Eliminar dirección',
      onClick: () => onDelete(id),
      showIf: !isDefault, // Solo se muestra si NO es predeterminada
    },
  ];
}

/**
 * Componente mejorado para mostrar una dirección individual.
 * Mantiene compatibilidad con la versión anterior, pero
 * muestra datos adicionales como número exterior, colonia, etc.
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID de la dirección
 * @param {string} props.name - Nombre de la dirección
 * @param {string} props.street - Calle completa
 * @param {string} [props.numExt] - Número exterior (opcional)
 * @param {string} [props.numInt] - Número interior (opcional)
 * @param {string} [props.colonia] - Colonia (opcional)
 * @param {string} props.city - Ciudad
 * @param {string} props.state - Estado
 * @param {string} props.zip - Código postal
 * @param {string} [props.references] - Referencias adicionales (opcional)
 * @param {boolean} props.isDefault - Si es la dirección predeterminada
 * @param {Function} props.onSetDefault - Función para establecer como predeterminada
 * @param {Function} props.onDelete - Función para eliminar la dirección
 * @param {Function} props.onEdit - Función para editar la dirección
 * @returns {JSX.Element} Componente de tarjeta de dirección con acciones
 */
export function AddressItem({
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
                              onEdit,
                            }) {
  // Objeto todos los datos de la dirección para pasarlos fácilmente
  const addressData = {
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
  };

  // Acciones para el ActionItemCard
  const actions = createActionItems({
    id,
    isDefault,
    onEdit,
    onSetDefault,
    onDelete,
    addressData,
  });

  return (
    <ActionItemCard
      title={name}
      subtitle={street}
      isDefault={isDefault}
      defaultBadgeText="Predeterminada"
      actions={actions}
    >
      {/* Muestra detalles completos de la dirección, usando la función de formateo */}
      <div className="address-details">
        {formatAddress({ street, numExt, numInt, colonia, city, state, zip, references })}
      </div>
    </ActionItemCard>
  );
}
