import { useState } from 'react';
import { EmptyState, SectionTitle } from '../components/shared/index.js'
import '../../../../src/styles/pages/userProfile.css';


/**
 * AddressesPage - Página para gestionar las direcciones del usuario
 * Versión rediseñada con estilo minimalista y elegante
 */
export const AddressesPage = () => {
  // Datos de ejemplo - en una implementación real vendrían de Firebase
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      name: 'Casa',
      street: 'Av. Siempre Viva 742',
      city: 'CDMX',
      state: 'CDMX',
      zip: '01234',
      isDefault: true
    },
    {
      id: '2',
      name: 'Oficina',
      street: 'Av. Reforma 222, Piso 3',
      city: 'CDMX',
      state: 'CDMX',
      zip: '06600',
      isDefault: false
    }
  ]);

  /**
   * Establecer una dirección como predeterminada
   * @param {string} id - ID de la dirección
   */
  const handleSetDefault = (id) => {
    // Actualizar direcciones, estableciendo solo una como predeterminada
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  /**
   * Eliminar una dirección
   * @param {string} id - ID de la dirección
   */
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta dirección?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Mis Direcciones" />

      {/* Lista de direcciones */}
      {addresses.length > 0 ? (
        <ul className="address-list">
          {addresses.map(address => (
            <li key={address.id} className="address-item">
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
                >
                  <i className="bi bi-pencil"></i>
                </button>

                {/* Botón Predeterminada (solo si no es la predeterminada) */}
                {!address.isDefault && (
                  <button
                    className="address-action-btn default"
                    title="Establecer como predeterminada"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <i className="bi bi-star"></i>
                  </button>
                )}

                {/* Botón Eliminar (solo si no es la predeterminada) */}
                {!address.isDefault && (
                  <button
                    className="address-action-btn delete"
                    title="Eliminar dirección"
                    onClick={() => handleDelete(address.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="geo-alt"
          title="No hay direcciones"
          message="Aún no has agregado ninguna dirección de envío"
        />
      )}

      {/* Botón para agregar dirección - ahora dentro del contenido */}
      <div className="add-address-container">
        <button className="add-address-btn" title="Agregar dirección">
          <i className="bi bi-plus"></i>
        </button>
        <small className="text-muted mt-2">Agregar dirección</small>
      </div>
    </div>
  );
};