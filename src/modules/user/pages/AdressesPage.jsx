import { SectionTitle } from '../components/shared/index.js';
import { useAddresses } from '../hooks/useAddresses';
import { AddAddressButton, AddressesList } from '../components/addresses/index.js'
import '../styles/profileAddresses.css';

/**
 * AddressesPage - Página para gestionar las direcciones del usuario
 * Versión modular y fácil de leer
 */
export const AddressesPage = () => {

  // Obtener métodos y estado del hook personalizado
  const {
    addresses,
    setDefaultAddress,
    deleteAddress,
    editAddress,
    addAddress
  } = useAddresses();

  return (
    <div>

      {/* Título de sección */}
      <SectionTitle title="Mis Direcciones" />

      {/* Lista de direcciones */}
      <AddressesList
        addresses={addresses}
        onSetDefault={setDefaultAddress}
        onDelete={deleteAddress}
        onEdit={editAddress}
      />

      {/* Botón para agregar dirección */}
      <AddAddressButton onClick={addAddress} />

    </div>
  );
};