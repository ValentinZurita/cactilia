/**
 * Utilidades para validación
 */

/**
 * Valida un correo electrónico
 *
 * @param {string} email - Email a validar
 * @returns {boolean} - Si el email es válido
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida un RFC mexicano
 *
 * @param {string} rfc - RFC a validar
 * @returns {boolean} - Si el RFC es válido
 */
export const isValidRFC = (rfc) => {
  if (!rfc) return false;

  // Expresión regular para validar RFC
  const rfcRegex = /^([A-ZÑ&]{3,4})(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01]))([A-Z\d]{2})([A\d])$/;
  return rfcRegex.test(rfc);
};

/**
 * Valida un código postal mexicano
 *
 * @param {string} zipCode - Código postal a validar
 * @returns {boolean} - Si el código postal es válido
 */
export const isValidZipCode = (zipCode) => {
  if (!zipCode) return false;

  // Expresión regular para validar código postal de México (5 dígitos)
  const zipRegex = /^\d{5}$/;
  return zipRegex.test(zipCode);
};

/**
 * Valida una tarjeta de crédito
 *
 * @param {string} cardNumber - Número de tarjeta
 * @returns {boolean} - Si la tarjeta es válida
 */
export const isValidCreditCard = (cardNumber) => {
  if (!cardNumber) return false;

  // Eliminar espacios y guiones
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  // Verificar si solo contiene dígitos y tiene longitud válida
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  // Algoritmo de Luhn (módulo 10)
  let sum = 0;
  let shouldDouble = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};