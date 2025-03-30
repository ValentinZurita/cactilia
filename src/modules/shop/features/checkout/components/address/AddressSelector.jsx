import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/addressSelector.css';
import { AddressOption } from './AddressOption.jsx';
import { NewAddressForm } from './NewAddressForm.jsx';

/**
 * AddressSelector - Componente para seleccionar dirección de envío
 * Permite seleccionar una dirección existente o usar una dirección nueva
 *
 * @param {Object} props
 * @param {Array} props.addresses - Lista de direcciones disponibles
 * @param {string} props.selectedAddressId - ID de la dirección seleccionada
 * @param {string} props.selectedAddressType - Tipo de dirección seleccionada ('saved', 'new')
 * @param {Function} props.onAddressSelect - Función al seleccionar dirección guardada
 * @param {Function} props.onNewAddressSelect - Función al seleccionar "Usar dirección nueva"
 * @param {Function} props.onNewAddressDataChange - Función al cambiar datos de nueva dirección
 * @param {boolean} props.loading - Indica si están cargando las direcciones
 * @param {Function} props.onAddAddress - Función para agregar una nueva dirección permanente
 */
export const AddressSelector = ({
                                  addresses = [],
                                  selectedAddressId,
                                  selectedAddressType,
                                  onAddressSelect,
                                  onNewAddressSelect,
                                  onNewAddressDataChange,
                                  loading = false,
                                  onAddAddress
                                }) => {
  // Estado para mostrar el formulario de nueva dirección permanente
  const [showManageForm, setShowManageForm] = React.useState(false);

  // Estado para guardar dirección temporal
  const [saveAddress, setSaveAddress] = React.useState(false);

  // Detectar si se ha seleccionado dirección nueva
  const isNewAddressSelected = selectedAddressType === 'new';

  // Manejador para guardar la opción de guardar dirección
  const handleSaveAddressChange = (save) => {
    setSaveAddress(save);
    if (onNewAddressDataChange) {
      onNewAddressDataChange({
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
          onAddressChange={onNewAddressDataChange}
          saveAddress={saveAddress}
          onSaveAddressChange={handleSaveAddressChange}
        />
      </div>
    );
  }

  return (
    <div className="address-selector">
      {/* Opción para usar una dirección nueva */}
      <AddressOption
        isSelected={isNewAddressSelected}
        onSelect={onNewAddressSelect}
        icon="bi-plus-circle"
        name="Usar dirección nueva"
        description="Ingresa los datos de una dirección para esta compra"
        id="address-new"
      >
        {isNewAddressSelected && (
          <div className="new-address-form-container mt-3">
            <NewAddressForm
              onAddressChange={onNewAddressDataChange}
              saveAddress={saveAddress}
              onSaveAddressChange={handleSaveAddressChange}
            />
          </div>
        )}
      </AddressOption>

      {/* Separador entre nueva dirección y direcciones guardadas */}
      <div className="address-separator my-3">
        <span className="separator-text">o usa una dirección guardada</span>
      </div>

      {/* Lista de direcciones existentes */}
      <div className="address-list">
        {addresses.map(address => (
          <AddressOption
            key={address.id}
            isSelected={selectedAddressId === address.id && selectedAddressType === 'saved'}
            onSelect={() => onAddressSelect(address.id, 'saved')}
            name={address.name}
            description={formatAddress(address)}
            references={address.references}
            isDefault={address.isDefault}
            id={`address-${address.id}`}
          />
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

      {/* Modal para nueva dirección guardada - Se implementaría en un componente separado */}
      {showManageForm && (
        <div className="modal-placeholder">
          {/* Aquí irá el modal de formulario de dirección permanente */}
          {/* Se mantiene por compatibilidad pero debe implementarse por separado */}
        </div>
      )}
    </div>
  );
};

/**
 * Formatear dirección para mostrarla
 * @param {Object} address - Objeto de dirección
 * @returns {string} - Dirección formateada
 */
function formatAddress(address) {
  const { street, numExt, numInt, colonia, city, state, zip } = address;
  let formattedAddress = street;

  if (numExt) formattedAddress += ` #${numExt}`;
  if (numInt) formattedAddress += `, Int. ${numInt}`;
  if (colonia) formattedAddress += `, ${colonia}`;

  formattedAddress += `, ${city}, ${state} ${zip}`;

  return formattedAddress;
}