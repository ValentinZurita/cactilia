/**
 * Servicios para interactuar con la colección de direcciones en Firestore
 */
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore'
import { FirebaseDB } from '../../../../config/firebase/firebaseConfig'
import { FIRESTORE_COLLECTIONS } from '../constants/index.js'

/**
 * Obtiene una dirección específica por ID
 * @param {string} addressId - ID de la dirección
 * @returns {Promise<Object|null>} - Dirección o null si no existe
 */
export const fetchAddressById = async (addressId) => {
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
 * Obtiene todas las direcciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de direcciones
 */
export const fetchAddressesByUserId = async (userId) => {
  try {
    if (!userId) return []

    const addressesQuery = query(
      collection(FirebaseDB, FIRESTORE_COLLECTIONS.ADDRESSES),
      where('userId', '==', userId),
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