/**
 * Utilidades para manejar localStorage y sessionStorage
 */

/**
 * Guarda un valor en localStorage
 * @param {string} key - Clave para guardar
 * @param {any} value - Valor a guardar
 */
export const saveToLocalStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

/**
 * Recupera un valor de localStorage
 * @param {string} key - Clave a recuperar
 * @param {any} defaultValue - Valor por defecto si no existe la clave
 * @returns {any} - Valor recuperado o defaultValue
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('Error al leer de localStorage:', error);
    return defaultValue;
  }
};

/**
 * Guarda un valor en sessionStorage
 * @param {string} key - Clave para guardar
 * @param {any} value - Valor a guardar
 */
export const saveToSessionStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error al guardar en sessionStorage:', error);
  }
};

/**
 * Recupera un valor de sessionStorage
 * @param {string} key - Clave a recuperar
 * @param {any} defaultValue - Valor por defecto si no existe la clave
 * @returns {any} - Valor recuperado o defaultValue
 */
export const getFromSessionStorage = (key, defaultValue = null) => {
  try {
    const serializedValue = sessionStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('Error al leer de sessionStorage:', error);
    return defaultValue;
  }
};

/**
 * Elimina un valor de localStorage
 * @param {string} key - Clave a eliminar
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error al eliminar de localStorage:', error);
  }
};

/**
 * Elimina un valor de sessionStorage
 * @param {string} key - Clave a eliminar
 */
export const removeFromSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error al eliminar de sessionStorage:', error);
  }
};

/**
 * Limpia todo el localStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error al limpiar localStorage:', error);
  }
};

/**
 * Limpia todo el sessionStorage
 */
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error al limpiar sessionStorage:', error);
  }
};