/**
 * Punto de entrada centralizado para todas las configuraciones
 * Este archivo facilita la importación de configuraciones desde cualquier parte de la aplicación
 */

// Importar y exportar configuraciones
export { default as appConfig } from './app';
export * from './app';

// Exportar configuración de Firebase
export * as firebaseConfig from './firebase';

// Exportar configuración de Stripe
export * as stripeConfig from './stripe';