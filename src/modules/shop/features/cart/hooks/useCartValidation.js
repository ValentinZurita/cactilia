import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { validateItemsStock } from '../../../services/productServices.js';
import { updateCartItemStock } from '../store/index.js'

/**
 * Hook especializado en validación de stock de productos en el carrito
 *
 * Se encarga de:
 * - Validación periódica de stock
 * - Verificación en tiempo real antes del checkout
 * - Identificación de productos con problemas de stock
 *
 * @param {Array} items - Productos en el carrito
 * @returns {Object} Estado y métodos de validación
 */
export const useCartValidation = (items) => {
  const dispatch = useDispatch();
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  // Referencias para control de validación
  const lastStockCheck = useRef(null);
  const validationLock = useRef(false);
  const stockValidationTimer = useRef(null);
  const isInitialMount = useRef(true);

  /**
   * Identifica productos sin stock
   */
  const outOfStockItems = useMemo(() => (
    items.filter(item => {
      // Manejar caso donde stock es undefined o null
      const stock = item.stock !== undefined && item.stock !== null ? item.stock : 0;
      return stock === 0;
    })
  ), [items]);

  /**
   * Identifica productos con stock insuficiente
   */
  const insufficientStockItems = useMemo(() => (
    items.filter(item => {
      // Manejar caso donde stock es undefined o null
      const stock = item.stock !== undefined && item.stock !== null ? item.stock : 0;
      return stock > 0 && item.quantity > stock;
    })
  ), [items]);

  /**
   * Indica si hay algún problema de stock
   */
  const hasStockIssues = useMemo(() => (
    outOfStockItems.length > 0 || insufficientStockItems.length > 0
  ), [outOfStockItems, insufficientStockItems]);

  /**
   * Indica si hay productos sin stock
   */
  const hasOutOfStockItems = useMemo(() => (
    outOfStockItems.length > 0
  ), [outOfStockItems]);

  /**
   * Función interna para actualizar el stock
   * @private
   */
  const updateStockInfo = useCallback(async () => {
    // Prevenir múltiples ejecuciones
    if (validationLock.current) {
      console.log('Validación de stock bloqueada por otra en progreso');
      return;
    }

    // Verificar si hay elementos en el carrito
    if (!items || items.length === 0) {
      return;
    }

    // Verificar el tiempo desde la última validación
    const now = Date.now();
    if (lastStockCheck.current && (now - lastStockCheck.current) < 30000) {
      console.log('Validación de stock omitida - última realizada hace menos de 30 segundos');
      return;
    }

    try {
      // Activar el bloqueo
      validationLock.current = true;
      setIsValidatingStock(true);

      // Registrar una única vez
      const result = await validateItemsStock(items);
      lastStockCheck.current = now;

      // Si hay productos con stock desactualizado, actualizarlos en el carrito
      if (!result.valid && result.outOfStockItems && result.outOfStockItems.length > 0) {
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
      // Liberar el bloqueo
      validationLock.current = false;
      setIsValidatingStock(false);
    }
  }, [dispatch, items]);

  /**
   * Iniciar validación programada en montaje y limpieza al desmontar
   */
  useEffect(() => {
    // Validación inicial después del primer renderizado
    if (isInitialMount.current) {
      isInitialMount.current = false;

      // Ejecutar primera validación con retraso
      if (items.length > 0) {
        stockValidationTimer.current = setTimeout(() => {
          updateStockInfo();
        }, 2000);
      }
    }

    // Limpieza al desmontar
    return () => {
      if (stockValidationTimer.current) {
        clearTimeout(stockValidationTimer.current);
        stockValidationTimer.current = null;
      }
    };
  }, [updateStockInfo, items]);

  /**
   * Fuerza una validación inmediata de stock
   * @returns {Promise<Object>} Resultado de la validación
   */
  const forceStockValidation = useCallback(async () => {
    // Si ya hay una validación en curso, esperar
    if (validationLock.current) {
      console.log('Validación forzada en espera...');
      // Intentar hasta 5 segundos (10 intentos x 500ms)
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!validationLock.current) break;
      }

      // Si después de esperar sigue bloqueado, usar datos actuales
      if (validationLock.current) {
        console.log('Tiempo de espera agotado, usando datos actuales');
        return { valid: true };
      }
    }

    try {
      validationLock.current = true;
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
      validationLock.current = false;
      setIsValidatingStock(false);
    }
  }, [dispatch, items]);

  /**
   * Validar carrito para checkout
   * @returns {Promise<Object>} Resultado de la validación
   */
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
    outOfStockItems,
    insufficientStockItems,
    hasOutOfStockItems,
    hasStockIssues,
    isValidatingStock,
    forceStockValidation,
    validateCheckout
  };
};