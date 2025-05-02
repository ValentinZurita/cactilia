/**
 * Componente para seleccionar dirección de envío
 */
import React, { useEffect, useState } from 'react'
import { fetchAddressesByUserId } from './addressesService.js'
import '@modules/checkout/shipping/AddressSelector.css'

/**
 * Formatea una dirección para mostrar
 * @param {Object} address - Datos de la dirección
 * @returns {string} - Dirección formateada
 */
const formatAddress = (address) => {
  if (!address) return ''

  const parts = [
    address.street,
    address.number,
    address.colonia && `Col. ${address.colonia}`,
    address.city,
    address.state,
    address.zip && `CP. ${address.zip}`,
  ]

  return parts.filter(Boolean).join(', ')
}

/**
 * Componente para seleccionar dirección de envío
 * @param {Object} props - Propiedades
 * @param {string} props.userId - ID del usuario
 * @param {Object} props.selectedAddress - Dirección seleccionada
 * @param {Function} props.onAddressChange - Callback cuando cambia la dirección
 * @returns {JSX.Element} - Componente de selector de dirección
 */
export const AddressSelector = ({
                                  userId,
                                  selectedAddress = null,
                                  onAddressChange = () => {
                                  },
                                }) => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar direcciones del usuario
  useEffect(() => {
    const loadAddresses = async () => {
      if (!userId) return

      try {
        setLoading(true)
        setError(null)

        const userAddresses = await fetchAddressesByUserId(userId)

        setAddresses(userAddresses)

        // Si hay direcciones y no hay seleccionada, seleccionar la primera
        if (userAddresses.length > 0 && !selectedAddress) {
          onAddressChange(userAddresses[0])
        }
      } catch (err) {
        console.error('Error al cargar direcciones:', err)
        setError(err.message || 'Error al cargar direcciones')
      } finally {
        setLoading(false)
      }
    }

    loadAddresses()
  }, [userId, selectedAddress, onAddressChange])

  // Manejar cambio de dirección
  const handleAddressChange = (event) => {
    const addressId = event.target.value
    const address = addresses.find(addr => addr.id === addressId)

    if (address) {
      onAddressChange(address)
    }
  }

  // Si está cargando, mostrar estado de carga
  if (loading) {
    return (
      <div className="address-selector-container loading">
        <p>Cargando direcciones...</p>
      </div>
    )
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div className="address-selector-container error">
        <p>Error al cargar direcciones: {error}</p>
      </div>
    )
  }

  // Si no hay direcciones, mostrar mensaje
  if (addresses.length === 0) {
    return (
      <div className="address-selector-container no-addresses">
        <p>No tienes direcciones guardadas. Agrega una para continuar.</p>
        <button className="add-address-button">Agregar dirección</button>
      </div>
    )
  }

  return (
    <div className="address-selector-container">
      <h3>Dirección de envío</h3>

      <div className="address-selection">
        <select
          className="address-select"
          value={selectedAddress?.id || ''}
          onChange={handleAddressChange}
        >
          <option value="" disabled>Selecciona una dirección</option>
          {addresses.map(address => (
            <option key={address.id} value={address.id}>
              {address.name || formatAddress(address)}
            </option>
          ))}
        </select>
      </div>

      {selectedAddress && (
        <div className="selected-address">
          <p className="address-label">Enviar a:</p>
          <p className="address-details">{formatAddress(selectedAddress)}</p>
        </div>
      )}
    </div>
  )
}