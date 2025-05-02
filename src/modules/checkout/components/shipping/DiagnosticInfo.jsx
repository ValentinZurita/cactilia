import React from 'react'
import PropTypes from 'prop-types'
import '@modules/checkout/styles/address/shimmer.css'

/**
 * Componente para mostrar información de diagnóstico sobre opciones de envío
 * Útil durante el desarrollo y depuración
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.shippingOptions - Opciones de envío disponibles
 * @param {Array} props.groupedOptions - Opciones agrupadas calculadas
 * @param {boolean} props.loading - Indica si las opciones están cargando
 * @param {string} props.error - Mensaje de error (si existe)
 * @param {string} props.errorState - Estado de error interno
 * @param {boolean} props.debug - Si es true, siempre muestra el banner (para desarrollo)
 */
const DiagnosticInfo = ({
                          shippingOptions = [],
                          groupedOptions = [],
                          loading = false,
                          error = null,
                          errorState = null,
                          debug = false,
                        }) => {
  // No mostrar nada si no está en modo debug, no hay error y no está cargando
  if (!debug && !error && !loading) return null

  // Verificar si hay precios disponibles
  const hasPrices = shippingOptions?.some(option =>
    option.price !== undefined ||
    option.totalCost !== undefined ||
    option.cost !== undefined,
  )

  // Verificar si hay paquetes
  const hasPackages = shippingOptions?.some(option =>
    option.packages && option.packages.length > 0,
  )

  // Determinar clase CSS basada en el estado
  const bannerClass = error ? 'shimmer-diagnostic error' :
    loading ? 'shimmer-diagnostic' :
      'diagnostic-banner'

  return (
    <div className={bannerClass}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '4px' }}>
        <div className="diagnostic-item">
          <strong>Groups:</strong> {
          Array.isArray(groupedOptions)
            ? groupedOptions.length
            : (groupedOptions ? Object.keys(groupedOptions).length : 0)
        }
        </div>
        <div className="diagnostic-item">
          <strong>Options:</strong> {shippingOptions ? shippingOptions.length : 0}
        </div>
        <div className="diagnostic-item">
          <strong>Prices:</strong> {hasPrices ? '✓' : '✗'}
        </div>
        <div className="diagnostic-item">
          <strong>Packages:</strong> {hasPackages ? '✓' : '✗'}
        </div>
        <div className="diagnostic-item">
          <strong>Status:</strong> {loading ? 'Loading...' : 'Ready'}
        </div>
        {error && (
          <div className="diagnostic-item" style={{ gridColumn: '1 / -1' }}>
            <strong>Error:</strong> {typeof error === 'string' ? error : (error?.message || 'Unknown error')}
          </div>
        )}
        {errorState && (
          <div className="diagnostic-item" style={{ gridColumn: '1 / -1' }}>
            <strong>Details:</strong> {errorState}
          </div>
        )}
      </div>
    </div>
  )
}

DiagnosticInfo.propTypes = {
  shippingOptions: PropTypes.array,
  groupedOptions: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.bool,
  ]),
  errorState: PropTypes.string,
  debug: PropTypes.bool,
}

export default DiagnosticInfo