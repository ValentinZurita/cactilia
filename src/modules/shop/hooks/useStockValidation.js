import { useCallback } from 'react';
import { validateItemsStock } from '../services/productServices';

/**
 * Hook for validating product stock against requested quantity.
 * @param {Function} getItem - Function to get item details from cart (e.g., `getItem` from `useCart`).
 * @returns {{ validateStock: (product: object, requestedQty: number) => Promise<{ valid: boolean, quantity?: number, error?: string }> }}
 */
export const useStockValidation = (getItem) => {

  const validateStock = useCallback(async (product, requestedQty) => {
    if (!product || !product.id) {
      console.error('validateStock: Producto inválido proporcionado.', product);
      return { valid: false, error: 'Producto no válido.' };
    }
    
    try {
      const result = await validateItemsStock([{
        id: product.id,
        name: product.name,
        quantity: requestedQty
      }]);

      // Check if validation failed and it's due to this specific item
      if (!result.valid && result.outOfStockItems?.some(item => item.id === product.id)) {
        const errorItem = result.outOfStockItems.find(item => item.id === product.id);
        const inCartQty = getItem(product.id)?.quantity || 0;
        // Calculate remaining stock AVAILABLE TO ADD (current stock minus what's already in cart)
        const remainingAvailableToAdd = Math.max(errorItem.currentStock - inCartQty, 0);

        return {
          valid: false, 
          // Return the maximum quantity the user *could* add, respecting stock and cart
          quantity: Math.max(Math.min(requestedQty, remainingAvailableToAdd), 0), 
          error: `Stock insuficiente. Solo puedes agregar ${remainingAvailableToAdd} más.`
        };
      }

      // If validation passed OR failed for reasons other than this item's stock
      return { valid: true }; 

    } catch (err) {
      console.error('Error validando stock:', err);
      return { valid: false, error: 'Error al validar el stock.' };
    }
  }, [getItem]); // Depend on getItem to ensure it uses the latest cart state

  return { validateStock };
}; 