import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCartError,
  selectCartItems,
  selectCartItemsCount,
  selectCartLoading,
  selectCartTotal,
} from '../../../store/cart/cartSlice.js'
import {
  addToCartWithSync, clearCartWithSync,
  decrementQuantityWithSync,
  incrementQuantityWithSync, loadCartFromFirestore,
  removeFromCartWithSync,
} from '../../../store/cart/cartThunk.js'
import { calculateCartTotals, getOutOfStockItems } from '../../shop/utils/cartUtilis.js'


/**
 * Custom hook to interact with the cart
 * Provides methods to add, remove, update items and get cart info
 */

export const useCart = () => {
  const dispatch = useDispatch();

  // Get cart state from Redux
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const itemsCount = useSelector(selectCartItemsCount);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);

  // Add item to cart
  const addToCart = useCallback((product, quantity = 1) => {
    dispatch(addToCartWithSync(product, quantity));
  }, [dispatch]);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    dispatch(removeFromCartWithSync(productId));
  }, [dispatch]);

  // Increase item quantity
  const increaseQuantity = useCallback((productId) => {
    dispatch(incrementQuantityWithSync(productId));
  }, [dispatch]);

  // Decrease item quantity
  const decreaseQuantity = useCallback((productId) => {
    dispatch(decrementQuantityWithSync(productId));
  }, [dispatch]);

  // Clear cart
  const clearCart = useCallback(() => {
    dispatch(clearCartWithSync());
  }, [dispatch]);

  // Load cart from Firestore (useful when user logs in)
  const loadCart = useCallback(() => {
    dispatch(loadCartFromFirestore());
  }, [dispatch]);

  // Get cart totals including tax, shipping, etc.
  const cartTotals = useMemo(() => {
    return calculateCartTotals(items);
  }, [items]);

  // Check if cart has out-of-stock items
  const outOfStockItems = useMemo(() => {
    return getOutOfStockItems(items);
  }, [items]);

  // Check if item is in cart
  const isInCart = useCallback((productId) => {
    return items.some(item => item.id === productId);
  }, [items]);

  // Get specific item from cart
  const getItem = useCallback((productId) => {
    return items.find(item => item.id === productId) || null;
  }, [items]);

  return {
    // Cart state
    items,
    total,
    itemsCount,
    loading,
    error,

    // Extended cart info
    ...cartTotals,
    outOfStockItems,
    hasOutOfStockItems: outOfStockItems.length > 0,

    // Cart actions
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    loadCart,
    isInCart,
    getItem
  };
};