import React, { useState } from 'react'
import PropTypes from 'prop-types'
import ShippingOption from './ShippingOption.jsx'
import '../../styles/shipping.css'

/**
 * Componente que agrupa opciones de envío bajo una misma regla
 *
 * @param {Object} props
 * @param {Array} props.options - Opciones de envío para este grupo
 * @param {Function} props.onSelect - Función para seleccionar una opción
 * @param {string} props.selectedOptionId - ID de la opción seleccionada
 * @param {boolean} props.disabled - Si las opciones están deshabilitadas
 * @param {Array} props.selectedProducts - Productos ya seleccionados en otros grupos
 * @returns {JSX.Element}
 */
const ShippingOptionGroup = ({
                               options,
                               onSelect,
                               selectedOptionId = '',
                               disabled = false,
                               selectedProducts = [],
                             }) => {
  const [expanded, setExpanded] = useState(false)

  // Agrupar opciones por regla
  const groupedOptions = options.reduce((acc, option) => {
    const ruleId = option.ruleId
    if (!acc[ruleId]) {
      acc[ruleId] = {
        ruleName: option.ruleName || 'Sin nombre',
        options: [],
      }
    }
    acc[ruleId].options.push(option)
    return acc
  }, {})

  // Verificar si algunas opciones están deshabilitadas por productos ya seleccionados
  const checkOptionDisabled = (option) => {
    if (disabled) return true

    // Si no hay productos seleccionados, nada está deshabilitado
    if (!selectedProducts || selectedProducts.length === 0) return false

    // Verificar si algún producto de esta opción ya está seleccionado en otro grupo
    let hasOverlap = false

    if (option.products && Array.isArray(option.products)) {
      option.products.forEach(product => {
        const productId = product.product?.id || product.id
        if (selectedProducts.includes(productId)) {
          hasOverlap = true
        }
      })
    }

    return hasOverlap
  }

  return (
    <div className="shipping-option-group">
      {Object.values(groupedOptions).map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="shipping-option-group__container">
          <div className="shipping-option-group__header">
            <h3 className="shipping-option-group__title">{group.ruleName}</h3>
            {group.options.length > 1 && (
              <button
                className="shipping-option-group__toggle"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Mostrar menos' : 'Ver todas las opciones'}
              </button>
            )}
          </div>

          <div className="shipping-option-group__options">
            {/* Mostrar primera opción o todas si está expandido */}
            {group.options.slice(0, expanded ? group.options.length : 1).map((option) => (
              <ShippingOption
                key={option.id}
                option={option}
                isSelected={selectedOptionId === option.id}
                onSelect={onSelect}
                isComplete={option.coversAllProducts}
                disabled={checkOptionDisabled(option)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

ShippingOptionGroup.propTypes = {
  options: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedOptionId: PropTypes.string,
  disabled: PropTypes.bool,
  selectedProducts: PropTypes.array,
}

export default ShippingOptionGroup