import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, clearCart } from '../../shop/slices/cartSlice';
import { syncCartWithServer } from '../../shop/thunks/cartThunk';
import { calculateCartTotals, getOutOfStockItems } from '../../shop/utils/cartUtilis.js';

/**
 * Hook personalizado para manejar las operaciones del carrito
 * Proporciona métodos para añadir, eliminar, actualizar y verificar productos
 *
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

  /**
   * Añadir producto al carrito
   * @param {Object} product - Producto a añadir
   * @param {number} quantity - Cantidad a añadir
   * @returns {void}
   */
  const handleAddToCart = useCallback((product, quantity = 1) => {
    dispatch(addToCart({ product, quantity }));

    // Sincronizar con el servidor si el usuario está autenticado
    if (uid) {
      dispatch(syncCartWithServer(uid));
    }
  }, [dispatch, uid]);

  /**
   * Eliminar producto del carrito
   * @param {string} productId - ID del producto a eliminar
   * @returns {void}
   */
  const handleRemoveFromCart = useCallback((productId) => {
    dispatch(removeFromCart(productId));

    // Sincronizar con el servidor si el usuario está autenticado
    if (uid) {
      dispatch(syncCartWithServer(uid));
    }
  }, [dispatch, uid]);

  /**
   * Actualizar cantidad de un producto
   * @param {string} productId - ID del producto
   * @param {number} quantity - Nueva cantidad
   * @returns {void}
   */
  const handleUpdateQuantity = useCallback((productId, quantity) => {
    dispatch(updateQuantity({ id: productId, quantity }));

    // Sincronizar con el servidor si el usuario está autenticado
    if (uid) {
      dispatch(syncCartWithServer(uid));
    }
  }, [dispatch, uid]);

  /**
   * Vaciar el carrito
   * @returns {void}
   */
  const handleClearCart = useCallback(() => {
    dispatch(clearCart());

    // Sincronizar con el servidor si el usuario está autenticado
    if (uid) {
      dispatch(syncCartWithServer(uid));
    }
  }, [dispatch, uid]);

  /**
   * Verificar si un producto está en el carrito
   * @param {string} productId - ID del producto a verificar
   * @returns {boolean} - Si el producto está en el carrito
   */
  const isInCart = useCallback((productId) => {
    return items.some(item => item.id === productId);
  }, [items]);

  /**
   * Obtener un producto del carrito
   * @param {string} productId - ID del producto a obtener
   * @returns {Object|undefined} - El producto o undefined si no existe
   */
  const getItem = useCallback((productId) => {
    return items.find(item => item.id === productId);
  }, [items]);

  /**
   * Validar si se puede proceder al checkout
   * @returns {Object} - Resultado de la validación
   */
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