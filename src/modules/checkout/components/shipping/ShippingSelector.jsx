import React, { lazy, Suspense, useEffect, useState } from 'react'
import ShippingGroupSelector from './ShippingGroupSelector.jsx'
import '../../styles/shipping.css'
import PropTypes from 'prop-types'
import { ToggleDebugButton } from '../common/index.js'
import { useDebugMode } from '../../hooks/useDebugMode.js'
import { ShippingOptionAutoSelector } from './components/index.js'

// Lazy loading para reducir el bundle inicial
const DeveloperDebugPanel = lazy(() => import('./DeveloperDebugPanel.jsx'))

/**
 * Componente adaptador para selección de envío
 * Maneja el estado de selección y validación
 */
const ShippingSelector = ({
                            cartItems,
                            onOptionSelect,
                            selectedOptionId,
                            userAddress,
                            onCombinationsCalculated,
                            shippingOptions = [],
                            isLoading = false,
                            error = null,
                            autoSelectPreference = 'cheapest',
                            enableAutoSelect = true,
                          }) => {
  // Estado para advertencia de envío incompleto
  const [incompleteShipping, setIncompleteShipping] = useState(false)
  // Estado para almacenar opciones procesadas
  const [processedOptions, setProcessedOptions] = useState([])
  // Estado para controlar si ya extraímos opciones nacionales
  const [hasExtractedNationalOptions, setHasExtractedNationalOptions] = useState(false)
  // Hook para gestionar el modo de depuración
  const [isDebugMode, toggleDebugMode] = useDebugMode()

  // Procesar opciones cuando se reciben nuevas
  useEffect(() => {
    if (shippingOptions.length === 0) {
      return
    }

    // Extraer opciones nacionales independientes de las combinaciones
    let nationalOptions = []
    let enrichedOptions = [...shippingOptions]

    // Solo extraer si no lo hemos hecho antes o si hay nuevas opciones diferentes
    const needsUpdate = processedOptions.length === 0 ||
      JSON.stringify(shippingOptions.map(o => o.id)) !==
      JSON.stringify(processedOptions.map(o => o.id))

    if (needsUpdate) {
      // Asignar IDs estables
      enrichedOptions = shippingOptions.map(option => {
        if (!option.id && !option.optionId) {
          option.optionId = `opt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        }
        return option
      })

      // Solo extraer opciones nacionales si no lo hemos hecho antes
      if (!hasExtractedNationalOptions) {
        // Buscar todas las opciones que son combinaciones y tienen opciones nacionales
        enrichedOptions.forEach(option => {
          if (option.combination && option.combination.options) {
            // Filtrar opciones nacionales
            const nationalsInCombo = option.combination.options.filter(opt =>
              (opt.zoneType && opt.zoneType.toLowerCase().includes('nacional')) ||
              (opt.zoneName && opt.zoneName.toLowerCase().includes('nacional') ||
                opt.zoneName && opt.zoneName.toLowerCase().includes('national')),
            )

            nationalsInCombo.forEach(natOpt => {
              // Verificar que tenga carrier/label
              if (natOpt.carrierName && natOpt.carrierLabel) {
                // Verificar si ya existe una opción similar
                const alreadyExists = nationalOptions.some(existing =>
                  existing.carrierName === natOpt.carrierName &&
                  existing.carrierLabel === natOpt.carrierLabel,
                )

                if (!alreadyExists) {
                  // Crear copia independiente
                  const nationalOption = {
                    ...natOpt,
                    id: `national_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'nacional',
                    name: `${natOpt.carrierName} - ${natOpt.carrierLabel}`,
                    description: `Servicio de envío nacional ${natOpt.carrierLabel.toLowerCase()}`,
                    standalone: true,
                    // Información de productos
                    products: natOpt.products || [],
                    // Evitar que se confunda con combinaciones
                    combination: null,
                  }

                  nationalOptions.push(nationalOption)
                }
              }
            })
          }
        })

        // Añadir opciones nacionales al conjunto principal
        if (nationalOptions.length > 0) {
          enrichedOptions = [...nationalOptions, ...enrichedOptions]
          setHasExtractedNationalOptions(true)
        }
      }

      setProcessedOptions(enrichedOptions)
    }
  }, [shippingOptions, hasExtractedNationalOptions, processedOptions])

  /**
   * Manejar la selección de una opción de envío
   */
  const handleOptionSelect = (option) => {
    // Initialize as true, and only set to false if we can determine it's not complete
    let isComplete = true

    // If the option already has an explicit coversAllProducts flag, respect it
    if (option.coversAllProducts !== undefined) {
      isComplete = option.coversAllProducts
    }
    // For options from standalone/national services with isNational flag
    else if (option && option.isNational && option.standalone) {
      // Check if there are any products that require local shipping
      const hasLocalProducts = cartItems.some(item => {
        const product = item.product || item

        // Verificar si este producto requiere envío local
        return product.shippingRuleIds &&
          product.shippingRuleIds.some(ruleId => ruleId.toLowerCase().includes('local'))
      })

      // Si hay productos locales, esta opción nacional no cubre todo
      isComplete = !hasLocalProducts
    }
    // For options from our new service with combination property
    else if (option && option.combination?.isComplete) {
      isComplete = true
    }
    // For options with product coverage by rule
    else if (option && option.covered_products) {
      // Check if all cart items are covered by this option
      const productRuleIds = new Set()

      if (Array.isArray(option.covered_products)) {
        option.covered_products.forEach(productId => {
          productRuleIds.add(productId)
        })
      }

      // Count how many cart items have their rules covered
      const rulesInCart = new Set()

      cartItems.forEach(item => {
        const product = item.product || item
        const productId = product.id

        if (productRuleIds.has(productId)) {
          rulesInCart.add(productId)
        }
      })

      // If all products are covered, set isComplete to true
      isComplete = rulesInCart.size === cartItems.length
    }

    setIncompleteShipping(!isComplete)

    // Add coverage information to the option
    const optionWithCoverage = {
      ...option,
      coversAllProducts: isComplete,
    }

    // Call the original callback
    if (onOptionSelect) {
      onOptionSelect(optionWithCoverage)
    }
  }

  return (
    <div className="shipping-selector-container">
      {/* Auto-selector para elegir la mejor opción según las preferencias */}
      <ShippingOptionAutoSelector
        shippingOptions={processedOptions.length > 0 ? processedOptions : shippingOptions}
        selectedOptionId={selectedOptionId}
        onOptionSelect={handleOptionSelect}
        enabled={enableAutoSelect && !isLoading && !error}
        preference={autoSelectPreference}
      />

      {/* Panel de depuración - Lazy loading */}
      {isDebugMode && (
        <Suspense fallback={<div className="p-3 bg-light rounded">Cargando panel de depuración...</div>}>
          <DeveloperDebugPanel
            cartItems={cartItems}
            userAddress={userAddress}
            selectedOptionId={selectedOptionId}
            shippingOptions={processedOptions.length > 0 ? processedOptions : shippingOptions}
          />
        </Suspense>
      )}

      {/* Selector de grupo de envío */}
      <ShippingGroupSelector
        cartItems={cartItems}
        onOptionSelect={handleOptionSelect}
        selectedOptionId={selectedOptionId}
        userAddress={userAddress}
        shippingOptions={processedOptions.length > 0 ? processedOptions : shippingOptions}
        isLoading={isLoading}
        error={error}
        showDiagnostics={isDebugMode}
      />

      {/* Advertencia de envío incompleto */}
      {incompleteShipping && selectedOptionId && (
        <div className="shipping-incomplete-warning alert alert-warning mt-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Envío incompleto:</strong> La opción seleccionada no cubre todos los productos de tu carrito.

          {processedOptions.find(opt => (opt.id || opt.optionId) === selectedOptionId)?.standalone && (
            <div className="mt-2">
              <p>Esta opción nacional solo cubre los productos que requieren envío nacional. Para los productos locales,
                necesitas seleccionar una combinación que incluya envío local + nacional.</p>
            </div>
          )}

          <div className="mt-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                // Deseleccionar la opción actual
                if (onOptionSelect) {
                  onOptionSelect(null)
                }
              }}
            >
              Ver otras opciones
            </button>
          </div>
        </div>
      )}

      {/* Botón de depuración (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <ToggleDebugButton
          active={isDebugMode}
          onClick={toggleDebugMode}
        />
      )}
    </div>
  )
}

ShippingSelector.propTypes = {
  cartItems: PropTypes.array.isRequired,
  onOptionSelect: PropTypes.func.isRequired,
  selectedOptionId: PropTypes.string,
  userAddress: PropTypes.object,
  onCombinationsCalculated: PropTypes.func,
  shippingOptions: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  autoSelectPreference: PropTypes.oneOf(['cheapest', 'fastest', 'preferred']),
  enableAutoSelect: PropTypes.bool,
}

export default ShippingSelector