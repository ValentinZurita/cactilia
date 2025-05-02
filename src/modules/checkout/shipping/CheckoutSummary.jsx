import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { formatPrice } from '../../../utils/formatting/formatPrice.js'
import { useShipping } from './useShipping.js'

/**
 * Componente de resumen del checkout que incluye selección de envío
 * Utiliza el nuevo sistema de envío mejorado
 */
const CheckoutSummary = ({ cart, userAddress, onCheckout, currentStep }) => {
  // Estado local para el resumen
  const [summary, setSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  })
  const [isDebugMode, setIsDebugMode] = useState(false)

  // Usar el hook de envío para obtener opciones basadas en el carrito y la dirección
  const {
    loading,
    error,
    availableOptions,
    selectedOption,
    selectShippingOption,
    ineligibleProducts,
    hasShippingRestrictions,
    isAddressComplete,
    orderSubtotal,
  } = useShipping(cart?.items || [], userAddress)

  // Verificar si se debe mostrar el modo de depuración (URL con debug=true)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setIsDebugMode(urlParams.get('debug') === 'true')
  }, [])

  // Calcular el resumen cuando cambia el carrito o la opción de envío
  useEffect(() => {
    if (!cart || !cart.items) {
      return
    }

    // Calcular subtotal
    const subtotal = orderSubtotal

    // Calcular impuesto (ejemplo: 16% IVA)
    const taxRate = 0.16
    const tax = subtotal * taxRate

    // Calcular envío
    const shipping = selectedOption ? selectedOption.calculatedCost || 0 : 0

    // Calcular total
    const total = subtotal + tax + shipping

    // Actualizar resumen
    const newSummary = {
      subtotal,
      shipping,
      tax,
      total,
      shippingOption: selectedOption,
    }

    setSummary(newSummary)

    // Si estamos en el paso de envío o confirmación y hay una opción de envío seleccionada, 
    // actualizar el resumen en el componente padre
    if ((currentStep === 2 || currentStep === 3) && selectedOption) {
      onCheckout({
        ...newSummary,
        shippingOption: selectedOption,
      })
    }
  }, [cart, selectedOption, orderSubtotal, currentStep, onCheckout])

  // Manejar cambio en opción de envío
  const handleShippingChange = (option) => {
    selectShippingOption(option)
  }

  // Función para cambiar a modo debug
  const toggleDebugMode = () => {
    const newDebugMode = !isDebugMode
    setIsDebugMode(newDebugMode)

    // Actualizar URL sin recargar
    const url = new URL(window.location)
    if (newDebugMode) {
      url.searchParams.set('debug', 'true')
    } else {
      url.searchParams.delete('debug')
    }
    window.history.pushState({}, '', url)
  }

  return (
    <div className="checkout-summary">
      {/* Título de la sección */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Resumen del pedido</h5>
        <button
          className="btn btn-sm btn-link text-muted p-0"
          onClick={toggleDebugMode}
        >
          <i className="bi bi-gear"></i>
        </button>
      </div>

      {/* Información de productos */}
      <div className="checkout-items mb-4">
        <h6>Productos ({cart?.items?.length || 0})</h6>
        <div className="checkout-items-list">
          {cart?.items && cart.items.map((item) => (
            <div key={item.product.id} className="d-flex justify-content-between mb-2">
              <div className="item-info">
                <span className="item-name">{item.product.name}</span>
                <span className="item-quantity text-muted"> x{item.quantity}</span>
              </div>
              <div className="item-price">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mostrar advertencia si hay productos que no se pueden enviar */}
      {hasShippingRestrictions && (
        <div className="alert alert-warning small mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Algunos productos no pueden enviarse a la dirección seleccionada.
        </div>
      )}

      {/* Tabla de costos */}
      <div className="checkout-totals mb-4">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          <span>${summary.subtotal.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>IVA (16%):</span>
          <span>${summary.tax.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Envío:</span>
          {selectedOption && selectedOption.isFree ? (
            <span className="text-success">Gratis</span>
          ) : (
            <span>${summary.shipping.toFixed(2)}</span>
          )}
        </div>
        <div className="d-flex justify-content-between mt-3 pt-2 border-top">
          <strong>Total:</strong>
          <strong className="fs-5">${summary.total.toFixed(2)}</strong>
        </div>
      </div>

      {/* Contenedor para el botón de acción según el paso */}
      {currentStep === 2 && (
        <div className="d-grid">
          <button
            className="btn btn-dark"
            onClick={() => onCheckout({
              ...summary,
              shippingOption: selectedOption,
            })}
            disabled={!selectedOption || loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Continuar al pago'
            )}
          </button>
        </div>
      )}

      {currentStep === 4 && (
        <div className="d-grid">
          <button
            className="btn btn-success"
            onClick={() => onCheckout({
              ...summary,
              shippingOption: selectedOption,
            })}
            disabled={!selectedOption}
          >
            Confirmar y pagar
          </button>
        </div>
      )}

      {/* Modo debug */}
      {isDebugMode && (
        <div className="card mt-4 border-dark">
          <div className="card-header bg-dark text-white">
            Información de depuración
          </div>
          <div className="card-body">
            <div><strong>Estado:</strong> {loading ? 'Cargando' : 'Listo'}</div>
            <div><strong>Error:</strong> {error || 'Ninguno'}</div>
            <div><strong>Dirección completa:</strong> {isAddressComplete ? 'Sí' : 'No'}</div>
            <div><strong>Opciones disponibles:</strong> {availableOptions.length}</div>
            <div><strong>Subtotal:</strong> ${orderSubtotal.toFixed(2)}</div>
            <div><strong>Productos no enviables:</strong> {ineligibleProducts.length}</div>
            <hr />
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => console.log({
                cartItems: cart?.items,
                userAddress,
                availableOptions,
                selectedOption,
                ineligibleProducts,
              })}
            >
              Log datos en consola
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

CheckoutSummary.propTypes = {
  cart: PropTypes.object,
  userAddress: PropTypes.object,
  onCheckout: PropTypes.func.isRequired,
  currentStep: PropTypes.number.isRequired,
}

export default CheckoutSummary