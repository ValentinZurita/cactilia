import { apiService } from '../../shop/services/api.js'

/**
 * Obtiene todas las direcciones de un usuario
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const getUserAddresses = async (userId) => {
  if (!userId) return { ok: false, error: 'ID de usuario requerido' }

  try {
    return await apiService.getDocuments('addresses', [], ['createdAt', 'desc'], `users/${userId}`)
  } catch (error) {
    console.error('Error al obtener direcciones:', error)
    return { ok: false, error: error.message }
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
    return await apiService.createDocument('addresses', addressData, `users/${userId}`)
  } catch (error) {
    console.error('Error al guardar dirección:', error)
    return { ok: false, error: error.message }
  }
}