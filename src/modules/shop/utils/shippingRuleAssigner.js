/**
 * Módulo para asignar automáticamente reglas de envío a productos
 * Soluciona el problema de productos sin reglas de envío
 */

import { fetchShippingRules } from '../../admin/shipping/api/shippingApi.js';

// ID de la regla de envío nacional por defecto (ajustar según corresponda)
// Este ID debe existir en la colección zonas_envio
const DEFAULT_NATIONAL_RULE_ID = "fyfkhfITejBjMASFCMZ2";

// Cache para evitar múltiples llamadas a Firebase
let cachedDefaultRules = null;

/**
 * Obtiene reglas de envío predeterminadas desde Firestore
 * @returns {Promise<Array>} Lista de IDs de reglas predeterminadas
 */
export const getDefaultShippingRuleIds = async () => {
  // Si ya tenemos las reglas en caché, usarlas
  if (cachedDefaultRules) {
    return cachedDefaultRules;
  }

  try {
    // Intentar obtener reglas activas desde Firestore
    const rules = await fetchShippingRules(true);
    
    if (rules && rules.length > 0) {
      // Filtrar reglas nacionales/principales
      const nationalRules = rules.filter(
        rule => rule.tipo === 'nacional' || rule.cobertura === 'nacional'
      );
      
      if (nationalRules.length > 0) {
        // Usar reglas nacionales como predeterminadas
        cachedDefaultRules = nationalRules.map(rule => rule.id);
        console.log('✅ Reglas nacionales encontradas:', cachedDefaultRules);
        return cachedDefaultRules;
      }
      
      // Si no hay reglas nacionales, usar la primera regla activa
      cachedDefaultRules = [rules[0].id];
      console.log('⚠️ No se encontraron reglas nacionales, usando primera regla:', cachedDefaultRules);
      return cachedDefaultRules;
    }
  } catch (error) {
    console.error('Error al obtener reglas de envío:', error);
  }
  
  // Si hay algún problema, usar el ID hardcodeado
  console.warn('⚠️ Usando ID de regla de envío hardcodeado:', DEFAULT_NATIONAL_RULE_ID);
  return [DEFAULT_NATIONAL_RULE_ID];
};

/**
 * Asegura que un producto tenga reglas de envío válidas
 * Si no tiene reglas, le asigna las predeterminadas
 * 
 * @param {Object} product - Producto a validar
 * @returns {Object} Producto con reglas de envío garantizadas
 */
export const ensureProductHasShippingRules = async (product) => {
  // Si el producto no existe, retornar sin cambios
  if (!product) {
    return product;
  }
  
  // Si ya tiene reglas de envío válidas, no hacer nada
  const hasRuleIds = product.shippingRuleIds && 
                     Array.isArray(product.shippingRuleIds) && 
                     product.shippingRuleIds.length > 0;
                     
  const hasRuleId = product.shippingRuleId && 
                    typeof product.shippingRuleId === 'string' && 
                    product.shippingRuleId.trim() !== '';
  
  if (hasRuleIds || hasRuleId) {
    return product;
  }
  
  // No tiene reglas, obtener reglas predeterminadas
  const defaultRuleIds = await getDefaultShippingRuleIds();
  
  // Crear copia del producto con las reglas asignadas
  const updatedProduct = { ...product };
  
  updatedProduct.shippingRuleIds = defaultRuleIds;
  updatedProduct.shippingRuleId = defaultRuleIds[0];
  
  console.log(`🚚 Producto sin reglas de envío: "${product.name || product.id}". Asignando regla predeterminada:`, defaultRuleIds);
  
  return updatedProduct;
};

/**
 * Asegura que todos los productos en el carrito tengan reglas de envío
 * 
 * @param {Array} cartItems - Items del carrito a validar
 * @returns {Promise<Array>} Items del carrito con reglas de envío garantizadas
 */
export const ensureCartItemsHaveShippingRules = async (cartItems) => {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return cartItems;
  }
  
  console.log(`🔍 Verificando reglas de envío para ${cartItems.length} productos del carrito`);
  
  const updatedItems = await Promise.all(
    cartItems.map(async (item) => {
      // Si el producto está dentro de item.product
      if (item.product) {
        const updatedProduct = await ensureProductHasShippingRules(item.product);
        return { ...item, product: updatedProduct };
      }
      
      // Si el producto es directamente el item
      return await ensureProductHasShippingRules(item);
    })
  );
  
  // Contar productos actualizados
  const updatedCount = updatedItems.filter((item, index) => {
    const origProduct = cartItems[index].product || cartItems[index];
    const newProduct = item.product || item;
    
    const origHasRules = (origProduct.shippingRuleIds && origProduct.shippingRuleIds.length > 0) ||
                         (origProduct.shippingRuleId && origProduct.shippingRuleId.trim() !== '');
                         
    const newHasRules = (newProduct.shippingRuleIds && newProduct.shippingRuleIds.length > 0) ||
                         (newProduct.shippingRuleId && newProduct.shippingRuleId.trim() !== '');
                         
    return !origHasRules && newHasRules;
  }).length;
  
  if (updatedCount > 0) {
    console.log(`✅ Se asignaron reglas de envío a ${updatedCount} productos del carrito`);
  }
  
  return updatedItems;
}; 