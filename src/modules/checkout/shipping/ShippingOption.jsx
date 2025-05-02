import React from 'react'
import PropTypes from 'prop-types'
import styles from './shipping.module.css'

/**
 * Component to display a single shipping option
 */
const ShippingOption = ({
                          option,
                          isSelected,
                          onSelect,
                          showDetails = false,
                        }) => {
  if (!option) return null

  const {
    name,
    calculatedCost,
    isFree,
    deliveryTime,
    packages = [],
  } = option

  // Handle option selection
  const handleClick = () => {
    onSelect && onSelect(option)
  }

  // Format the price display
  const formattedPrice = isFree
    ? <span className={styles.freeShipping}>Gratis</span>
    : <span>${calculatedCost.toFixed(2)}</span>

  return (
    <div
      className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
      onClick={handleClick}
    >
      <div className={styles.optionHeader}>
        <div>
          <div className="d-flex align-items-center">
            <input
              type="radio"
              className={styles.radioButton}
              checked={isSelected}
              onChange={() => {
              }}
              onClick={(e) => e.stopPropagation()}
              id={`shipping-option-${option.id}`}
            />
            <h6 className={styles.optionName}>{name}</h6>
          </div>
          <div className={styles.deliveryTime}>
            <i className="bi bi-clock me-1"></i>
            {deliveryTime}
          </div>
        </div>
        <div className={styles.optionPrice}>
          {formattedPrice}
        </div>
      </div>

      {/* Display package details if requested and is selected */}
      {isSelected && showDetails && packages.length > 0 && (
        <div className={styles.packagesList}>
          <div className="mt-2 mb-1 small text-muted">
            Detalles del envío:
          </div>
          {packages.map((pkg, index) => (
            <div key={pkg.id} className={styles.packageItem}>
              <div className={styles.packageTitle}>
                Paquete {index + 1}
                <span className="ms-2 text-muted">
                  ({pkg.totalWeight.toFixed(2)} kg - {pkg.totalQuantity} {pkg.totalQuantity === 1 ? 'artículo' : 'artículos'})
                </span>
              </div>
              {pkg.items.map((item, idx) => {
                const product = item.product || item
                return (
                  <div key={`${product.id}-${idx}`} className={styles.productItem}>
                    <div>{product.name}</div>
                    <div>x{item.quantity}</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

ShippingOption.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    calculatedCost: PropTypes.number.isRequired,
    isFree: PropTypes.bool,
    deliveryTime: PropTypes.string,
    packages: PropTypes.array,
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  showDetails: PropTypes.bool,
}

export default ShippingOption