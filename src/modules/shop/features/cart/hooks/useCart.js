import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} from '../store/index.js';
import { syncCartWithServer } from '../store/index.js';
import { calculateCartTotals, getOutOfStockItems } from '../utils/index.js';

/**
 * Hook personalizado para manejar las operaciones del carrito
 * Proporciona métodos para añadir, eliminar, actualizar y verificar productos
 * @returns {Object} - Métodos y datos del carrito
 */
export const useCart = () => {
  const dispatch = useDispatch();

  // Obtener el estado del carrito desde Redux
  const { items = [] } = useSelector(state => state.cart);
  const { uid } = useSelector(state => state.auth);

  // Verificar si hay productos sin stock
  const outOfStockItems = useMemo(() =>
      items.filter(item => item.stock === 0),
    [items]
  );

  // Verificar si hay productos con stock insuficiente
  const insufficientStockItems = useMemo(() =>
      items.filter(item => item.stock > 0 && item.quantity > item.stock),
    [items]
  );

  // Calcular los totales del carrito
  const {
    subtotal,
    taxes,
    shipping,
    total,
    finalTotal,
    isFreeShipping
  } = useMemo(() => calculateCartTotals(items), [items]);

  // Verificar si hay problemas de stock
  const hasStockIssues = useMemo(() =>
      outOfStockItems.length > 0 || insufficientStockItems.length > 0,
    [outOfStockItems, insufficientStockItems]
  );

  // Funciones para manipular el carrito
  const handleAddToCart = useCallback((product, quantity = 1) => {
    dispatch(addToCart({ product, quantity }));
    if (uid) dispatch(syncCartWithServer(uid));
  }, [dispatch, uid]);

  const handleRemoveFromCart = useCallback((productId) => {
    dispatch(removeFromCart(productId));
    if (uid) dispatch(syncCartWithServer(uid));
  }, [dispatch, uid]);

  const handleUpdateQuantity = useCallback((productId, quantity) => {
    dispatch(updateQuantity({ id: productId, quantity }));
    if (uid) dispatch(syncCartWithServer(uid));
  }, [dispatch, uid]);

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
    if (uid) dispatch(syncCartWithServer(uid));
  }, [dispatch, uid]);

  // Verificar si un producto está en el carrito
  const isInCart = useCallback((productId) => {
    return items.some(item => item.id === productId);
  }, [items]);

  // Obtener un producto del carrito
  const getItem = useCallback((productId) => {
    return items.find(item => item.id === productId);
  }, [items]);

  // Validar si se puede proceder al checkout
  const validateCheckout = useCallback(() => {
    if (items.length === 0) {
      return {
        valid: false,
        error: 'Tu carrito está vacío'
      };
    }

    if (outOfStockItems.length > 0) {
      return {
        valid: false,
        error: 'Hay productos sin existencia en tu carrito',
        outOfStockItems
      };
    }

    if (insufficientStockItems.length > 0) {
      return {
        valid: false,
        error: 'Hay productos con cantidades mayores al stock disponible',
        insufficientStockItems
      };
    }

    return { valid: true };
  }, [items, outOfStockItems, insufficientStockItems]);

  return {
    // Datos del carrito
    items,
    subtotal,
    taxes,
    shipping,
    total,
    finalTotal,
    isFreeShipping,
    outOfStockItems,
    insufficientStockItems,
    hasOutOfStockItems: outOfStockItems.length > 0,
    hasStockIssues,

    // Métodos
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    isInCart,
    getItem,
    validateCheckout
  };
};