import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../features/cart/hooks/useCart';
import { useStockValidation } from './useStockValidation';

/**
 * Hook to manage the state and logic for the ProductModal component.
 * @param {object | null} product - The product to display in the modal.
 * @param {boolean} isOpen - Whether the modal is currently open.
 * @param {Function} onClose - Function to close the modal.
 * @returns {object} - State values and handlers for the modal component.
 */
export const useProductModal = (product, isOpen, onClose) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [stockError, setStockError] = useState(null);
  const [isOutOfStockState, setIsOutOfStockState] = useState(false); // Internal state for stock status

  const { addToCart, isInCart, getItem } = useCart();
  const { validateStock } = useStockValidation(getItem);

  // Derived state: Calculate available stock considering cart quantity
  const productStock = product?.stock ?? 0; // Use nullish coalescing for safety
  const cartQuantity = isInCart(product?.id) ? getItem(product?.id)?.quantity ?? 0 : 0;
  const availableStock = Math.max(productStock - cartQuantity, 0);
  const isOutOfStock = isOutOfStockState || availableStock <= 0;

  // Reset state and check initial stock when modal opens or product changes
  useEffect(() => {
    const checkInitialStock = async () => {
      if (isOpen && product) {
        setAdded(false);
        setStockError(null);
        
        // Re-evaluate stock status based on potentially updated product/cart data
        const currentCartQty = getItem(product.id)?.quantity || 0;
        const currentAvailable = Math.max((product.stock ?? 0) - currentCartQty, 0);

        if (currentAvailable <= 0) {
          setIsOutOfStockState(true);
          setQuantity(0); 
        } else {
          setIsOutOfStockState(false);
          setQuantity(1); // Reset to 1 if stock is available
        }
      } else {
        // Reset when closing
        setQuantity(1);
        setAdded(false);
        setStockError(null);
        setIsOutOfStockState(false);
      }
    };

    checkInitialStock();
    // Dependencies: isOpen, product (specifically product.id and product.stock could be used if stable)
    // getItem is included as cart state might influence initial availability
  }, [isOpen, product, getItem]); 

  // --- Event Handlers ---
  const handleIncrement = useCallback(async () => {
    if (!product) return;
    const nextQty = quantity + 1;
    const result = await validateStock(product, nextQty);

    if (result.valid) {
      setQuantity(nextQty);
      setStockError(null);
    } else {
      setStockError(result.error || 'No se pudo incrementar la cantidad.');
      // Adjust quantity if validation returned a max possible value
      if (typeof result.quantity === 'number') {
         setQuantity(result.quantity);
         // If adjusted quantity is 0, explicitly mark as out of stock
         if(result.quantity <= 0) {
            setIsOutOfStockState(true);
            setAdded(false); // Reset added state if stock runs out
         } else {
           // Ensure we don't incorrectly flag as out of stock if some quantity is still possible
           setIsOutOfStockState(false); 
         }
      }
    }
  }, [quantity, product, validateStock]);

  const handleDecrement = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      setStockError(null); // Clear error on valid decrement
      setIsOutOfStockState(false); // Should not be out of stock if decrementing from > 1
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
      // Pass true for the `validate` parameter in addToCart ONLY if server-side validation is desired redundantely
      // Or pass false if client-side validation (`useStockValidation`) is sufficient.
      // Passing true might be safer but could lead to double validation.
      const res = await addToCart(product, quantity, false); // Assuming client validation is enough
      if (res?.success) {
        setAdded(true);
        // Close modal after a short delay for user feedback
        const timer = setTimeout(onClose, 1500);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      setStockError('Hubo un problema al agregar el producto.');
    }
  }, [product, quantity, addToCart, onClose, validateStock]);

  // Calculate total price
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