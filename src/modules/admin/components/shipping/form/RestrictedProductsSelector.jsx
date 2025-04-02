import React, { useState, useEffect } from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { useProducts } from '../hooks/useProducts';

/**
 * Componente para seleccionar productos restringidos para el envío.
 * Versión renovada con diseño minimalista
 */
export const RestrictedProductsSelector = ({ control }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [showSelector, setShowSelector] = useState(false);

  const {
    products,
    loading,
    error,
    searchProducts
  } = useProducts();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "productos_restringidos"
  });

  // Buscar productos cuando cambia el término de búsqueda
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.length >= 2) {
        searchProducts(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, searchProducts]);

  // Verificar si un producto ya está restringido
  const isProductRestricted = (productId) => {
    return fields.some(field => field.id === productId);
  };

  // Agregar producto a la lista de restringidos
  const handleAddProduct = () => {
    if (selectedProductId && !isProductRestricted(selectedProductId)) {
      const selectedProduct = products.find(p => p.id === selectedProductId);

      if (selectedProduct) {
        append({
          id: selectedProduct.id,
          name: selectedProduct.name,
          sku: selectedProduct.sku
        });

        setSelectedProductId('');
        setSearchTerm('');
      }
    }
  };

  return (
    <div className="restricted-products-selector">
      {/* Toggle para mostrar/ocultar selector */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setShowSelector(!showSelector)}
        >
          {showSelector ? (
            <>
              <i className="bi bi-dash-circle me-2"></i>
              Ocultar selector
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle me-2"></i>
              Agregar productos restringidos
            </>
          )}
        </button>

        <span className="badge bg-secondary px-2 py-1">
          {fields.length} producto{fields.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Selector de productos */}
      {showSelector && (
        <div className="card border-0 rounded-4 bg-light mb-4">
          <div className="card-body p-3">
            <div className="row g-3 mb-3">
              {/* Búsqueda de productos */}
              <div className="col-md-6">
                <label className="form-label text-secondary small">Buscar Producto</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Buscar productos"
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary border-start-0"
                      type="button"
                      onClick={() => setSearchTerm('')}
                      aria-label="Limpiar búsqueda"
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
                {loading && (
                  <div className="form-text">
                    <div className="spinner-border spinner-border-sm text-secondary me-2" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <span className="small">Buscando productos...</span>
                  </div>
                )}
              </div>

              {/* Selector de producto */}
              <div className="col-md-6">
                <label className="form-label text-secondary small">Seleccionar Producto</label>
                <div className="input-group">
                  <select
                    className="form-select"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={loading || products.length === 0}
                    aria-label="Seleccionar producto"
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                        disabled={isProductRestricted(product.id)}
                      >
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleAddProduct}
                    disabled={!selectedProductId || loading}
                  >
                    <i className="bi bi-plus"></i> Añadir
                  </button>
                </div>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="alert alert-danger py-2 small">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de productos restringidos */}
      <Controller
        name="productos_restringidos"
        control={control}
        render={({ field }) => (
          <>
            {fields.length > 0 ? (
              <div className="card border-0 rounded-4 bg-light">
                <ul className="list-group list-group-flush rounded-4">
                  {fields.map((item, index) => (
                    <li
                      key={item.id}
                      className="list-group-item bg-transparent d-flex justify-content-between align-items-center p-3"
                    >
                      <div className="d-flex align-items-center">
                        <i className="bi bi-ban text-danger me-3"></i>
                        <div>
                          <div>{item.name || `Producto ${item.id.substring(0, 6)}...`}</div>
                          {item.sku && (
                            <small className="text-muted">SKU: {item.sku}</small>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-pill"
                        onClick={() => remove(index)}
                        aria-label="Eliminar producto restringido"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="alert alert-secondary">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle text-secondary me-3 fs-4"></i>
                  <div>
                    <p className="mb-0">No hay productos restringidos</p>
                    <p className="mb-0 small text-muted">Los productos marcados como restringidos no podrán ser enviados a esta zona</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      />
    </div>
  );
};