/**
 * Valida los campos del formulario de contacto y envía el mensaje
 * @param {Object} formData - Datos del formulario de contacto
 * @param {string} formData.name - Nombre del usuario
 * @param {string} formData.email - Correo electrónico del usuario
 * @param {string} formData.subject - Asunto del mensaje
 * @param {string} formData.message - Contenido del mensaje
 * @returns {Promise<Object>} - Resultado de la operación
 * @throws {Error} - Si hay errores en la validación o en el envío
 */
export const validateAndSendContactForm = async (formData) => {
  // Validar que existan todos los campos requeridos
  if (!formData || typeof formData !== 'object') {
    throw new Error("Se requieren los datos del formulario");
  }
  
  const { name, email, subject, message } = formData;
  
  // Validar campos individuales
  if (!name || name.trim().length < 2) {
    return {
      success: false,
      field: 'name',
      error: 'El nombre es obligatorio y debe tener al menos 2 caracteres'
    };
  }
  
  // Validar formato de email con una expresión regular simple
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      field: 'email',
      error: 'El correo electrónico no es válido'
    };
  }
  
  // Validar asunto
  if (!subject || subject.trim().length < 3) {
    return {
      success: false,
      field: 'subject',
      error: 'El asunto es obligatorio y debe tener al menos 3 caracteres'
    };
  }
  
  // Validar mensaje
  if (!message || message.trim().length < 10) {
    return {
      success: false,
      field: 'message',
      error: 'El mensaje es obligatorio y debe tener al menos 10 caracteres'
    };
  }
  
  try {
    // Simular envío del formulario a una API o servicio
    // En una implementación real, aquí se enviaría a un servicio o API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Devolver resultado exitoso
    return {
      success: true,
      message: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.'
    };
  } catch (error) {
    console.error('Error al enviar el formulario de contacto:', error);
    throw new Error('No se pudo enviar el mensaje. Por favor intente más tarde.');
  }
}; 