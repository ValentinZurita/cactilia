/**
 * Configuración centralizada de la aplicación
 * Incluye configuración para servicios externos como Stripe, etc.
 */

// Cache para evitar cargar configuración múltiples veces
let configCache = null;

/**
 * Obtiene la configuración de la aplicación
 * @returns {Object} Configuración de la aplicación
 */
export const getConfig = () => {
  // Si ya tenemos la configuración en caché, la devolvemos
  if (configCache) {
    return configCache;
  }

  // Configuración base
  const config = {
    app: {
      name: 'Cactilia',
      version: '1.0.0',
      environment: import.meta.env.MODE || 'development'
    },
    stripe: {
      publicKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      // Otras configuraciones específicas de Stripe
      options: {
        locale: 'es-MX',
        appearance: {
          theme: 'stripe',
          labels: 'floating',
          variables: {
            colorPrimary: '#34C749', // Verde de tu tema
          }
        }
      }
    },
    // Otras configuraciones futuras
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || '',
      timeout: 15000
    }
  };

  // Guardar en caché para futuras llamadas
  configCache = config;

  return config;
};

/**
 * Obtiene la configuración de Stripe
 * @returns {Object} Configuración de Stripe
 */
export const getStripeConfig = () => {
  const config = getConfig();
  return config.stripe;
};

/**
 * Resetea la caché de configuración
 * Útil para pruebas o cuando cambian variables de entorno en tiempo de ejecución
 */
export const resetConfigCache = () => {
  configCache = null;
};

export default {
  getConfig,
  getStripeConfig,
  resetConfigCache
};