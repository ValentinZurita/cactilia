import PropTypes from 'prop-types';
import { formatPrice } from '../../../../utils/index.js'
import '../../styles/unavailableProducts.css';

/**
 * CheckoutSummary - Componente que muestra el resumen del pedido
 * Incluye lista de productos, subtotal, impuestos, envío y total
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Elementos del carrito
 * @param {number} props.subtotal - Subtotal
 * @param {number} props.taxes - Impuestos
 * @param {number} props.shipping - Costos de envío
 * @param {number} props.total - Total final
 * @param {boolean} props.isFreeShipping - Si el envío es gratuito
 * @param {Array} props.unavailableProductIds - IDs de productos no disponibles para envío
 */
export const CheckoutSummary = ({
                                  items = [],
                                  subtotal = 0,
                                  taxes = 0,
                                  shipping = 0,
                                  total = 0,
                                  isFreeShipping = false,
                                  unavailableProductIds = []
                                }) => {
  // Calcular subtotal de productos disponibles si hay productos no disponibles
  const hasUnavailableProducts = unavailableProductIds.length > 0;
  
  // Calcular el subtotal correcto excluyendo productos no disponibles
  const calculateAvailableSubtotal = () => {
    if (!hasUnavailableProducts) return subtotal;
    
    return items
      .filter(item => !unavailableProductIds.includes(item.id))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  // Subtotal de productos disponibles para envío
  const availableSubtotal = calculateAvailableSubtotal();
  
  // Calcular el IVA basado solo en productos disponibles
  const availableTaxes = hasUnavailableProducts ? availableSubtotal * 0.16 : taxes;
  
  // Calcular el total basado solo en productos disponibles
  const availableTotal = availableSubtotal + availableTaxes + (isFreeShipping ? 0 : shipping);
  
  // Separar productos disponibles y no disponibles
  const availableItems = items.filter(item => !unavailableProductIds.includes(item.id));
  const unavailableItems = items.filter(item => unavailableProductIds.includes(item.id));
  
  return (
    <div className="checkout-summary">
      <h3 className="summary-title mb-4">Resumen del Pedido</h3>

      {/* Productos disponibles */}
      <div className="product-list mb-4">
        {availableItems.map(item => (
          <div 
            key={item.id} 
            className="product-item d-flex mb-3"
          >
            <div className="product-image me-3">
              <img
                src={item.image}
                alt={item.name}
                className="img-fluid rounded"
                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              />
            </div>
            <div className="product-details flex-grow-1">
              <h6 className="product-name mb-0">{item.name}</h6>
              <div className="d-flex flex-column">
                <span className="product-quantity text-muted small mt-1">
                  {item.quantity} x {formatPrice(item.price)}
                </span>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div>
                    {item.stock === 0 && (
                      <span className="badge bg-danger text-white">Sin stock</span>
                    )}
                    {item.stock > 0 && item.stock < item.quantity && (
                      <span className="badge bg-warning text-dark">
                        Stock disponible: {item.stock}
                      </span>
                    )}
                  </div>
                  <span className="product-total" style={{ color: '#4CAF50' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Productos no disponibles */}
      {hasUnavailableProducts && (
        <div className="checkout-summary-products-unavailable">
          <div className="unavailable-products-title">
            <i className="bi bi-geo-alt"></i>
            <span>Productos no disponibles para esta dirección</span>
          </div>
          <div className="product-list mb-4">
            {unavailableItems.map(item => (
              <div 
                key={item.id} 
                className="product-item unavailable d-flex mb-3"
              >
                <div className="product-image me-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="img-fluid rounded"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                </div>
                <div className="product-details flex-grow-1">
                  <h6 className="product-name mb-0">{item.name}</h6>
                  <small className="text-muted">No disponible para la dirección seleccionada</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desglose de costos */}
      <div className="cost-breakdown">
        <div className="d-flex justify-content-between mb-2">
          <span>Subtotal:</span>
          {hasUnavailableProducts ? (
            <span>{formatPrice(availableSubtotal)}</span>
          ) : (
            <span>{formatPrice(subtotal)}</span>
          )}
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>IVA (16%):</span>
          {hasUnavailableProducts ? (
            <span>{formatPrice(availableTaxes)}</span>
          ) : (
            <span>{formatPrice(taxes)}</span>
          )}
        </div>

        <div className="d-flex justify-content-between mb-2">
          <span>Envío:</span>
          {isFreeShipping ? (
            <span style={{ color: '#4CAF50' }}>Gratis</span>
          ) : (
            <span>{Number(shipping) <= 0 ? 'Pendiente' : formatPrice(Number(shipping))}</span>
          )}
        </div>

        {/* Log para debugging */}
        {console.log('🚢 [CheckoutSummary] Datos de envío:', {
          shipping,
          isFreeShipping,
          shippingDisplay: isFreeShipping ? 'Gratis' : (Number(shipping) <= 0 ? 'Pendiente' : formatPrice(Number(shipping)))
        })}

        <div className="d-flex justify-content-between">
          <span className="fw-bold">Total:</span>
          {hasUnavailableProducts ? (
            <span className="fw-bold fs-5" style={{ color: '#4CAF50' }}>{formatPrice(availableTotal)}</span>
          ) : (
            <span className="fw-bold fs-5" style={{ color: '#4CAF50' }}>{formatPrice(Number(total))}</span>
          )}
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

CheckoutSummary.propTypes = {
  items: PropTypes.array,
  subtotal: PropTypes.number,
  taxes: PropTypes.number,
  shipping: PropTypes.number,
  total: PropTypes.number,
  isFreeShipping: PropTypes.bool,
  unavailableProductIds: PropTypes.array
};