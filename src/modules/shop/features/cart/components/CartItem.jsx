import '../../../../../styles/pages/cart.css';
import { useState, useCallback } from 'react';

/**
 * Componente que representa un item individual en el carrito
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.product - Datos del producto en el carrito
 * @param {Function} props.onIncrement - Función para incrementar cantidad
 * @param {Function} props.onDecrement - Función para decrementar cantidad
 * @param {Function} props.onRemove - Función para eliminar el producto del carrito
 * @returns {JSX.Element}
 */
export const CartItem = ({ product, onIncrement, onDecrement, onRemove }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [localQuantity, setLocalQuantity] = useState(product.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  // Actualizar localQuantity cuando el props cambia
  if (localQuantity !== product.quantity) {
    setLocalQuantity(product.quantity);
  }

  // Verificar disponibilidad de stock
  const hasStock = product.stock > 0;
  const stockSufficient = hasStock && product.quantity <= product.stock;
  const canIncrement = hasStock && product.quantity < product.stock;

  // Calcular el total del producto
  const totalPrice = (product.price * localQuantity).toFixed(2);

  // Handler optimizado para incremento
  const handleIncrement = useCallback(() => {
    if (!canIncrement) {
      setErrorMessage(`Máximo stock disponible: ${product.stock}`);
      setTimeout(() => setErrorMessage(null), 2000);
      return;
    }

    // Actualización optimista para feedback inmediato
    setLocalQuantity(prev => prev + 1);
    setIsUpdating(true);
    
    // Aplicar efecto visual de presionado
    const button = document.activeElement;
    if (button) button.classList.add('active');
    
    // Llamar a la función real
    const result = onIncrement();
    
    // Quitar efecto visual después de un breve tiempo
    setTimeout(() => {
      if (button) button.classList.remove('active');
      setIsUpdating(false);
      
      // Mostrar error si hay problemas
      if (result && !result.success && result.message) {
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(null), 2000);
        // Restaurar cantidad si falla
        setLocalQuantity(product.quantity);
      }
    }, 300);
  }, [canIncrement, product.quantity, product.stock, onIncrement]);

  // Handler optimizado para decremento
  const handleDecrement = useCallback(() => {
    if (product.quantity <= 1) return;

    // Actualización optimista para feedback inmediato
    setLocalQuantity(prev => prev - 1);
    setIsUpdating(true);
    
    // Aplicar efecto visual de presionado
    const button = document.activeElement;
    if (button) button.classList.add('active');
    
    // Llamar a la función real
    onDecrement();
    
    // Quitar efecto visual después de un breve tiempo
    setTimeout(() => {
      if (button) button.classList.remove('active');
      setIsUpdating(false);
    }, 300);
  }, [product.quantity, onDecrement]);

  // Handler optimizado para eliminar
  const handleRemove = useCallback(() => {
    // Aplicar efecto visual
    const button = document.activeElement;
    if (button) button.classList.add('active');
    
    // Mostrar feedback visual
    setIsUpdating(true);
    
    // Pequeño retraso para el efecto visual
    setTimeout(() => onRemove(), 150);
  }, [onRemove]);

  // Funciones auxiliares
  const getStockMessage = useCallback(() => {
    if (!hasStock) return "Sin stock";
    if (!stockSufficient) return `Stock disponible: ${product.stock}`;
    return "En stock";
  }, [hasStock, stockSufficient, product.stock]);

  const getStockClass = useCallback(() => {
    if (!hasStock) return "text-danger";
    if (!stockSufficient) return "text-warning";
    return "text-success";
  }, [hasStock, stockSufficient]);

  return (
    <div className={`cart-item-container d-flex align-items-start py-3 ${isUpdating ? 'opacity-75' : ''}`}>
      {/* Contenedor de detalles y controles */}
      <div className="cart-item-details flex-grow-1">
        <h5 className="cart-item-title">{product.name}</h5>
        <p className="cart-item-subtitle text-muted mb-1">{product.category}</p>

        <div className="cart-item-price-stock d-flex align-items-center mb-2">
          {/* Precio total del producto según la cantidad */}
          <span className="me-2 fw-bold">${totalPrice}</span>

          {/* Indicador de stock */}
          <span className={`${getStockClass()} fw-light`}>
            {getStockMessage()}
          </span>
        </div>

        {/* Mensaje de error si existe */}
        {errorMessage && (
          <div className="stock-error-message text-danger small mb-2">
            <i className="bi bi-exclamation-circle me-1"></i>
            {errorMessage}
          </div>
        )}

        {/* Acciones: cantidad y botón eliminar */}
        <div className="cart-item-actions d-flex align-items-center">
          <div className="quantity-controls d-flex align-items-center">
            <div className="btn-group" role="group" aria-label="Cantidad del producto">
              {/* Botón de decrementar */}
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={handleDecrement}
                aria-label="Disminuir cantidad"
                disabled={!hasStock || localQuantity <= 1}
              >
                –
              </button>

              {/* Indicador de cantidad - usar localQuantity para actualización inmediata */}
              <span className="btn btn-sm btn-light disabled mb-0">
                {localQuantity}
              </span>

              {/* Botón de aumentar cantidad */}
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={handleIncrement}
                aria-label="Aumentar cantidad"
                disabled={!canIncrement}
              >
                +
              </button>
            </div>

            {/* Botón de eliminar */}
            <button
              type="button"
              className="btn btn-sm btn-light ms-2"
              onClick={handleRemove}
              aria-label="Eliminar del carrito"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor para la imagen */}
      <div className="cart-item-image ms-3">
        <img
          src={product.image}
          alt={product.name}
          className="img-fluid rounded"
        />
      </div>
    </div>
  );
};