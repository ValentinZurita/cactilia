import { StockErrorAlert } from '../../../shop/components/common/StockErrorAlert.jsx'

/**
 * Componente que muestra los errores en el checkout
 *
 * @param {Object} props - Props del componente
 * @param {string} props.error - Error general
 * @param {string} props.validationError - Error de validación de stock
 * @param {Function} props.onClearError - Función para limpiar error general
 * @param {Function} props.onClearValidationError - Función para limpiar error de validación
 * @returns {JSX.Element|null} Resumen de errores o null
 */
export const ErrorSummary = ({
                               error,
                               validationError,
                               onClearError,
                               onClearValidationError,
                             }) => {
  // Si no hay errores, no mostrar nada
  if (!error && !validationError) {
    return null
  }

  return (
    <>
      {/* Mostrar el error general si existe */}
      {error && (
        <StockErrorAlert
          message={error}
          onClose={onClearError}
          className="mb-4"
        />
      )}

      {/* Mostrar error de validación si existe y es diferente del error general */}
      {validationError && !error && (
        <StockErrorAlert
          message={validationError}
          onClose={onClearValidationError}
          className="mb-4"
        />
      )}
    </>
  )
}