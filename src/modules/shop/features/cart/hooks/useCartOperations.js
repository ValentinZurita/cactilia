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
 * Helper para mostrar información detallada sobre reglas de envío
 * @param {Object} product - Producto a analizar
 */
const logShippingInfo = async (product) => {
  if (!product) return;
  
  // En algunos casos, el producto puede estar anidado en sí mismo
  // Esto ocurre cuando se pasa un objeto de tipo {product: {...}}
  const actualProduct = product.product || product;
  
  console.group(`🚚 Información de envío para: ${actualProduct.name || actualProduct.id}`);
  
  try {
    console.log('🔍 Objeto producto completo:', actualProduct);
    
    // Revisar propiedades directamente para depuración
    const shippingKeys = [];
    Object.keys(actualProduct).forEach(key => {
      if (key.toLowerCase().includes('shipping')) {
        console.log(`🔑 Propiedad de envío encontrada: ${key} =`, actualProduct[key]);
        shippingKeys.push(key);
      }
    });
    
    if (shippingKeys.length === 0) {
      console.warn(`⚠️ ALERTA: El producto no tiene ninguna propiedad relacionada con envío`);
      
      // Intentar obtener el producto directamente desde Firebase solo para diagnóstico
      try {
        console.log('🔄 Intentando obtener producto directamente desde Firebase para diagnóstico...');
        
        // Importación dinámica para evitar dependencia circular
        const { doc, getDoc } = await import('firebase/firestore');
        const { FirebaseDB } = await import('../../../../../config/firebase/firebaseConfig.js');
        
        const productRef = doc(FirebaseDB, 'products', actualProduct.id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          console.log('📊 Datos directos de Firebase:', {
            id: actualProduct.id,
            name: productData.name,
            shippingRuleId: productData.shippingRuleId,
            shippingRuleIds: productData.shippingRuleIds
          });
          
          // Usar datos de Firebase para el diagnóstico
          if (productData.shippingRuleId || (productData.shippingRuleIds && productData.shippingRuleIds.length > 0)) {
            console.warn('⚠️ PROBLEMA DETECTADO: El producto tiene reglas de envío en Firebase pero se perdieron al cargarlo en la aplicación');
          }
        } else {
          console.warn('⚠️ No se encontró el producto en Firebase');
        }
      } catch (error) {
        console.error('❌ Error al intentar verificar datos en Firebase:', error);
      }
    }
    
    // Extraer IDs de reglas de envío del producto considerando varios escenarios
    let ruleIds = [];
    
    // Verificar si existe shippingRuleIds como array
    if (actualProduct.shippingRuleIds && Array.isArray(actualProduct.shippingRuleIds) && actualProduct.shippingRuleIds.length > 0) {
      ruleIds = [...actualProduct.shippingRuleIds];
      console.log('📋 Usando shippingRuleIds del producto');
    } 
    // Si no hay shippingRuleIds pero hay shippingRuleId
    else if (actualProduct.shippingRuleId) {
      ruleIds = [actualProduct.shippingRuleId];
      console.log('📋 Usando shippingRuleId individual del producto');
    }
    
    // Información del producto con detalle de reglas encontradas
    console.log(`📦 Producto: ${actualProduct.name || actualProduct.id}`, {
      id: actualProduct.id,
      peso: actualProduct.weight || 0,
      precio: actualProduct.price || 0,
      tieneReglasEnvio: ruleIds.length > 0,
      reglasAsignadas: ruleIds,
      shippingRuleId: actualProduct.shippingRuleId,
      shippingRuleIds: actualProduct.shippingRuleIds 
        ? Array.isArray(actualProduct.shippingRuleIds) ? actualProduct.shippingRuleIds : 'No es array' 
        : 'No definido'
    });
    
    // PATCH TEMPORAL para producto de ejemplo específico
    if (actualProduct.id === 'e9lK7PMv83TCwSwngDDi' && ruleIds.length === 0) {
      console.log('🔧 PATCH: Usando reglas de envío conocidas para producto de prueba');
      ruleIds = ['x8tRGxol2MOr8NMzeAPp', 'fyfkhfITejBjMASFCMZ2'];
    }
    
    if (ruleIds.length === 0) {
      console.warn('⚠️ El producto no tiene reglas de envío asignadas o están en formato incorrecto');
      console.groupEnd();
      return;
    }
    
    // Obtener y mostrar cada regla de envío
    for (const ruleId of ruleIds) {
      if (!ruleId) {
        console.warn('⚠️ ID de regla inválido o vacío');
        continue;
      }
      
      console.log(`🔍 Consultando regla de envío: ${ruleId}`);
      
      try {
        const rule = await fetchShippingRuleById(ruleId);
        
        if (!rule) {
          console.warn(`⚠️ Regla de envío no encontrada: ${ruleId}`);
          continue;
        }
        
        console.log(`📋 Regla de envío: ${rule.zona || 'Sin nombre'} (${ruleId})`, {
          zona: rule.zona,
          envioGratis: rule.envio_gratis ? 'Sí' : 'No',
          montoMinimoEnvioGratis: rule.envio_gratis_monto_minimo || 'No aplica',
          codigosPostales: rule.zipcodes || [],
          activa: rule.activo
        });
        
        // Mostrar opciones de mensajería
        if (rule.opciones_mensajeria && Array.isArray(rule.opciones_mensajeria)) {
          console.log(`📨 Opciones de mensajería (${rule.opciones_mensajeria.length}):`);
          
          rule.opciones_mensajeria.forEach((opcion, index) => {
            console.log(`  ${index + 1}. ${opcion.nombre} (${opcion.label || 'Sin etiqueta'})`, {
              precio: opcion.precio || 0,
              tiempoEntrega: opcion.tiempo_entrega || `${opcion.minDays || '?'}-${opcion.maxDays || '?'} días`,
              pesoMaximo: opcion.peso_maximo || 'Sin límite',
              configuracionPaquetes: opcion.configuracion_paquetes || 'No configurado'
            });
          });
        } else {
          console.warn('⚠️ La regla no tiene opciones de mensajería configuradas');
        }
      } catch (error) {
        console.error(`❌ Error al obtener información de la regla ${ruleId}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error al procesar información de envío:', error);
  }
  
  console.groupEnd();
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