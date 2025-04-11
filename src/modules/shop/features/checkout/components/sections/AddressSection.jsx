import { CheckoutSection } from './CheckoutSection';
import { LoadingSpinner } from '../../../../components/ui/index.js'
import { AddressSelector } from '../address/index.js'

/**
 * Sección para selección de dirección de envío
 *
 * @param {Object} props - Props del componente
 * @param {Array} props.addresses - Lista de direcciones disponibles
 * @param {string} props.selectedAddressId - ID de la dirección seleccionada
 * @param {string} props.selectedAddressType - Tipo de dirección seleccionada
 * @param {boolean} props.loading - Si está cargando las direcciones
 * @param {Function} props.onAddressSelect - Función para seleccionar dirección
 * @param {Function} props.onNewAddressSelect - Función para seleccionar nueva dirección
 * @param {Function} props.onNewAddressDataChange - Función para actualizar datos de nueva dirección
 * @returns {JSX.Element} Sección de selección de dirección
 */
export const AddressSection = ({
                                 addresses,
                                 selectedAddressId,
                                 selectedAddressType,
                                 loading,
                                 onAddressSelect,
                                 onNewAddressSelect,
                                 onNewAddressDataChange
                               }) => {
  // Log para asegurarnos que los handlers existen en este nivel
  console.log('AddressSection props:', {
    addressesCount: addresses?.length || 0,
    onAddressSelect: typeof onAddressSelect,
    onAddressSelectValue: onAddressSelect,
    onNewAddressSelect: typeof onNewAddressSelect,
    onNewAddressSelectValue: onNewAddressSelect
  });
  
  // Crear wrappers para los handlers para confirmar que funcionan
  const handleAddressSelect = (id, type) => {
    console.log('AddressSection.handleAddressSelect llamado con:', { id, type });
    if (typeof onAddressSelect === 'function') {
      onAddressSelect(id, type);
    } else {
      console.error('onAddressSelect no es una función en AddressSection:', onAddressSelect);
    }
  };
  
  const handleNewAddressSelect = () => {
    console.log('AddressSection.handleNewAddressSelect llamado');
    if (typeof onNewAddressSelect === 'function') {
      onNewAddressSelect();
    } else {
      console.error('onNewAddressSelect no es una función en AddressSection:', onNewAddressSelect);
    }
  };
                                 
  return (
    <CheckoutSection title="Dirección de Envío" stepNumber={1}>
      {loading ? (
        <LoadingSpinner size="sm" text="Cargando direcciones..." />
      ) : (
        <AddressSelector
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          selectedAddressType={selectedAddressType}
          onAddressSelect={handleAddressSelect}
          onNewAddressSelect={handleNewAddressSelect}
          onNewAddressDataChange={onNewAddressDataChange}
        />
      )}
    </CheckoutSection>
  );
};