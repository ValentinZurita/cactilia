import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SimpleAddressForm } from '../../../../user/components/addresses/index.js'
import { NewAddressForm } from './NewAddressForm.jsx';
import '../styles/newAddressForm.css';
import '../styles/addressSelector.css';

/**
 * AddressSelector - Componente para seleccionar una dirección de envío
 * Permite seleccionar una dirección existente, usar una dirección nueva temporal
 * o agregar una nueva dirección al perfil
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.addresses - Lista de direcciones disponibles
 * @param {string} props.selectedAddressId - ID de la dirección seleccionada
 * @param {string} props.selectedAddressType - Tipo de dirección seleccionada ('saved', 'new')
 * @param {Function} props.onAddressSelect - Función que se ejecuta al seleccionar una dirección
 * @param {Function} props.onNewAddressSelect - Función que se ejecuta al seleccionar "Usar dirección nueva"
 * @param {Function} props.onNewAddressDataChange - Función que se ejecuta cuando cambian los datos de la nueva dirección
 * @param {boolean} props.loading - Indica si están cargando las direcciones
 */
export const AddressSelector = ({
                                  addresses = [],
                                  selectedAddressId,
                                  selectedAddressType,
                                  onAddressSelect,
                                  onNewAddressSelect,
                                  onNewAddressDataChange,
                                  loading = false
                                }) => {
  // Estado local para formulario de nueva dirección permanente
  const [showManageForm, setShowManageForm] = useState(false);

  // Estados para la dirección nueva temporal
  const [saveAddress, setSaveAddress] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    name: '',
    street: '',
    numExt: '',
    numInt: '',
    colonia: '',
    city: '',
    state: '',
    zip: '',
    references: '',
    saveAddress: false
  });

  // Comprobar si se ha seleccionado una dirección nueva
  const isNewAddressSelected = selectedAddressType === 'new';

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
    if (!selectedAddressId && !selectedAddressType && addresses.length > 0 && !loading) {
      // Buscar dirección predeterminada
      const defaultAddress = addresses.find(address => address.isDefault);

      if (defaultAddress) {
        onAddressSelect(defaultAddress.id, 'saved');
      } else if (addresses.length > 0) {
        // Si no hay dirección predeterminada, usar la primera
        onAddressSelect(addresses[0].id, 'saved');
      }
    }
  }, [addresses, selectedAddressId, selectedAddressType, loading, onAddressSelect]);

  // Manejador para agregar nueva dirección permanente
  const handleAddAddress = (addressData) => {
    console.log('Agregando nueva dirección permanente:', addressData);
    // Cerrar el formulario después de agregar
    setShowManageForm(false);
  };

  // Manejador para seleccionar "usar dirección nueva"
  const handleNewAddressSelection = () => {
    console.log('Seleccionando usar dirección nueva');
    if (onNewAddressSelect) {
      onNewAddressSelect(); // Llama a setSelectedAddressType('new')
    }
  };

  // Manejador para seleccionar dirección guardada
  const handleSavedAddressSelection = (id) => {
    console.log('Seleccionando dirección guardada:', id);
    if (onAddressSelect) {
      onAddressSelect(id, 'saved');
    }
  };

  // Manejador para cambios en los datos de la nueva dirección
  const handleNewAddressChange = (data) => {
    setNewAddressData(data);
    if (onNewAddressDataChange) {
      onNewAddressDataChange({
        ...data,
        saveAddress,
      });
    }
  };

  // Manejador para cambio en la opción de guardar dirección
  const handleSaveAddressChange = (save) => {
    setSaveAddress(save);
    if (onNewAddressDataChange) {
      onNewAddressDataChange({
        ...newAddressData,
        saveAddress: save
      });
    }
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

  // Si no hay direcciones, mostrar directamente el formulario de dirección nueva
  if (addresses.length === 0) {
    return (
      <div className="address-selector-empty">
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No tienes direcciones guardadas. Por favor, ingresa una dirección de envío.
        </div>

        <NewAddressForm
          onAddressChange={handleNewAddressChange}
          saveAddress={saveAddress}
          onSaveAddressChange={handleSaveAddressChange}
        />
      </div>
    );
  }

  // Debug info
  console.log('Render AddressSelector', {
    selectedAddressId,
    selectedAddressType,
    isNewAddressSelected
  });

  return (
    <div className="address-selector">
      {/* Opción para usar una dirección nueva */}
      <div className={`address-option ${isNewAddressSelected ? 'active-address-option' : ''}`}>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="addressSelection"
            id="address-new"
            checked={isNewAddressSelected}
            onChange={handleNewAddressSelection}
          />
          <label
            className="form-check-label d-flex align-items-center"
            htmlFor="address-new"
            style={{ cursor: 'pointer' }}
            onClick={handleNewAddressSelection} // Añadido para mejor UX
          >
            <i className="bi bi-plus-circle me-2 fs-4"></i>
            <div>
              <div className="address-name">
                Usar dirección nueva
              </div>
              <div className="address-details text-muted small">
                Ingresa los datos de una dirección para esta compra
              </div>
            </div>
          </label>
        </div>

        {/* Formulario de nueva dirección (si está seleccionado) */}
        {isNewAddressSelected && (
          <div className="new-address-form-container mt-3">
            <NewAddressForm
              onAddressChange={handleNewAddressChange}
              saveAddress={saveAddress}
              onSaveAddressChange={handleSaveAddressChange}
              addressData={newAddressData}
            />
          </div>
        )}
      </div>

      {/* Separador entre nueva dirección y direcciones guardadas */}
      <div className="address-separator my-3">
        <span className="separator-text">o usa una dirección guardada</span>
      </div>

      {/* Lista de direcciones existentes */}
      <div className="address-list">
        {addresses.map(address => (
          <div
            key={address.id}
            className={`address-option ${selectedAddressId === address.id && selectedAddressType === 'saved' ? 'active-address-option' : ''}`}
          >
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="addressSelection"
                id={`address-${address.id}`}
                checked={selectedAddressId === address.id && selectedAddressType === 'saved'}
                onChange={() => handleSavedAddressSelection(address.id)}
              />
              <label
                className="form-check-label"
                htmlFor={`address-${address.id}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSavedAddressSelection(address.id)} // Añadido para mejor UX
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

      {/* Acciones */}
      <div className="address-actions mt-3">
        <button
          className="btn btn-outline-secondary btn-sm me-2"
          onClick={() => setShowManageForm(true)}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Guardar Nueva Dirección
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

      {/* Modal para nueva dirección guardada */}
      {showManageForm && (
        <SimpleAddressForm
          isOpen={showManageForm}
          onClose={() => setShowManageForm(false)}
          onSave={handleAddAddress}
        />
      )}
    </div>
  );
};