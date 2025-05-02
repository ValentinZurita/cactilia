import { apiService } from '../../shop/services/api.js'
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import { FirebaseDB } from '@config/firebase/firebaseConfig.js'
import { FIRESTORE_COLLECTIONS } from '../constants/shippingConstants.js'

/**
 * Obtiene todas las direcciones de un usuario desde Firestore
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de direcciones ordenadas por creación
 */
export const getUserAddresses = async (userId) => {
  try {
    if (!userId) return []

    const addressesQuery = query(
      collection(FirebaseDB, FIRESTORE_COLLECTIONS.ADDRESSES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(addressesQuery)

    const addresses = []
    querySnapshot.forEach(doc => {
      addresses.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return addresses
  } catch (error) {
    console.error(`Error al obtener direcciones del usuario ${userId}:`, error)
    return []
  }
}

/**
 * Obtiene una dirección específica por ID desde Firestore
 * @param {string} addressId - ID de la dirección
 * @returns {Promise<Object|null>} - Dirección o null si no existe
 */
export const getAddressById = async (addressId) => {
  try {
    if (!addressId) return null

    const addressRef = doc(FirebaseDB, FIRESTORE_COLLECTIONS.ADDRESSES, addressId)
    const addressDoc = await getDoc(addressRef)

    if (!addressDoc.exists()) {
      return null
    }

    return {
      id: addressDoc.id,
      ...addressDoc.data(),
    }
  } catch (error) {
    console.error(`Error al obtener dirección con ID ${addressId}:`, error)
    return null
  }
}

/**
 * Guarda una nueva dirección para un usuario
 *
 * @param {string} userId - ID del usuario
 * @param {Object} addressData - Datos de la dirección
 * @param {boolean} isDefault - Si es la dirección predeterminada
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const saveAddress = async (userId, addressData, isDefault = false) => {
  if (!userId || !addressData) {
    return { ok: false, error: 'ID de usuario y datos requeridos' }
  }

  try {
    // Si es dirección predeterminada, usar Cloud Function
    if (isDefault) {
      return await apiService.callCloudFunction('saveAddress', {
        address: addressData,
        isDefault,
      })
    }

    // Si no es predeterminada, guardar directamente
    return await apiService.createDocument(FIRESTORE_COLLECTIONS.ADDRESSES, { ...addressData, userId }, null)
  } catch (error) {
    console.error('Error al guardar dirección:', error)
    return { ok: false, error: error.message }
  }
}