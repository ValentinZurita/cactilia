/**
 * Selecciona la URL de imagen más apropiada de un objeto de datos de imagen 
 * que puede contener URLs redimensionadas generadas por Firebase Extensions (e.g., Resize Images).
 *
 * Busca tamaños específicos ('large', 'medium', 'small') en el objeto `resizedUrls` 
 * y proporciona fallbacks al siguiente tamaño mayor o a la URL original si el tamaño deseado no está disponible.
 *
 * @param {Object} imgData - Objeto que contiene los datos de la imagen. 
 *                         Puede tener `url` o `src` para la original y `resizedUrls` (un mapa como {'1200x1200': '...', '600x600': '...'}).
 * @param {string} [desiredSize='medium'] - El tamaño deseado ('original', 'large', 'medium', 'small').
 * @returns {string|null} La URL de la imagen encontrada o null si no hay datos de imagen.
 */
export const getImageUrlBySize = (imgData, desiredSize = 'medium') => {
  if (!imgData) return null;

  const resized = imgData.resizedUrls; // Mapa { '1200x1200': '...', '600x600': '...', ... }
  // Intentar obtener la URL original de .url o .src
  const originalUrl = imgData.url || imgData.src; 

  // Asegurar que las claves coincidan con las generadas (_WxH.ext -> WxH)
  const largeKey = '1200x1200';
  const mediumKey = '600x600';
  const smallKey = '200x200';

  switch (desiredSize) {
    case 'original':
      return originalUrl;
    case 'large': 
      return (resized && resized[largeKey]) || originalUrl;
    case 'medium': 
      return (resized && resized[mediumKey]) || (resized && resized[largeKey]) || originalUrl;
    case 'small': 
      return (resized && resized[smallKey]) || (resized && resized[mediumKey]) || originalUrl;
    default: // Default a mediano si el tamaño no es válido o no se especifica
      console.warn(`Tamaño de imagen no reconocido o no especificado: '${desiredSize}'. Usando tamaño mediano por defecto.`);
      return (resized && resized[mediumKey]) || (resized && resized[largeKey]) || originalUrl;
  }
}; 