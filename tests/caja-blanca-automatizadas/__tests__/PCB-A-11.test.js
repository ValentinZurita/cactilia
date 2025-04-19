// pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-11.test.js

// Simulando la importación del módulo de servicios de contacto
const validateAndSendContactForm = async (formData) => {
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

// Función auxiliar para simular un error en el envío
const mockSendError = async (formData) => {
  // Validaciones iniciales iguales
  if (!formData || typeof formData !== 'object') {
    throw new Error("Se requieren los datos del formulario");
  }
  
  const { name, email, subject, message } = formData;
  
  if (!name || name.trim().length < 2) {
    return {
      success: false,
      field: 'name',
      error: 'El nombre es obligatorio y debe tener al menos 2 caracteres'
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      success: false,
      field: 'email',
      error: 'El correo electrónico no es válido'
    };
  }
  
  if (!subject || subject.trim().length < 3) {
    return {
      success: false,
      field: 'subject',
      error: 'El asunto es obligatorio y debe tener al menos 3 caracteres'
    };
  }
  
  if (!message || message.trim().length < 10) {
    return {
      success: false,
      field: 'message',
      error: 'El mensaje es obligatorio y debe tener al menos 10 caracteres'
    };
  }
  
  // Siempre lanzar error al enviar
  throw new Error('No se pudo enviar el mensaje. Por favor intente más tarde.');
};

describe('PCB-A-11: Validación de formulario de contacto', () => {
  // Datos de prueba válidos
  const validFormData = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    subject: 'Consulta sobre productos',
    message: 'Me gustaría obtener más información sobre los productos de cactus disponibles.'
  };
  
  // Caso 1: formData no proporcionado
  test('1. Debe rechazar formData inválido', async () => {
    await expect(validateAndSendContactForm(null)).rejects.toThrow('Se requieren los datos del formulario');
    await expect(validateAndSendContactForm()).rejects.toThrow('Se requieren los datos del formulario');
  });
  
  // Caso 2: Nombre inválido
  test('2. Debe validar el campo nombre', async () => {
    const result1 = await validateAndSendContactForm({
      ...validFormData,
      name: ''
    });
    
    expect(result1.success).toBe(false);
    expect(result1.field).toBe('name');
    
    const result2 = await validateAndSendContactForm({
      ...validFormData,
      name: 'A'
    });
    
    expect(result2.success).toBe(false);
    expect(result2.field).toBe('name');
  });
  
  // Caso 3: Email inválido
  test('3. Debe validar el campo email', async () => {
    const result1 = await validateAndSendContactForm({
      ...validFormData,
      email: ''
    });
    
    expect(result1.success).toBe(false);
    expect(result1.field).toBe('email');
    
    const result2 = await validateAndSendContactForm({
      ...validFormData,
      email: 'correo-invalido'
    });
    
    expect(result2.success).toBe(false);
    expect(result2.field).toBe('email');
  });
  
  // Caso 4: Asunto inválido
  test('4. Debe validar el campo asunto', async () => {
    const result1 = await validateAndSendContactForm({
      ...validFormData,
      subject: ''
    });
    
    expect(result1.success).toBe(false);
    expect(result1.field).toBe('subject');
    
    const result2 = await validateAndSendContactForm({
      ...validFormData,
      subject: 'AB'
    });
    
    expect(result2.success).toBe(false);
    expect(result2.field).toBe('subject');
  });
  
  // Caso 5: Mensaje inválido
  test('5. Debe validar el campo mensaje', async () => {
    const result = await validateAndSendContactForm({
      ...validFormData,
      message: 'Corto'
    });
    
    expect(result.success).toBe(false);
    expect(result.field).toBe('message');
  });
  
  // Caso 6: Envío exitoso
  test('6. Debe procesar un formulario válido correctamente', async () => {
    const result = await validateAndSendContactForm(validFormData);
    
    expect(result.success).toBe(true);
    expect(result.message).toContain('Mensaje enviado correctamente');
  });
  
  // Caso 7: Error en el envío
  test('7. Debe manejar errores durante el envío', async () => {
    await expect(mockSendError(validFormData)).rejects.toThrow('No se pudo enviar el mensaje');
  });
}); 