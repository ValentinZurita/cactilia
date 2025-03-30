// src/modules/shop/features/cart/hooks/useCart.js
import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} from '../../cart/store/cartSlice.js';
import { calculateCartTotals } from '../utils/cartUtils';
import { syncCartWithServer } from '../store/index.js'

export const useCart = () => {
  const dispatch = useDispatch();
  const { items = [] } = useSelector(state => state.cart);
  const { uid } = useSelector(state => state.auth);

  // Calcular totales del carrito
  const {
    subtotal,
    taxes,
    shipping,
    total,
    finalTotal,
    isFreeShipping
  } = useMemo(() => calculateCartTotals(items), [items]);

  // Total de items (cantidad)
  const itemsCount = useMemo(() =>
      items.reduce((count, item) => count + item.quantity, 0),
    [items]);

  // Verificar si hay productos sin stock o con stock insuficiente
  const outOfStockItems = useMemo(() =>
      items.filter(item => item.stock === 0),
    [items]
  );

  const insufficientStockItems = useMemo(() =>
      items.filter(item => item.stock > 0 && item.quantity > item.stock),
    [items]
  );

  const hasStockIssues = useMemo(() =>
      outOfStockItems.length > 0 || insufficientStockItems.length > 0,
    [outOfStockItems, insufficientStockItems]
  );

  // Funciones para manipular el carrito
  const handleAddToCart = useCallback((product, quantity = 1) => {
    dispatch(addToCart({ product, quantity }));
    if (uid) dispatch(syncCartWithServer());
  }, [dispatch, uid]);

  const handleRemoveFromCart = useCallback((productId) => {
    dispatch(removeFromCart(productId));
    if (uid) dispatch(syncCartWithServer());
  }, [dispatch, uid]);

  // Función para incrementar cantidad
  const increaseQuantity = useCallback((productId) => {
    console.log("Incrementando cantidad para:", productId);
    const item = items.find(item => item.id === productId);
    if (item) {
      dispatch(updateQuantity({ id: productId, quantity: item.quantity + 1 }));
      if (uid) dispatch(syncCartWithServer());
    }
  }, [dispatch, items, uid]);

  // Función para decrementar cantidad
  const decreaseQuantity = useCallback((productId) => {
    console.log("Decrementando cantidad para:", productId);
    const item = items.find(item => item.id === productId);
    if (item && item.quantity > 1) {
      dispatch(updateQuantity({ id: productId, quantity: item.quantity - 1 }));
      if (uid) dispatch(syncCartWithServer());
    }
  }, [dispatch, items, uid]);

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
    if (uid) dispatch(syncCartWithServer());
  }, [dispatch, uid]);

  // Verificar si un producto está en el carrito
  const isInCart = useCallback((productId) => {
    return items.some(item => item.id === productId);
  }, [items]);

  // Obtener un producto del carrito
  const getItem = useCallback((productId) => {
    return items.find(item => item.id === productId);
  }, [items]);

  // Validar carrito para checkout
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
    itemsCount,
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
    increaseQuantity,
    decreaseQuantity,
    clearCart: handleClearCart,
    isInCart,
    getItem,
    validateCheckout
  };
};