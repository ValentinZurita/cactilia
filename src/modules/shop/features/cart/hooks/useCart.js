import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} from '../store/index.js';
import { calculateCartTotals } from '../utils/cartUtils';
import { syncCartWithServer } from '../store/index.js';

/**
 * Hook personalizado para manejar todas las operaciones del carrito de compras
 * Proporciona acceso a los items del carrito, métodos para manipularlo y cálculos derivados
 *
 * @returns {Object} Funciones y estado del carrito
 */
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
    [items]
  );

  // Verificar si hay productos sin stock o con stock insuficiente
  const outOfStockItems = useMemo(() =>
      items.filter(item => {
        // Manejar caso donde stock es undefined o null
        const stock = item.stock !== undefined && item.stock !== null ? item.stock : 0;
        return stock === 0;
      }),
    [items]
  );

  const insufficientStockItems = useMemo(() =>
      items.filter(item => {
        // Manejar caso donde stock es undefined o null
        const stock = item.stock !== undefined && item.stock !== null ? item.stock : 0;
        return stock > 0 && item.quantity > stock;
      }),
    [items]
  );

  const hasStockIssues = useMemo(() =>
      outOfStockItems.length > 0 || insufficientStockItems.length > 0,
    [outOfStockItems, insufficientStockItems]
  );

  // Funciones para manipular el carrito
  const handleAddToCart = useCallback((product, quantity = 1) => {
    // Validación básica
    if (!product || !product.id) {
      console.error('Producto inválido', product);
      return;
    }

    // Verificar stock disponible
    const stock = product.stock !== undefined && product.stock !== null ? product.stock : 0;
    if (stock <= 0) {
      console.warn('Producto sin stock disponible:', product.id);
      return;
    }

    // Encontrar si ya existe en el carrito para validar cantidad total
    const existingItem = items.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    // Validar que no exceda el stock disponible
    const totalQuantity = currentQuantity + quantity;
    if (totalQuantity > stock) {
      console.warn(`Cantidad excede stock disponible (${stock})`, product.id);
      // Opcional: Ajustar automáticamente al máximo disponible
      // quantity = stock - currentQuantity;
      return;
    }

    dispatch(addToCart({
      product: {
        ...product,
        stock // Asegurar que el stock se guarda en el carrito
      },
      quantity
    }));

    if (uid) dispatch(syncCartWithServer());
  }, [dispatch, uid, items]);

  const handleRemoveFromCart = useCallback((productId) => {
    if (!productId) {
      console.error('ID de producto requerido para eliminar del carrito');
      return;
    }

    dispatch(removeFromCart(productId));
    if (uid) dispatch(syncCartWithServer());
  }, [dispatch, uid]);

  // Función para incrementar cantidad con validación de stock
  const increaseQuantity = useCallback((productId) => {
    if (!productId) return;

    const item = items.find(item => item.id === productId);
    if (!item) {
      console.warn('Producto no encontrado en el carrito:', productId);
      return;
    }

    // Validar stock disponible
    const stock = item.stock !== undefined && item.stock !== null ? item.stock : 0;
    if (stock <= 0 || item.quantity >= stock) {
      console.warn('No hay suficiente stock para incrementar:', productId);
      return;
    }

    dispatch(updateQuantity({ id: productId, quantity: item.quantity + 1 }));
    if (uid) dispatch(syncCartWithServer());
  }, [dispatch, items, uid]);

  // Función para decrementar cantidad
  const decreaseQuantity = useCallback((productId) => {
    if (!productId) return;

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