/**
 * Validador de productos
 * 
 * Este módulo proporciona funciones para validar la estructura y tipos de datos
 * de los productos antes de ser utilizados en la aplicación.
 */

// Esquema que define la estructura esperada de un producto
const productSchema = {
  // Campos requeridos
  required: ['id', 'name', 'price'],
  
  // Definición de tipos y validaciones específicas
  fields: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string', required: false },
    price: { type: 'number', required: true, min: 0 },
    mainImage: { type: 'string', required: false },
    images: { type: 'array', required: false, itemType: 'string' },
    category: { type: 'string', required: false },
    categoryId: { type: 'string', required: false },
    stock: { type: 'number', required: false, default: 0 },
    weight: { type: 'number', required: false, default: 0 },
    active: { type: 'boolean', required: false, default: true },
    featured: { type: 'boolean', required: false, default: false },
    sku: { type: 'string', required: false },
    shippingRuleId: { type: 'string', required: false },
    shippingRuleIds: { type: 'array', required: false, itemType: 'string' }
  }
};

/**
 * Valida un producto contra el esquema
 * 
 * @param {Object} product - Producto a validar
 * @returns {Object} Resultado de la validación { valid, errors, warnings }
 */
export const validateProduct = (product) => {
  if (!product) {
    return {
      valid: false,
      errors: ['Producto no definido'],
      warnings: []
    };
  }

  const errors = [];
  const warnings = [];

  // Validar campos requeridos
  for (const field of productSchema.required) {
    if (product[field] === undefined || product[field] === null) {
      errors.push(`Campo requerido '${field}' no está presente`);
    }
  }

  // Validar tipos y restricciones de cada campo
  Object.entries(productSchema.fields).forEach(([fieldName, fieldSchema]) => {
    if (product[fieldName] !== undefined && product[fieldName] !== null) {
      // Validar tipo
      const actualType = Array.isArray(product[fieldName]) ? 'array' : typeof product[fieldName];
      if (actualType !== fieldSchema.type) {
        errors.push(`Campo '${fieldName}' debe ser de tipo '${fieldSchema.type}', pero es '${actualType}'`);
      }

      // Validaciones adicionales por tipo
      if (fieldSchema.type === 'number' && fieldSchema.min !== undefined && product[fieldName] < fieldSchema.min) {
        errors.push(`Campo '${fieldName}' debe ser mayor o igual a ${fieldSchema.min}`);
      }

      // Validar elementos de un array
      if (fieldSchema.type === 'array' && fieldSchema.itemType && Array.isArray(product[fieldName])) {
        product[fieldName].forEach((item, index) => {
          const itemType = typeof item;
          if (itemType !== fieldSchema.itemType) {
            warnings.push(`Elemento ${index} del campo '${fieldName}' debe ser de tipo '${fieldSchema.itemType}', pero es '${itemType}'`);
          }
        });
      }
    } else if (fieldSchema.required) {
      errors.push(`Campo requerido '${fieldName}' no está presente`);
    }
  });

  // Verificaciones específicas para campos de envío
  if (product.shippingRuleId && product.shippingRuleIds && Array.isArray(product.shippingRuleIds)) {
    if (product.shippingRuleIds.length > 0 && product.shippingRuleIds[0] !== product.shippingRuleId) {
      warnings.push(`El campo 'shippingRuleId' (${product.shippingRuleId}) no coincide con el primer elemento de 'shippingRuleIds' (${product.shippingRuleIds[0]})`);
    }
  } else if (!product.shippingRuleId && !product.shippingRuleIds) {
    warnings.push(`Producto sin propiedades de envío (shippingRuleId o shippingRuleIds)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Normaliza un producto según el esquema, estableciendo valores por defecto
 * y corrigiendo tipos de datos cuando sea posible
 * 
 * @param {Object} product - Producto a normalizar
 * @returns {Object} Producto normalizado
 */
export const normalizeProduct = (product) => {
  if (!product) return null;

  const normalized = { ...product };

  // Aplicar valores por defecto para campos faltantes
  Object.entries(productSchema.fields).forEach(([fieldName, fieldSchema]) => {
    if ((normalized[fieldName] === undefined || normalized[fieldName] === null) && fieldSchema.default !== undefined) {
      normalized[fieldName] = fieldSchema.default;
    }
  });

  // Normalizar campos específicos
  
  // Asegurar que price es un número
  if (normalized.price !== undefined && typeof normalized.price !== 'number') {
    normalized.price = parseFloat(normalized.price) || 0;
  }

  // Asegurar que stock es un número
  if (normalized.stock !== undefined && typeof normalized.stock !== 'number') {
    normalized.stock = parseInt(normalized.stock) || 0;
  }

  // Asegurar que weight es un número
  if (normalized.weight !== undefined && typeof normalized.weight !== 'number') {
    normalized.weight = parseFloat(normalized.weight) || 0;
  }

  // Normalizar campos booleanos
  ['active', 'featured'].forEach(field => {
    if (normalized[field] !== undefined && typeof normalized[field] !== 'boolean') {
      normalized[field] = Boolean(normalized[field]);
    }
  });

  // Normalizar arrays
  if (normalized.images && !Array.isArray(normalized.images)) {
    normalized.images = normalized.images ? [normalized.images] : [];
  }

  // Normalizar propiedades específicas de envío
  if (normalized.shippingRuleIds && !Array.isArray(normalized.shippingRuleIds)) {
    normalized.shippingRuleIds = normalized.shippingRuleIds ? [String(normalized.shippingRuleIds)] : [];
  }

  if (!normalized.shippingRuleIds && normalized.shippingRuleId) {
    normalized.shippingRuleIds = [normalized.shippingRuleId];
  } else if (normalized.shippingRuleIds && normalized.shippingRuleIds.length > 0 && !normalized.shippingRuleId) {
    normalized.shippingRuleId = normalized.shippingRuleIds[0];
  }

  return normalized;
};

/**
 * Valida y normaliza un producto en una sola operación
 * 
 * @param {Object} product - Producto a validar y normalizar
 * @param {boolean} logWarnings - Si es true, muestra warnings en consola
 * @returns {Object} { product: Producto normalizado, valid: boolean, errors: array }
 */
export const validateAndNormalizeProduct = (product, logWarnings = false) => {
  if (!product) {
    return { product: null, valid: false, errors: ['Producto no definido'] };
  }

  // Primero normalizar para corregir problemas solucionables
  const normalizedProduct = normalizeProduct(product);
  
  // Luego validar para identificar problemas restantes
  const { valid, errors, warnings } = validateProduct(normalizedProduct);

  // Opcionalmente mostrar warnings en consola
  if (logWarnings && warnings.length > 0) {
    console.warn(`⚠️ Advertencias para producto "${normalizedProduct.name || normalizedProduct.id}":`, warnings);
  }

  return {
    product: normalizedProduct,
    valid,
    errors,
    warnings
  };
};

export default {
  validateProduct,
  normalizeProduct,
  validateAndNormalizeProduct,
  productSchema
}; 