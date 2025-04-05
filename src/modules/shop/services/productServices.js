import StockService from './stockService';
import ProductQueryService from './productQueryService';
import ProductBatchService from './productBatchService';
import ProductValidator from './productValidator';

/**
 * Re-exportación de todas las funciones de los servicios
 * con nombres compatibles con el código anterior
 * para facilitar la migración progresiva
 */

// Exportaciones de StockService
export const getProductCurrentStock = StockService.getProductStock.bind(StockService);
export const getMultipleProductsStock = StockService.getMultipleProductsStock.bind(StockService);
export const validateItemsStock = StockService.validateItemsStock.bind(StockService);

// Exportaciones de ProductBatchService
export const getBatchProductStock = ProductBatchService.getBatchProductStock.bind(ProductBatchService);
export const verifyAndUpdateStockForOrder = ProductBatchService.verifyAndUpdateStockForOrder.bind(ProductBatchService);
export const updateProductStockBatch = ProductBatchService.updateProductStockBatch.bind(ProductBatchService);

// Exportaciones de ProductQueryService
const getProductByIdWithShippingProps = async (productId) => {
  const product = await ProductQueryService.getProductById(productId);
  
  if (!product) return null;
  
  // Asegurar propiedades de envío antes de devolver
  return ensureShippingProperties(product, 'getProductByIdWrapper');
};

export const getProductById = getProductByIdWithShippingProps;
export const getProductsByIds = ProductQueryService.getProductsByIds.bind(ProductQueryService);
export const searchProducts = ProductQueryService.searchProducts.bind(ProductQueryService);
export const getFeaturedProducts = ProductQueryService.getFeaturedProducts.bind(ProductQueryService);

// Exportar funciones de validación
export const validateProduct = ProductValidator.validateProduct;
export const normalizeProduct = ProductValidator.normalizeProduct;
export const validateAndNormalizeProduct = ProductValidator.validateAndNormalizeProduct;

/**
 * Utilidad de diagnóstico para asegurar que las propiedades de envío estén presentes
 * Cualquier componente puede usar esta función para verificar y corregir problemas
 * 
 * @param {Object} product - Producto a verificar
 * @param {string} source - Identificador de la fuente que realiza la verificación (para logs)
 * @returns {Object} - Producto con propiedades corregidas si es necesario
 */
export const ensureShippingProperties = (product, source = 'unknown') => {
  if (!product) return product;
  
  // Usar el normalizador para hacer la mayor parte del trabajo
  const normalized = normalizeProduct(product);
  
  // Validación específica para casos especiales
  const productId = normalized.id;
  let modified = false;
  
  // PATCH temporal para productos específicos con problemas conocidos
  if (productId === 'e9lK7PMv83TCwSwngDDi' && 
     (!normalized.shippingRuleId || !normalized.shippingRuleIds || !Array.isArray(normalized.shippingRuleIds) || normalized.shippingRuleIds.length === 0)) {
    // Aplicar valores conocidos
    normalized.shippingRuleId = 'x8tRGxol2MOr8NMzeAPp';
    normalized.shippingRuleIds = ['x8tRGxol2MOr8NMzeAPp', 'fyfkhfITejBjMASFCMZ2'];
    modified = true;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔧 PATCH aplicado para producto de prueba ${productId}`);
    }
  }
  
  // Solo mostrar un log si se modificó algo y estamos en desarrollo
  if (modified && process.env.NODE_ENV !== 'production') {
    console.log(`✅ [${source}] Propiedades de envío verificadas para "${normalized.name || productId}"`);
  }
  
  return normalized;
};

// Exportación de servicios completos para usar en componentes nuevos
export const ProductServices = {
  Stock: StockService,
  Query: ProductQueryService,
  Batch: ProductBatchService,
  Validator: ProductValidator,
  Utils: {
    ensureShippingProperties,
    validateAndNormalizeProduct
  }
};

export default ProductServices;