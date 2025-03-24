import React, { useState } from 'react';

/**
 * Componente para los filtros avanzados de búsqueda
 * Se mantiene como componente separado para mejor organización del código
 */
export const SearchFilters = ({ onApplyFilters, onClear, initialFilters = {} }) => {
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(initialFilters.dateTo || '');
  const [minAmount, setMinAmount] = useState(initialFilters.minAmount || '');
  const [maxAmount, setMaxAmount] = useState(initialFilters.maxAmount || '');
  const [productName, setProductName] = useState(initialFilters.productName || '');

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters({
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      minAmount: minAmount ? Number(minAmount) : null,
      maxAmount: maxAmount ? Number(maxAmount) : null,
      productName: productName || null
    });
  };

  // Limpiar todos los filtros
  const handleClear = () => {
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setProductName('');
    onClear();
  };

  return (
    <div className="search-filters px-4 py-2">
      <form onSubmit={handleSubmit}>
        {/* Rango de fechas */}
        <div className="mb-3">
          <label className="form-label small text-secondary mb-1">Desde</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small text-secondary mb-1">Hasta</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Rango de montos */}
        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label small text-secondary mb-1">Mínimo $</label>
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="0"
              min="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
          <div className="col-6">
            <label className="form-label small text-secondary mb-1">Máximo $</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min="0"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Producto específico */}
        <div className="mb-3">
          <label className="form-label small text-secondary mb-1">Producto</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Nombre del producto"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        {/* Botones de acción */}
        <div className="d-flex justify-content-between mt-3">
          <button
            type="button"
            className="btn btn-sm btn-link text-secondary"
            onClick={handleClear}
          >
            Limpiar
          </button>
          <button type="submit" className="btn btn-sm btn-primary">
            Aplicar filtros
          </button>
        </div>
      </form>
    </div>
  );
};