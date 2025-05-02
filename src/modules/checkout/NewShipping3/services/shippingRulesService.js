/**
 * Servicios para interactuar con la colección de reglas de envío (zonas_envio) en Firestore
 */
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore'
import { FirebaseDB } from '../../../../config/firebase/firebaseConfig'
import { FIRESTORE_COLLECTIONS } from '../constants/index.js'

/**
 * Obtiene todas las reglas de envío activas
 * @returns {Promise<Array>} - Lista de reglas activas
 */
export const fetchAllShippingRules = async () => {
  try {
    // Consultar reglas activas
    const shippingRulesQuery = query(
      collection(FirebaseDB, FIRESTORE_COLLECTIONS.SHIPPING_RULES),
      where('activo', '==', true),
    )

    const querySnapshot = await getDocs(shippingRulesQuery)

    const rules = []
    querySnapshot.forEach(doc => {
      rules.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    console.log(`📏 Se encontraron ${rules.length} reglas de envío en total`)
    return rules
  } catch (error) {
    console.error('Error al obtener reglas de envío:', error)
    return []
  }
}

/**
 * Obtiene una regla de envío específica por ID
 * @param {string} ruleId - ID de la regla de envío
 * @returns {Promise<Object|null>} - Regla de envío o null si no existe
 */
export const fetchShippingRuleById = async (ruleId) => {
  try {
    if (!ruleId) return null

    const ruleRef = doc(FirebaseDB, FIRESTORE_COLLECTIONS.SHIPPING_RULES, ruleId)
    const ruleDoc = await getDoc(ruleRef)

    if (!ruleDoc.exists()) {
      return null
    }

    return {
      id: ruleDoc.id,
      ...ruleDoc.data(),
    }
  } catch (error) {
    console.error(`Error al obtener regla de envío con ID ${ruleId}:`, error)
    return null
  }
}

/**
 * Obtiene múltiples reglas de envío por sus IDs
 * @param {Array<string>} ruleIds - Lista de IDs de reglas de envío
 * @returns {Promise<Array>} - Lista de reglas de envío encontradas
 */
export const fetchShippingRulesByIds = async (ruleIds) => {
  try {
    if (!ruleIds || !Array.isArray(ruleIds) || ruleIds.length === 0) {
      return []
    }

    // Obtener cada regla individualmente (no hay where-in en Firestore JS SDK v9)
    const rulesPromises = ruleIds.map(id => fetchShippingRuleById(id))
    const rulesResults = await Promise.all(rulesPromises)

    // Filtrar resultados nulos
    return rulesResults.filter(rule => rule !== null)
  } catch (error) {
    console.error('Error al obtener múltiples reglas de envío:', error)
    return []
  }
}