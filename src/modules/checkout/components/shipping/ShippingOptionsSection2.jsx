import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

/**
 * Sección del checkout que muestra las opciones de envío disponibles
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.shippingOptions - Lista de opciones de envío disponibles
 * @param {string} props.selectedOptionId - ID de la opción seleccionada
 * @param {Function} props.onOptionSelect - Función para seleccionar una opción
 * @param {boolean} props.loading - Indica si están cargando las opciones
 * @param {boolean} props.addressSelected - Indica si ya se seleccionó una dirección
 */
export const ShippingOptionsSection2 = ({
                                          shippingOptions = [],
                                          selectedOptionId,
                                          onOptionSelect,
                                          loading = false,
                                          addressSelected = false,
                                        }) => {
  // Referencia para controlar logs
  const loggedRef = useRef(false)

  // Log condicional para evitar spam en la consola
  useEffect(() => {
    // Solo mostrar el log una vez al iniciar la sección
    if (!loggedRef.current) {
      console.log('📦 Sección de opciones de envío inicializada')
      loggedRef.current = true
    }
  }, [])

  return (
    <div>
      {/* Rest of the component code */}
    </div>
  )
}

ShippingOptionsSection2.propTypes = {
  shippingOptions: PropTypes.array.isRequired,
  selectedOptionId: PropTypes.string,
  onOptionSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  addressSelected: PropTypes.bool,
}