import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { StockAlert } from '../../cart/components';
import { formatPrice } from '../../../utils';

/**
 * CartSummary - Componente que muestra el resumen del carrito en el checkout
 * Incluye lista de productos, subtotal, descuentos, envío y total
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Elementos del carrito
 * @param {number} props.shippingCost - Costos de envío
 * @param {number} props.couponDiscount - Descuento por cupón
 * @param {string} props.couponCode - Código de cupón aplicado
 * @param {Function} props.onRemoveCoupon - Función para eliminar cupón
 * @param {Array} props.nonShippableProducts - Productos no enviables
 */
export const CartSummary = ({
  items = [],
  shippingCost = 0,
  couponDiscount = 0,
  couponCode = '',
  onRemoveCoupon = () => {},
  nonShippableProducts = []
}) => {
  // Crear un conjunto de IDs de productos no enviables para búsquedas rápidas
  const nonShippableIds = useMemo(() => {
    const idSet = new Set();
    if (nonShippableProducts && nonShippableProducts.length > 0) {
      nonShippableProducts.forEach(item => {
        const product = item.product || item;
        idSet.add(product.id);
      });
    }
    return idSet;
  }, [nonShippableProducts]);

  // Función para verificar si un producto es no enviable
  const isProductNonShippable = useMemo(() => (item) => {
    const product = item.product || item;
    return nonShippableIds.has(product.id);
  }, [nonShippableIds]);
  
  // Filtrar productos enviables para calcular subtotal
  const shippableItems = useMemo(() => {
    return items.filter(item => !isProductNonShippable(item));
  }, [items, isProductNonShippable]);
  
  // Calcular subtotal solo con productos enviables
  const subtotal = useMemo(() => {
    return shippableItems.reduce(
      (sum, item) => {
        const product = item.product || item;
        const price = product.price || item.price || 0;
        const quantity = parseInt(item.quantity || 1);
        return sum + (price * quantity);
      }, 
      0
    );
  }, [shippableItems]);
  
  // Calcular impuestos (asumiendo 16% sobre el subtotal)
  const taxes = subtotal * 0.16;
  
  // Calcular total
  const total = subtotal + taxes + shippingCost - couponDiscount;
  
  // Verificar si el envío es gratuito
  const isFreeShipping = shippingCost === 0;

  // Calcular estadísticas de productos
  const nonShippableCount = nonShippableIds.size;

  return (
    <div className="checkout-summary">
      <h3 className="summary-title mb-4">Resumen del Pedido</h3>

      {/* Alertas de stock */}
      <StockAlert items={items} className="mb-3" />

      {/* Lista de productos */}
      <div className="product-list mb-4">
        {items.map(item => {
          const product = item.product || item;
          const price = product.price || item.price || 0;
          const name = product.name || product.title || 'Producto';
          const isNonShippable = isProductNonShippable(item);
          
          // Mejorar la obtención de imágenes - explorar todas las propiedades posibles
          let image = null;
          
          // Intentar todas las propiedades comunes para imágenes
          const imageProperties = [
            'image', 'thumbnail', 'imageURL', 'thumbnailURL', 'img', 
            'imgURL', 'mainImage', 'mainImageURL', 'featuredImage'
          ];
          
          // Buscar en todas las propiedades posibles
          for (const prop of imageProperties) {
            if (product[prop]) {
              image = product[prop];
              break;
            }
            
            // También verificar en item por si las propiedades están allí
            if (item[prop]) {
              image = item[prop];
              break;
            }
          }
          
          // Si hay un array de imágenes, usar la primera
          if (!image && product.pictures && Array.isArray(product.pictures) && product.pictures.length > 0) {
            image = product.pictures[0];
          }
          
          // Si aún no hay imagen, usar placeholder
          if (!image) {
            console.warn(`No se encontró imagen para producto: ${name} (id: ${product.id || 'desconocido'})`);
            image = '/placeholder.jpg';
          }
          
          const quantity = item.quantity || 1;
          
          return (
            <div 
              key={item.id || product.id} 
              className="product-item d-flex mb-3"
            >
              <div className="product-image me-3">
                <img
                  src={image}
                  alt={name}
                  className="img-fluid rounded"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  onError={(e) => {
                    console.log('Error cargando imagen:', image);
                    e.target.onerror = null;
                    e.target.src = '/placeholder.jpg';
                  }}
                />
              </div>
              <div className="product-details flex-grow-1">
                <h6 className="product-name mb-0">
                  {name}
                  {isNonShippable && <span className="badge bg-danger ms-2">No enviable</span>}
                </h6>
                <div className="d-flex justify-content-between">
                  <span className="product-quantity text-muted">
                    {quantity} x {isNonShippable ? '- -' : formatPrice(price)}
                  </span>
                  <span className="product-total fw-medium">
                    {isNonShippable ? 'No disponible para envío' : formatPrice(price * quantity)}
                  </span>
                </div>
                {item.stock === 0 && (
                  <span className="badge bg-danger text-white mt-1">Sin stock</span>
                )}
                {item.stock > 0 && item.stock < quantity && (
                  <span className="badge bg-warning text-dark mt-1">
                    Stock disponible: {item.stock}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desglose de costos */}
      <div className="cost-breakdown">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal {nonShippableCount > 0 ? '(productos enviables)' : ''}:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>IVA (16%):</span>
          <span>{formatPrice(taxes)}</span>
        </div>

        {couponCode && (
          <div className="d-flex justify-content-between mb-2">
            <span className="d-flex align-items-center">
              Cupón ({couponCode}):
              <button 
                className="btn btn-sm btn-link text-danger p-0 ms-2"
                onClick={onRemoveCoupon}
              >
                <i className="bi bi-x-circle"></i>
              </button>
            </span>
            <span className="text-success">-{formatPrice(couponDiscount)}</span>
          </div>
        )}

        <div className="d-flex justify-content-between mb-2">
          <span>Envío:</span>
          {isFreeShipping || shippingCost === 0 ? (
            <span className="text-success">Gratis</span>
          ) : (
            <span>{formatPrice(shippingCost)}</span>
          )}
        </div>

        <div className="d-flex justify-content-between">
          <span className="fw-bold">Total:</span>
          <span className="fw-bold fs-5 text-green-1">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Información adicional */}
      <div className="additional-info mt-4">
        <div className="d-flex align-items-center text-muted mb-2">
          <i className="bi bi-shield-check me-2 text-success"></i>
          <small>Pago seguro garantizado</small>
        </div>

        <div className="d-flex align-items-center text-muted">
          <i className="bi bi-truck me-2 text-success"></i>
          <small>Envío sujeto a zona o monto de compra</small>
        </div>
      </div>
    </div>
  );
};

CartSummary.propTypes = {
  items: PropTypes.array,
  shippingCost: PropTypes.number,
  couponDiscount: PropTypes.number,
  couponCode: PropTypes.string,
  onRemoveCoupon: PropTypes.func,
  nonShippableProducts: PropTypes.array
}; 