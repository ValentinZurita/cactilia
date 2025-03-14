import { AddItemButton, SectionTitle } from '../components/shared/index.js'
import { useAddresses } from '../hooks/useAddresses';
import '../styles/profileAddresses.css';
import '../styles/sharedComponents.css';
import { AddressesList, SimpleAddressForm } from '../components/addresses/index.js'

/**
 * Página mejorada de gestión de direcciones del usuario
 * Incluye soporte para direcciones mexicanas con campos adicionales
 */
export const AddressesPage = () => {
  // Usar los hooks mejorados para direcciones
  const {
    addresses,
    loading,
    error,
    submitting,
    selectedAddress,
    showForm,
    saveAddress,
    confirmDeleteAddress,
    setDefaultAddress,
    openAddForm,
    openEditForm,
    closeForm
  } = useAddresses();

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
    </div>
  );
};