/**
 * Funciones auxiliares diversas
 */

/**
 * Genera un ID único
 *
 * @param {string} prefix - Prefijo para el ID
 * @returns {string} - ID único
 */
export const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${randomStr}`;
};

/**
 * Filtra productos por categoría
 *
 * @param {Array} products - Lista de productos
 * @param {string} category - Categoría a filtrar
 * @returns {Array} - Productos filtrados
 */
export const filterProductsByCategory = (products, category) => {
  if (!category) return products;
  return products.filter(product => product.category?.toLowerCase() === category.toLowerCase());
};

/**
 * Ordena productos por precio
 *
 * @param {Array} products - Lista de productos
 * @param {string} order - Orden ('asc' o 'desc')
 * @returns {Array} - Productos ordenados
 */
export const sortProductsByPrice = (products, order = 'asc') => {
  return [...products].sort((a, b) => {
    return order === 'asc' ? a.price - b.price : b.price - a.price;
  });
};

/**
 * Filtra productos por término de búsqueda
 *
 * @param {Array} products - Lista de productos
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} - Productos filtrados
 */
export const filterProductsBySearchTerm = (products, searchTerm) => {
  if (!searchTerm) return products;

  const term = searchTerm.toLowerCase().trim();
  return products.filter(product => {
    const name = product.name?.toLowerCase() || '';
    const desc = product.desc?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';

    return name.includes(term) || desc.includes(term) || category.includes(term);
  });
};

/**
 * Obtiene productos destacados
 *
 * @param {Array} products - Lista de productos
 * @returns {Array} - Productos destacados
 */
export const getFeaturedProducts = (products) => {
  return products.filter(product => product.featured);
};

/**
 * Agrupa productos por categoría
 *
 * @param {Array} products - Lista de productos
 * @returns {Object} - Productos agrupados por categoría
 */
export const groupProductsByCategory = (products) => {
  return products.reduce((acc, product) => {
    const category = product.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});
};