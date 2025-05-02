/**
 * Servicios para interactuar con la colección de productos en Firestore
 */
import { doc, getDoc } from 'firebase/firestore'
import { FirebaseDB } from '../../../../config/firebase/firebaseConfig'
import { FIRESTORE_COLLECTIONS } from '../constants/index.js'

/**
 * Obtiene un producto específico por ID
 * @param {string} productId - ID del producto
 * @returns {Promise<Object|null>} - Producto o null si no existe
 */
export const fetchProductById = async (productId) => {
  try {
    if (!productId) return null

    const productRef = doc(FirebaseDB, FIRESTORE_COLLECTIONS.PRODUCTS, productId)
    const productDoc = await getDoc(productRef)

    if (!productDoc.exists()) {
      return null
    }

    return {
      id: productDoc.id,
      ...productDoc.data(),
    }
  } catch (error) {
    console.error(`Error al obtener producto con ID ${productId}:`, error)
    return null
  }
}

/**
 * Obtiene múltiples productos por sus IDs
 * @param {Array<string>} productIds - Lista de IDs de productos
 * @returns {Promise<Array>} - Lista de productos encontrados
 */
export const fetchProductsByIds = async (productIds) => {
  try {
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return []
    }

    // Obtener cada producto individualmente
    const productsPromises = productIds.map(id => fetchProductById(id))
    const productsResults = await Promise.all(productsPromises)

    // Filtrar resultados nulos
    return productsResults.filter(product => product !== null)
  } catch (error) {
    console.error('Error al obtener múltiples productos:', error)
    return []
  }
}

/**
 * Extrae los IDs de reglas de envío de un producto
 * @param {Object} product - Producto
 * @returns {Array<string>} - Lista de IDs de reglas de envío
 */
export const extractShippingRuleIds = (product) => {
  if (!product) return []

  // Verificar si el producto tiene shippingRuleIds como array
  if (product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
    return [...product.shippingRuleIds]
  }

  // Verificar si el producto tiene un solo ID de regla de envío
  if (product.shippingRuleId && typeof product.shippingRuleId === 'string') {
    return [product.shippingRuleId]
  }

  return []
}