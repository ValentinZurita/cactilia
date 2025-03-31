import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useCartOperations } from './useCartOperations';
import { useCartValidation } from './useCartValidation';
import { useCartTotals } from './useCartTotals';
import { clearCartWithSync } from '../store/index.js';

/**
 * Hook principal para manejar todas las operaciones del carrito de compras
 *
 * Este hook funciona como fachada para los hooks más especializados,
 * proporcionando una API unificada para interactuar con el carrito.
 * Delega responsabilidades específicas a hooks más pequeños.
 *
 * @returns {Object} Funciones y estado del carrito
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const { items = [] } = useSelector(state => state.cart);
  const { uid } = useSelector(state => state.auth);

  // Hooks específicos para cada responsabilidad
  const cartOperations = useCartOperations(items, uid);
  const cartValidation = useCartValidation(items);
  const cartTotals = useCartTotals(items);

  // Calcular número total de items
  const itemsCount = items.reduce((count, item) => count + item.quantity, 0);

  // Limpiar carrito completamente
  const handleClearCart = useCallback(() => {
    dispatch(clearCartWithSync());
  }, [dispatch]);

  // Retornar todos los valores y funciones necesarios
  return {
    // Datos del carrito
    items,
    itemsCount,

    // Operaciones CRUD
    addToCart: cartOperations.addToCart,
    removeFromCart: cartOperations.removeFromCart,
    increaseQuantity: cartOperations.increaseQuantity,
    decreaseQuantity: cartOperations.decreaseQuantity,
    clearCart: handleClearCart,
    isInCart: cartOperations.isInCart,
    getItem: cartOperations.getItem,

    // Validación
    validateCheckout: cartValidation.validateCheckout,
    forceStockValidation: cartValidation.forceStockValidation,
    hasOutOfStockItems: cartValidation.hasOutOfStockItems,
    hasStockIssues: cartValidation.hasStockIssues,
    outOfStockItems: cartValidation.outOfStockItems,
    insufficientStockItems: cartValidation.insufficientStockItems,
    isValidatingStock: cartValidation.isValidatingStock,

    // Totales
    ...cartTotals
  };
};