import React from 'react'
import PropTypes from 'prop-types'
import styles from './shipping.module.css'

/**
 * Component to display warnings about products that can't be shipped
 */
const ShippingWarning = ({ ineligibleProducts = [] }) => {
  if (!ineligibleProducts || ineligibleProducts.length === 0) {
    return null
  }

  return (
    <div className={styles.warningCard}>
      <div className="d-flex align-items-start">
        <i className={`bi bi-exclamation-triangle-fill ${styles.warningIcon}`}></i>
        <div>
          <strong>Algunos productos no pueden enviarse a esta dirección</strong>
          <p className="mb-2 small">
            Los siguientes productos no tienen opciones de envío disponibles para la dirección
            seleccionada y han sido excluidos del cálculo de envío:
          </p>
          <ul className="mb-0 small ps-3">
            {ineligibleProducts.map(item => {
              const product = item.product || item
              return (
                <li key={product.id}>
                  {product.name}
                  {item.quantity > 1 && <span className="text-muted"> (x{item.quantity})</span>}
                </li>
              )
            })}
          </ul>
          <div className="mt-2 small text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Estos productos no se incluyen en el cálculo de envío. Si deseas comprarlos,
            deberás realizar un pedido separado con una dirección diferente.
          </div>
        </div>
      </div>
    </div>
  )
}

ShippingWarning.propTypes = {
  ineligibleProducts: PropTypes.array,
}

export default ShippingWarning