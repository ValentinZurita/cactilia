import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SimpleAddressForm } from '../../../user/components/addresses/index.js'


/**
 * AddressSelector - Componente para seleccionar una dirección de envío
 * Permite seleccionar una dirección existente o agregar una nueva
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.addresses - Lista de direcciones disponibles
 * @param {string} props.selectedAddressId - ID de la dirección seleccionada
 * @param {Function} props.onAddressSelect - Función que se ejecuta al seleccionar una dirección
 * @param {boolean} props.loading - Indica si están cargando las direcciones
 */
export const AddressSelector = ({
                                  addresses = [],
                                  selectedAddressId,
                                  onAddressSelect,
                                  loading = false
                                }) => {
  // Estado local para formulario de nueva dirección
  const [showForm, setShowForm] = useState(false);

  // Formatear dirección para mostrarla en el selector
  const formatAddress = (address) => {
    const { street, numExt, numInt, colonia, city, state, zip } = address;
    let formattedAddress = street;

    if (numExt) formattedAddress += ` #${numExt}`;
    if (numInt) formattedAddress += `, Int. ${numInt}`;
    if (colonia) formattedAddress += `, ${colonia}`;

    formattedAddress += `, ${city}, ${state} ${zip}`;

    return formattedAddress;
  };

  // Efecto para seleccionar la dirección predeterminada cuando se cargan las direcciones
  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0 && !loading) {
      // Buscar dirección predeterminada
      const defaultAddress = addresses.find(address => address.isDefault);

      if (defaultAddress) {
        onAddressSelect(defaultAddress.id);
      } else {
        // Si no hay dirección predeterminada, usar la primera
        onAddressSelect(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId, loading, onAddressSelect]);

  // Manejador para agregar nueva dirección
  const handleAddAddress = (addressData) => {
    // Aquí se manejaría la adición de la nueva dirección
    // Esta función sería implementada con la lógica real que ya tienes
    console.log('Agregando nueva dirección:', addressData);

    // Cerrar el formulario después de agregar
    setShowForm(false);
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando direcciones...</span>
        </div>
        <p className="mt-2">Cargando direcciones...</p>
      </div>
    );
  }

  // Si no hay direcciones, mostrar mensaje y opción para agregar
  if (addresses.length === 0) {
    return (
      <div className="address-selector-empty">
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No tienes direcciones guardadas. Por favor, agrega una dirección de envío.
        </div>

        {showForm ? (
          <SimpleAddressForm
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            onSave={handleAddAddress}
          />
        ) : (
          <button
            className="btn btn-green-3 mt-2"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Agregar Dirección
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="address-selector">
      <div className="address-list">
        {addresses.map(address => (
          <div key={address.id} className="address-option">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="addressSelection"
                id={`address-${address.id}`}
                checked={selectedAddressId === address.id}
                onChange={() => onAddressSelect(address.id)}
              />
              <label
                className="form-check-label"
                htmlFor={`address-${address.id}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="address-name fw-medium">{address.name}</div>
                <div className="address-details text-muted small">
                  {formatAddress(address)}
                </div>
                {address.references && (
                  <div className="address-references text-muted small fst-italic">
                    <i className="bi bi-signpost me-1"></i>
                    {address.references}
                  </div>
                )}
                {address.isDefault && (
                  <span className="badge bg-secondary bg-opacity-25 text-secondary mt-1">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Predeterminada
                  </span>
                )}
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="address-actions mt-3">
        <button
          className="btn btn-outline-secondary btn-sm me-2"
          onClick={() => setShowForm(true)}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Agregar Nueva Dirección
        </button>

        <Link
          to="/profile/addresses"
          className="btn btn-link btn-sm text-decoration-none"
          target="_blank"
        >
          <i className="bi bi-pencil me-1"></i>
          Administrar Direcciones
        </Link>
      </div>

      {/* Formulario para nueva dirección */}
      {showForm && (
        <SimpleAddressForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleAddAddress}
        />
      )}
    </div>
  );
};