/**
 * Componente para mostrar un paquete de envío individual
 */
import React, { useState } from 'react'
import '@modules/checkout/shipping/ShippingPackage.css' // <-- Restaurar la importación
import { PackageHeader } from './components/PackageHeader' // <-- Importar el nuevo componente
import { PackageSummary } from './components/PackageSummary' // <-- Importar PackageSummary
import { PackageDetailsList } from './components/PackageDetailsList' // <-- Importar PackageDetailsList
import { usePackageDisplayData } from './hooks/usePackageDisplayData.jsx' // <-- Actualizar extensión a .jsx

/**
 * Componente que muestra un paquete de envío. Utiliza el hook usePackageDisplayData
 * para la lógica de cálculo y se enfoca en la estructura y el estado.
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.packageData - Datos del paquete
 * @param {boolean} props.selected - Si está seleccionado
 * @param {Array} props.cartItems - Items del carrito para identificar productos incluidos
 * @param {Function} props.onSelect - Función para manejar la selección del paquete
 */
export const ShippingPackage = ({
                                  packageData,
                                  selected = false,
                                  cartItems = [],
                                  onSelect = () => {},
                                }) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  // --- Usar el hook para obtener todos los datos calculados ---
  const {
    // packProducts, // No se usa directamente en este componente
    totalProductUnits,
    totalWeight,
    packages,
    actualPackagesCount,
    calculatedTotalCost,
    // isFreeShipping, // Implícito en calculatedTotalCost === 0
    formattedTotalCost,
    displayDeliveryTime,
    getShippingIcon,
  } = usePackageDisplayData(packageData, cartItems);

  // Extraer solo el nombre y carrier para la cabecera y aria-label (si es necesario)
  const name = packageData?.name || 'Opción de envío';
  const carrier = packageData?.carrier;

  // --- Estados y Manejadores que permanecen en el componente ---
  if (!packageData) return null // Guard clause

  // Manejador de selección
  const handleSelect = () => {
    if (onSelect) {
      onSelect(packageData) // Pasamos el packageData original
    }
  }

  // Manejador para el toggle de detalles
  const handleToggleDetails = () => {
    setDetailsExpanded(!detailsExpanded);
  };

  // Generar ID para el input
  const optionId = `shipping-pkg-${packageData?.id || Math.random().toString(36).substring(7)}`

  // --- Renderizado usando datos del hook y subcomponentes ---
  return (
    <div
      className={`shipping-option ${selected ? 'active-shipping-option' : ''}`}
    >
      <div className="form-check w-100">
        <input
          className="form-check-input"
          type="checkbox"
          id={optionId}
          checked={selected}
          onChange={handleSelect}
          aria-label={`Seleccionar opción de envío: ${name}`}
        />
        <label
          className="form-check-label d-block"
          htmlFor={optionId}
          style={{ cursor: 'pointer' }}
        >
          {/* Usar valores del hook */}
          <PackageHeader
            name={name} // Usar el nombre extraído
            carrier={carrier} // Usar el carrier extraído
            displayDeliveryTime={displayDeliveryTime}
            calculatedTotalCost={calculatedTotalCost}
            formattedTotalCost={formattedTotalCost}
            getShippingIcon={getShippingIcon}
            packagesCount={actualPackagesCount}
          />

          <div className="shipping-package-body">
            {/* Usar valores del hook */}
            <PackageSummary
              totalProductUnits={totalProductUnits}
              totalWeight={totalWeight}
              maxProductsPerPackage={packageData?.maxProductsPerPackage} // Pasar directamente de props
              maxWeightPerPackage={packageData?.maxWeightPerPackage} // Pasar directamente de props
              actualPackagesCount={actualPackagesCount}
              detailsExpanded={detailsExpanded}
              onToggleDetails={handleToggleDetails}
            />

            {detailsExpanded && (
              /* Usar valores del hook */
              <PackageDetailsList
                packages={packages}
                actualPackagesCount={actualPackagesCount}
              />
            )}
          </div>
        </label>
      </div>
    </div>
  )
}