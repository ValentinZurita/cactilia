/**
 * Variante de ShippingManager adaptada específicamente para integración con el checkout
 * Recibe la dirección directamente en lugar de seleccionarla
 */
import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { ShippingOptions } from './ShippingOptions.jsx'
import '@modules/checkout/shipping/ShippingManager.css'

/**
 * Componente para gestionar el envío dentro del checkout
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.cartItems - Ítems del carrito
 * @param {Object} props.selectedAddress - Dirección seleccionada (proporcionada por el checkout)
 * @param {Function} props.onShippingCostChange - Callback cuando cambia el costo de envío
 * @param {Function} props.onShippingValidChange - Callback cuando cambia la validez del envío
 * @param {Function} props.onShippingCoverageChange - Callback cuando cambian los productos cubiertos
 * @returns {JSX.Element} - Componente de gestión de envío para checkout
 */
export const ShippingManagerForCheckout = ({
                                             cartItems = [],
                                             selectedAddress,
                                             onShippingCostChange = () => {
                                             },
                                             onShippingValidChange = () => {
                                             },
                                             onShippingCoverageChange = () => {
                                             },
                                           }) => {
  // Usar refs para detectar cambios
  const addressRef = useRef(null)
  const cartItemsRef = useRef([])
  const forceUpdateRef = useRef(0)

  // Detectar cambios en la dirección o elementos del carrito
  useEffect(() => {
    // Si la dirección o los elementos del carrito cambian, actualizar referencias
    const addressChanged =
      !addressRef.current ||
      (selectedAddress && addressRef.current && selectedAddress.id !== addressRef.current.id)

    const cartItemsChanged =
      JSON.stringify(cartItemsRef.current.map(item => item.id)) !==
      JSON.stringify(cartItems.map(item => item.id))

    if (addressChanged || cartItemsChanged) {
      addressRef.current = selectedAddress
      cartItemsRef.current = [...cartItems]
      // Incrementar para forzar la actualización en componentes descendientes
      forceUpdateRef.current += 1
    }
  }, [selectedAddress, cartItems])

  // Manejar cambios en la opción de envío (ahora puede ser múltiple)
  const handleShippingOptionChange = (shippingData) => {
    console.log(`🔍 [SECUENCIA DETALLADA] ShippingManagerForCheckout recibió datos:`,
      shippingData ? {
        totalCost: shippingData.totalCost,
        optionsCount: shippingData.options?.length || 0,
        unavailableCount: shippingData.unavailableProductIds?.length || 0,
        hasPartialCoverage: !!shippingData.hasPartialCoverage,
        isPartial: !!shippingData.isPartial,
        isFree: !!shippingData.isFree,
      } : 'null')

    if (!shippingData) {
      // Si no hay datos de envío, establecer costo 0
      console.log(`🔍 [SECUENCIA DETALLADA] No hay datos de envío, estableciendo costo 0`)
      onShippingCostChange(0)
      // Informar que no hay productos cubiertos
      onShippingCoverageChange({
        coveredProductIds: [],
        unavailableProductIds: cartItems.map(item => (item.product || item).id),
        hasPartialCoverage: false,
      })
      return
    }

    // Verificar explícitamente si el envío debe ser gratuito
    const shippingCost = shippingData.isFree ? 0 : (shippingData.totalCost || 0)

    // Usar el costo total de todas las opciones seleccionadas
    console.log(`🔍 [SECUENCIA DETALLADA] Pasando costo total: $${shippingCost} (marcado como gratuito: ${!!shippingData.isFree})`)
    onShippingCostChange(shippingCost)

    // Pasar información de cobertura al checkout
    if (onShippingCoverageChange) {
      const coverageData = {
        coveredProductIds: shippingData.coveredProductIds || [],
        unavailableProductIds: shippingData.unavailableProductIds || [],
        hasPartialCoverage: shippingData.isPartial || shippingData.hasPartialCoverage || false,
        isFreeShipping: !!shippingData.isFree,
      }

      console.log(`🔍 [SECUENCIA DETALLADA] Pasando información de cobertura:`, {
        cubiertos: coverageData.coveredProductIds.length,
        noCubiertos: coverageData.unavailableProductIds.length,
        esCoberturaParcial: coverageData.hasPartialCoverage,
        esEnvioGratis: coverageData.isFreeShipping,
      })

      // Asegurar que la información se pase correctamente
      setTimeout(() => {
        onShippingCoverageChange(coverageData)

        // Registrar que el cambio fue procesado
        console.log(`🔍 [SECUENCIA DETALLADA] Cambio de cobertura procesado`)
      }, 0)
    }

    // Opcionalmente, se podría pasar más información al checkout
    console.log('Datos de envío actualizados:', {
      costo: shippingCost,
      esGratis: !!shippingData.isFree,
      opciones: shippingData.options?.length || 0,
    })
  }

  // Si no hay una dirección seleccionada, mostrar mensaje
  if (!selectedAddress) {
    return (
      <div className="shipping-manager shipping-manager-checkout">
        <div className="shipping-no-address">
          <h3>Selecciona una dirección de envío</h3>
          <p>No se puede calcular envío sin una dirección seleccionada</p>
        </div>
      </div>
    )
  }

  // Verificar si la dirección tiene código postal
  const hasPostalCode = selectedAddress.zip || selectedAddress.zipcode || selectedAddress.postalCode || selectedAddress.cp
  if (!hasPostalCode) {
    return (
      <div className="shipping-manager shipping-manager-checkout">
        <div className="shipping-no-address">
          <h3>Dirección incompleta</h3>
          <p>Es necesario un código postal para calcular opciones de envío.</p>
          <button
            className="btn btn-outline-primary mt-2"
            onClick={() => window.scrollTo(0, 0)}
          >
            Completar dirección
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="shipping-manager shipping-manager-checkout">
      <ShippingOptions
        address={selectedAddress}
        cartItems={cartItems}
        onShippingOptionChange={handleShippingOptionChange}
        onShippingValidityChange={onShippingValidChange}
        forceUpdateKey={forceUpdateRef.current}
      />
    </div>
  )
}

ShippingManagerForCheckout.propTypes = {
  cartItems: PropTypes.array,
  selectedAddress: PropTypes.object,
  onShippingCostChange: PropTypes.func,
  onShippingValidChange: PropTypes.func,
  onShippingCoverageChange: PropTypes.func,
}