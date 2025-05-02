/**
 * Muestra un resumen del resultado de validación de stock
 *
 * @param {Object} props - Props del componente
 * @param {Object} props.validationResult - Resultado de la validación de stock
 * @param {boolean} props.isValidating - Si la validación está en progreso
 * @returns {JSX.Element|null} Resumen de estado de stock o null
 */
export const StockStatusSummary = ({ validationResult, isValidating }) => {
  // No mostrar si está validando o no hay resultado
  if (isValidating || !validationResult) {
    return null;
  }

  // Si el stock es válido, mostrar mensaje de éxito
  if (validationResult.valid) {
    return (
      <div className="alert alert-success mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-check-circle-fill me-2"></i>
          <span>Todos los productos están disponibles en las cantidades solicitadas.</span>
        </div>
      </div>
    );
  }

  // Si hay error pero no hay outOfStockItems, no mostrar nada
  if (!validationResult.outOfStockItems || validationResult.outOfStockItems.length === 0) {
    return null;
  }

  return null; // El error detallado ya se muestra en ErrorSummary
};