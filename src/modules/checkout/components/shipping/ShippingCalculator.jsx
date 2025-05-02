import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useCart } from '../../../shop/features/cart/hooks/useCart.js'
import './ShippingCalculator.css'

/**
 * Componente para seleccionar opciones de envío y mostrar su costo
 */
const ShippingCalculator = ({
                              availableOptions = [],
                              selectedOption = null,
                              onSelect = () => {
                              },
                              isLoading = false,
                              excludedProducts = [],
                            }) => {
  const { updateShipping } = useCart()
  const [expanded, setExpanded] = useState(false)

  // Actualizar costo de envío cuando cambia la opción seleccionada
  useEffect(() => {
    if (selectedOption) {
      const cost = selectedOption.totalCost || selectedOption.calculatedCost || 0
      updateShipping(cost)
    } else {
      updateShipping(0)
    }
  }, [selectedOption, updateShipping])

  // Ordenar opciones por costo
  const sortedOptions = availableOptions.length ?
    [...availableOptions].sort((a, b) => {
      // Primero opciones gratis
      if (a.isFreeShipping && !b.isFreeShipping) return -1
      if (!a.isFreeShipping && b.isFreeShipping) return 1

      // Luego por costo
      return (a.totalCost || a.calculatedCost || 0) - (b.totalCost || b.calculatedCost || 0)
    }) : []

  // Manejar selección de opción
  const handleSelectOption = (option) => {
    if (option && onSelect) {
      onSelect(option)
    }
  }

  // Mostrar spinner mientras carga
  if (isLoading) {
    return (
      <div className="shipping-calculator p-3 border rounded mb-3">
        <div className="d-flex align-items-center text-secondary">
          <div className="spinner-border spinner-border-sm me-2" role="status">
            <span className="visually-hidden">Cargando opciones de envío...</span>
          </div>
          <span>Calculando opciones de envío...</span>
        </div>
      </div>
    )
  }

  // Si no hay opciones, mostrar mensaje
  if (!availableOptions || availableOptions.length === 0) {
    return (
      <div className="shipping-calculator p-3 border rounded mb-3">
        <div className="alert alert-warning mb-0">
          <strong>No hay opciones de envío disponibles</strong>
          {excludedProducts && excludedProducts.length > 0 && (
            <div className="mt-2 small">
              <span>Hay {excludedProducts.length} producto(s) en tu carrito que no tienen reglas de envío asignadas.</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="shipping-calculator border rounded p-3 mb-3">
      <h6 className="mb-3">Opciones de envío</h6>

      {excludedProducts && excludedProducts.length > 0 && (
        <div className="alert alert-warning mb-3">
          <strong>Atención:</strong> Algunos productos no tienen reglas de envío y han sido excluidos del cálculo.
          <button
            className="btn btn-sm btn-link text-dark p-0 ms-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Ocultar detalles' : 'Ver detalles'}
          </button>

          {expanded && (
            <div className="mt-2 small">
              <strong>Productos excluidos:</strong>
              <ul className="mb-0 ps-3 mt-1">
                {excludedProducts.map(product => (
                  <li key={product.id}>{product.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="shipping-options list-group">
        {sortedOptions.map(option => (
          <button
            key={option.id}
            className={`
              list-group-item list-group-item-action d-flex justify-content-between align-items-center
              ${selectedOption && selectedOption.id === option.id ? 'active' : ''}
            `}
            onClick={() => handleSelectOption(option)}
          >
            <div>
              <div className="fw-bold">{option.carrier}</div>
              <small className="text-muted">{option.deliveryTime}</small>
            </div>
            <div className="shipping-price">
              {option.isFreeShipping ? (
                <span className="badge bg-success">Gratis</span>
              ) : (
                <span>${(option.totalCost || option.calculatedCost || 0).toFixed(2)}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

ShippingCalculator.propTypes = {
  availableOptions: PropTypes.array,
  selectedOption: PropTypes.object,
  onSelect: PropTypes.func,
  isLoading: PropTypes.bool,
  excludedProducts: PropTypes.array,
}

export default ShippingCalculator