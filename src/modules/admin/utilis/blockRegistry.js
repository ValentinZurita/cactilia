/**
 * Sistema de registro de tipos de bloques
 * Permite registrar, recuperar y listar los diferentes tipos de bloques disponibles
 */

// Almacén de tipos de bloques
const blockTypes = {};

/**
 * Registra un nuevo tipo de bloque
 * @param {string} type - Identificador único del tipo de bloque
 * @param {Object} config - Configuración del bloque
 * @param {string} config.title - Título legible del bloque
 * @param {string} config.icon - Clase de icono (Bootstrap Icons)
 * @param {React.Component} config.editor - Componente para editar el bloque
 * @param {React.Component} config.preview - Componente para previsualizar el bloque
 * @param {Object} config.schema - Definición de los campos del bloque
 * @param {boolean} [config.experimental] - Si es una característica experimental
 */
export const registerBlockType = (type, config) => {
  if (blockTypes[type]) {
    console.warn(`Tipo de bloque '${type}' ya registrado. Sobrescribiendo...`);
  }

  blockTypes[type] = config;

  // Verificar si los componentes necesarios están presentes
  if (!config.editor) {
    console.warn(`El tipo de bloque '${type}' no tiene un componente editor definido.`);
  }

  if (!config.preview) {
    console.warn(`El tipo de bloque '${type}' no tiene un componente preview definido.`);
  }

  // Si todo está bien, confirmar registro
  console.log(`Bloque '${type}' registrado exitosamente.`);
};

/**
 * Obtiene la configuración de un tipo de bloque
 * @param {string} type - Identificador del tipo de bloque
 * @returns {Object|null} - Configuración del bloque o null si no existe
 */
export const getBlockConfig = (type) => {
  return blockTypes[type] || null;
};

/**
 * Obtiene todos los tipos de bloques registrados
 * @param {boolean} [includeExperimental=false] - Si se deben incluir bloques experimentales
 * @returns {Array} - Array de objetos con información de los bloques
 */
export const getAllBlockTypes = (includeExperimental = false) => {
  return Object.keys(blockTypes)
    .filter(type => includeExperimental || !blockTypes[type].experimental)
    .map(type => ({
      type,
      ...blockTypes[type],
    }));
};

/**
 * Verifica si un tipo de bloque existe
 * @param {string} type - Identificador del tipo de bloque
 * @returns {boolean} - true si el tipo de bloque está registrado
 */
export const blockTypeExists = (type) => {
  return !!blockTypes[type];
};

/**
 * Obtiene el componente editor para un tipo de bloque
 * @param {string} type - Identificador del tipo de bloque
 * @returns {React.Component|null} - Componente editor o null si no existe
 */
export const getBlockEditor = (type) => {
  return blockTypes[type]?.editor || null;
};

/**
 * Obtiene el componente preview para un tipo de bloque
 * @param {string} type - Identificador del tipo de bloque
 * @returns {React.Component|null} - Componente preview o null si no existe
 */
export const getBlockPreview = (type) => {
  return blockTypes[type]?.preview || null;
};

/**
 * Obtiene el schema para un tipo de bloque
 * @param {string} type - Identificador del tipo de bloque
 * @returns {Object|null} - Schema del bloque o null si no existe
 */
export const getBlockSchema = (type) => {
  return blockTypes[type]?.schema || null;
};

/**
 * Registra varios tipos de bloques a la vez
 * @param {Object} blocksConfig - Objeto con la configuración de múltiples bloques
 */
export const registerBlockTypes = (blocksConfig) => {
  Object.entries(blocksConfig).forEach(([type, config]) => {
    registerBlockType(type, config);
  });
};