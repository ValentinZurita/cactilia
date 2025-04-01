import { CartItem } from './CartItem.jsx';

/**
 * CartItemList - Lista de productos en el carrito
 *
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Lista de items del carrito
 */
export const CartItemList = ({
                               items,
                               onIncreaseQuantity,
                               onDecreaseQuantity,
                               onRemoveItem
                             }) => {
  return (
    <div className="cart-items">

      {/* Mapeo de productos en el carrito */}
      {items.map(item => (
        <CartItem
          key={item.id}
          product={item}
          onIncrement={() => onIncreaseQuantity(item.id)}
          onDecrement={() => onDecreaseQuantity(item.id)}
          onRemove={() => onRemoveItem(item.id)}
        />
      ))}

    </div>
  );
};
