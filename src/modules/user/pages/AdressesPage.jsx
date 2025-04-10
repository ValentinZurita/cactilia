import { AddItemButton, SectionTitle } from '../components/shared/index.js'
import { useAddresses } from '../hooks/useAddresses';
import '../styles/profileAddresses.css';
import '../styles/sharedComponents.css';
import { AddressesList, SimpleAddressForm } from '../components/addresses/index.js'
import { ConfirmationModal } from '../components/shared/ConfirmationModal.jsx';

/**
 * Página mejorada de gestión de direcciones del usuario
 * Incluye soporte para direcciones mexicanas con campos adicionales
 */
const AddressesPage = () => {
  // Usar los hooks mejorados para direcciones
  const {
    addresses,
    loading,
    error,
    submitting,
    selectedAddress,
    showForm,
    showConfirmModal,
    addressToDelete,
    isProcessing,
    saveAddress,
    deleteAddress,
    confirmDeleteAddress,
    cancelDeleteAddress,
    setDefaultAddress,
    openAddForm,
    openEditForm,
    closeForm
  } = useAddresses();

  /**
   * Formatear la dirección para mostrar en el modal
   */
  const getAddressDetails = () => {
    if (!addressToDelete) return null;

    return addressToDelete.name || 'esta dirección';
  };

  return (
    <div className="addresses-container">
      {/* Título de sección */}
      <SectionTitle title="Mis Direcciones" />

      {/* Descripción sobre las direcciones */}
      <p className="text-muted mb-4">
        Administra tus direcciones de envío para recibir tus pedidos. Puedes agregar, editar y eliminar tus direcciones.
      </p>

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
        onSetDefault={setDefaultAddress}
        onDelete={confirmDeleteAddress}
        onEdit={openEditForm}
        loading={loading}
      />

      {/* Botón para agregar nueva dirección */}
      <AddItemButton
        onClick={openAddForm}
        label="Agregar dirección"
        icon="plus"
      />

      {/* Modal para agregar/editar direcciones - usando el formulario mejorado */}
      <SimpleAddressForm
        isOpen={showForm}
        onClose={closeForm}
        onSave={saveAddress}
        address={selectedAddress}
        loading={submitting}
      />

      {/* Modal de confirmación para eliminar dirección */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={cancelDeleteAddress}
        onConfirm={deleteAddress}
        title="Eliminar dirección"
        message={getAddressDetails()}
        detail={
          <p>
            ¿Estás seguro de que deseas eliminar esta dirección? Esta acción no se puede deshacer.
            <br /><br />
            <span className="text-muted small">
              Solo puedes eliminar direcciones que no estén establecidas como predeterminadas.
            </span>
          </p>
        }
        confirmText="Eliminar dirección"
        cancelText="Cancelar"
        icon="bi-geo-alt"
        iconColor="danger"
        confirmColor="danger"
        loading={isProcessing}
      />
    </div>
  );
};

export default AddressesPage;