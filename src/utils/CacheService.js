/**
 * Servicio de caché para mejorar el rendimiento de la aplicación
 */
export const CacheService = {
  // Almacén de caché
  _cache: {},

  /**
   * Guarda un valor en caché
   * @param {string} key - Clave única
   * @param {any} value - Valor a almacenar
   * @param {number} ttlMinutes - Tiempo de vida en minutos (0 = sin expiración)
   */
  set: function(key, value, ttlMinutes = 5) {
    const expiryTime = ttlMinutes > 0 ? Date.now() + (ttlMinutes * 60 * 1000) : null;

    this._cache[key] = {
      value: value,
      expiry: expiryTime
    };

    return value;
  },

  /**
   * Obtiene un valor de la caché
   * @param {string} key - Clave a buscar
   * @returns {any|null} - Valor almacenado o null si no existe o expiró
   */
  get: function(key) {
    const item = this._cache[key];

    // Si no existe el item
    if (!item) return null;

    // Si tiene tiempo de expiración y ya pasó
    if (item.expiry && item.expiry < Date.now()) {
      delete this._cache[key];
      return null;
    }

    return item.value;
  },

  /**
   * Obtiene un valor de caché o lo carga si no existe
   * @param {string} key - Clave de caché
   * @param {Function} fetchFunction - Función que devuelve una promesa con los datos
   * @param {number} ttlMinutes - Tiempo de vida en minutos
   * @returns {Promise<any>} - Datos de caché o cargados
   */
  getOrFetch: async function(key, fetchFunction, ttlMinutes = 5) {
    // Verificar caché primero
    const cachedData = this.get(key);
    if (cachedData !== null) {
      return cachedData;
    }

    // Si no está en caché, cargar usando la función provista
    try {
      const result = await fetchFunction();
      // Solo guardar en caché si la operación fue exitosa
      if (result && (result.ok !== false)) {
        return this.set(key, result, ttlMinutes);
      }
      return result;
    } catch (error) {
      console.error(`Error cargando datos para caché (${key}):`, error);
      throw error;
    }
  },

  /**
   * Elimina una clave de la caché
   * @param {string} key - Clave a eliminar
   */
  remove: function(key) {
    delete this._cache[key];
  },

  /**
   * Limpia toda la caché
   */
  clear: function() {
    this._cache = {};
  }
};