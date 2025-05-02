/**
 * Componente principal que integra todos los componentes del módulo de envío
 */
import React, { useCallback, useState } from 'react'
import { AddressSelector2 } from '../address/AddressSelector2.jsx'
import { ShippingOptions } from './ShippingOptions.jsx'
import '@modules/checkout/styles/ShippingManager.css'

/**
 * Componente principal para gestionar el envío en checkout
 * @param {Object} props - Propiedades
 * @param {Array} props.cartItems - Ítems del carrito
 * @param {string} props.userId - ID del usuario
 * @param {Function} props.onShippingCostChange - Callback cuando cambia el costo de envío
 * @param {Function} props.onShippingValidChange - Callback cuando cambia la validez del envío
 * @returns {JSX.Element} - Componente de gestión de envío
 */
export const ShippingManager = ({
                                  cartItems = [],
                                  userId = null,
                                  onShippingCostChange = () => {
                                  },
                                  onShippingValidChange = () => {
                                  },
                                }) => {
  // Estado local para dirección seleccionada
  const [selectedAddress, setSelectedAddress] = useState(null)

  // Manejar cambio de dirección
  const handleAddressChange = useCallback((newAddress) => {
    setSelectedAddress(newAddress)
  }, [])

  // Manejar cambio en costo de envío
  const handleShippingCostChange = useCallback((cost) => {
    if (typeof onShippingCostChange === 'function') {
      onShippingCostChange(cost)
    }
  }, [onShippingCostChange])

  // Manejar cambio en validez de envío
  const handleShippingValidChange = useCallback((isValid) => {
    if (typeof onShippingValidChange === 'function') {
      onShippingValidChange(isValid)
    }
  }, [onShippingValidChange])

  return (
    <div className="shipping-manager-container">
      <h2 className="shipping-section-title">Información de Envío</h2>

      {/* Selector de dirección */}
      <AddressSelector2
        userId={userId}
        selectedAddress={selectedAddress}
        onAddressChange={handleAddressChange}
      />

      {/* Opciones de envío */}
      <ShippingOptions
        cartItems={cartItems}
        selectedAddress={selectedAddress}
        onShippingCostChange={handleShippingCostChange}
        onShippingValidChange={handleShippingValidChange}
      />
    </div>
  )
}