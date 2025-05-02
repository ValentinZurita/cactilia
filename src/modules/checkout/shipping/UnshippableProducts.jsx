/**
 * Componente para mostrar productos que no se pueden enviar a la dirección seleccionada
 */
import React from 'react';
import '../styles/UnshippableProducts.css';

/**
 * Componente para mostrar productos no enviables
 * @param {Object} props - Propiedades
 * @param {Array} props.products - Lista de productos no enviables
 * @param {boolean} props.expanded - Si la sección está expandida
 * @param {Function} props.onToggleExpand - Función para alternar expansión
 * @returns {JSX.Element} - Componente de productos no enviables
 */
export const UnshippableProducts = ({ 
  products = [],
  expanded = false,
  onToggleExpand = () => {}
}) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="unshippable-products-container">
      <div className="unshippable-header" onClick={onToggleExpand}>
        <div className="unshippable-title">
          <h4>Productos no enviables a esta dirección</h4>
          <span className="unshippable-count">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
        <button className="expand-button">
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {expanded && (
        <div className="unshippable-details">
          <p className="unshippable-message">
            Los siguientes productos no pueden ser enviados a la dirección que seleccionaste. 
            Te recomendamos elegir otra dirección o eliminarlos de tu carrito.
          </p>
          
          <ul className="unshippable-list">
            {products.map((item, index) => {
              const product = item.product || item;
              return (
                <li key={`unshippable-${product.id || index}`} className="unshippable-item">
                  <div className="product-info">
                    <div className="product-name">{product.name || 'Producto'}</div>
                    {product.price && (
                      <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}; 