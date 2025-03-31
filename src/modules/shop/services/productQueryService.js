import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { FirebaseDB } from '../../../config/firebase/firebaseConfig.js';
import { logError } from '../utils/errorLogger.js';

/**
 * Servicio especializado en operaciones de consulta de productos
 * Maneja todas las operaciones de lectura relacionadas con productos
 */
const ProductQueryService = {
  /**
   * Obtiene un producto por su ID
   *
   * @param {string} productId - ID del producto a obtener
   * @returns {Promise<Object|null>} Datos del producto o null si no existe
   */
  async getProductById(productId) {
    try {
      if (!productId) {
        console.warn('Se intentó obtener un producto sin ID');
        return null;
      }

      const productRef = doc(FirebaseDB, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        console.warn(`Producto con ID ${productId} no encontrado`);
        return null;
      }

      return {
        id: productId,
        ...productSnap.data()
      };
    } catch (error) {
      logError('Error obteniendo producto por ID', error, { productId });
      return null;
    }
  },

  /**
   * Obtiene múltiples productos por sus IDs
   *
   * @param {Array<string>} productIds - Array de IDs de productos
   * @returns {Promise<Array<Object>>} Array de productos encontrados
   */
  async getProductsByIds(productIds) {
    try {
      if (!productIds || !productIds.length) return [];

      // Eliminar duplicados
      const uniqueIds = [...new Set(productIds)];

      // Realizar consultas en paralelo para mejor rendimiento
      const promises = uniqueIds.map(id => this.getProductById(id));
      const results = await Promise.all(promises);

      // Filtrar productos no encontrados (null)
      return results.filter(product => product !== null);
    } catch (error) {
      logError('Error obteniendo múltiples productos', error, { productIds });
      return [];
    }
  },

  /**
   * Busca productos que coincidan con criterios específicos
   *
   * @param {Object} criteria - Criterios de búsqueda
   * @param {string} criteria.query - Texto a buscar en nombre/descripción
   * @param {string} criteria.category - Categoría a filtrar
   * @param {boolean} criteria.onlyActive - Solo productos activos
   * @param {boolean} criteria.onlyFeatured - Solo productos destacados
   * @param {number} criteria.maxResults - Número máximo de resultados
   * @returns {Promise<Array<Object>>} Lista de productos que coinciden
   */
  async searchProducts(criteria = {}) {
    try {
      // Valores predeterminados
      const {
        query = '',
        category = '',
        onlyActive = true,
        onlyFeatured = false,
        maxResults = 50
      } = criteria;

      // Crear consulta base
      const productsRef = collection(FirebaseDB, 'products');
      let constraints = [];

      // Añadir restricciones según criterios
      if (onlyActive) {
        constraints.push(where('active', '==', true));
      }

      if (onlyFeatured) {
        constraints.push(where('featured', '==', true));
      }

      if (category) {
        constraints.push(where('category', '==', category));
      }

      // Ejecutar consulta
      const productsQuery = query(
        productsRef,
        ...constraints,
        limit(maxResults)
      );

      const querySnapshot = await getDocs(productsQuery);
      let results = [];

      // Procesar resultados
      querySnapshot.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Filtrar por texto de búsqueda si es necesario
      if (query) {
        const normalizedQuery = query.toLowerCase();
        results = results.filter(product =>
          product.name?.toLowerCase().includes(normalizedQuery) ||
          product.description?.toLowerCase().includes(normalizedQuery)
        );
      }

      return results;
    } catch (error) {
      logError('Error en búsqueda de productos', error, { criteria });
      return [];
    }
  },

  /**
   * Obtiene productos destacados
   *
   * @param {number} count - Número de productos a obtener
   * @returns {Promise<Array<Object>>} Lista de productos destacados
   */
  async getFeaturedProducts(count = 10) {
    return this.searchProducts({
      onlyFeatured: true,
      maxResults: count
    });
  },

  /**
   * Obtiene productos por categoría
   *
   * @param {string} categoryId - ID de la categoría
   * @param {number} count - Número máximo de productos
   * @returns {Promise<Array<Object>>} Lista de productos en la categoría
   */
  async getProductsByCategory(categoryId, count = 20) {
    return this.searchProducts({
      category: categoryId,
      maxResults: count
    });
  }
};

export default ProductQueryService;