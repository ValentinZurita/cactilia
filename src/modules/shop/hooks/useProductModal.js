import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../features/cart/hooks/useCart';
import { useStockValidation } from './useStockValidation';

/**
 * Hook para gestionar el estado y la lógica del componente ProductModal.
 * @param {object | null} product - El producto a mostrar en el modal.
 * @param {boolean} isOpen - Indica si el modal está abierto actualmente.
 * @param {Function} onClose - Función para cerrar el modal.
 * @returns {object} - Valores de estado y manejadores para el componente modal.
 */
export const useProductModal = (product, isOpen, onClose) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [stockError, setStockError] = useState(null);
  const [isOutOfStockState, setIsOutOfStockState] = useState(false); // Estado interno para el estado de stock

  const { addToCart, isInCart, getItem } = useCart();
  const { validateStock } = useStockValidation(getItem);

  // Estado derivado: Calcula el stock disponible considerando la cantidad en el carrito
  const productStock = product?.stock ?? 0; // Usar nullish coalescing por seguridad
  const cartQuantity = isInCart(product?.id) ? getItem(product?.id)?.quantity ?? 0 : 0;
  const availableStock = Math.max(productStock - cartQuantity, 0);
  const isOutOfStock = isOutOfStockState || availableStock <= 0;

  // Resetear estado y comprobar stock inicial cuando se abre el modal o cambia el producto
  useEffect(() => {
    const checkInitialStock = async () => {
      if (isOpen && product) {
        setAdded(false);
        setStockError(null);
        
        // Re-evaluar el estado de stock basado en datos potencialmente actualizados del producto/carrito
        const currentCartQty = getItem(product.id)?.quantity || 0;
        const currentAvailable = Math.max((product.stock ?? 0) - currentCartQty, 0);

        if (currentAvailable <= 0) {
          setIsOutOfStockState(true);
          setQuantity(0); 
        } else {
          setIsOutOfStockState(false);
          setQuantity(1); // Resetear a 1 si hay stock disponible
        }
      } else {
        // Resetear al cerrar
        setQuantity(1);
        setAdded(false);
        setStockError(null);
        setIsOutOfStockState(false);
      }
    };

    checkInitialStock();
    // Dependencias: isOpen, product (específicamente product.id y product.stock podrían usarse si son estables)
    // getItem se incluye ya que el estado del carrito podría influir en la disponibilidad inicial
  }, [isOpen, product, getItem]); 

  // --- Manejadores de Eventos ---
  const handleIncrement = useCallback(async () => {
    if (!product) return;
    const nextQty = quantity + 1;
    const result = await validateStock(product, nextQty);

    if (result.valid) {
      setQuantity(nextQty);
      setStockError(null);
    } else {
      setStockError(result.error || 'No se pudo incrementar la cantidad.');
      // Ajustar cantidad si la validación devolvió un valor máximo posible
      if (typeof result.quantity === 'number') {
         setQuantity(result.quantity);
         // Si la cantidad ajustada es 0, marcar explícitamente como sin stock
         if(result.quantity <= 0) {
            setIsOutOfStockState(true);
            setAdded(false); // Resetear estado 'added' si se acaba el stock
         } else {
           // Asegurar que no marquemos incorrectamente como sin stock si aún es posible alguna cantidad
           setIsOutOfStockState(false); 
         }
      }
    }
  }, [quantity, product, validateStock]);

  const handleDecrement = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      setStockError(null); // Limpiar error en decremento válido
      setIsOutOfStockState(false); // No debería estar sin stock si se decrementa desde > 1
    }
  }, [quantity]);

  const handleAddToCartClick = useCallback(async () => {
    if (!product || quantity <= 0) return;

    const result = await validateStock(product, quantity);
    if (!result.valid) {
      setStockError(result.error || 'No se pudo agregar al carrito.');
      if (typeof result.quantity === 'number') {
        setQuantity(result.quantity);
        if (result.quantity <= 0) {
            setIsOutOfStockState(true);
            setAdded(false);
        }
      }
      return;
    }

    try {
      // Pasar true para el parámetro `validate` en addToCart
      const res = await addToCart(product, quantity, true);
      if (res?.success) {
        setAdded(true);
        // Cerrar modal después de un breve retraso para feedback al usuario
        const timer = setTimeout(onClose, 1500);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      setStockError('Hubo un problema al agregar el producto.');
    }
  }, [product, quantity, addToCart, onClose, validateStock]);

  // Calcular precio total
  const totalPrice = product ? (product.price * quantity).toFixed(2) : '0.00';

  return {
    quantity,
    added,
    stockError,
    isOutOfStock,
    availableStock,
    totalPrice,
    handleIncrement,
    handleDecrement,
    handleAddToCartClick,
  };
}; 