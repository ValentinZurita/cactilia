import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  updateCartItemStock
} from '../store/index.js';
import { calculateCartTotals } from '../utils/cartUtils';
import { syncCartWithServer } from '../store/index.js';
import { getProductCurrentStock, validateItemsStock } from '../../../services/productServices.js'

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

  // Estado local para tracking de validación
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  // Usar useRef para evitar múltiples validaciones innecesarias
  const lastStockCheck = useRef(null);
  const stockValidationTimer = useRef(null);
  const validationInProgress = useRef(false);

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

  // Verificar y actualizar stock de manera controlada
  useEffect(() => {
    // Limpiar temporizador anterior si existe
    if (stockValidationTimer.current) {
      clearTimeout(stockValidationTimer.current);
    }

    // Skip si no hay items o si está en progreso una validación
    if (!items.length || validationInProgress.current) {
      return;
    }

    // Verificar si se debe ejecutar una validación (máximo cada 30 segundos)
    const shouldValidate = !lastStockCheck.current ||
      (Date.now() - lastStockCheck.current) > 30000;

    if (!shouldValidate) {
      return;
    }

    const updateStockInfo = async () => {
      try {
        validationInProgress.current = true;
        setIsValidatingStock(true);
        console.log('Ejecutando validación de stock programada', new Date().toISOString());

        const result = await validateItemsStock(items);
        lastStockCheck.current = Date.now();

        // Si hay productos con stock desactualizado, actualizarlos en el carrito
        if (!result.valid && result.outOfStockItems.length > 0) {
          // Actualizar el stock en el carrito
          result.outOfStockItems.forEach(item => {
            dispatch(updateCartItemStock({
              id: item.id,
              stock: item.currentStock
            }));
          });
        }
      } catch (error) {
        console.error('Error al actualizar información de stock:', error);
      } finally {
        setIsValidatingStock(false);
        validationInProgress.current = false;
      }
    };

    // Usar un timeout para evitar múltiples validaciones simultáneas
    stockValidationTimer.current = setTimeout(updateStockInfo, 500);

    // Cleanup para evitar memory leaks
    return () => {
      if (stockValidationTimer.current) {
        clearTimeout(stockValidationTimer.current);
      }
    };
  }, [dispatch, items]);

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

  // Obtener stock real y actualizado de un producto
  const getUpdatedProductStock = useCallback(async (productId) => {
    try {
      return await getProductCurrentStock(productId);
    } catch (error) {
      console.error('Error al obtener stock actualizado:', error);
      return 0;
    }
  }, []);

  // Funciones para manipular el carrito
  const handleAddToCart = useCallback(async (product, quantity = 1) => {
    // Validación básica
    if (!product || !product.id) {
      console.error('Producto inválido', product);
      return {
        success: false,
        message: 'Producto inválido'
      };
    }

    try {
      // Verificar stock REAL desde el servidor
      const currentStock = await getUpdatedProductStock(product.id);

      // Si no hay stock, no permitir agregar
      if (currentStock <= 0) {
        console.warn('Producto sin stock disponible:', product.id);
        return {
          success: false,
          message: 'Producto sin stock disponible'
        };
      }

      // Encontrar si ya existe en el carrito para validar cantidad total
      const existingItem = items.find(item => item.id === product.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;

      // Validar que no exceda el stock disponible
      const totalQuantity = currentQuantity + quantity;
      if (totalQuantity > currentStock) {
        console.warn(`Cantidad excede stock disponible (${currentStock})`, product.id);
        return {
          success: false,
          message: `Solo hay ${currentStock} unidades disponibles. Ya tienes ${currentQuantity} en tu carrito.`
        };
      }

      // Agregar al carrito con el stock actualizado
      dispatch(addToCart({
        product: {
          ...product,
          stock: currentStock // Asegurar que usamos el stock real
        },
        quantity
      }));

      if (uid) dispatch(syncCartWithServer());

      // Actualizar última verificación
      lastStockCheck.current = Date.now();

      return {
        success: true,
        message: 'Producto agregado al carrito'
      };
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      return {
        success: false,
        message: 'Error al agregar al carrito. Intente nuevamente.'
      };
    }
  }, [dispatch, uid, items, getUpdatedProductStock]);

  const handleRemoveFromCart = useCallback((productId) => {
    if (!productId) {
      console.error('ID de producto requerido para eliminar del carrito');
      return;
    }

    dispatch(removeFromCart(productId));
    if (uid) dispatch(syncCartWithServer());
  }, [dispatch, uid]);

  // Función para incrementar cantidad con validación de stock real
  const increaseQuantity = useCallback(async (productId) => {
    if (!productId) return { success: false, message: 'ID de producto no válido' };

    try {
      const item = items.find(item => item.id === productId);
      if (!item) {
        console.warn('Producto no encontrado en el carrito:', productId);
        return { success: false, message: 'Producto no encontrado en el carrito' };
      }

      // Verificar stock REAL desde el servidor
      const currentStock = await getUpdatedProductStock(productId);

      // Si el stock real es diferente al almacenado, actualizarlo
      if (currentStock !== item.stock) {
        dispatch(updateCartItemStock({
          id: productId,
          stock: currentStock
        }));
      }

      // Validar stock disponible
      if (currentStock <= 0 || item.quantity >= currentStock) {
        console.warn('No hay suficiente stock para incrementar:', productId);
        return {
          success: false,
          message: `Has alcanzado el máximo de unidades disponibles (${currentStock})`
        };
      }

      dispatch(updateQuantity({ id: productId, quantity: item.quantity + 1 }));
      if (uid) dispatch(syncCartWithServer());

      // Actualizar timestamp de validación
      lastStockCheck.current = Date.now();

      return { success: true };
    } catch (error) {
      console.error('Error al incrementar cantidad:', error);
      return {
        success: false,
        message: 'Error al actualizar cantidad. Intente nuevamente.'
      };
    }
  }, [dispatch, items, uid, getUpdatedProductStock]);

  // Función para decrementar cantidad
  const decreaseQuantity = useCallback((productId) => {
    if (!productId) return { success: false };

    const item = items.find(item => item.id === productId);
    if (item && item.quantity > 1) {
      dispatch(updateQuantity({ id: productId, quantity: item.quantity - 1 }));
      if (uid) dispatch(syncCartWithServer());
      return { success: true };
    }

    return { success: false };
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

  // Forzar una verificación de stock inmediata
  const forceStockValidation = useCallback(async () => {
    // Si ya hay una validación en curso, no iniciar otra
    if (validationInProgress.current) {
      console.log('Validación ya en progreso, esperando...');
      // Esperar a que termine la validación actual
      for (let i = 0; i < 10; i++) { // Máximo 10 intentos (5 segundos)
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!validationInProgress.current) break;
      }

      // Si después de esperar sigue en progreso, devolver el resultado más reciente
      if (validationInProgress.current) {
        console.log('Timeout esperando validación, usando datos actuales');
        return { valid: true }; // Asumir válido por defecto para evitar bloqueo
      }
    }

    try {
      validationInProgress.current = true;
      setIsValidatingStock(true);
      console.log('Forzando validación de stock', new Date().toISOString());

      const result = await validateItemsStock(items);
      lastStockCheck.current = Date.now();

      // Actualizar stocks en el carrito
      if (result.outOfStockItems && result.outOfStockItems.length > 0) {
        result.outOfStockItems.forEach(item => {
          dispatch(updateCartItemStock({
            id: item.id,
            stock: item.currentStock
          }));
        });
      }

      return result;
    } catch (error) {
      console.error('Error al validar stock:', error);
      return { valid: false, error: error.message };
    } finally {
      setIsValidatingStock(false);
      validationInProgress.current = false;
    }
  }, [dispatch, items]);

  // Validar carrito para checkout
  const validateCheckout = useCallback(async () => {
    // Primero verificar si hay items
    if (items.length === 0) {
      return {
        valid: false,
        error: 'Tu carrito está vacío'
      };
    }

    // Forzar una verificación de stock en tiempo real
    const validationResult = await forceStockValidation();

    if (!validationResult.valid) {
      if (validationResult.outOfStockItems && validationResult.outOfStockItems.length > 0) {
        // Crear mensaje amigable para el usuario
        if (validationResult.outOfStockItems.length === 1) {
          const item = validationResult.outOfStockItems[0];
          return {
            valid: false,
            error: `"${item.name}" no está disponible en la cantidad solicitada. Solo hay ${item.currentStock} unidades disponibles.`,
            outOfStockItems: validationResult.outOfStockItems
          };
        } else {
          return {
            valid: false,
            error: 'Algunos productos en tu carrito no están disponibles en la cantidad solicitada. Por favor, revisa tu carrito y ajusta tu pedido.',
            outOfStockItems: validationResult.outOfStockItems
          };
        }
      }

      if (validationResult.error) {
        return {
          valid: false,
          error: validationResult.error
        };
      }
    }

    return { valid: true };
  }, [items, forceStockValidation]);

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
    isValidatingStock,

    // Métodos
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart: handleClearCart,
    isInCart,
    getItem,
    validateCheckout,
    forceStockValidation
  };
};