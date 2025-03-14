import { useState } from 'react';
import { AddItemButton, SectionTitle } from '../components/shared/index.js';
import { useAddresses } from '../hooks/useAddresses';
import '../styles/profileAddresses.css';
import '../styles/sharedComponents.css';
import { AddressesList,  } from '../components/addresses/index.js';
import { SimpleAddressForm } from '../components/addresses/SimpleAddressForm.jsx'

/**
 * Página de gestión de direcciones del usuario
 * Permite agregar, editar, eliminar y establecer direcciones predeterminadas
 */
export const AddressesPage = () => {
  // Usar los hooks para direcciones y modal
  const {
    addresses,
    loading,
    error,
    submitting,
    saveAddress,
    deleteAddress,
    setDefaultAddress
  } = useAddresses();

  // Estado para controlar la visibilidad del modal
  const [showModal, setShowModal] = useState(false);

  // Estado para almacenar la dirección que se está editando
  const [editingAddress, setEditingAddress] = useState(null);

  /**
   * Abre el modal para agregar una nueva dirección
   */
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  /**
   * Abre el modal para editar una dirección existente
   *
   * @param {Object} address - Dirección a editar
   */
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  /**
   * Cierra el modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
  };

  /**
   * Controla el guardado de una dirección (nueva o existente)
   *
   * @param {Object} addressData - Datos de la dirección
   */
  const handleSaveAddress = async (addressData) => {
    const result = await saveAddress(addressData);

    if (result.ok) {
      setShowModal(false);
      setEditingAddress(null);
    }
  };

  /**
   * Confirma y maneja la eliminación de una dirección
   *
   * @param {string} addressId - ID de la dirección a eliminar
   */
  const handleDeleteAddress = async (addressId) => {
    // Confirmar eliminación
    if (window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      await deleteAddress(addressId);
    }
  };

  /**
   * Establece una dirección como predeterminada
   *
   * @param {string} addressId - ID de la dirección a establecer como predeterminada
   */
  const handleSetDefault = async (addressId) => {
    await setDefaultAddress(addressId);
  };

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Mis Direcciones" />

      {/* Mensaje de error si existe */}
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Lista de direcciones */}
      <AddressesList
        addresses={addresses}
        onSetDefault={handleSetDefault}
        onDelete={handleDeleteAddress}
        onEdit={handleEditAddress}
        loading={loading}
      />

      {/* Botón para agregar nueva dirección */}
      <AddItemButton
        onClick={handleAddAddress}
        label="Agregar dirección"
        icon="plus"
      />

      {/* Modal para agregar/editar direcciones */}
      <SimpleAddressForm
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveAddress}
        address={editingAddress}
        loading={submitting}
      />
    </div>
  );
};