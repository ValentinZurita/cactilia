/**
 * Utilidades de validación para formularios y datos
 */

/**
 * Valida si un email tiene formato correcto
 * @param {string} email - El email a validar
 * @returns {boolean} - true si el email es válido
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida si un número de teléfono tiene formato válido (México)
 * @param {string} phone - El número de teléfono a validar
 * @returns {boolean} - true si el teléfono es válido
 */
export const isValidMexicanPhone = (phone) => {
  // Formato para números mexicanos (10 dígitos)
  const regex = /^[0-9]{10}$/;
  return regex.test(phone.replace(/\s+/g, ''));
};

/**
 * Valida si una contraseña cumple con requisitos mínimos de seguridad
 * @param {string} password - La contraseña a validar
 * @returns {Object} - Objeto con resultado y mensaje
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una letra mayúscula' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos un número' };
  }
  
  return { valid: true, message: 'Contraseña válida' };
};

/**
 * Valida un código postal mexicano
 * @param {string} zipCode - El código postal a validar
 * @returns {boolean} - true si el código postal es válido
 */
export const isValidMexicanZipCode = (zipCode) => {
  const regex = /^[0-9]{5}$/;
  return regex.test(zipCode);
};

/**
 * Valida un RFC mexicano (formato básico)
 * @param {string} rfc - El RFC a validar
 * @returns {boolean} - true si el RFC tiene un formato válido
 */
export const isValidMexicanRFC = (rfc) => {
  // Validación básica de formato (no verifica dígito verificador)
  const regex = /^([A-ZÑ&]{3,4})(\d{6})([A-Z0-9]{3})$/;
  return regex.test(rfc);
};

/**
 * Función para crear un validador personalizado
 * @param {Function} validationFn - Función de validación
 * @param {string} errorMessage - Mensaje de error
 * @returns {Function} - Función validadora
 */
export const createValidator = (validationFn, errorMessage) => {
  return (value) => {
    const isValid = validationFn(value);
    return isValid ? undefined : errorMessage;
  };
};