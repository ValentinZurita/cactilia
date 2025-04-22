import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { FirebaseDB, FirebaseFunctions } from '@config/firebase/firebaseConfig.js'
import { httpsCallable } from 'firebase/functions'

/**
 * Servicio para manejar mensajes de contacto
 */
export const contactService = {
  /**
   * Guardar un mensaje de contacto en la base de datos
   * @param {Object} contactData - Datos del formulario de contacto
   * @returns {Promise<Object>} - ID del documento creado
   */
  saveContactMessage: async (contactData) => {
    console.log('🔍 GUARDANDO MENSAJE EN FIRESTORE:', contactData)

    try {
      // Guardar el mensaje en Firestore
      const contactRef = await addDoc(collection(FirebaseDB, 'contact_messages'), {
        ...contactData,
        createdAt: serverTimestamp(),
        status: 'new', // nuevo, leído, respondido
      })

      console.log('✅ MENSAJE GUARDADO EXITOSAMENTE, ID:', contactRef.id)

      return {
        success: true,
        messageId: contactRef.id,
      }
    } catch (error) {
      console.error('❌ ERROR AL GUARDAR MENSAJE DE CONTACTO:', error)
      console.error('Detalles completos:', error.toString())
      throw error
    }
  },

  /**
   * Enviar un email de contacto
   * @param {Object} data - Datos del mensaje y destinatario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  sendContactEmail: async (data) => {
    console.log('📩 ENVIANDO EMAIL DE CONTACTO:', data)

    try {
      // Verificar que tenga los campos requeridos
      if (!data.name || !data.email || !data.message) {
        console.error('❌ DATOS INCOMPLETOS:', data)
        throw new Error('Faltan campos requeridos para enviar el mensaje')
      }

      if (!data.recipientEmail) {
        console.error('❌ FALTA EMAIL DESTINO')
        throw new Error('No se ha configurado un correo de destino')
      }

      console.log('📧 Configuración de envío - Email destino:', data.recipientEmail)
      console.log('📧 Usando Firebase real (producción)')

      // Llamar a la Cloud Function para enviar el email
      console.log('🔄 Llamando a Cloud Function sendContactEmail...')
      const sendContactEmailFn = httpsCallable(FirebaseFunctions, 'sendContactEmail')

      try {
        console.log('⏳ Esperando respuesta...')
        const result = await sendContactEmailFn(data)
        console.log('✅ RESPUESTA RECIBIDA:', result)
        console.log('✅ DATA:', result.data)

        // Revisar si la respuesta contiene errores
        if (!result.data || !result.data.success) {
          console.error('❌ LA RESPUESTA NO INDICA ÉXITO:', result)
          throw new Error(result.data?.message || 'Error desconocido al enviar email')
        }

        return result.data
      } catch (callError) {
        console.error('❌ ERROR EN LA LLAMADA A CLOUD FUNCTION:', callError)
        console.error('Detalles de error:', callError.toString())
        console.error('Código:', callError.code)
        console.error('Mensaje:', callError.message)
        console.error('Detalles:', callError.details)
        throw callError
      }
    } catch (error) {
      console.error('❌ ERROR AL ENVIAR EMAIL DE CONTACTO:', error)
      throw error
    }
  },

  /**
   * Procesar un mensaje de contacto completo (guardar y enviar)
   * @param {Object} contactData - Datos del formulario
   * @param {string} recipientEmail - Email del destinatario
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  processContactForm: async (contactData, recipientEmail) => {
    console.log('🚀 PROCESANDO FORMULARIO DE CONTACTO COMPLETO')
    console.log('📋 Datos:', contactData)
    console.log('📧 Destinatario:', recipientEmail)

    try {
      // 1. Guardar el mensaje en la base de datos
      console.log('📝 Paso 1: Guardando mensaje en base de datos...')
      const saveResult = await contactService.saveContactMessage(contactData)
      console.log('✅ Mensaje guardado, ID:', saveResult.messageId)

      // 2. Enviar el email con los datos del formulario
      console.log('📧 Paso 2: Enviando email...')
      const emailResult = await contactService.sendContactEmail({
        ...contactData,
        recipientEmail,
        messageId: saveResult.messageId,
      })
      console.log('✅ Email enviado, resultado:', emailResult)

      return {
        success: true,
        messageId: saveResult.messageId,
        emailSent: emailResult.success,
        emailResult,
      }
    } catch (error) {
      console.error('❌ ERROR AL PROCESAR FORMULARIO DE CONTACTO:', error)
      throw error
    }
  },
}