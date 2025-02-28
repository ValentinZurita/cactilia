import { useState } from 'react';
import { EmptyState, ProfileCard, SectionTitle } from '../components/shared/index.js'


/**
 * AddressesPage
 *
 * Manages user shipping addresses
 */
export const AddressesPage = () => {
  // Mock data - would come from Firebase in real implementation
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
   * Set an address as default
   * @param {string} id - Address ID
   */
  const handleSetDefault = (id) => {
    // Update addresses, setting only one as default
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  /**
   * Delete an address
   * @param {string} id - Address ID
   */
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta dirección?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  return (
    <div>
      {/* Section title */}
      <SectionTitle title="Mis Direcciones" />

      {/* Add new address button */}
      <button className="btn btn-green-3 text-white mb-4">
        <i className="bi bi-plus-circle me-2"></i>
        Agregar dirección
      </button>

      {/* Addresses list */}
      {addresses.length > 0 ? (
        <div className="row">
          {addresses.map(address => (
            <div key={address.id} className="col-md-6 mb-3">
              <ProfileCard>
                <div className="d-flex justify-content-between mb-2">
                  <h5 className="mb-0">{address.name}</h5>
                  {address.isDefault && (
                    <span className="badge bg-green-3">Predeterminada</span>
                  )}
                </div>

                <p className="mb-1">{address.street}</p>
                <p className="mb-3">{address.city}, {address.state} {address.zip}</p>

                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-sm btn-outline-green">
                    Editar
                  </button>

                  {!address.isDefault && (
                    <>
                      <button
                        className="btn btn-sm btn-outline-green"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Predeterminada
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(address.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </ProfileCard>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="geo-alt"
          title="No hay direcciones"
          message="Aún no has agregado ninguna dirección de envío"
        />
      )}
    </div>
  );
};