import { formatPrice } from '../../../utils/index.js'

/**
 * Muestra la lista de productos en una orden
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.items - Productos de la orden
 * @returns {JSX.Element}
 */
export const OrderProductsList = ({ items }) => {
  return (
    <div className="order-products-list">
      {items.map((item, index) => (
        <OrderProductItem key={`${item.id}-${index}`} item={item} />
      ))}
    </div>
  );
};

/**
 * Muestra un producto individual en la lista de orden
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.item - Datos del producto
 * @returns {JSX.Element}
 */
export const OrderProductItem = ({ item }) => {
  return (
    <div className="order-product-item">
      <div className="order-product-image">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} />
        ) : (
          <div className="no-image">
            <i className="bi bi-box"></i>
          </div>
        )}
      </div>
      <div className="order-product-details">
        <h5>{item.name}</h5>
        <div className="order-product-meta">
          <span className="quantity">Cantidad: {item.quantity}</span>
          <span className="price">{formatPrice(item.price)}</span>
        </div>
      </div>
      <div className="order-product-total">
        {formatPrice(item.price * item.quantity)}
      </div>
    </div>
  );
};