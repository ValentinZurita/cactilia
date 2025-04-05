import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  syncCartWithServer
} from '../store/index.js';
import { getProductCurrentStock } from '../../../services/productServices.js';
import { fetchShippingRuleById } from '../../../../admin/shipping/api/shippingApi.js';

/**
 * Helper para mostrar información condensada sobre reglas de envío
 * @param {Object} product - Producto a analizar
 */
const logShippingInfo = async (product) => {
  if (!product) return;
  
  // En algunos casos, el producto puede estar anidado en sí mismo
  const actualProduct = product.product || product;
  
  try {
    // Validar estructura del producto
    const { product: validatedProduct, valid, warnings } = await import('../../../services/productValidator.js')
      .then(module => module.validateAndNormalizeProduct(actualProduct, false));

    // Si hay advertencias sobre la estructura del producto, solo mostrarlas en desarrollo
    if (process.env.NODE_ENV !== 'production' && warnings.length > 0) {
      console.warn(`⚠️ Advertencias del producto "${validatedProduct.name || validatedProduct.id}":`, 
        warnings.length <= 3 ? warnings.join('; ') : `${warnings.length} problemas detectados`);
    }
    
    // Trabajar con el producto validado y normalizado
    const ruleIds = validatedProduct.shippingRuleIds || [];
    
    // PATCH para producto específico
    const needsPatch = validatedProduct.id === 'e9lK7PMv83TCwSwngDDi' && ruleIds.length === 0;
    const finalRuleIds = needsPatch ? ['x8tRGxol2MOr8NMzeAPp', 'fyfkhfITejBjMASFCMZ2'] : ruleIds;
    
    // Log condensado para el producto
    console.log(`📦 Envío para "${validatedProduct.name || validatedProduct.id}": ${finalRuleIds.length > 0 ? `${finalRuleIds.length} reglas` : '⚠️ Sin reglas'}`);
    
    if (finalRuleIds.length === 0) {
      return;
    }
    
    // Obtener y mostrar info condensada de cada regla de envío
    const rulesInfo = [];
    
    for (const ruleId of finalRuleIds) {
      if (!ruleId) continue;
      
      try {
        const rule = await fetchShippingRuleById(ruleId);
        
        if (!rule) {
          rulesInfo.push(`⚠️ Regla no encontrada: ${ruleId}`);
          continue;
        }
        
        // Información condensada de la regla
        const freeShipping = rule.envio_gratis ? 'Envío gratis' : '';
        const minOrderFree = rule.envio_gratis_monto_minimo ? `Gratis desde $${rule.envio_gratis_monto_minimo}` : '';
        const freeInfo = freeShipping || minOrderFree ? ` (${freeShipping || minOrderFree})` : '';
        
        // Opciones de mensajería condensadas
        const options = [];
        if (rule.opciones_mensajeria && Array.isArray(rule.opciones_mensajeria)) {
          rule.opciones_mensajeria.forEach(option => {
            const price = option.precio || 0;
            const time = option.tiempo_entrega || `${option.minDays || '?'}-${option.maxDays || '?'} días`;
            options.push(`${option.nombre}: $${price} (${time})`);
          });
        }
        
        rulesInfo.push(`✅ ${rule.zona || 'Sin nombre'}${freeInfo}: ${options.length > 0 ? options.join(' | ') : '⚠️ Sin opciones'}`);
      } catch (error) {
        rulesInfo.push(`❌ Error con regla ${ruleId}: ${error.message}`);
      }
    }
    
    // Mostrar resumen de reglas
    console.log(`🚚 Opciones de envío disponibles:\n  ${rulesInfo.join('\n  ')}`);
    
  } catch (error) {
    console.error('❌ Error al procesar información de envío:', error);
  }
};

/**
 * Hook especializado en operaciones CRUD del carrito
 * Maneja añadir, eliminar y actualizar productos
 *
 * @param {Array} items - Productos actuales en el carrito
 * @param {string} uid - ID del usuario autenticado
 * @returns {Object} Métodos para manipular el carrito
 */
export const useCartOperations = (items, uid) => {
  const dispatch = useDispatch();

  /**
   * Verifica si un producto está en el carrito
   * @param {string} productId - ID del producto a verificar
   * @returns {boolean} True si el producto está en el carrito
   */
  const isInCart = useCallback((productId) => {
    return items.some(item => item.id === productId);
  }, [items]);

  /**
   * Obtiene un producto del carrito
   * @param {string} productId - ID del producto a obtener
   * @returns {Object|undefined} Producto del carrito o undefined
   */
  const getItem = useCallback((productId) => {
    return items.find(item => item.id === productId);
  }, [items]);

  /**
   * Obtiene stock real y actualizado de un producto
   * @param {string} productId - ID del producto
   * @returns {Promise<number>} Stock actual
   */
  const getUpdatedProductStock = useCallback(async (productId) => {
    try {
      return await getProductCurrentStock(productId);
    } catch (error) {
      console.error('Error al obtener stock actualizado:', error);
      return 0;
    }
  }, []);

  /**
   * Añade un producto al carrito con validación de stock
   * @param {Object} product - Producto a añadir
   * @param {number} quantity - Cantidad a añadir
   * @returns {Promise<Object>} Resultado de la operación
   */
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
      // Mostrar información de envío del producto (en paralelo)
      logShippingInfo(product).catch(err => console.error('Error al mostrar información de envío:', err));
      
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
      const existingItem = isInCart(product.id) ? getItem(product.id) : null;
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

      // Sincronizar con el servidor si hay usuario
      if (uid) dispatch(syncCartWithServer());

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
  }, [dispatch, uid, isInCart, getItem, getUpdatedProductStock]);

  /**
   * Elimina un producto del carrito
   * @param {string} productId - ID del producto a eliminar
   */
  const handleRemoveFromCart = useCallback((productId) => {
    if (!productId) {
      console.error('ID de producto requerido para eliminar del carrito');
      return;
    }

    dispatch(removeFromCart(productId));
    if (uid) dispatch(syncCartWithServer());
  }, [dispatch, uid]);

  /**
   * Incrementa la cantidad de un producto en el carrito
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} Resultado de la operación
   */
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

      return { success: true };
    } catch (error) {
      console.error('Error al incrementar cantidad:', error);
      return {
        success: false,
        message: 'Error al actualizar cantidad. Intente nuevamente.'
      };
    }
  }, [dispatch, items, uid, getUpdatedProductStock]);

  /**
   * Decrementa la cantidad de un producto en el carrito
   * @param {string} productId - ID del producto
   * @returns {Object} Resultado de la operación
   */
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

  return {
    isInCart,
    getItem,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    increaseQuantity,
    decreaseQuantity
  };
};