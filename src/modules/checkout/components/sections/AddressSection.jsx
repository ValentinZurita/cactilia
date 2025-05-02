import { CheckoutSection } from './CheckoutSection.jsx'
import { LoadingSpinner } from '../../../shop/components/ui/index.js'
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
                                 onNewAddressDataChange,
                               }) => {
  return (
    <CheckoutSection title="Dirección de Envío" stepNumber={1}>
      {loading ? (
        <LoadingSpinner size="sm" text="Cargando direcciones..." />
      ) : (
        <AddressSelector
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          selectedAddressType={selectedAddressType}
          onAddressSelect={onAddressSelect}
          onNewAddressSelect={onNewAddressSelect}
          onNewAddressDataChange={onNewAddressDataChange}
        />
      )}
    </CheckoutSection>
  )
}