/**
 * Punto de entrada centralizado para todas las utilidades
 * Este archivo facilita la importación de utilidades desde cualquier parte de la aplicación
 */

// Exportar utilidades agrupadas por categoría
export * as firebase from './firebase';
export * as formatting from './formatting';
export * as validation from './validation';
export * as storage from './storage';

// Exportar CacheService directamente para mantener compatibilidad con código existente
export { CacheService } from './storage';

// Re-exportar funciones comunes para facilitar su uso
export { formatDate, formatCurrency, truncateText, slugify } from './formatting';
export { isValidEmail, isValidMexicanPhone, validatePassword } from './validation';
export { saveToLocalStorage, getFromLocalStorage } from './storage';