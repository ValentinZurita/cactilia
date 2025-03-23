import { formatPrice } from '../../utils/cartUtilis';

export const OrderProductsList = ({ items }) => {
  return (
    <div className="order-products-list">
      {items.map((item, index) => (
        <OrderProductItem key={`${item.id}-${index}`} item={item} />
      ))}
    </div>
  );
};

export const OrderProductItem = ({ item }) => {
  return (
    <div className="order-product-item">
      <div className="order-product-image">
        {item.image ? (
          <img src={item.image} alt={item.name} />
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