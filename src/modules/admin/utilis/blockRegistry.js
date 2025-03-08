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
 */
export const registerBlockType = (type, config) => {
  if (blockTypes[type]) {
    console.warn(`Block type '${type}' already registered. Overwriting...`);
  }

  blockTypes[type] = config;
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
 * @returns {Array} - Array de objetos con información de los bloques
 */
export const getAllBlockTypes = () => {
  return Object.keys(blockTypes).map(type => ({
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