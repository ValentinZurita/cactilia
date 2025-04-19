/**
 * Configuración central de la aplicación
 * Este archivo centraliza todas las configuraciones y constantes importantes de la aplicación
 */

// Entorno de la aplicación
export const APP_ENV = import.meta.env.MODE || 'development';
export const IS_DEVELOPMENT = APP_ENV === 'development';
export const IS_PRODUCTION = APP_ENV === 'production';

// URLs de la aplicación
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'Cactilia',
  description: 'Tienda de productos hechos de cactus',
  version: import.meta.env.PACKAGE_VERSION || '0.0.0',
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en'],
  defaultCurrency: 'MXN',
  defaultPageSize: 12,
  maxUploadSizeMB: 5,
  contactEmail: 'contacto@cactilia.com',
  social: {
    instagram: 'https://instagram.com/cactilia',
    facebook: 'https://facebook.com/cactilia',
    twitter: 'https://twitter.com/cactilia',
  }
};

// Configuración para pagos
export const PAYMENT_CONFIG = {
  supportedMethods: ['card', 'oxxo'],
  minimumOrderAmount: 50, // MXN
};

// Configuración para envíos
export const SHIPPING_CONFIG = {
  domesticShippingMethods: ['standard', 'express'],
  internationalShippingMethods: ['standard'],
  freeShippingThreshold: 1000, // MXN
};

// Constantes para rutas de navegación
export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  PRODUCT: '/product',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ACCOUNT: '/account',
  ORDERS: '/account/orders',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_CUSTOMERS: '/admin/customers',
};

// Constantes para mensajes de error
export const ERROR_MESSAGES = {
  GENERAL: 'Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.',
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.',
    EMAIL_ALREADY_IN_USE: 'Este correo ya está en uso. Por favor, utiliza otro o inicia sesión.',
    WEAK_PASSWORD: 'La contraseña es demasiado débil. Debe tener al menos 8 caracteres.',
  },
  PAYMENT: {
    DECLINED: 'Tu tarjeta fue declinada. Por favor, intenta con otro método de pago.',
    INSUFFICIENT_FUNDS: 'Fondos insuficientes en la tarjeta.',
    PROCESSING_ERROR: 'Error al procesar el pago. Por favor, inténtalo de nuevo.',
  },
};

// Exportar todas las configuraciones
export default {
  APP_ENV,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  APP_URL,
  API_URL,
  APP_CONFIG,
  PAYMENT_CONFIG,
  SHIPPING_CONFIG,
  ROUTES,
  ERROR_MESSAGES,
};