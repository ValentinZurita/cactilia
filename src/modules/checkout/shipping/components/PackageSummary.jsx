import React from 'react';

/**
 * Muestra el resumen de un paquete de envío (pills informativas y botón de detalles).
 * @param {Object} props
 * @param {number} props.totalProductUnits - Número total de unidades de producto
 * @param {string|number} props.totalWeight - Peso total formateado
 * @param {number} [props.maxProductsPerPackage] - Máximo de productos por paquete (si aplica)
 * @param {number} [props.maxWeightPerPackage] - Máximo de peso por paquete (si aplica)
 * @param {number} props.actualPackagesCount - Número total de paquetes físicos
 * @param {boolean} props.detailsExpanded - Si los detalles están expandidos
 * @param {Function} props.onToggleDetails - Función para cambiar el estado de expansión
 */
export const PackageSummary = ({
  totalProductUnits,
  totalWeight,
  maxProductsPerPackage,
  maxWeightPerPackage,
  actualPackagesCount,
  detailsExpanded,
  onToggleDetails,
}) => {
  return (
    <div className="shipping-package-summary">
      <div className="summary-pill">
        <i className="bi bi-boxes"></i>
        <span>{totalProductUnits} producto{totalProductUnits !== 1 ? 's' : ''}</span>
      </div>
      <div className="summary-pill">
        <i className="bi bi-weight"></i>
        <span>{totalWeight} kg</span>
      </div>
      {maxProductsPerPackage && (
        <div className="summary-pill">
          <i className="bi bi-box"></i>
          <span>Máx. {maxProductsPerPackage} producto{maxProductsPerPackage !== 1 ? 's' : ''}/paquete</span>
        </div>
      )}
      {maxWeightPerPackage && (
        <div className="summary-pill">
          <i className="bi bi-weight"></i>
          <span>Máx. {maxWeightPerPackage} kg/paquete</span>
        </div>
      )}
      {actualPackagesCount > 1 && (
        <div className="summary-pill">
          <i className="bi bi-archive"></i>
          <span>{actualPackagesCount} paquetes</span>
        </div>
      )}
      <button
        className="details-toggle"
        onClick={(e) => {
          e.stopPropagation(); // Prevenir que el click se propague al label
          onToggleDetails(); // Llamar a la función pasada por props
        }}
        type="button"
      >
        {detailsExpanded ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>}
        <span>{detailsExpanded ? 'Ocultar detalles' : 'Ver detalles'}</span>
      </button>
    </div>
  );
};

// PackageSummary.propTypes = { ... }; 