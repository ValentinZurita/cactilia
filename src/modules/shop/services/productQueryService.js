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

      // Obtener los datos del producto
      const productData = productSnap.data();
      
      // Logs de diagnóstico para shippingRules
      console.log(`[ProductQueryService] Producto ${productId} - ${productData.name}:`, {
        tieneShippingRuleId: !!productData.shippingRuleId,
        shippingRuleId: productData.shippingRuleId || 'No definido',
        tieneShippingRuleIds: !!productData.shippingRuleIds && Array.isArray(productData.shippingRuleIds),
        shippingRuleIds: productData.shippingRuleIds || [],
      });
      
      // Asegurarnos de que las reglas de envío existan correctamente
      // Priorizar el arreglo shippingRuleIds, pero mantener compatibilidad con shippingRuleId
      let finalShippingRuleIds = [];
      
      if (productData.shippingRuleIds && Array.isArray(productData.shippingRuleIds) && productData.shippingRuleIds.length > 0) {
        finalShippingRuleIds = [...productData.shippingRuleIds];
        console.log(`[ProductQueryService] Usando ${finalShippingRuleIds.length} reglas de envío del arreglo shippingRuleIds`);
      } else if (productData.shippingRuleId) {
        finalShippingRuleIds = [productData.shippingRuleId];
        console.log(`[ProductQueryService] Usando regla de envío individual: ${productData.shippingRuleId}`);
      } else {
        console.warn(`[ProductQueryService] Producto ${productId} - ${productData.name} no tiene reglas de envío asignadas`);
      }
      
      // Crear objeto final del producto con reglas normalizadas
      return {
        id: productId,
        ...productData,
        // Asegurarnos de que siempre existan ambos campos y sean coherentes
        shippingRuleIds: finalShippingRuleIds,
        shippingRuleId: finalShippingRuleIds.length > 0 ? finalShippingRuleIds[0] : null
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
   * @param {string} criteria.shippingRuleId - ID de la regla de envío
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
        shippingRuleId = '',
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

      if (shippingRuleId) {
        constraints.push(where('shippingRuleId', '==', shippingRuleId));
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
  },

  /**
   * Obtiene productos asociados a una regla de envío específica
   *
   * @param {string} shippingRuleId - ID de la regla de envío
   * @param {number} count - Número máximo de productos
   * @returns {Promise<Array<Object>>} Lista de productos con la regla de envío especificada
   */
  async getProductsByShippingRule(shippingRuleId, count = 20) {
    return this.searchProducts({
      shippingRuleId: shippingRuleId,
      maxResults: count
    });
  }
};

export default ProductQueryService;