import React, { useState, useEffect } from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { useProducts } from '../hooks/useProducts';

/**
 * Componente para seleccionar productos restringidos para el envío.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.control - Control de react-hook-form
 */
export const RestrictedProductsSelector = ({ control }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

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
      if (searchTerm.trim()) {
        searchProducts(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, searchProducts]);

  // Verificar si un producto ya está restringido
  const isProductRestricted = (productId) => {
    return fields.includes(productId);
  };

  // Agregar producto a la lista de restringidos
  const handleAddProduct = () => {
    if (selectedProductId && !isProductRestricted(selectedProductId)) {
      append(selectedProductId);
      setSelectedProductId('');
    }
  };

  return (
    <div className="restricted-products-selector card border-0 bg-light rounded-3 p-3">
      <div className="card-body">
        <h6 className="card-title mb-3">Productos Restringidos</h6>

        {/* Buscador y selector de productos */}
        <div className="row g-3 mb-3">
          <div className="col-md-5">
            <label className="form-label">Buscar Producto</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-md-5">
            <label className="form-label">Seleccionar Producto</label>
            <select
              className="form-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={loading || products.length === 0}
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
            {loading && (
              <div className="form-text">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                Buscando productos...
              </div>
            )}
          </div>

          <div className="col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleAddProduct}
              disabled={!selectedProductId || loading}
            >
              Añadir
            </button>
          </div>
        </div>

        {/* Lista de productos restringidos */}
        <Controller
          name="productos_restringidos"
          control={control}
          render={({ field }) => (
            <>
              {fields.length > 0 ? (
                <ul className="list-group">
                  {fields.map((item, index) => (
                    <li
                      key={item.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <ProductInfo
                        productId={item}
                        loading={loading}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => remove(index)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  No hay productos restringidos seleccionados.
                </div>
              )}
            </>
          )}
        />

        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Componente auxiliar para mostrar información del producto.
 */
const ProductInfo = ({ productId, loading }) => {
  const [productInfo, setProductInfo] = useState(null);

  useEffect(() => {
    // En un escenario real, aquí se haría una petición para obtener los detalles
    // del producto si no están ya disponibles
    setProductInfo({ id: productId, name: `Producto ${productId.substring(0, 6)}...` });
  }, [productId]);

  if (loading || !productInfo) {
    return (
      <div className="d-flex align-items-center">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <span>Cargando información...</span>
      </div>
    );
  }

  return (
    <span>{productInfo.name}</span>
  );
};