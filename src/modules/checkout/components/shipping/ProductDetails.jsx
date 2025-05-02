import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente que muestra detalles de productos incluidos en una opción de envío
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.option - Opción de envío
 * @param {Array} props.cartItems - Items del carrito
 */
const ProductDetails = ({ option, cartItems = [] }) => {
  if (!option) return null;
  
  // Función para obtener todos los productos de un carrito
  const getAllCartProducts = () => {
    if (!cartItems || cartItems.length === 0) return [];
    
    return cartItems.map(item => {
      // Algunos formatos tienen el producto en .product, otros son directos
      const product = item.product || item;
      return { 
        ...product, 
        quantity: item.quantity || 1 
      };
    });
  };
  
  // Recopilar productos de diferentes fuentes
  const allProducts = option.products 
    ? option.products
    : option.items 
      ? option.items
      : option.packages && option.packages.some(pkg => pkg.products || pkg.items)
        ? [].concat(...option.packages
            .map(pkg => pkg.products || pkg.items || []))
        : getAllCartProducts();
  
  // Variable para verificar si estamos en empaquetado simple
  const isOneProductPerPackage = option.packageType === 'oneProductPerPackage' || 
    (option.packages && option.packages.every(pkg => (pkg.products || pkg.items || []).length === 1));
  
  // Si no hay productos, no mostrar nada
  if (!allProducts || allProducts.length === 0) return null;
  
  // Si es un paquete con productos similares juntos, mostrar agrupados por productos
  if (option.packages && option.packages.some(pkg => pkg.similarProducts)) {
    return (
      <div className="product-details mt-2">
        <small>
          <i className="bi bi-box me-1"></i>
          <strong>Productos agrupados por similitud:</strong>
        </small>
        
        <div className="package-products mt-2">
          {option.packages.map((pkg, pkgIdx) => {
            if (!pkg.similarProducts || !pkg.items || pkg.items.length === 0) return null;
            
            return (
              <div key={pkgIdx} className="package-group mb-2">
                <div className="package-group-name mb-1">
                  <small className="fw-medium text-muted">{pkg.name || `Paquete ${pkgIdx + 1}`}</small>
                </div>
                {pkg.items && pkg.items.length > 0 ? (
                  <ul className="products-list pl-2 mb-1">
                    {pkg.items.map((item, itemIdx) => {
                      const product = item.product || item;
                      const name = product.name || product.title || `Producto #${product.id}`;
                      const quantity = item.quantity || 1;
                      const weight = parseFloat(product.weight || product.peso || 0);
                      const totalItemWeight = weight * quantity;
                      
                      return (
                        <li key={itemIdx} className="d-flex justify-content-between small">
                          <span>{product.name}</span>
                          <span className="text-muted">
                            {quantity > 1 ? `${quantity}x ` : ''}
                            {totalItemWeight.toFixed(2)} kg
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted small ms-3 mb-0 mt-1">Información en proceso...</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  // Si es un producto por paquete, no deduplicar - mostrar todos los productos del carrito
  if (isOneProductPerPackage && cartItems && cartItems.length > 0) {
    return (
      <div className="product-details mt-2">
        <small>
          <i className="bi bi-box me-1"></i>
          <strong>Productos incluidos:</strong>
        </small>
        <ul className="products-list mt-1 mb-0">
          {cartItems.map((item, idx) => {
            const product = item.product || item;
            const name = product.name || product.title || `Producto #${product.id}`;
            const weight = parseFloat(product.weight || product.peso || 0);
            return (
              <li key={idx} className="product-item">
                {name} ({weight.toFixed(2)} kg)
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  
  // Para otros casos, deduplicar productos usando un Map para evitar repeticiones
  const productMap = new Map();
  allProducts.forEach(item => {
    const product = item.product || item;
    const productId = product.id || product.productId;
    if (!productMap.has(productId)) {
      productMap.set(productId, item);
    }
  });
  
  // Convertir Map de productos únicos de nuevo a array
  const uniqueProducts = Array.from(productMap.values());
  
  // Si no hay categorización por peso pero hay productos, mostrar lista básica
  if (!option.costBreakdown?.some(b => b.weightSummary) && uniqueProducts.length > 0) {
    return (
      <div className="product-details mt-2">
        <small>
          <i className="bi bi-box me-1"></i>
          <strong>Productos incluidos:</strong>
        </small>
        <ul className="products-list mt-1 mb-0">
          {uniqueProducts.map((item, idx) => {
            const product = item.product || item;
            const name = product.name || product.title || `Producto #${product.id}`;
            const weight = parseFloat(product.weight || product.peso || 0);
            return (
              <li key={idx} className="product-item">
                {name} ({weight.toFixed(2)} kg)
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  
  // Si hay categorización por peso, mostrarla
  return (
    <div className="product-details mt-2">
      <small>
        <i className="bi bi-box me-1"></i>
        <strong>Contenido del envío:</strong>
      </small>
      <div className="product-weight-summary mt-1">
        {option.costBreakdown?.map((breakdown, idx) => {
          if (!breakdown.weightSummary) return null;
          const { light, medium, heavy } = breakdown.weightSummary;
          return (
            <div key={idx} className="weight-summary">
              {light.count > 0 && (
                <span className="weight-tag light">{light.count} productos ligeros ({light.totalWeight.toFixed(2)} kg)</span>
              )}
              {medium.count > 0 && (
                <span className="weight-tag medium">{medium.count} productos medianos ({medium.totalWeight.toFixed(2)} kg)</span>
              )}
              {heavy.count > 0 && (
                <span className="weight-tag heavy">{heavy.count} productos pesados ({heavy.totalWeight.toFixed(2)} kg)</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

ProductDetails.propTypes = {
  option: PropTypes.object.isRequired,
  cartItems: PropTypes.array
};

export default ProductDetails; 