import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../styles/addressSelector.css';
import { AddressOption } from './AddressOption.jsx';
import { NewAddressForm } from './NewAddressForm.jsx';
import { formatAddress } from '../../../../utils/index.js';
import { SimpleAddressForm } from '../../../../../user/components/addresses/index.js';
import { addAddress } from '../../../../../user/services/addressService';

/**
 * Selector de direcciones para el checkout
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.addresses - Lista de direcciones disponibles
 * @param {string} props.selectedAddressId - ID de la dirección seleccionada
 * @param {string} props.selectedAddressType - Tipo de dirección seleccionada
 * @param {Function} props.onAddressSelect - Función al seleccionar dirección
 * @param {Function} props.onNewAddressSelect - Función al seleccionar nueva dirección
 * @param {Function} props.onNewAddressDataChange - Función al cambiar datos
 * @param {boolean} props.loading - Indica si están cargando las direcciones
 * @param {Function} props.onAddAddress - Función para agregar dirección
 * @returns {JSX.Element}
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
  // Añadir log para verificar qué props recibimos                                
  console.log('AddressSelector props:', {
    addressesCount: addresses.length,
    selectedAddressId,
    selectedAddressType,
    onAddressSelect: typeof onAddressSelect,
    onNewAddressSelect: typeof onNewAddressSelect,
    onNewAddressDataChange: typeof onNewAddressDataChange
  });

  // Estado para mostrar el formulario de nueva dirección permanente
  const [showManageForm, setShowManageForm] = useState(false);
  const { uid } = useSelector(state => state.auth);
  const [savingAddress, setSavingAddress] = useState(false);

  // Estado para guardar dirección temporal
  const [saveAddress, setSaveAddress] = useState(false);

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

  // Manejador para guardar una nueva dirección permanente
  const handleSaveNewAddress = async (addressData) => {
    setSavingAddress(true);
    try {
      // Usar el servicio existente para guardar la dirección
      const result = await addAddress(uid, addressData);
      
      if (result.ok) {
        // Si guardamos exitosamente, cerrar el modal
        setShowManageForm(false);
        
        // Opcional: Podemos forzar una recarga de direcciones
        if (onAddAddress) {
          onAddAddress();
        }
        
        // Mensaje de éxito (se podría mejorar con mensajes globales)
        alert('Dirección guardada correctamente');
      } else {
        throw new Error(result.error || 'Error al guardar dirección');
      }
    } catch (error) {
      console.error('Error al guardar dirección:', error);
      alert('No se pudo guardar la dirección: ' + error.message);
    } finally {
      setSavingAddress(false);
    }
  };

  // Maneja la selección de dirección guardada
  const handleSavedAddressSelect = (addressId) => {
    console.log('handleSavedAddressSelect llamado con:', addressId);
    if (typeof onAddressSelect === 'function') {
      onAddressSelect(addressId, 'saved');
    } else {
      console.error('onAddressSelect no es una función:', onAddressSelect);
    }
  };

  // Maneja la selección de nueva dirección
  const handleNewAddressSelect = () => {
    console.log('handleNewAddressSelect llamado en AddressSelector');
    if (typeof onNewAddressSelect === 'function') {
      onNewAddressSelect();
    } else {
      console.error('onNewAddressSelect no es una función:', onNewAddressSelect);
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
        <div className="active-address-form-container mt-3">
          <NewAddressForm
            onAddressChange={onNewAddressDataChange}
            saveAddress={saveAddress}
            onSaveAddressChange={handleSaveAddressChange}
          />
        </div>
        
        {/* Agregamos las acciones de dirección también para usuarios sin direcciones */}
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
        <SimpleAddressForm
          isOpen={showManageForm}
          onClose={() => setShowManageForm(false)}
          onSave={handleSaveNewAddress}
          loading={savingAddress}
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
        name="Ingresa tu dirección"
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
        {addresses.map(address => {
          console.log(`Dirección ${address.id} - onAddressSelect es:`, typeof onAddressSelect, onAddressSelect);
          return (
            <AddressOption
              key={address.id}
              isSelected={selectedAddressId === address.id && selectedAddressType === 'saved'}
              onSelect={() => {
                console.log("Llamando a onAddressSelect:", typeof onAddressSelect);
                if (typeof onAddressSelect === 'function') {
                  onAddressSelect(address.id, 'saved');
                } else {
                  console.error('Error: onAddressSelect no es una función', onAddressSelect);
                }
              }}
              name={address.name}
              description={formatAddress(address)}
              references={address.references}
              isDefault={address.isDefault}
              id={`address-${address.id}`}
            />
          );
        })}
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
      <SimpleAddressForm
        isOpen={showManageForm}
        onClose={() => setShowManageForm(false)}
        onSave={handleSaveNewAddress}
        loading={savingAddress}
      />
    </div>
  );
};