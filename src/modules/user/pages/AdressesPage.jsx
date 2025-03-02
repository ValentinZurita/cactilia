import { AddItemButton, SectionTitle } from '../components/shared/index.js'
import { useAddresses } from '../hooks/useAddresses';
import '../styles/profileAddresses.css';
import '../styles/sharedComponents.css';
import { AddressesList } from '../components/addresses/index.js'

/**
 * AddressesPage - Página refactorizada para gestionar las direcciones del usuario
 * Implementa componentes y hooks genéricos para mayor modularidad
 */
export const AddressesPage = () => {
  // Usar el hook refactorizado para manejar direcciones
  const {
    addresses,
    loading,
    error,
    setDefaultAddress,
    deleteAddress,
    editAddress,
    addAddress
  } = useAddresses();

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

      {/* Lista de direcciones refactorizada */}
      <AddressesList
        addresses={addresses}
        onSetDefault={setDefaultAddress}
        onDelete={deleteAddress}
        onEdit={editAddress}
        loading={loading}
      />

      {/* Botón genérico para agregar dirección */}
      <AddItemButton
        onClick={addAddress}
        label="Agregar dirección"
        icon="plus"
      />
    </div>
  );
};