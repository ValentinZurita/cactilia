import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB } from '../../../config/firebase/firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { FirebaseFunctions } from '../../../config/firebase/firebaseConfig';

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
    try {
      // Guardar el mensaje en Firestore
      const contactRef = await addDoc(collection(FirebaseDB, 'contact_messages'), {
        ...contactData,
        createdAt: serverTimestamp(),
        status: 'new' // nuevo, leído, respondido
      });
      
      return { 
        success: true, 
        messageId: contactRef.id 
      };
    } catch (error) {
      console.error('Error al guardar mensaje de contacto:', error);
      throw error;
    }
  },
  
  /**
   * Enviar un email de contacto
   * @param {Object} data - Datos del mensaje y destinatario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  sendContactEmail: async (data) => {
    try {
      // Verificar que tenga los campos requeridos
      if (!data.name || !data.email || !data.message) {
        throw new Error('Faltan campos requeridos para enviar el mensaje');
      }
      
      if (!data.recipientEmail) {
        throw new Error('No se ha configurado un correo de destino');
      }
      
      // Llamar a la Cloud Function para enviar el email
      const sendContactEmailFn = httpsCallable(FirebaseFunctions, 'sendContactEmail');
      const result = await sendContactEmailFn(data);
      
      return result.data;
    } catch (error) {
      console.error('Error al enviar email de contacto:', error);
      throw error;
    }
  },
  
  /**
   * Procesar un mensaje de contacto completo (guardar y enviar)
   * @param {Object} contactData - Datos del formulario
   * @param {string} recipientEmail - Email del destinatario
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  processContactForm: async (contactData, recipientEmail) => {
    try {
      // 1. Guardar el mensaje en la base de datos
      const saveResult = await contactService.saveContactMessage(contactData);
      
      // 2. Enviar el email con los datos del formulario
      const emailResult = await contactService.sendContactEmail({
        ...contactData,
        recipientEmail,
        messageId: saveResult.messageId
      });
      
      return {
        success: true,
        messageId: saveResult.messageId,
        emailSent: emailResult.success
      };
    } catch (error) {
      console.error('Error al procesar formulario de contacto:', error);
      throw error;
    }
  }
}; 