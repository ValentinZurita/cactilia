import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  syncCartWithServer,
  removeItemAndSync
} from '../store/index.js';
import { decrementShopProductStock } from '@store/slices/shopPageSlice.js';
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
    
    // Log detallado para el producto
    console.log(`\n📦 INFORMACIÓN DETALLADA DE ENVÍO - "${validatedProduct.name || validatedProduct.id}" (${validatedProduct.id})`);
    console.log(`--------------------------------------------------`);
    console.log(`Peso del producto: ${validatedProduct.weight || 0}kg`);
    console.log(`Reglas de envío: ${finalRuleIds.length > 0 ? `${finalRuleIds.length} reglas` : '⚠️ Sin reglas'}`);
    
    if (finalRuleIds.length === 0) {
      console.log(`⚠️ Este producto no tiene reglas de envío configuradas.`);
      console.log(`--------------------------------------------------\n`);
      return;
    }
    
    // Obtener y mostrar info completa de cada regla de envío
    console.log(`\n🚚 DETALLES DE ZONAS DE ENVÍO DISPONIBLES:`);
    
    for (const ruleId of finalRuleIds) {
      if (!ruleId) continue;
      
      try {
        const rule = await fetchShippingRuleById(ruleId);
        
        if (!rule) {
          console.log(`❌ Regla ID ${ruleId}: No encontrada`);
          continue;
        }
        
        console.log(`\n✅ ZONA: ${rule.zona || 'Sin nombre'} (ID: ${rule.id})`);
        console.log(`--------------------------------------------------`);
        console.log(`Activo: ${rule.activo ? 'Sí' : 'No'}`);
        console.log(`Envío gratis: ${rule.envio_gratis ? 'Sí' : 'No'}`);
        
        if (rule.envio_gratis_monto_minimo) {
          console.log(`Envío gratis a partir de: $${rule.envio_gratis_monto_minimo}`);
        }
        
        console.log(`Cobertura: ${rule.zipcode || rule.zipcodes?.join(', ') || 'No especificada'}`);
        
        // Opciones de mensajería detalladas
        if (rule.envio_variable && rule.envio_variable.aplica && 
            rule.envio_variable.opciones_mensajeria && 
            Array.isArray(rule.envio_variable.opciones_mensajeria)) {
          
          console.log(`\n📋 OPCIONES DE MENSAJERÍA DISPONIBLES:`);
          
          rule.envio_variable.opciones_mensajeria.forEach((option, index) => {
            console.log(`\n  ${index + 1}. ${option.label || 'Sin etiqueta'} (${option.nombre || 'Sin nombre'})`);
            console.log(`  ----------------------------------------`);
            console.log(`  Precio: $${option.precio || 0}`);
            console.log(`  Tiempo de entrega: ${option.tiempo_entrega || `${option.minDays || '?'}-${option.maxDays || '?'} días`}`);
            
            // Configuración de paquetes
            if (option.configuracion_paquetes) {
              const config = option.configuracion_paquetes;
              console.log(`  Peso máximo por paquete: ${config.peso_maximo_paquete || 0}kg`);
              console.log(`  Costo por kg extra: $${config.costo_por_kg_extra || 0}`);
              console.log(`  Máximo productos por paquete: ${config.maximo_productos_por_paquete || 1}`);
            }
            
            // Rangos de peso si aplican
            if (option.usaRangosPeso && option.rangosPeso && option.rangosPeso.length > 0) {
              console.log(`  Rangos de peso:`);
              option.rangosPeso.forEach(rango => {
                console.log(`    - De ${rango.desde || 0}kg a ${rango.hasta || '∞'}kg: $${rango.precio || 0}`);
              });
            }
          });
        } else {
          console.log(`❌ Sin opciones de mensajería configuradas`);
        }
        
        console.log(`--------------------------------------------------`);
      } catch (error) {
        console.log(`❌ Error con regla ${ruleId}: ${error.message}`);
      }
    }
    
    console.log(`\n🛒 FIN INFORMACIÓN DE ENVÍO\n`);
    
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
  
  // Referencia para prevenir múltiples incrementos automáticos
  const incrementLocks = useRef({});
  const incrementDelay = 2000; // 2 segundos de bloqueo entre incrementos
  
  // Control para evitar múltiples llamadas a addToCart
  const addToCartLock = useRef(false);

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
   * @param {boolean} incrementExistente - Si es true, incrementa la cantidad si ya existe, si es false, mantiene la cantidad actual
   * @returns {Promise<Object>} Resultado de la operación
   */
  const handleAddToCart = useCallback(async (product, quantity = 1, incrementExistente = false) => {
    // Validación básica
    if (!product || !product.id) {
      console.error('Producto inválido', product);
      return {
        success: false,
        message: 'Producto inválido'
      };
    }

    // Prevenir múltiples llamadas simultáneas a addToCart
    if (addToCartLock.current) {
      console.warn('Se bloqueó una llamada duplicada a addToCart', product.id);
      return {
        success: false,
        message: 'Procesando solicitud anterior, por favor espere'
      };
    }

    // Activar bloqueo
    addToCartLock.current = true;

    try {
      // Asegurarse que el producto tenga reglas de envío
      // Importar dinámicamente para evitar dependencias circulares
      const { ensureProductHasShippingRules } = await import('../../../utils/shippingRuleAssigner.js');
      const productWithRules = await ensureProductHasShippingRules(product);
      
      if (product.id !== productWithRules.id) {
        console.error('Error al asignar reglas de envío: IDs no coinciden');
        return {
          success: false,
          message: 'Error al procesar producto'
        };
      }
      
      // Verificar si se asignaron reglas de envío
      const rulesAdded = 
        (!product.shippingRuleIds || !product.shippingRuleIds.length) && 
        (productWithRules.shippingRuleIds && productWithRules.shippingRuleIds.length);
        
      if (rulesAdded) {
        console.log(`🔧 PATCH aplicado para producto ${product.id}`);
      }
      
      // Mostrar información de envío del producto con reglas asignadas
      logShippingInfo(productWithRules).catch(err => console.error('Error al mostrar información de envío:', err));
      
      // Verificar stock REAL desde el servidor
      const currentStock = await getUpdatedProductStock(productWithRules.id);

      // Si no hay stock, no permitir agregar
      if (currentStock <= 0) {
        console.warn('Producto sin stock disponible:', productWithRules.id);
        return {
          success: false,
          message: 'Producto sin stock disponible'
        };
      }

      // Encontrar si ya existe en el carrito para validar cantidad total
      const existingItem = isInCart(productWithRules.id) ? getItem(productWithRules.id) : null;
      const currentQuantity = existingItem ? existingItem.quantity : 0;

      // Validar que no exceda el stock disponible
      const totalQuantity = currentQuantity + quantity;
      if (totalQuantity > currentStock) {
        console.warn(`Cantidad excede stock disponible (${currentStock})`, productWithRules.id);
        return {
          success: false,
          message: `Solo hay ${currentStock} unidades disponibles. Ya tienes ${currentQuantity} en tu carrito.`
        };
      }

      // Agregar al carrito con el stock actualizado y reglas de envío asignadas
      dispatch(addToCart({
        product: {
          ...productWithRules,
          stock: currentStock // Asegurar que usamos el stock real
        },
        quantity,
        shouldIncrement: incrementExistente // Pasar el valor recibido como parámetro
      }));

      // Despachar actualización optimista para la UI de la tienda
      dispatch(decrementShopProductStock({
        productId: productWithRules.id,
        quantityToDecrement: quantity
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
    } finally {
      // Liberar el bloqueo después de un retraso para permitir que Redux se actualice
      setTimeout(() => {
        addToCartLock.current = false;
      }, 1000);
    }
  }, [dispatch, uid, isInCart, getItem, getUpdatedProductStock]);

  /**
   * Elimina un producto del carrito
   * @param {string} productId - ID del producto a eliminar
   */
  const handleRemoveFromCart = useCallback((productId) => {
    console.log('Dispatching removeItemAndSync for product:', productId);
    dispatch(removeItemAndSync(productId));
  }, [dispatch]);

  /**
   * Incrementa la cantidad de un producto en el carrito
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} Resultado de la operación
   */
  const increaseQuantity = useCallback(async (productId) => {
    if (!productId) return { success: false, message: 'ID de producto no válido' };

    // Simplificamos el bloqueo para que no sea tan restrictivo
    if (incrementLocks.current[productId]) {
      // Si hay bloqueo, permitimos continuar pero lo registramos
      console.log('Operación rápida detectada:', productId);
    }

    const item = items.find(item => item.id === productId);
    if (!item) {
      return { success: false, message: 'Producto no encontrado en el carrito' };
    }

    // Actualización optimista - actualizamos UI inmediatamente
    dispatch(updateQuantity({ id: productId, quantity: item.quantity + 1 }));
    
    // Marcar como bloqueado brevemente
    incrementLocks.current[productId] = true;
    
    // Validación en segundo plano sin bloquear UI
    setTimeout(async () => {
      try {
        // Verificar stock en segundo plano
        const currentStock = await getUpdatedProductStock(productId);
        
        // Si excede el stock, revertir al stock máximo
        if (item.quantity + 1 > currentStock) {
          dispatch(updateQuantity({ id: productId, quantity: currentStock }));
          console.warn(`Cantidad ajustada a stock disponible (${currentStock})`);
        }
        
        // Sincronizar con el servidor si necesario
        if (uid) dispatch(syncCartWithServer());
      } catch (error) {
        console.error('Error en validación de stock:', error);
      } finally {
        // Liberar bloqueo rápidamente
        incrementLocks.current[productId] = false;
      }
    }, 300); // Retraso mínimo para mejor UX

    return { success: true };
  }, [dispatch, items, uid, getUpdatedProductStock]);

  /**
   * Decrementa la cantidad de un producto en el carrito
   * @param {string} productId - ID del producto
   * @returns {Object} Resultado de la operación
   */
  const decreaseQuantity = useCallback((productId) => {
    if (!productId) return { success: false };

    // Simplificamos el bloqueo para permitir operaciones rápidas
    if (incrementLocks.current[productId]) {
      console.log('Operación rápida detectada (decremento):', productId);
    }

    const item = items.find(item => item.id === productId);
    if (!item || item.quantity <= 1) {
      return { success: false };
    }

    // Actualización optimista - actualizamos UI inmediatamente
    dispatch(updateQuantity({ id: productId, quantity: item.quantity - 1 }));
    
    // Marcar como bloqueado brevemente
    incrementLocks.current[productId] = true;
    
    // Sincronizar con el servidor en segundo plano
    setTimeout(() => {
      if (uid) dispatch(syncCartWithServer());
      // Liberar bloqueo rápidamente
      incrementLocks.current[productId] = false;
    }, 300);
    
    return { success: true };
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