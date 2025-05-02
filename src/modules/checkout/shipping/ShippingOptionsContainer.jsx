import React, { useState } from 'react'
import PropTypes from 'prop-types'
import ShippingOption from './ShippingOption.jsx'
import ShippingWarning from './ShippingWarning.jsx'
import styles from './shipping.module.css'

/**
 * Container component to display all shipping options
 */
const ShippingOptionsContainer = ({
                                    loading = false,
                                    error = null,
                                    availableOptions = [],
                                    selectedOption = null,
                                    ineligibleProducts = [],
                                    onOptionSelect,
                                    isAddressComplete = false,
                                  }) => {
  const [showDetails, setShowDetails] = useState(false)

  // Toggle shipping details view
  const toggleDetails = () => {
    setShowDetails(prev => !prev)
  }

  // If loading, show spinner
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span>Calculando opciones de envío...</span>
      </div>
    )
  }

  // If error, show error message
  if (error) {
    return (
      <div className={styles.errorCard}>
        <div className="d-flex align-items-start">
          <i className={`bi bi-x-circle-fill ${styles.errorIcon}`}></i>
          <div>
            <strong>Error al calcular opciones de envío</strong>
            <p className="mb-0 small">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // If address is not complete, show message
  if (!isAddressComplete) {
    return (
      <div className={styles.warningCard}>
        <div className="d-flex align-items-start">
          <i className={`bi bi-info-circle-fill ${styles.warningIcon}`}></i>
          <div>
            <strong>Dirección de envío incompleta</strong>
            <p className="mb-0 small">
              Por favor completa tu dirección de envío para ver las opciones disponibles.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If no options available, but address is complete
  if (availableOptions.length === 0 && isAddressComplete) {
    return (
      <div className={styles.errorCard}>
        <div className="d-flex align-items-start">
          <i className={`bi bi-x-circle-fill ${styles.errorIcon}`}></i>
          <div>
            <strong>No hay opciones de envío disponibles</strong>
            <p className="mb-0 small">
              No encontramos opciones de envío para tu dirección con los productos en tu carrito.
              Por favor modifica tu dirección o contacta con servicio al cliente.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.shippingContainer}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Opciones de envío</h5>
        {availableOptions.length > 0 && selectedOption && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={toggleDetails}
            type="button"
          >
            {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
          </button>
        )}
      </div>

      {/* Show warning for ineligible products */}
      <ShippingWarning ineligibleProducts={ineligibleProducts} />

      {/* Display available shipping options */}
      {availableOptions.map(option => (
        <ShippingOption
          key={option.id}
          option={option}
          isSelected={selectedOption?.id === option.id}
          onSelect={onOptionSelect}
          showDetails={showDetails}
        />
      ))}
    </div>
  )
}

ShippingOptionsContainer.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  availableOptions: PropTypes.array,
  selectedOption: PropTypes.object,
  ineligibleProducts: PropTypes.array,
  onOptionSelect: PropTypes.func.isRequired,
  isAddressComplete: PropTypes.bool,
}

export default ShippingOptionsContainer