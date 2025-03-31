// src/modules/shop/pages/CartPage.jsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import '../../../styles/pages/cart.css';
import { useCart } from '../features/cart/hooks/useCart';
import { CartItem, CartTotal, EmptyCart, StockAlert } from '../features/cart/components/index.js';
import { useSelector } from 'react-redux';

export const CartPage = () => {
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const [actionError, setActionError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Referencias para control de validación
  const validationTimerRef = useRef(null);
  const hasValidatedRef = useRef(false);

  const {
    items: cartItems,
    itemsCount,
    hasOutOfStockItems,
    hasStockIssues,
    insufficientStockItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    forceStockValidation,
    isValidatingStock
  } = useCart();

  // Validar stock al cargar la página, solo una vez
  useEffect(() => {
    // Limpiar cualquier timer previo
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Si ya validamos o no hay items, no hacer nada
    if (hasValidatedRef.current || cartItems.length === 0) {
      return;
    }

    const validateInitialStock = async () => {
      setIsValidating(true);
      try {
        await forceStockValidation();
        hasValidatedRef.current = true;
      } catch (error) {
        console.error('Error en validación inicial:', error);
      } finally {
        setIsValidating(false);
      }
    };

    // Iniciar validación después de un breve retraso
    validationTimerRef.current = setTimeout(validateInitialStock, 1000);

    // Limpiar timer en desmontaje
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, [cartItems.length, forceStockValidation]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleCheckout = async () => {
    if (status !== 'authenticated') {
      navigate('/auth/login?redirect=shop/checkout');
      return;
    }

    // Verificar stock en tiempo real antes de proceder
    setIsValidating(true);
    try {
      const stockValidation = await forceStockValidation();

      if (!stockValidation.valid) {
        setActionError(
          stockValidation.error ||
          'Hay productos con problemas de stock en tu carrito. Por favor, revisa las cantidades antes de continuar.'
        );
        setTimeout(() => setActionError(null), 5000);
        return;
      }

      navigate('/shop/checkout');
    } catch (error) {
      console.error('Error validando stock para checkout:', error);
      setActionError('Error al verificar disponibilidad. Por favor, inténtalo de nuevo.');
    } finally {
      setIsValidating(false);
    }
  };

  if (cartItems.length === 0) {
    return <EmptyCart onContinueShopping={() => navigate('/shop')} />;
  }

  return (
    <div className="container cart-page pt-5 mt-5">
      {/* Encabezado y botón de regreso */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn-arrow-back me-3"
          onClick={handleGoBack}
          aria-label="Regresar"
        >
          <i className="bi bi-arrow-left"></i>
        </button>

        <div>
          <h2 className="mb-0 fw-bold">Tu Carrito</h2>
          <p className="text-muted mb-0">
            {itemsCount} {itemsCount === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>
      </div>

      {/* Banner de validación - Mostrar solo mientras se valida */}
      {(isValidating || isValidatingStock) && (
        <div className="alert alert-info mb-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Validando...</span>
            </div>
            <span>Verificando disponibilidad de productos...</span>
          </div>
        </div>
      )}

      {/* Mostrar alerta de error si existe */}
      {actionError && (
        <div className="alert alert-danger mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {actionError}
        </div>
      )}

      {/* Mostrar alerta de stock si hay problemas */}
      {hasStockIssues && (
        <StockAlert items={cartItems} className="mb-4" />
      )}

      {/* Layout con dos columnas en desktop */}
      <div className="row">
        {/* Columna izquierda: Lista de productos */}
        <div className="col-lg-8 cart-items-column">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-0">
              <div className="cart-items">
                {cartItems.map(item => (
                  <CartItem
                    key={item.id}
                    product={item}
                    onIncrement={() => increaseQuantity(item.id)}
                    onDecrement={() => decreaseQuantity(item.id)}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Resumen y acciones */}
        <div className="col-lg-4 cart-summary-column">
          {/* Resumen del carrito */}
          <CartTotal items={cartItems} />

          {/* Botón de checkout */}
          <div className="d-grid mb-4">
            <button
              className="btn btn-green-checkout w-100"
              onClick={handleCheckout}
              disabled={hasStockIssues || isValidating || isValidatingStock}
            >
              {(isValidating || isValidatingStock) ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Verificando disponibilidad...
                </>
              ) : (
                <>
                  <i className="bi bi-credit-card me-2"></i>
                  Proceder al pago
                </>
              )}
            </button>

            <div className="text-center mt-3">
              <button
                className="btn btn-link text-muted text-decoration-none"
                onClick={() => navigate('/shop')}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Continuar comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};