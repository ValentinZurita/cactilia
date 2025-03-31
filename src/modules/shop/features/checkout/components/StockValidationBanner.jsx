import React from 'react';

/**
 * Banner que muestra el estado de validación de stock
 *
 * @param {Object} props - Props del componente
 * @param {boolean} props.isValidating - Si está validando stock
 * @returns {JSX.Element|null} Banner de validación o null
 */
export const StockValidationBanner = ({ isValidating }) => {
  if (!isValidating) {
    return null;
  }

  return (
    <div className="alert alert-info mb-4">
      <div className="d-flex align-items-center">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Validando...</span>
        </div>
        <span>Verificando disponibilidad de productos...</span>
      </div>
    </div>
  );
};