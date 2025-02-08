
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../components/CartItem';
import { CartTotal } from '../components/CartTotal';
import '../../../styles/pages/cart.css';

export const CartPage = () => {

  // Mock data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: 'Metal Earrings',
      subtitle: 'Special Design',
      price: 12,
      image: '../images/placeholder.jpg',
      quantity: 1,
      inStock: true,
    },
    {
      id: 2,
      title: 'Metal Earrings',
      subtitle: 'Special Design',
      price: 12,
      image: '../images/placeholder.jpg',
      quantity: 1,
      inStock: true,
    },
    {
      id: 3,
      title: 'Metal Earrings',
      subtitle: 'Special Design',
      price: 12,
      image: '../images/placeholder.jpg',
      quantity: 1,
      inStock: true,
    },
  ]);

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    console.log('Ir al checkout...');
  };

  // Update quantity
  const handleIncrement = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Total del carrito
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cartItems.length;

  return (
    <div className="container cart-page pt-3">
      {/* Encabezado */}
      <div className="d-flex align-items-center mb-3">
        <button className="btn-arrow-back me-3" onClick={handleGoBack} aria-label="Regresar">
          <span className="fs-5">&#8592;</span>
        </button>
        <div>
          <h2 className="mb-0 fw-bold">Carrito</h2>
          <p className="text-muted mb-0">{totalItems} artículos</p>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="cart-items">
        {cartItems.map(item => (
          <CartItem
            key={item.id}
            product={item}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* Resumen/Desglose total */}
      <div className="mt-4">
        <CartTotal total={total} />
      </div>

      {/* Checkout */}
      <div className="mt-4 d-flex justify-content-center mb-4">
        <button className="btn btn-green-checkout fw-bold" onClick={handleCheckout}>
          Continuar
        </button>
      </div>



    </div>


  );
};